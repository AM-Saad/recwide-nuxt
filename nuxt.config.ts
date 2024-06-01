// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'

const sw = process.env.SW === 'true'

export default defineNuxtConfig({
  modules: [
    '@sidebase/nuxt-auth',
    '@nuxtjs/tailwindcss',
    '~/modules/user/module.ts',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    "@nuxt/image",
  ],

  future: {
    typescriptBundlerResolution: true,
  },
  experimental: {
    payloadExtraction: true,
    watcher: 'parcel',
  },
  imports: {
    autoImport: true,
  },
  appConfig: {
    // you don't need to include this: only for testing purposes
    buildDate: new Date().toISOString(),
  },
  vite: {
    logLevel: 'info',
  },
  pwa: {
    strategies: sw ? 'injectManifest' : 'generateSW',
    srcDir: sw ? 'public/service-worker' : undefined,
    filename: sw ? 'index.ts' : undefined,
    registerType: 'autoUpdate',
    manifest: {
      name: 'Recwide',
      short_name: 'Recwide',
      theme_color: '#ffffff',
      start_url: '/',
      display: 'standalone',
      id: '/',
      display_override: ['standalone', 'minimal-ui', 'fullscreen'],
      description: 'Recwide is a screen, audio, and cam recorder for the web.',
      screenshots: [
        {
          src: 'screenshots/desktop.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide', // Specify this for desktop
        },
        {
          src: 'screenshots/mobile.png',
          sizes: '640x360',
          type: 'image/png',
          form_factor: 'narrow',
        }
      ],
      icons: [
        { src: "icons/16x16.png", sizes: "16x16", type: "image/png" },
        { src: "icons/32x32.png", sizes: "32x32", type: "image/png" },
        { src: "icons/72x72.png", sizes: "72x72", type: "image/png" },
        { src: "icons/96x96.png", sizes: "96x96", type: "image/png" },
        { src: "icons/120x120.png", sizes: "120x120", type: "image/png" },
        { src: "icons/128x128.png", sizes: "128x128", type: "image/png" },
        { src: "icons/144x144.png", sizes: "144x144", type: "image/png" },
        { src: "icons/152x152.png", sizes: "152x152", type: "image/png" },
        { src: "icons/180x180.png", sizes: "180x180", type: "image/png" },
        { src: "icons/192x192.png", sizes: "192x192", type: "image/png" },
        { src: "icons/384x384.png", sizes: "384x384", type: "image/png" },
        { src: "icons/512x512.png", sizes: "512x512", type: "image/png" },
        { src: "icons/512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
      ],
      protocol_handlers: [
        {
          protocol: 'web+recwide',
          url: '/web+recwide?type=%s',
        }
      ],
      share_target: {
        action: '/share-target',
        method: 'POST',
        params: {
          title: '',
          text: 'text',
          url: 'url',
        },
      },
    },

    client: {
      installPrompt: true,
      // you don't need to include this: only for testing purposes
      // if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
      periodicSyncForUpdates: 20,


    },
    devOptions: {
      enabled: true,
      suppressWarnings: false,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
    // workbox: {
    //   runtimeCaching: [
    //     {
    //       urlPattern: /\.(?:png|gif|jpg|jpeg|svg)$/,
    //       handler: 'CacheFirst',
    //       options: {
    //         cacheName: 'image-cache',
    //         expiration: {
    //           maxEntries: 100,
    //           maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
    //         },
    //       },
    //     },
    //   ]
    // }
  },
  build: {
    // transpile: ['trpc-nuxt']
  },
  ssr: false,
  css: ['~/assets/css/main.css'],
  typescript: {
    shim: false,
  },
  runtimeConfig: {
    public: {
      SERVER_URL: process.env.SERVER_URL,
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,

    },
  },



})