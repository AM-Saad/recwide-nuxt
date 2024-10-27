/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching"
import { clientsClaim } from "workbox-core"
import { NavigationRoute, registerRoute } from "workbox-routing"
import { CacheFirst } from "workbox-strategies"
import { ExpirationPlugin } from "workbox-expiration"
import { calculate_chunk_size, SW_MESSAGE_TYPE } from "../../utils"

declare let self: ServiceWorkerGlobalScope
let db: IDBDatabase

// self.__WB_MANIFEST is default injection point
precacheAndRoute([
  ...self.__WB_MANIFEST,
  { url: "/_nuxt/entry.js", revision: null }, // Manually add the missing asset
  { url: "/_nuxt/@vite/client", revision: null },
  { url: "/recorder", revision: "1" },
  { url: "/about", revision: null }, // Cache the /about page
  { url: "/offline", revision: null }, // Cache the /offline page
])

// clean old assets
// cleanupOutdatedCaches()

let allowlist: undefined | RegExp[]
// allowlist = [/^\//]

// to allow work offline
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/"), {
    allowlist,
    //  denylist: [/^\/api/],
  }),
)

// Caching image files
registerRoute(
  ({ request }) => {
    return new RegExp(/\.(?:png|gif|jpg|jpeg|webp|svg|ico)$/).test(request.url)
  },
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 44, // Max number of images to cache
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
      }),
    ],
  }),
)

// Caching CSS and JavaScript files
registerRoute(
  ({ url }) => url.pathname.startsWith("/_nuxt/"),
  new CacheFirst({
    cacheName: "nuxt-assets",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // Cache for 7 days
      }),
    ],
  }),
)

// Caching API responses
registerRoute(
  ({ url }) => url.pathname.startsWith("/api"),
  new CacheFirst({
    cacheName: "api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // Cache for 1 hour
      }),
    ],
  }),
)

// Open Database
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open("recwide_db", 1)

    request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
      if (!event.target) return
      const target = event.target as IDBOpenDBRequest
      db = target.result
      const objectStore = db.createObjectStore("projects", {
        keyPath: "name",
        autoIncrement: true,
      })
      objectStore.createIndex("name", "name", { unique: false })

      const objectStore2 = db.createObjectStore("forms", {
        keyPath: "email",
        autoIncrement: true,
      })
      objectStore2.createIndex("email", "email", { unique: false })
    }

    request.onsuccess = function (event: Event) {
      const target = event.target as IDBOpenDBRequest
      db = target.result
      resolve(db)
    }

    request.onerror = function (event: Event) {
      const target = event.target
      reject("Database error: " + target)
    }
  })
}

openDatabase()
  .then((db) => {
    console.assert("Database opened successfully")
  })
  .catch((error) => {
    console.error(error)
  })

// Events listeners
self.addEventListener("push", async (event: PushEvent) => {
  console.log("Push event received")
  const data: any = await event.data?.json()
  console.log("Push event received data -> ", data)
  self.registration.showNotification(data?.title, {
    body: data?.message,
    icon: "https://github.com/user-attachments/assets/b290c081-ca6d-47a8-a387-73fb34f0a526",
    silent: false,
    requireInteraction: true,
  })
})

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  console.log("Notification clicked", event.notification)
  event.notification.close()
  event.waitUntil(
    self.clients.openWindow("").then((client) => {
      // Handle notification click event
    }),
  )
})

self.addEventListener("periodicsync", (event: any) => {
  console.log("Something happening in periodicsync..")
  if (event.tag === "content-sync") {
    event.waitUntil(syncContent())
  }
})

self.addEventListener("sync", async (event: any) => {
  console.log("Something happening in sync..")

  if (event.tag === "syncForm") {
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: SW_MESSAGE_TYPE.SYNC_FORM,
        data: { message: "Syncing data..", data: event.data },
      })
    })
    return syncAuthentcation(clients)
  }
})

self.addEventListener("message", async (e: any) => {
  const { type, files, uploadUrl, name } = e.data
  console.log("Message received", "type: ", type, "data", files)
  if (type == "uploadFiles") {
    // Notify the originating client about the upload start (if needed)
    if (e.source.id) {
      const client = await self.clients.get(e.source.id)
      if (!client) {
        console.error("Client not found")
        return
      }
      client.postMessage({
        type: SW_MESSAGE_TYPE.UPLOAD_START,
        data: { message: "Upload has started." },
      })
    }
    handleDatabaseOperation({ action: "add", payload: { name, files } })

    await handleConcurrentUploads(name, files, uploadUrl)
  }
})

function handleDatabaseOperation(data: { action: string; payload: any }) {
  // Start a new transaction
  const transaction = db.transaction(["projects"], "readwrite")
  console.info(`Transaction Started With Action = ${data.action}`)

  // Get the object store
  const objectStore = transaction.objectStore("projects")
  console.info(`Object Store = ${objectStore.name}`)

  // Perform the desired operation (add, get, update, delete)
  let request

  if (data.action === "add") {
    console.log("Data to be added: ", data.payload)
    // Ensure payload contains the `name` property for the in-line key
    request = objectStore.add(data.payload)
  } else if (data.action === "get") {
    request = objectStore.get(data.payload.id)
  } else if (data.action === "update") {
    request = objectStore.put(data.payload)
  } else if (data.action === "delete") {
    request = objectStore.delete(data.payload.id)
  }

  request!.onsuccess = function (event) {
    console.log("Transaction Operation successful", event.target)
  }

  request!.onerror = function (event) {
    console.error("Transaction Operation error: ", event.target)
  }
}

