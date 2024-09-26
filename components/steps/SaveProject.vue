<script setup lang="ts">
import { reactive, defineProps, defineEmits } from "vue"
import { useMainStore } from "~/store"

const { status } = useAuth()

// Define your component's emits
const emit = defineEmits(["cancel", "register", "submitPorject"])
const config = useRuntimeConfig()
const store = useMainStore()

type WorkerMessage = {
  type: string
  data: {
    message: string
    identifier: string
    index: number
    totalChunks: number
  }
}

interface SaveProjectData {
  // Keep only the necessary properties for UI
  uploading: boolean
  uploadError: boolean
  uploaded: boolean
  saving: boolean
  saved: boolean
  totalSize: number
  totalMBSize: number
  totalMbDone: number
  currentFileIndex: number
  currentPercent: number
  videosNames: string[]
  name: string
  cancled: boolean
  error: string | null
}

// Define your project properties as before
const props = defineProps({
  videotype: String,
  videos: Array,
}) as {
  videotype: string
  videos: string[]
}

// Reactive state for upload data
const state = reactive<SaveProjectData>({
  uploading: false,
  uploadError: false,
  uploaded: false,
  saving: false,
  saved: false,
  totalSize: 0,
  totalMBSize: 0,
  totalMbDone: 0,
  currentFileIndex: 0,
  currentPercent: 0,
  videosNames: [],
  cancled: false,
  name: "",
  error: null,
})

onMounted(() => {
  // Register for push notifications
  registerNotfification()

  if ("serviceWorker" in navigator) {
    // Ensure there's a service worker controlling the page
    if (navigator.serviceWorker.controller) {
      listenToServiceWorker()
    } else {
      // If the page isn't controlled, wait for it to be claimed
      navigator.serviceWorker.oncontrollerchange = (): void => {
        listenToServiceWorker()
      }
    }
  }
})

const listenToServiceWorker = (): void => {
  navigator.serviceWorker.addEventListener("message", handleSWMessage)
}

const handleSWMessage = (event: MessageEvent<WorkerMessage>): void => {
  const { type, data } = event.data as WorkerMessage
  console.log(type, data)
  // Handle different types of messages: progress, error, completed
  switch (type) {
    case "progress":
      // Update currentPercent in state based on the totalChunks and index
      state.currentPercent = Math.floor((data.index / data.totalChunks) * 100)
      state.totalMbDone = (data.index * 5) / 100
      break
    case "fileComplete":
      // Handle upload completion
      console.log("fileComplete", data)
      state.currentFileIndex++
      state.currentPercent = 0
      state.videosNames.push(data.identifier)
      break
    case "error":
      // Handle an upload error
      state.uploadError = true
      state.error = data.message
      break

    case "allComplete":
      state.uploaded = true
      state.uploading = false
      state.currentPercent = 0.9999
      submitPorject()
      break
  }
}

// beforeDestroy() {
//   // Clean up: remove the event listener if the component is destroyed
//   navigator.serviceWorker.removeEventListener('message', this.handleSWMessage);
// },

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const registerNotfification = async (): Promise<void> => {
  try {
    const registration = await navigator.serviceWorker.ready
    const permission = await Notification.requestPermission()

    if (permission !== "granted") {
      throw new Error("Permission not granted for Notification")
    }
    console.log("Notification permission granted")
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        config.public.VAPID_PUBLIC_KEY,
      ),
    })
    console.log("Subscription object", subscription)

    // Send the subscription object to the server
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    })

    console.log("Subscription successful")
  } catch (error) {
    console.error("Error during push notification registration:", error)
  }
}

// Function to start uploading files
const startUploading = (): void => {
  state.error = null
  if (!store.blobs.length) return
  if (state.name === "") {
    state.error = "Please enter a project name"
    return
  }
  console.info("Uploading files")

  const files = store.blobs.map((blob, index) => {
    const converted = new Blob(blob.chunks, {
      type: `video/${props.videotype}`,
    })
    const file = new File([converted], `video-${index}.${props.videotype}`, {
      type: `video/${props.videotype}`,
    })
    return file
  })

  if (navigator.serviceWorker.controller) {
    console.log("Sending message to service worker")
    state.uploading = true
    navigator.serviceWorker.controller.postMessage({
      type: "uploadFiles",
      files,
      uploadUrl: `${config.public.SERVER_URL}/user/projects/upload/chunk`,
      name: state.name,
    })
  } else {
    console.error("Service Worker not ready")
    state.error = "Service Worker not ready"
  }
}

const cancel = (): void => {
  if (state.uploading || state.saving) return
  emit("cancel")
  state.cancled = true
}

const submitPorject = async (): Promise<void> => {
  state.saving = true
  const today = new Date()
  const date = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`

  const payload = {
    videos: state.videosNames,
    name: state.name,
    mode: store.mode,
    audioSettings: store.audioSettings,
    resolution: store.currentResolution,
    videotype: props.videotype,
    date: date,
  }

  console.info("Saving project", payload)

  const res = await fetch(`/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  state.saving = false
  state.saved = true

  console.log("Project Saved !", data)

  // setTimeout(() => {
  //   // this.$emit("finished");
  //   return this.$router.push(`/project/${res.json.projectId}`);
  // }, 100);
}

