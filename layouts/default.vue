<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="mx-auto flex h-screen max-w-4xl flex-col justify-between px-2">
    <nav
      id="nav"
      class="glass-bg relative z-20 flex justify-between rounded-b-lg border border-t-0 p-2"
    >
      <div class="flex items-center">
        <router-link to="/">
          <img
            class="w-28 dark:invert-[1] dark:filter"
            src="~/assets/images/full_logo.png"
            alt="recwide-logo"
          />
        </router-link>
      </div>
      <div v-if="status !== 'authenticated'" class="flex gap-5">
        <router-link class="btn btn-small bg-white" to="/auth/signIn">
          Login
        </router-link>
        <router-link class="btn btn-small bg-theme text-white" to="/auth/signup"
          >Signup</router-link
        >
      </div>

      <div v-if="status === 'authenticated'" class="flex gap-5">
        <!-- <button
          class="btn btn-small animate-gradient"
          @click="$pwa.install()"
        >
          Install
        </button> -->
        <ui-dropdown-menu />
      </div>
    </nav>

    <div class="flex-1">
      <shared-in-app-notifications :show="showInAppNotification">
        <template #header>
          <h2 class="text-lg font-bold">Notification</h2>
        </template>
        <template #body>
          <p class="text-sm">This is a notification</p>
        </template>
      </shared-in-app-notifications>
      <slot></slot>
    </div>

    <footer class="glass-bg rounded-t-lg p-2">
      <div class="footer-wrapper grid">
        <div class="footer-social">
          <ul>
            <li>
              <a><i class="fab fa-facebook-f"></i></a>
            </li>
            <li>
              <a><i class="fab fa-twitter"></i></a>
            </li>
            <li>
              <a><i class="fab fa-instagram"></i></a>
            </li>
            <li>
              <a><i class="fab fa-google"></i></a>
            </li>
          </ul>
          <ul class="flex justify-center gap-5">
            <li class="dark:text-gray-300">
              <a href="/">Support</a>
            </li>
            <li class="dark:text-gray-300">
              <router-link to="/about"> About </router-link>
            </li>
            <li class="dark:text-gray-300">
              <a href="/">Contact </a>
            </li>
          </ul>
        </div>
      </div>
      <p class="my-2 text-center text-sm dark:text-gray-300">
        Provided by
        <a class="underline" href="https://amsaad.cc">Abdelrahman Saad</a>
      </p>
    </footer>
  </div>
</template>
<!-- eslint-disable no-console -->

<script setup lang="ts">
import { SW_MESSAGE_TYPE } from "~/utils/constants"

const { $pwa } = useNuxtApp()
console.log("pwa", Object.keys($pwa), Object.values($pwa))
console.log("need refresh", $pwa.needRefresh)
const { status } = useAuth()

const showInAppNotification = ref(false)

const listenToServiceWorker = (): void => {
  navigator.serviceWorker.addEventListener("message", handleSWMessage)
}

const handleSWMessage = (event: MessageEvent<WorkerMessage>): void => {
  const { type, data } = event.data as WorkerMessage
  // Handle different types of messages: progress, error, completed
  switch (type) {
    case SW_MESSAGE_TYPE.SYNC_FORM:
      // Handle upload completion
      console.log("syncForm", data)
      break
    case SW_MESSAGE_TYPE.FORM_SYNCED:
      // Handle upload completion
      console.log("formSynced", data)
      break
    case SW_MESSAGE_TYPE.FORM_SYNC_ERROR:
      // Handle upload completion
      console.log("formSyncError", data)
      break
    default:
      console.log("Unknown message type", type)
      break
  }
}

onMounted(() => {
  listenToServiceWorker()

  setTimeout(() => {
    showInAppNotification.value = true
  }, 2000)
})
</script>
