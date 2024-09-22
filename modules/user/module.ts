import { defineNuxtModule } from "@nuxt/kit"
import { resolve, join } from "pathe"
import type { Nuxt } from "@nuxt/schema"
import type { ModuleDefinition, ModuleOptions } from "nuxt/schema"

const userModule = {
  setup(options: ModuleOptions, nuxt: Nuxt): void {
    // Auto register components
    nuxt.hook("components:dirs", (dirs) => {
      dirs.push({
        path: join(__dirname, "components"),
      })
    })

    // Auto register composables
    nuxt.hook("components:dirs", (dirs) => {
      dirs.push(resolve(__dirname, "./composables"))
    })

    // Auto register pages
    nuxt.hook("pages:extend", (pages): void => {
      pages.push({
        name: "projects",
        path: "/projects",
        file: resolve(__dirname, "./pages/projects/page.vue"),
      })

      pages.push({
        name: "project",
        path: "/projects/:slug",
        file: resolve(__dirname, "./pages/projects/[slug].vue"),
      })

      pages.push({
        name: "edit",
        path: "/projects/edit/:slug",
        file: resolve(__dirname, "./pages/projects/edit/[slug].vue"),
      })
    })

    // Pinia store modules are auto imported
  },
}

export default defineNuxtModule(userModule)