const registerUser = (): void => {
  console.log("User Registering")
  emit("register")
}
</script>

<template>
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <UiDialogModal :show="true" @close="cancel">
      <template #header>
        <h3 class="text-lg font-bold">Create New Project</h3>
      </template>
      <template #body>
        <div>
          <div class="flex items-center justify-between">
            <p id="Uploaded" class="text-gray-700">
              <span id="mb"> {{ state.totalMbDone }}</span> /
              {{ state.totalMBSize }} MB
            </p>

            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs text-gray-200"
            >
              <p
                class="timer"
                data-from="0"
                :data-to="state.currentPercent"
                data-speed="800"
              >
                <span v-if="!state.uploaded">
                  {{ state.currentFileIndex }}
                </span>
                <span v-if="state.uploaded">
                  {{ state.currentFileIndex + 1 }}
                </span>
                /
                {{ store.blobs.length }}
              </p>
            </div>
          </div>

          <div
            class="progress-bar relative my-4 w-full"
            :style="'--progress:' + '00.' + state.currentPercent"
          >
            <div class="box relative m-auto h-8 w-full bg-[#eaeaea57]">
              <p
                :class="{ hidden: state.uploaded }"
                class="loading-text absolute left-0 top-[3px] z-10 h-full w-full text-center text-gray-500 transition-all"
              >
                Loading <span id="percent">:0</span>%
              </p>

              <p
                :class="{ 'done-text': !state.uploaded }"
                class="loading-text absolute left-0 top-[5px] z-10 h-full w-full text-center text-gray-500 transition-all"
              >
                Video('s) Successfully Uploaded 🎉
              </p>

              <div
                class="box-front absolute bottom-0 left-0 h-2 w-full bg-gray-400 transition-all duration-1000"
              ></div>

              <div
                class="box-bottom absolute bottom-0 left-0 h-1 w-full bg-black/50 blur-sm"
              ></div>
            </div>
          </div>

          <div class="mb-5 mt-2">
            <input
              id="name"
              v-model="state.name"
              type="text"
              name="name"
              :disabled="state.uploading || state.saving || state.saved"
              class="mb-2 h-10 w-full rounded-md border border-gray-200 px-4 text-sm"
              placeholder="Project Name.."
              autoComplete="false"
            />
            <div v-if="state.uploadError || state.error">
              <p class="text-sm text-red-400">
                {{ state.error }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button
            v-if="!state.saved"
            class="btn btn-small glass-bg"
            @click="cancel"
          >
            Cancel
          </button>

          <button
            v-if="
              !state.uploading &&
              !state.saving &&
              !state.uploaded &&
              status === 'authenticated'
            "
            class="btn btn-small bg-theme"
            @click="startUploading"
          >
            Upload Videos
          </button>

          <button
            v-if="status !== 'authenticated'"
            class="btn btn-small bg-theme"
            @click="registerUser"
          >
            Login To Upload
          </button>

          <button
            v-if="state.saved && status === 'authenticated'"
            class="btn btn-small btn-success"
          >
            Saved!
          </button>

          <button
            v-if="state.saving || state.uploading"
            class="btn btn-small bg-theme"
            disabled
          >
            <div class="spinner">
              <div class="double-bounce1"></div>
              <div class="double-bounce2"></div>
            </div>
          </button>
        </div>
      </template>
    </UiDialogModal>
  </Teleport>
</template>

<style>
#uploads {
  margin: auto;
  display: block;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 5px;
}

#uploads div {
  padding: 5px;
  background-color: #eee;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

#uploads div .delete {
  background-color: red;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px;
}

.wrap {
  border-radius: 4px;
  background-color: #2e4261;
  box-shadow: 0 1px 2px 0 #c9ced1;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  min-height: 40vh;
}

.progress-bar {
  --progress: 0;
  perspective: 200px;
}

.progress-bar .box {
  transform-style: preserve-3d;
  transform: rotateX(0);
  transition: transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform: rotateX(22deg);
}

.progress-bar.done .box {
  transform: rotateX(0);
}

.progress-bar .box-front {
  transform-origin: center bottom;
  transform: rotateX(95deg);
  transition: transform 1s;
}

.progress-bar.done .box p.loading-text {
  opacity: 0;
  visibility: hidden;
}

.progress-bar:not(.done) .box p.done-text {
  opacity: 0;
  visibility: hidden;
}

.progress-bar .box-bottom {
  transform-origin: center bottom;
  transform: translateZ(-20px);
}

.progress-bar .box::after {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  background: #68ff95;
  transform-origin: top left;
  transform: scaleX(var(--progress));
  transition: transform 0.1s;
  box-shadow: 0px 0px 17px 3px rgb(0 255 35 / 71%);
  border-radius: 3px;
}

.progress-bar .box-front::after {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  background: #68ff95;
  opacity: 0.3;
  transform-origin: top left;
  transform: scaleX(var(--progress));
  transition: transform 0.1s;
  box-shadow: 0px 0px 20px rgba(100, 255, 121, 0.4);
  border-radius: 3px;
}

@media only screen and (max-width: 767px) and (min-width: 320px) {
  .wrapper {
    width: 90%;
  }
}
</style>
