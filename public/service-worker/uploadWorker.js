/*
 This worker is responsible for uploading files to the server. It uses the Fetch API to send chunks of files to the server, and it can handle multiple concurrent uploads. It also includes error handling and retry logic.
 The worker receives messages from the main thread with the files to upload and the upload URL. It then uploads the files and sends progress updates back to the main thread.
*/

function calculateChunkSize(fileSize) {
  // Adjust these values based on your needs and testing
  const maxChunkSize = 5 * 1024 * 1024; // 5 MB
  const minChunkSize = 256 * 1024; // 256 KB
  let chunkSize = Math.ceil(fileSize / 100); // Example strategy to create 100 chunks
  chunkSize = Math.max(chunkSize, minChunkSize);
  chunkSize = Math.min(chunkSize, maxChunkSize);
  return chunkSize;
}

async function uploadChunk(data) {
  const { chunk, index, totalChunks, fileIdentifier, uploadUrl } = data;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // Set timeout to 20 seconds

  const formData = new FormData();
  formData.append('file', chunk);
  formData.append('index', index);
  formData.append('totalChunks', totalChunks);
  formData.append('identifier', fileIdentifier);

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId); // Clear the timeout if the request completes in time
    if (!response.ok) throw new Error('Upload failed');
    // Optionally parse and return response data here
  } catch (error) {
    clearTimeout(timeoutId); // Ensure to clear the timeout if an error occurs
    throw error;
  }
}

async function uploadFile(file, uploadUrl, retryDelays) {
  const chunkSize = calculateChunkSize(file.size);
  console.log('Chunk size', chunkSize);
  const totalChunks = Math.ceil(file.size / chunkSize);
  console.log('Total chunks', totalChunks);
  const fileIdentifier = `${file.name}-${Date.now()}`; // Example unique identifier

  const uploadPromises = [];

  for (let index = 0; index < totalChunks; index++) {
    const chunk = file.slice(index * chunkSize, (index + 1) * chunkSize);

    uploadPromises.push(
      (async () => {
        for (let attempt = 0; attempt < retryDelays.length; attempt++) {
          try {
            const data = {
              chunk,
              index,
              totalChunks,
              fileIdentifier,
              uploadUrl,
            };
            await uploadChunk(data);
            postMessage({
              type: 'progress',
              data: {
                identifier: fileIdentifier,
                index,
                totalChunks,
              },
            });
            break; // Success, exit retry loop
          } catch (error) {
            if (attempt < retryDelays.length - 1) {
              // If not the last attempt, wait for the retry delay before retrying
              await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt]));
            } else {
              // Last attempt, throw error without waiting
              throw error;
            }
          }
        }
      })(),
    );
  }

  try {
    const res = await Promise.all(uploadPromises);
    console.log('Upload complete', file.name, res);
    postMessage({
      type: 'fileComplete',
      data: { identifier: fileIdentifier },
    });
  } catch (error) {
    console.error('Failed to upload', file.name, error);
    postMessage({
      type: 'error',
      data: {
        message: `Failed to upload ${file.name}`,
        identifier: fileIdentifier,
      },
    });
  }
}

// Control concurrent uploads here
async function handleConcurrentUploads(files, uploadUrl, retryDelays, maxConcurrentUploads) {
  const concurrentUploads = [];

  for (let file of files) {
    if (concurrentUploads.length >= maxConcurrentUploads) {
      await Promise.race(concurrentUploads);
    }

    const uploadPromise = uploadFile(file, uploadUrl, retryDelays);
    concurrentUploads.push(uploadPromise);

    // Remove settled promises from the array
    uploadPromise.finally(() => {
      const index = concurrentUploads.indexOf(uploadPromise);
      if (index !== -1) {
        concurrentUploads.splice(index, 1);
      }
    });
  }

  await Promise.all(concurrentUploads); // Ensure all uploads complete
  postMessage({ type: 'allComplete' });
}

self.addEventListener('message', async (e) => {
  const { files, uploadUrl } = e.data;
  const retryDelays = [5000, 10000, 15000]; // Milliseconds to wait before retries
  const maxConcurrentUploads = 4; // Adjust based on your server capacity

  console.log('Starting uploads' + files.length + ' files');

  await handleConcurrentUploads(files, uploadUrl, retryDelays, maxConcurrentUploads);
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  // Your logic to update or fetch content in the background
}

self.addEventListener('push', (event) => {
  const data = event.data.json();
  console.log('Push received', data);
  self.registration.showNotification(data.title, {
    body: data.message,
    icon: '/path/to/icon.png',
  });
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'myFirstSync') {
    event.waitUntil(doSomeBackgroundSync());
  }
});

async function doSomeBackgroundSync() {
  // Your background sync logic here, e.g., sending messages or syncing data
}
