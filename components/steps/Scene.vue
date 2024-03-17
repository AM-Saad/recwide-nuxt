<script setup lang="ts">
import { useMainStore } from '~/store'
import { SCENE } from '~/utils/constents';

const emit = defineEmits(); // Define the emit function
const store = useMainStore()


// Computed
const mode = computed((): string => store.mode)


// Methods
const switchComponent = (comp: string, mode?: SCENE): void => {
  if (mode) {
    store.changeMode(mode)
  }
  emit("switch", comp)
}

const changeScene = (mode: SCENE): void => store.changeMode(mode)

const checkKeyPressed = (e: KeyboardEvent, mode: SCENE): void => {

  if (e.key === "ArrowDown") {
    e.preventDefault()
    // Change the mode to the next mode
    if (mode === SCENE.SCREEN_AND_WEBCAM) {
      store.changeMode(SCENE.SCREEN_ONLY)
    } else if (mode === SCENE.SCREEN_ONLY) {
      store.changeMode(SCENE.WEBCAM_ONLY)
    } else if (mode === SCENE.WEBCAM_ONLY) {
      store.changeMode(SCENE.SCREEN_AND_WEBCAM)
    }
  }

  if (e.key === "ArrowUp") {
    e.preventDefault()
    // Change the mode to the previous mode
    if (mode === SCENE.SCREEN_AND_WEBCAM) {
      store.changeMode(SCENE.WEBCAM_ONLY)
    } else if (mode === SCENE.SCREEN_ONLY) {
      store.changeMode(SCENE.SCREEN_AND_WEBCAM)
    } else if (mode === SCENE.WEBCAM_ONLY) {
      store.changeMode(SCENE.SCREEN_ONLY)
    }
  }

  if (e.key === "Enter") {
    e.preventDefault()
    switchComponent("Options", mode)
  }
}

const fnBrowserDetect = (): string => {
  let userAgent = navigator.userAgent;
  let browserName;

  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "chrome";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "firefox";
  } else if (userAgent.match(/safari/i)) {
    browserName = "safari";
  } else if (userAgent.match(/opr\//i)) {
    browserName = "opera";
  } else if (userAgent.match(/edg/i)) {
    browserName = "edge";
  } else {
    browserName = "No browser detection";
  }
  return browserName;
}

const handleKeyDown = (e: KeyboardEvent): void => checkKeyPressed(e, mode.value as SCENE);


onMounted(() => {

  emit("reRecord")

  const browserName = fnBrowserDetect()
  if (browserName === "chrome") {
    navigator.permissions.query({ name: "microphone" as PermissionName }).then((res): boolean => store.micGranted = res.state === "granted")
    navigator.permissions.query({ name: "camera" as PermissionName }).then((res): boolean => store.camGranted = res.state === "granted")
  }

  try {
    if (window.camstream) {
      window.camstream.getTracks().forEach((track: MediaStreamTrack): void => track.stop())
    }

    if (window.boradcast) {
      window.boradcast.getTracks().forEach((track: MediaStreamTrack): void => track.stop())
    }

  } catch (error) {
    console.error(error)
  }

  document.addEventListener("keydown", handleKeyDown)

})

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown)
})
</script>


<template>
  <div class="step step-scene-select active mt-12">
    <h1 class="title text-left mb-5">Choose Recording Scene</h1>

    <div class="grid mb-3 md:grid-cols-2">

      <div id="modes" class="flex flex-col justify-center md:justify-between flex-wrap gap-5">
        <UiMode image="both.svg" title="Screen & Webcam" :mode="SCENE.SCREEN_AND_WEBCAM" @switch="switchComponent" />

        <UiMode image="screen.svg" title="Screen Only" :mode="SCENE.SCREEN_ONLY" @switch="switchComponent" />

        <UiMode image="cam.svg" title="Webcam Only" :mode="SCENE.WEBCAM_ONLY" @switch="switchComponent" />
      </div>

    </div>

    <button tabindex="4" class="btn mt-3 glass-bg" @click="switchComponent('Options')">
      Next Step
    </button>
  </div>
</template>
