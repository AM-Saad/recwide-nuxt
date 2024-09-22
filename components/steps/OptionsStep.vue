<script setup lang="ts">
import { useMainStore } from "~/store"
import { SCENE, STEPS } from "~/utils"

const store = useMainStore()
const emit = defineEmits<{ (event: "switch", component: STEPS): void }>()

const mediaRequested = ref(false)
const showMissingPermissionModel: Ref<boolean> = ref(false)
const showHowToAccessModel: Ref<boolean> = ref(false)
const needGuide: Ref<string> = ref("")
const camPreviewInitiated = ref(false)
const missingPermissionsConfirmed = ref(false)

const isMissingPermissions = computed(() => {
  return {
    screenAndWebcam:
      !store.camGranted ||
      (!store.micGranted &&
        store.audioSettings !== AUDIO.NONE &&
        store.audioSettings !== AUDIO.SYSTEM),
    webcam:
      !store.camGranted ||
      ((store.audioSettings == AUDIO.MIC ||
        store.audioSettings === AUDIO.MIC_AND_SYSTEM) &&
        !store.micGranted),
    screen:
      (store.audioSettings === AUDIO.MIC_AND_SYSTEM ||
        store.audioSettings === AUDIO.MIC) &&
      !store.micGranted,
  }
})

const canProceedWithWebcam = computed(() => {
  if (store.mode === SCENE.WEBCAM_ONLY) {
    return store.camGranted
  }
  return true
})
const canProceed = computed(
  () =>
    mediaRequested.value &&
    camPreviewInitiated.value &&
    canProceedWithWebcam.value,
)

function openHowToAllowAccessModel(reqGuide: string): void {
  needGuide.value = reqGuide
  showHowToAccessModel.value = true
}

function switchComponent(comp: STEPS): void {
  emit("switch", comp)
}

function proceed(): void {
  if (missingPermissionsConfirmed.value) {
    showMissingPermissionModel.value = true
  } else {
    emit("switch", STEPS.RECORD)
  }
}

function proceedAnyway(): void {
  showMissingPermissionModel.value = false

  if (store.mode === SCENE.WEBCAM_ONLY && !store.camGranted) {
    showHowToAccessModel.value = true
  }

  if (store.mode === SCENE.SCREEN_AND_WEBCAM && !store.camGranted) {
    store.changeMode(SCENE.SCREEN_ONLY)
    emit("switch", STEPS.RECORD)
  }

  if (store.mode != SCENE.SCREEN_ONLY && store.camGranted) {
    emit("switch", STEPS.RECORD)
  }

  if (
    store.mode == SCENE.SCREEN_ONLY &&
    (!store.micGranted || !store.camGranted)
  ) {
    emit("switch", STEPS.RECORD)
  }
}

onMounted(async () => {
  if (isMissingPermissions.value[store.mode]) {
    await requestUserMedia()
  } else {
    mediaRequested.value = true
  }

  if (
    store.mode !== SCENE.WEBCAM_ONLY &&
    store.mode !== SCENE.SCREEN_AND_WEBCAM
  ) {
    camPreviewInitiated.value = true
  }
})

const requestUserMedia = async (): Promise<void> => {
  console.log("Requesting User Media")
  try {
    await navigator.mediaDevices.getUserMedia({
      video:
        store.mode === SCENE.WEBCAM_ONLY ||
        (store.mode === SCENE.SCREEN_AND_WEBCAM && !store.camGranted),
      audio:
        store.audioSettings === AUDIO.MIC ||
        store.audioSettings === AUDIO.MIC_AND_SYSTEM,
    })
    store.setCamGranted(true)
    store.setMicGranted(true)
    missingPermissionsConfirmed.value = false
    mediaRequested.value = true
  } catch (error) {
    const { state, granted: camGranted } = await usePermissionStatus(
      "camera" as PermissionName,
    )
    const { state: micState, granted: micGranted } = await usePermissionStatus(
      "microphone" as PermissionName,
    )
    if (state === "denied" || micState === "denied") {
      missingPermissionsConfirmed.value = true
    }
    store.setCamGranted(camGranted)
    store.setMicGranted(micGranted)
    mediaRequested.value = true
    console.error("Error requesting user media", error)
    return
  }
}

onUnmounted(() => {
  try {
    if (window.screenStream)
      window.screenStream.getTracks().forEach((track) => track.stop())
    if (window.camStream)
      window.camStream.getTracks().forEach((track) => track.stop())
  } catch (error) {
    console.error("Error stopping broadcast", error)
    return
  }
})
</script>

<template>
  <div class="step step-scene-select active mt-12">
    <h1 class="title text-left">Audio Options</h1>

    <div class="head group mb-5">
      <button
        tabindex="7"
        type="button"
        class="goBack relative flex transform items-center justify-center transition-all duration-300 group-hover:-translate-x-2"
        @click="switchComponent(STEPS.SCENE)"
      >
        <icons-arrow-back />
        <span class="text-xs">Back To Recording Scene</span>
      </button>
    </div>

    <modals-how-to-allow-access
      :show="showHowToAccessModel"
      :need-guide="needGuide"
      @close="showHowToAccessModel = false"
    />

    <modals-warning-missing-permissions
      :show="showMissingPermissionModel"
      @close="showMissingPermissionModel = false"
      @proceed-anyway="proceedAnyway"
    />

    <div class="mb-3 grid gap-5 md:grid-cols-2">
      <div class="step-cam-preview h-full w-full">
        <RecordingAudioOptions @open-allow-access="openHowToAllowAccessModel" />
      </div>
      <RecordingCamPreview
        v-if="
          store.mode === SCENE.SCREEN_AND_WEBCAM ||
          store.mode === SCENE.WEBCAM_ONLY
        "
        :ready="mediaRequested"
        @allow-access="openHowToAllowAccessModel('Webcam')"
        @access-granted="camPreviewInitiated = true"
        @access-field="camPreviewInitiated = true"
      />
    </div>

    <button
      v-if="canProceed"
      class="btn bg-theme"
      tabindex="6"
      @click="proceed()"
    >
      Start Recording
    </button>
    <button
v-if="!canProceed" class="btn bg-theme opacity:50"
tabindex="6">
      Start Recording
    </button>
  </div>
</template>