// Functions
async function syncContent() {
  // Your logic to update or fetch content in the background
  console.log("Syncing content...")
  // Implement your content sync logic here
}

async function syncAuthentcation(clients: readonly Client[]) {
  const formData = getLocalData()
  if (formData) {
    const response = await sendDataToServer(formData)
    if (!response.ok) {
      console.error("Failed to sync form data with the server.")
      clients.forEach((client) => {
        client.postMessage({
          type: SW_MESSAGE_TYPE.FORM_SYNC_ERROR,
          data: { message: "Failed to sync form data with the server." },
        })
      })
      return
    }

    clients.forEach((client) => {
      client.postMessage({
        type: SW_MESSAGE_TYPE.FORM_SYNCED,
        data: { message: "Form data synced with the server." },
      })
    })
    console.log("Form data synced with the server.")
    // Optionally remove the local data after successful sync
    removeLocalData()
  }
}

const getLocalData = () => {
  // Retrieve the local data form the indexedDB to be synced
  // Return the data to be sent to the server

  const transaction = db.transaction(["forms"], "readwrite")
  const objectStore = transaction.objectStore("forms")
  const request = objectStore.getAll()

  request.onsuccess = function (event) {
    console.log("Data retrieved successfully", event.target?.result)
    return event.target.result
  }

  request.onerror = function (event) {
    console.error("Error retrieving data", event.target?.error)
    return null
  }

  return null
}

const sendDataToServer = async (data: any) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000) // Set timeout to 20 seconds
  console.info("Sending data to server")

  const formData = new FormData()
  formData.append("data", data)

  try {
    const response = await fetch("http://localhost:8004/auth/", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })
    clearTimeout(timeoutId) // Clear the timeout if the request completes in time
    if (!response.ok) throw new Error("Upload failed")
    // Optionally parse and return response data here
    return response
  } catch (error) {
    console.log(error)
    clearTimeout(timeoutId) // Ensure to clear the timeout if an error occurs
    throw error
  }
}

const removeLocalData = () => {
  // Remove the local data after successful sync
}

async function uploadChunk(data: {
  chunk: any
  index: any
  totalChunks: any
  fileIdentifier: any
  uploadUrl: any
}) {
  const { chunk, index, totalChunks, fileIdentifier, uploadUrl } = data
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000) // Set timeout to 20 seconds
  console.info("Upload chunk index ", index)

  const formData = new FormData()
  formData.append("file", chunk)
  formData.append("index", index)
  formData.append("totalChunks", totalChunks)
  formData.append("identifier", fileIdentifier)

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })
    clearTimeout(timeoutId) // Clear the timeout if the request completes in time
    if (!response.ok) throw new Error("Upload failed")
    // Optionally parse and return response data here
  } catch (error) {
    console.log(error)
    clearTimeout(timeoutId) // Ensure to clear the timeout if an error occurs
    throw error
  }
}

async function uploadFile(file: any, uploadUrl: any, retryDelays: any) {
  const chunkSize = calculate_chunk_size(file.size)
  console.info("Chunk size", chunkSize)

  const totalChunks = Math.ceil(file.size / chunkSize)
  console.info("Total chunks", totalChunks)

  const fileIdentifier = `${file.name}-${Date.now()}` // Example unique identifier

  const uploadPromises = []

  for (let index = 0; index < totalChunks; index++) {
    const chunk = file.slice(index * chunkSize, (index + 1) * chunkSize)

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
            }
            await uploadChunk(data)

            const clients = await self.clients.matchAll()
            clients.forEach((client) => {
              client.postMessage({
                type: SW_MESSAGE_TYPE.PROGRESS,
                data: { identifier: fileIdentifier, index, totalChunks },
              })
            })
            break // Success, exit retry loop
          } catch (error) {
            if (attempt < retryDelays.length - 1) {
              // If not the last attempt, wait for the retry delay before retrying
              await new Promise((resolve) =>
                setTimeout(resolve, retryDelays[attempt]),
              )
            } else {
              // Last attempt, throw error without waiting
              throw error
            }
          }
        }
      })(),
    )
  }

  try {
    const res = await Promise.all(uploadPromises)
    console.log("Upload complete", file.name, res)
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: SW_MESSAGE_TYPE.FILE_COMPLETE,
          data: {
            identifier: fileIdentifier,
            message: `${file.name} upload complete`,
          },
        })
      })
    })
  } catch (error) {
    console.error("Failed to upload", file.name, error)
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "error",
          data: {
            message: `Failed to upload ${file.name}`,
            identifier: fileIdentifier,
          },
        })
      })
    })
  }
}

async function handleConcurrentUploads(
  name: string,
  files: File[],
  uploadUrl: string,
) {
  const retryDelays = [5000, 10000, 15000] // Milliseconds to wait before retries
  const maxConcurrentUploads = 4 // Adjust based on your server capacity
  const concurrentUploads: any = []

  for (const file of files) {
    if (concurrentUploads.length >= maxConcurrentUploads) {
      await Promise.race(concurrentUploads)
    }

    const uploadPromise = uploadFile(file, uploadUrl, retryDelays)
    concurrentUploads.push(uploadPromise)

    // Remove settled promises from the array
    uploadPromise.finally(() => {
      const index = concurrentUploads.indexOf(uploadPromise)
      if (index !== -1) {
        concurrentUploads.splice(index, 1)
      }
    })
  }

  await Promise.all(concurrentUploads) // Ensure all uploads complete
  // Broadcast to all clients that all files are uploaded
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: SW_MESSAGE_TYPE.ALL_FILES_COMPLETE,
        data: { message: "All uploads complete." },
      })
    })
  })
}

self.skipWaiting()
clientsClaim()
