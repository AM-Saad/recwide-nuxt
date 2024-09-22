<script setup lang="ts">
import { useMainStore } from "~/store"

const store = useMainStore()
const emit = defineEmits(["accessGranted", "accessField", "AllowAccess"])
const camGranted = computed(() => store.camGranted)
const ready = ref(false)

const startBroadcast = async (): Promise<void> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    ready.value = true
    const gumVideo = document.querySelector(
      "#cam-broadcast",
    ) as HTMLVideoElement

    window.broadcast = stream
    gumVideo.srcObject = stream
    store.setCamGranted(true)
    emit("accessGranted")
  } catch (error) {
    const { name } = error as Error
    if (name === "NotAllowedError" || name === "NotFoundError") {
      ready.value = false
      emit("accessField")
    }
  }
}
const stopBroadcast = (): void => {
  try {
    ready.value = false
    if (window.broadcast !== undefined) {
      window.broadcast.getTracks().forEach((track) => track.stop())
      return
    }
  } catch (error) {
    return
  }
}
onMounted(() => {
  startBroadcast()
})

onUnmounted(() => {
  stopBroadcast()
})

watch(camGranted, (newVal) => {
  if (newVal) {
    startBroadcast()
  } else {
    stopBroadcast()
  }
})
</script>

<template>
  <div id="cam-broadcast_wrapper" class="relative h-full w-full rounded-md">
    <video
      id="cam-broadcast"
      class="w-full rounded shadow"
      :class="{ hidden: !ready }"
      muted
      autoplay
    >
      Your browser doesn't support the video tag
    </video>

    <div v-if="!ready" class="loading-cam grid justify-center">
      <img
        src="@/assets/images/cam_loading.gif"
        class="m-auto block mix-blend-multiply"
        alt="loading cam"
      />
      <p v-if="camGranted">Cam Preview is loading...</p>
      <div v-if="!camGranted">
        <p class="my-1 text-center text-xs text-red-400">
          Cannot access to camera
        </p>
        <div>
          <button class="btn btn-gradient font-m" @click="emit('AllowAccess')">
            Allow access to Camera
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
