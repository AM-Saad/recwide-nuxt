<script setup lang="ts">
import { useMainStore } from "~/store"

const emit = defineEmits(["switch"])

const store = useMainStore()
const recording = ref(false)
const start = ref(false)
const stopCam = ref(false)
const readyToStart = ref(false)
const showGuide = ref(false)
const accessGranted = ref(false)

onMounted(() => {
  displayGuide()

  try {
    window.boradcast.getTracks().forEach((track) => track.stop())
  } catch (error) {
    console.error("Error stopping broadcast tracks", error)
    return
  }

  window.onbeforeunload = ():string => "Are you sure you want to close the window?"
})

onUnmounted(() => {
  window.onbeforeunload = null
})

function displayGuide():void {
  const audio = store.audioSettings
  const guideDismissed =
    localStorage.getItem("guideDismissed") === "true" ? false : true
  if (
    (audio === AUDIO.MIC_AND_SYSTEM || audio === AUDIO.SYSTEM) &&
    guideDismissed
  ) {
    showGuide.value = true
  } else {
    readyToStart.value = true
  }
}

function closeGuide():void {
  showGuide.value = false
  readyToStart.value = true
}

function canceled(msg: string):void {
  store.setCamReady(false)
  store.setScreenReady(false)
  checkIfReadyToRecord()
  emit("switch", "options", msg)
}

function screenReady():void {
  store.setScreenReady(true)
  checkIfReadyToRecord()
}

function camReady():void {
  store.setCamReady(true)
  checkIfReadyToRecord()
}

function stopRecording():void {
  recording.value = false
  checkIfRecordingIsFinished()
}

function forceStopCam():void {
  stopCam.value = true
}

function accessDenied():void {
  accessGranted.value = false
  store.setCamError(true)
}

function checkIfReadyToRecord():void {
  switch (store.mode) {
    case SCENE.SCREEN_ONLY:
      if (store.screenIsReady) {
        recording.value = true
      }
      break
    case SCENE.SCREEN_AND_WEBCAM:
      if (store.screenIsReady && store.camIsReady) {
        recording.value = true
      }
      break
    case SCENE.WEBCAM_ONLY:
      if (store.camIsReady) {
        recording.value = true
      }
      break
  }
}

function checkIfRecordingIsFinished():void {
  switch (store.mode) {
    case SCENE.SCREEN_ONLY:
      if (store.blobs.length > 0) {
        store.setFinished(true)
      }
      break
    case SCENE.WEBCAM_ONLY:
      if (store.blobs.length > 0) {
        store.setFinished(true)
      }
      break
    case SCENE.SCREEN_AND_WEBCAM:
      if (store.blobs.length > 1) {
        store.setFinished(true)
      }
      break
  }
}

function pushCamFile(val: unknown):void {
  const exist = store.blobs.find((b) => b.name === "camRecording")
  if (!exist) {
    store.newBlob({ chunks: val, name: "camRecording" })
    checkIfRecordingIsFinished()
  }
}

function pushScreenFile(val: unknown):void {
  const exist = store.blobs.find((b) => b.name === "screenRecording")
  if (!exist) {
    store.newBlob({ chunks: val, name: "screenRecording" })
    checkIfRecordingIsFinished()
  }
}

watch(recording, (newVal) => {
  if (newVal) start.value = true
})
</script>

<template>
  <div class="containers">
    <ModalsGuide
      v-if="showGuide"
      :show="showGuide" @gotit="closeGuide" />

    <recording-screen-recording
      v-if="store.mode != SCENE.WEBCAM_ONLY && readyToStart"
      :recording="recording"
      :start="start"
      :finished="store.finished"
      :resolution="store.currentResolution"
      @ready="screenReady"
      @canceled="canceled"
      @downloadlink="pushScreenFile"
      @force-stop-cam="forceStopCam"
    />

    <recording-cam-recording
      v-if="store.mode != SCENE.SCREEN_ONLY && readyToStart"
      :recording="recording"
      :start="start"
      :finished="store.finished"
      :stop-cam="stopCam"
      @canceled="canceled"
      @ready="camReady"
      @downloadlink="pushCamFile"
      @accessdenied="accessDenied"
    />
  </div>

  <div
    v-if="start"
    class="recording-box flex flex-col items-center justify-center text-center"
  >
    <h3 class="text-2xl">Recording in Progress</h3>
    <recording-counting-time />
    <button
      class="recording-btn flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-red-600 text-red-400"
      @click="stopRecording"
    >
      <IconsStop />
    </button>
  </div>
</template>

<style scoped>
.wrapper {
  width: 75% !important;
  margin: var(--m-margin) auto !important;
}

.recording-box {
  padding: var(--l-padding);
  text-align: center;
  width: 400px;
  max-width: 100%;
  margin: auto;
  border-radius: var(--m-radius);
}
</style>
