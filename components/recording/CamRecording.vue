<script setup>
import { useMainStore } from "~/store";
const store = useMainStore()
const emit = defineEmits()
const props = defineProps(["recording", "start", "stopCam"])

const resolution = ref(store.currentResolution)
const states = reactive({
  mediaCamRecorder: null,
  recordedCamBlobs: []
});


onMounted(async () => {
  if (store.camGranted) {
    const ready = await startCambroadcast()
    if (ready) emit("ready")
  }
});

const startCambroadcast = async () => {
  let isReady;

  const constraints = {
    audio: store.micGranted && store.audioSettings != AUDIO.NONE,
    video: resolution
  };
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    window.camstream = stream;
    isReady = true;
  } catch (error) {
    console.log(error);
    console.log(error.name);
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      emit("accessdenied");
      isReady = false;
    }
  }
  return isReady;
}


const startRecordingCam = () => {
  let options = { mimeType: 'video/webm;codecs=h264' };
  try {
    states.mediaCamRecorder = new MediaRecorder(window.camstream, options);
    window.mediaCamRecorder = states.mediaCamRecorder;
  } catch (e) {
    return emit("canceled", "allow access to the microphone and camera to start recording");
  }
  states.mediaCamRecorder.ondataavailable = handleDataAvailable;
  states.mediaCamRecorder.start(1000);
  states.mediaCamRecorder.onended = stopRecordingCam;
}



const handleDataAvailable = (event) => {
  if (event.data && event.data.size > 0) states.recordedCamBlobs.push(event.data);

}


const stopRecordingCam = () => {
  try {
    window.camstream.getTracks().forEach((track) => track.stop());
    states.mediaCamRecorder.stop();
  } catch (error) {
    return;
  }
  emit("downloadlink", states.recordedCamBlobs);
}

watch(() => props.start, (val) => {
  if (val) {
    console.log("start recording cam");
    startRecordingCam();
  }
})

watch(() => props.recording, (val) => {
  if (!val) stopRecordingCam();

})

watch(() => props.stopCam, (val) => {
  if (val) stopRecordingCam();

})

onUnmounted(() => stopRecordingCam())

</script>

<template>
  <br />
</template>
