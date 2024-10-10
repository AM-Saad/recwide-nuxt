// https://nuxt.com/docs/api/configuration/nuxt-config
import process from "node:process"
const sw = process.env.SW === "true"

export default defineNuxtConfig({
  modules: [
    "@sidebase/nuxt-auth",
    "@nuxtjs/tailwindcss",
    "~/modules/user/module.ts",
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
    "@nuxt/image",
    "@nuxt/eslint",
    "@sidebase/nuxt-session",
  ],

  future: {
    typescriptBundlerResolution: true,
  },
  hooks: {
    ready: async () => {
      // Validate public environment variable
      if (!process.env.SERVER_URL) {
        throw new Error("Missing required environment variable: SERVER_URL")
      }
      if (!process.env.VAPID_PUBLIC_KEY) {
        throw new Error(
          "Missing required environment variable: VAPID_PUBLIC_KEY",
        )
      }
      if (!process.env.VAPID_PRIVATE_KEY) {
        throw new Error(
          "Missing required environment variable: VAPID_PRIVATE_KEY",
        )
      }
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error(
          "Missing required environment variable: SENDGRID_API_KEY",
        )
      }
      if (!process.env.AUTH_SECRET) {
        throw new Error("Missing required environment variable: AUTH_SECRET")
      }
      if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error(
          "Missing required environment variable: GOOGLE_CLIENT_ID",
        )
      }
      if (!process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error(
          "Missing required environment variable: GOOGLE_CLIENT_SECRET",
        )
      }
      if (!process.env.DATABASE_URL) {
        throw new Error("Missing required environment variable: DATABASE_URL")
      }

      // Log success if validation passes
      console.log("Environment variables validated successfully.")
    },
  },

  experimental: {
    compileTemplate: true,
    templateUtils: true,
    relativeWatchPaths: true,
    defaults: {
      useAsyncData: {
        deep: true,
      },
    },
  },
  unhead: {
    renderSSRHeadOptions: {
      omitLineBreaks: false,
    },
  },
  imports: {
    autoImport: true,
  },

  appConfig: {
    // you don't need to include this: only for testing purposes
    buildDate: new Date().toISOString(),
  },
  auth: {
    isEnabled: true,
    originEnvKey: "AUTH_ORIGIN",
    //  baseURL: process.env.AUTH_ORIGIN + "/api/auth",
    provider: {
      type: "authjs",
      trustHost: true,
      // defaultProvider: "google",
      // addDefaultCallbackUrl: true,
    },
    sessionRefresh: {
      enablePeriodically: false,
      enableOnWindowFocus: true,
      // handler: "./config/AuthRefreshHandler.ts",
    },
    globalAppMiddleware: true,
  },
  vite: {
    logLevel: "info",
    server: {
      hmr: {
        port: 3000, // Ensure this matches your local dev server
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify("v1.0.0"),
    },
    build: {
      assetsInlineLimit: 4096, // inline assets under 4kb for better performance and reduce requests
      minify: "esbuild",
    },
    esbuild: {
      drop: ["console", "debugger"],
    },
  },

  pwa: {
    strategies: sw ? "injectManifest" : "generateSW",
    srcDir: sw ? "public/service-worker" : undefined,
    filename: sw ? "index.ts" : undefined,
    registerType: "autoUpdate",
    manifest: {
      name: "Recwide",
      short_name: "Recwide",
      theme_color: "#f3f4f6",
      start_url: "/",
      display: "standalone",
      id: "/",
      display_override: ["standalone", "minimal-ui", "fullscreen"],
      description: "Recwide is a screen, audio, and cam recorder for the web.",
      screenshots: [
        {
          src: "screenshots/desktop.png",
          sizes: "1280x720",
          type: "image/png",
          form_factor: "wide", // Specify this for desktop
        },
        {
          src: "screenshots/mobile.png",
          sizes: "640x360",
          type: "image/png",
          form_factor: "narrow",
        },
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
        {
          src: "icons/512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      protocol_handlers: [
        {
          protocol: "web+recwide",
          url: "/web+recwide?type=%s",
        },
      ],
      share_target: {
        action: "/share-target",
        method: "POST",
        params: {
          title: "",
          text: "text",
          url: "url",
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
      navigateFallback: "/",
      navigateFallbackAllowlist: [/^\/$/],
      type: "module",
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
  css: ["~/assets/css/main.css"],

  typescript: {
    shim: true,
  },

  runtimeConfig: {
    public: {
      AUTH_ORIGIN: process.env.AUTH_ORIGIN,
      SERVER_URL: process.env.SERVER_URL,
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
      AUTH_SECRET: process.env.AUTH_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    },
    // Private config only available on the server
    //   MY_SECRET_VAR: process.env.MY_SECRET_VAR || '',
  },

  compatibilityDate: "2024-08-03",
})
