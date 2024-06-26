/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

let allowlist: undefined | RegExp[]
if (import.meta.env.DEV)
    allowlist = [/^\/$/]

// Inside your custom service worker file (e.g., sw.js)
self.addEventListener('push', async (event: PushEvent) => {
    const data: any = event.data?.json!
    self.registration.showNotification(data?.title, {
        body: data?.message,
        icon: '/path/to/icon.png',
    });
});


// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('/'), { allowlist, denylist: [/^\/api/] }))


self.addEventListener("periodicsync", (event: any) => {
    console.log("Something happeing in periodicsync");
    if (event.tag === "content-sync") {
        event.waitUntil(syncContent());
    }
});

async function syncContent() {
    // Your logic to update or fetch content in the background
}
self.addEventListener("sync", (event: any) => {
    console.log("Something happeing in sync");
    if (event.tag === "myFirstSync") {
        event.waitUntil(doSomeBackgroundSync());
    }
});

async function doSomeBackgroundSync() {
    // Your background sync logic here, e.g., sending messages or syncing data
}


// Caching image files
registerRoute(
    //  custom regular expression to match image file extention requests
    ({ request }) => {
        return new RegExp(/\.(?:png|gif|jpg|jpeg|webp|svg|ico)$/).test(request.url)
    },
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 14, // Max number of images to cache
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days


            }),
        ],
    }),
);


let db: IDBDatabase

function openDatabase() {

    return new Promise((resolve, reject) => {

        let request: IDBOpenDBRequest = indexedDB.open("recwide_db", 1)


        request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
            if (!event.target) return;

            let target = event.target as IDBOpenDBRequest
            db = target.result

            let objectStore = db.createObjectStore("projects", { keyPath: "id" });
            objectStore.createIndex("name", "name", { unique: false })
        }


        request.onsuccess = function (event: Event) {
            let target = event.target as IDBOpenDBRequest
            db = target.result
            resolve(db)
        }

        request.onerror = function (event: Event) {
            let target = event.target

            reject("Database error: " + target.errorCode)
        }

    })

}


openDatabase()
    .then(db => {
        console.log("Database opened successfully");
    }).catch(error => {
        console.error(error);
    });


function calculateChunkSize(fileSize: number): number {
    // Adjust these values based on your needs and testing
    const maxChunkSize = 5 * 1024 * 1024; // 5 MB
    const minChunkSize = 256 * 1024; // 256 KB
    let chunkSize = Math.ceil(fileSize / 100); // Example strategy to create 100 chunks
    chunkSize = Math.max(chunkSize, minChunkSize);
    chunkSize = Math.min(chunkSize, maxChunkSize);
    return chunkSize;
}

async function uploadChunk(data: { chunk: any, index: any, totalChunks: any, fileIdentifier: any, uploadUrl: any }) {
    const { chunk, index, totalChunks, fileIdentifier, uploadUrl } = data;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // Set timeout to 20 seconds
    console.log('Upload chunk index ', index);

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



async function uploadFile(file: any, uploadUrl: any, retryDelays: any) {
    const chunkSize = calculateChunkSize(file.size);
    console.log('Chunk size', chunkSize);
    const totalChunks = Math.ceil(file.size / chunkSize);
    console.log('Total chunks', totalChunks);
    const fileIdentifier = `${file.name}-${Date.now()}`; // Example unique identifier

    const uploadPromises = [];

    for (let index = 0; index < totalChunks; index++) {
        const chunk = file.slice(index * chunkSize, (index + 1) * chunkSize);

        uploadPromises.push((async () => {
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
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                            client.postMessage({
                                type: 'progress',
                                data: { identifier: fileIdentifier, index, totalChunks },
                            });
                        });
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
        })()
        );
    }

    try {
        const res = await Promise.all(uploadPromises);
        console.log('Upload complete', file.name, res);
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'fileComplete',
                    data: { identifier: fileIdentifier, message: `${file.name} upload complete` },
                });
            });
        });
    } catch (error) {
        console.error('Failed to upload', file.name, error);
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'error',
                    data: {
                        message: `Failed to upload ${file.name}`,
                        identifier: fileIdentifier,
                    },
                });
            });
        });
    }
}

// Control concurrent uploads here
async function handleConcurrentUploads(name: string, files: File[], uploadUrl: string, retryDelays: number[], maxConcurrentUploads: number) {
    const concurrentUploads: any = [];
    // console.log('the files is: ', files);

    // const userBlobsObjectStore = db
    //     .transaction("userBlobs", "readwrite")
    //     .objectStore("userBlobs");

    // userBlobsObjectStore.add({ name, files });

    for (const file of files) {
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
    // postMessage({ type: 'allComplete' });
    // Broadcast to all clients that all files are uploaded
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ type: 'allComplete', data: { message: 'All uploads complete.' } });
        });
    });
}



self.addEventListener('message', async (e: any) => {
    const { type, files, uploadUrl, name } = e.data;
    if (type == 'uploadFiles') {
        const retryDelays = [5000, 10000, 15000]; // Milliseconds to wait before retries
        const maxConcurrentUploads = 4; // Adjust based on your server capacity

        // Notify the originating client about the upload start (if needed)
        if (e.source.id) {
            self.clients.get(e.source.id)
                .then((client: any) => {
                    client.postMessage({ type: 'uploadStart', data: { message: 'Upload has started.' } });
                });
        }

        await handleConcurrentUploads(name, files, uploadUrl, retryDelays, maxConcurrentUploads);
    }

});



function handleDatabaseOperation(data) {
    // Start a new transaction
    let transaction = db.transaction(["projects"], "readwrite");

    // Get the object store
    let objectStore = transaction.objectStore("projects");

    // Perform the desired operation (add, get, update, delete)
    let request;

    if (data.action === "add") {
        request = objectStore.add(data.payload);
    } else if (data.action === "get") {
        request = objectStore.get(data.payload.id);
    } else if (data.action === "update") {
        request = objectStore.put(data.payload);
    } else if (data.action === "delete") {
        request = objectStore.delete(data.payload.id);
    }

    request.onsuccess = function (event) {
        console.log("Operation successful", event.target.result);
    };

    request.onerror = function (event) {
        console.error("Operation error: ", event.target.errorCode);
    };
}


// Caching css files
// registerRoute(
//     // Add a custom regular expression to match image file requests
//     ({ request }) => {
//         return request.destination === 'style'
//     },
//     new CacheFirst({
//         cacheName: 'styles',
//         plugins: [
//             new ExpirationPlugin({
//                 maxEntries: 10, // Max number of images to cache
//                 maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
//             }),
//         ],
//     }),
// );

self.skipWaiting()
clientsClaim()
