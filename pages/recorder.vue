<template>
  <div>
    <component
      :is="currentComp"
      v-if="!finished"
      @switch="switchComponent"
      @re-record="reRecord"
    />
    <p v-if="msg" class="block p-2 text-left text-sm text-yellow-600">
      {{ msg }}
    </p>

    <steps-final-step v-if="finished" @re-record="reRecord" />
  </div>
</template>
<script setup lang="ts">
import { useMainStore } from "~/store/index"

const SceneStep = resolveComponent("steps-scene-step")
const OptionsStep = resolveComponent("steps-options-step")
const RecordingStep = resolveComponent("steps-recording-step")
definePageMeta({
  auth: false,
})
const store = useMainStore()
const finished = computed((): boolean => store.finished)
const msg = ref(null) as Ref<string | null>

// Start with the Scene component by default
const currentComp = shallowRef(SceneStep)

function switchComponent(compName: STEPS, message: string): void {
  msg.value = message || ""
  currentComp.value =
    compName === STEPS.SCENE
      ? SceneStep
      : compName === STEPS.RECORD
        ? RecordingStep
        : OptionsStep
}

function reRecord(compName: STEPS): void {
  currentComp.value =
    compName === STEPS.SCENE
      ? SceneStep
      : compName === STEPS.RECORD
        ? RecordingStep
        : OptionsStep
  store.reset()
}

onMounted(async () => {
  const { state: micPermissionState } = await usePermissionStatus(
    "microphone" as PermissionName,
  )
  if (micPermissionState === "granted") store.setMicGranted(true)
  const { state: camPermissionState } = await usePermissionStatus(
    "camera" as PermissionName,
  )

  if (camPermissionState === "granted") store.setCamGranted(true)

  if (camPermissionState === "denied" || micPermissionState === "denied") {
    msg.value = `Note:
      It seems that your browser has denied the permission for ${
        micPermissionState && camPermissionState === "denied"
          ? "both the camera and microphone"
          : camPermissionState === "denied"
            ? "the camera"
            : "the microphone"
      }
    therefore you need to manually allow access to your camera from the browser settings to proceed.`
  }

  if (camPermissionState === "prompt" || micPermissionState === "prompt") {
    msg.value = `Note:
    It seems that your browser has not yet asked for the permission for ${
      micPermissionState && camPermissionState === "prompt"
        ? "both the camera and microphone"
        : camPermissionState === "prompt"
          ? "the camera"
          : "the microphone"
    }
    therefore you need to manually allow access to your camera from the browser settings to proceed.`
  }
})
</script>
