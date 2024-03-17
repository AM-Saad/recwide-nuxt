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
self.addEventListener('push', (event: PushEvent) => {
    const data = event.data?.json();
    self.registration.showNotification(data.title, {
        body: data.message,
        icon: '/path/to/icon.png',
    });
});


self.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'UPLOAD_START') {
        const { fileData } = event.data;
        console.log('fileData', fileData)
        try {
            // Implement your fetch upload logic here, similar to your socket logic but using fetch
            // Once upload completes
            setTimeout(() => {
                self.registration.showNotification("Upload Complete", {
                    body: "Your video upload has finished.",
                    icon: '/path/to/icon.png',
                });
            }, 5000)
        } catch (error) {
            console.error('Upload failed', error);
            // Optionally, send a message back to the page about the failure
        }
    }
});


// self.addEventListener('sync', (event) => {
//     if (event.tag === 'myFirstSync') {
//         event.waitUntil(doSomeBackgroundSync());
//     }
// });

async function doSomeBackgroundSync(): Promise<void> {
    // Your background sync logic here, e.g., sending messages or syncing data
    console.log('doSomeBackgroundSync')
}

// to allow work offline
registerRoute(new NavigationRoute(
    createHandlerBoundToURL('/'),
    { allowlist },
))


// Caching image files
registerRoute(
    // Add a custom regular expression to match image file requests
    ({ request }) => {
        return request.destination === 'image'
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


// Caching css files
registerRoute(
    // Add a custom regular expression to match image file requests
    ({ request }) => {
        return request.destination === 'style'
    },
    new CacheFirst({
        cacheName: 'styles',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 10, // Max number of images to cache
                // You can also set maxAgeSeconds to define how long the images stay in the cache
            }),
        ],
    }),
);

self.skipWaiting()
clientsClaim()
