<script setup lang="ts">
import { useMainStore } from '~/store';
import Counting from '../recording/Counting.vue';
import ScreenRecording from '../recording/ScreenRecording.vue';
import CamRecording from '../recording/CamRecording.vue';
import Guide from '../models/Guide.vue';
const emit = defineEmits();

const store = useMainStore();
const recording = ref(false);
const start = ref(false);
const stopCam = ref(false);
const readyToStart = ref(false);
const showGuide = ref(false);
const accessGranted = ref(false);

onMounted(() => {
  displayGuide();

  try {
    window.boradcast.getTracks().forEach((track) => track.stop())
  } catch (error) {
    return;
  }

  window.onbeforeunload = () => "Are you sure you want to close the window?";
});

onUnmounted(() => {
  window.onbeforeunload = null;
});


function displayGuide() {
  const audio = store.audioSettings;
  const guideDismissed = localStorage.getItem("guideDismissed") === "true" ? false : true;
  if ((audio === AUDIO.MIC_AND_SYSTEM || audio === AUDIO.SYSTEM) && guideDismissed) {
    showGuide.value = true;
  } else {
    readyToStart.value = true;
  }
}

function closeGuide() {
  showGuide.value = false;
  readyToStart.value = true;
}


function canceled(msg: any) {
  store.setCamReady(false);
  store.setScreenReady(false);
  checkIfReadyToRecord();
  emit("switch", "options", msg);
}

function screenReady() {
  store.setScreenReady(true);
  checkIfReadyToRecord();
}

function camReady() {
  store.setCamReady(true);
  checkIfReadyToRecord();
}

function stopRecording() {
  recording.value = false;
  checkIfRecordingIsFinished();
}

function forceStopCam() {
  stopCam.value = true;
}

function accessDenied() {
  accessGranted.value = false;
  store.setCamError(true);
}

function checkIfReadyToRecord() {
  switch (store.mode) {
    case SCENE.SCREEN_ONLY:
      if (store.screenIsReady) {
        recording.value = true;
      }
      break;
    case SCENE.SCREEN_AND_WEBCAM:
      if (store.screenIsReady && store.camIsReady) {
        recording.value = true;
      }
      break;
    case SCENE.WEBCAM_ONLY:
      if (store.camIsReady) {
        recording.value = true;
      }
      break;
  }
}

function checkIfRecordingIsFinished() {
  switch (store.mode) {
    case SCENE.SCREEN_ONLY:
      if (store.blobs.length > 0) {
        store.setFinished(true);
      }
      break;
    case SCENE.WEBCAM_ONLY:
      if (store.blobs.length > 0) {
        store.setFinished(true);
      }
      break;
    case SCENE.SCREEN_AND_WEBCAM:
      if (store.blobs.length > 1) {
        store.setFinished(true);
      }
      break;
  }
}

function pushCamFile(val: any) {
  const exist = store.blobs.find((b) => b.name === "camRecording");
  if (!exist) {
    store.newBlob({ chunks: val, name: "camRecording" });
    checkIfRecordingIsFinished();
  }
}

function pushScreenFile(val: any) {
  const exist = store.blobs.find((b) => b.name === "screenRecording");
  if (!exist) {
    store.newBlob({ chunks: val, name: "screenRecording" });
    checkIfRecordingIsFinished();
  }
}

watch(recording, (newVal) => {
  if (newVal) start.value = true;
});

</script>






<template>
  <div class="containers">

    <Guide v-on:gotit="closeGuide" v-if="showGuide" :show="showGuide" />

    <ScreenRecording v-if="store.mode != SCENE.WEBCAM_ONLY && readyToStart" @ready="screenReady" @canceled="canceled"
      :recording="recording" :start="start" :finished="store.finished" :resolution="store.currentResolution"
      @downloadlink="pushScreenFile" @forceStopCam="forceStopCam" />

    <CamRecording v-if="store.mode != SCENE.SCREEN_ONLY && readyToStart" @canceled="canceled" @ready="camReady"
      :recording="recording" :start="start" :finished="store.finished" :stopCam="stopCam" @downloadlink="pushCamFile"
      @accessdenied="accessDenied" />

  </div>

  <div v-if="start" class="flex flex-col items-center justify-center recording-box text-center">
    <h3 class="text-2xl">Recording in Progress</h3>
    <Counting />
    <button
      class="border border-red-600 cursor-pointer flex items-center justify-center recording-btn rounded-full w-16 h-16 text-red-400"
      @click="stopRecording">
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
