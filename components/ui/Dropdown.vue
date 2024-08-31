<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton
        class="inline-flex w-full justify-center gap-x-1.5 rounded-md text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
      >
        <div>
          <ul id="top-menu">
            <div class="flex">
              <img
                class="h-8 dark:invert-[1] dark:filter"
                src="~/assets/images/logo-geek.png"
                alt=""
              />
            </div>
          </ul>
        </div>
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        class="glass-bg absolute right-0 z-10 w-56 origin-top-right overflow-hidden rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div class="overflow-hidden">
          <MenuItem v-slot="{ active }">
            <router-link
              to="/projects"
              :class="[
                active
                  ? 'bg-gray-100/50 text-gray-900 dark:text-gray-300'
                  : 'text-gray-700 dark:text-gray-200',
                'block px-4 py-2 text-sm',
              ]"
            >
              Projects
            </router-link>
          </MenuItem>

          <MenuItem v-slot="{ active }">
            <button
              type="button"
              :class="[
                active
                  ? 'bg-gray-100/50 text-gray-900 dark:text-gray-300'
                  : 'text-gray-700 dark:text-gray-200',
                'block w-full px-4 py-2 text-left text-sm',
              ]"
              @click="logout"
            >
              Sign out
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue"

const { signOut } = useAuth()

const logout = async (): Promise<void> => {
  await signOut()
}
</script>
