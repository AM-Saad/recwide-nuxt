<script setup lang="ts">
  import { useMainStore } from '~/store'

  const store = useMainStore()
  const emit = defineEmits(['gotit', 'proceedAnyway'])
  defineProps({
    show: {
      type: Boolean,
      default: false
    }
  })

  const micGranted = computed((): boolean => store.micGranted)
  const camGranted = computed((): boolean => store.camGranted)

  // Helper to determine the title message
  const recordingMessage = computed(() => {
    // Check for SCREEN_ONLY scene
    if (store.mode === SCENE.SCREEN_ONLY) {
      if (
        (store.audioSettings === AUDIO.MIC ||
          store.audioSettings === AUDIO.MIC_AND_SYSTEM) &&
        !micGranted.value
      ) {
        return 'Microphone will not be recorded.'
      }
    }
    // Check for SCREEN_AND_WEBCAM scene
    else if (store.mode === SCENE.SCREEN_AND_WEBCAM) {
      if (
        (store.audioSettings === AUDIO.MIC_AND_SYSTEM ||
          store.audioSettings === AUDIO.MIC) &&
        !micGranted.value &&
        !camGranted.value
      ) {
        return 'Webcam and Microphone will not be recorded.'
      } else if (!camGranted.value) {
        return 'Webcam will not be recorded.'
      } else if (!micGranted.value) {
        return 'Microphone will not be recorded.'
      } 
    }
    // Check for WEBCAM_ONLY scene
    else if (store.mode === SCENE.WEBCAM_ONLY) {
      if (!camGranted.value) {
        return 'Webcam will not be recorded.'
      } else if (
        (store.audioSettings === AUDIO.MIC ||
          store.audioSettings === AUDIO.MIC_AND_SYSTEM) &&
        !micGranted.value
      ) {
        return 'Microphone will not be recorded.'
      }
    }
    return null // No message needed if conditions are not met
  })

  const checkPermissions = ():void => emit('gotit')

  const proceedAnyway = ():void => emit('proceedAnyway')
</script>

<template>
  <Teleport to="body">
    <UiDialogModal
:show="show"
@close="checkPermissions">
      <template #header>
        <div class="flex">
          <div id="title">
            <div class="title">
              {{ recordingMessage }}
            </div>
          </div>
          <div id="icons">
            <div
              v-if="!micGranted && !camGranted"
              class="icon mt-2 flex gap-x-2"
            >
              <IconsMicNotAllowed />
              <IconsCamNotAllowed />
            </div>
            <div
              v-if="!micGranted && camGranted"
              class="icon mt-2 flex gap-x-2"
            >
              <IconsMicNotAllowed />
            </div>
            <div
              v-if="micGranted && !camGranted"
              class="icon mt-2 flex gap-x-2"
            >
              <IconsCamNotAllowed />
            </div>
          </div>
        </div>
      </template>

      <template #body>
        <div class="desc text-sm text-gray-500">
          If you continue, the content without permissions will not be recorded.
          Do you want to continue recording?
        </div>
      </template>

      <template #footer>
        <div class="mt-3 flex gap-3">
          <button
            class="btn btn-gradient btn btn-gradient-info"
            @click="checkPermissions"
          >
            Check Permissions
          </button>
          <button
class="btn bg-yellow-400"
@click="proceedAnyway">
            Continue Recording
          </button>
        </div>
      </template>
    </UiDialogModal>
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
