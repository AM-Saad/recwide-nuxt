<script setup lang="ts">
import { useMainStore } from "~/store"
import { SCENE } from "~/utils"

const emit = defineEmits(["switch", "reRecord"])
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
  const userAgent = navigator.userAgent
  let browserName

  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "chrome"
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "firefox"
  } else if (userAgent.match(/safari/i)) {
    browserName = "safari"
  } else if (userAgent.match(/opr\//i)) {
    browserName = "opera"
  } else if (userAgent.match(/edg/i)) {
    browserName = "edge"
  } else {
    browserName = "No browser detection"
  }
  return browserName
}

const handleKeyDown = (e: KeyboardEvent): void =>
  checkKeyPressed(e, mode.value as SCENE)

onMounted(() => {
  emit("reRecord")

  const browserName = fnBrowserDetect()
  if (browserName === "chrome") {
    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((res): boolean => (store.micGranted = res.state === "granted"))
    navigator.permissions
      .query({ name: "camera" as PermissionName })
      .then((res): boolean => (store.camGranted = res.state === "granted"))
  }

  try {
    if (window.camstream) {
      window.camstream
        .getTracks()
        .forEach((track: MediaStreamTrack): void => track.stop())
    }

    if (window.boradcast) {
      window.boradcast
        .getTracks()
        .forEach((track: MediaStreamTrack): void => track.stop())
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
    <h1 class="title mb-5 text-left">Choose Recording Scene</h1>

    <div class="mb-3 grid md:grid-cols-2">
      <div
        id="modes"
        class="flex flex-col flex-wrap justify-center gap-5 md:justify-between"
      >
        <UiModeCard
          image="both.svg"
          title="Screen & Webcam"
          :mode="SCENE.SCREEN_AND_WEBCAM"
          @switch="switchComponent"
        />

        <UiModeCard
          image="screen.svg"
          title="Screen Only"
          :mode="SCENE.SCREEN_ONLY"
          @switch="switchComponent"
        />

        <UiModeCard
          image="cam.svg"
          title="Webcam Only"
          :mode="SCENE.WEBCAM_ONLY"
          @switch="switchComponent"
        />
      </div>
    </div>

    <button
      tabindex="4"
      class="btn glass-bg mt-3"
      @click="switchComponent('Options')"
    >
      Next Step
    </button>
  </div>
</template>
