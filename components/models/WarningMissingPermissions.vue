<script setup lang="ts">

import { defineEmits } from 'vue'
import { useMainStore } from '~/store'

const store = useMainStore()
const emit = defineEmits();
defineProps({
  show: Boolean
})

const micGranted = computed((): boolean => store.micGranted)
const camGranted = computed((): boolean => store.camGranted)

// Helper to determine the title message
const recordingMessage = computed(() => {
  // Check for SCREEN_ONLY scene
  if (store.mode === SCENE.SCREEN_ONLY) {
    if ((store.audioSettings === AUDIO.MIC || store.audioSettings === AUDIO.MIC_AND_SYSTEM) && !micGranted.value) {
      return "Microphone will not be recorded."
    }
  }
  // Check for SCREEN_AND_WEBCAM scene
  else if (store.mode === SCENE.SCREEN_AND_WEBCAM) {
    if ((store.audioSettings === AUDIO.MIC_AND_SYSTEM || store.audioSettings === AUDIO.MIC) && !micGranted.value && !camGranted.value) {
      return "Webcam and Microphone will not be recorded."
    } else if (!camGranted.value) {
      return "Webcam will not be recorded."
    } else if (!micGranted.value) {
      return "Microphone will not be recorded."
    } else if ((store.audioSettings === AUDIO.NONE || store.audioSettings === AUDIO.SYSTEM) && !camGranted.value) {
      return "Webcam will not be recorded."
    }
  }
  // Check for WEBCAM_ONLY scene
  else if (store.mode === SCENE.WEBCAM_ONLY) {
    if (!camGranted.value) {
      return "Webcam will not be recorded."
    } else if ((store.audioSettings === AUDIO.MIC || store.audioSettings === AUDIO.MIC_AND_SYSTEM) && !micGranted.value) {
      return "Microphone will not be recorded."
    }
  }
  return null // No message needed if conditions are not met
})

const checkPermissions = () => emit("gotit")

const proceedAnyway = () => emit("proceedAnyway")

</script>


<template>
  <Teleport to="body">
    <UiModel :show="show" @close="checkPermissions">
      <template #header>
        <div class="flex">
          <div id="title">
            <div class="title">
              {{ recordingMessage }}
            </div>
          </div>
          <div id="icons">
            <div class="flex gap-x-2 icon mt-2" v-if="!micGranted && !camGranted">
              <IconsMicNotAllowed />
              <IconsCamNotAllowed />
            </div>
            <div class="flex gap-x-2 icon mt-2" v-if="!micGranted && camGranted">
              <IconsMicNotAllowed />
            </div>
            <div class="flex gap-x-2 icon mt-2" v-if="micGranted && !camGranted">
              <IconsCamNotAllowed />
            </div>
          </div>
        </div>
      </template>

      <template #body>
        <div class="desc text-gray-500 text-sm">
          If you continue, the content
          without permissions will not be recorded. Do you want to continue
          recording?
        </div>
      </template>

      <template #footer>
        <div class="flex gap-3 mt-3">
          <button class="btn btn-gradient btn btn-gradient-info" @click="checkPermissions">Check Permissions</button>
          <button class="btn bg-yellow-400" @click="proceedAnyway">Continue Recording</button>
        </div>
      </template>
    </UiModel>
  </Teleport>
</template>


<style scoped>
.inner video {
  margin: auto;
  display: block;
  max-width: 90%;
}

@media only screen and (max-width: 767px) and (min-width: 320px) {
  .inner {
    width: 90%;
  }
}
</style>
