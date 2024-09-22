<script setup lang="ts">
import { useMainStore } from "~/store"

const store = useMainStore()
const emit = defineEmits<{
  (event: "ready" | "accessDenied"): void
  (event: "camBlobs", data: Blob[]): void
  (event: "canceled", msg: string): void
}>()
interface Props {
  start: boolean
  recording: boolean
  stopCam: boolean
}
const props = defineProps<Props>()

const resolution = ref(store.currentResolution)
const states = reactive({
  mediaCamRecorder: null,
  camBlobs: [],
}) as {
  mediaCamRecorder: MediaRecorder | null
  camBlobs: Blob[]
}

const startCamBroadcast = async (): Promise<boolean> => {
  let isReady = false

  const constraints: MediaStreamConstraints = {
    audio: store.micGranted && store.audioSettings != AUDIO.NONE,
    video: {
      width: { ideal: resolution.value },
      height: { ideal: resolution.value },
      facingMode: "user",
      frameRate: { ideal: 30 },
      aspectRatio: 1.777777778,
    },
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    window.camStream = stream
    isReady = true
  } catch (error) {
    const { name } = error as Error
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      emit("accessDenied")
      isReady = false
    }
  }
  return isReady
}

const startRecordingCam = (): void => {
  const options = { mimeType: "video/webm;codecs=h264" }
  try {
    states.mediaCamRecorder = new MediaRecorder(window.camStream, options)
    window.mediaCamRecorder = states.mediaCamRecorder
  } catch (e) {
    console.log(e)

    emit(
      "canceled",
      "allow access to the microphone and camera to start recording",
    )
  }

  if (!states.mediaCamRecorder) return
  states.mediaCamRecorder.ondataavailable = handleDataAvailable
  states.mediaCamRecorder.start(1000)
  //  states.mediaCamRecorder.onended = stopRecordingCam //check this later
}

const handleDataAvailable = (event: BlobEvent): void => {
  if (event.data && event.data.size > 0) states.camBlobs.push(event.data)
}

const stopRecordingCam = (): void => {
  try {
    window.camStream?.getTracks().forEach((track) => track.stop())

    states.mediaCamRecorder?.stop()
  } catch (error) {
    console.log(error)
    return
  }
  emit("camBlobs", states.camBlobs)
}

watch(
  () => props.start,
  (val) => {
    if (val) {
      console.log("start recording cam")
      startRecordingCam()
    }
  },
)

watch(
  () => props.recording,
  (val) => {
    if (!val) stopRecordingCam()
  },
)

watch(
  () => props.stopCam,
  (val) => {
    if (val) stopRecordingCam()
  },
)

onMounted(async () => {
  if (store.camGranted) {
    const ready = await startCamBroadcast()
    if (ready) emit("ready")
  }
})

onUnmounted(() => stopRecordingCam())
</script>

<template>
  <br />
</template>
