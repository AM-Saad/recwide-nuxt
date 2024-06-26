<script setup>

import { useMainStore } from "~/store";

const emit = defineEmits();
const mainStore = useMainStore()


const props = defineProps(["recording", "start", "stopCam"]);

const states = reactive({
  blobs: [],
  individualAudioStreams: [],
  rec: null,
  screenError: null,
});


const getOptions = () => {
  let options = {};

  if (mainStore.audioSettings === "Microphone + System audio") {
    options = {
      video: { video: mainStore.currentResolution, audio: true },
      audio: { audio: true },
    };
  } else if (mainStore.audioSettings === "Microphone") {
    options = {
      video: { video: mainStore.currentResolution },
      audio: { audio: true },
    };
  } else if (mainStore.audioSettings === "System audio") {
    options = {
      video: { video: mainStore.currentResolution, audio: true },
      audio: { audio: false },
    };
  } else {
    options = {
      video: { video: mainStore.currentResolution },
      audio: { audio: false },
    };
  }
  return options;
}



const mergeAudioStreams = (desktopStream, voiceStream) => {
  const context = new AudioContext();
  const destination = context.createMediaStreamDestination();
  let hasDesktop = false;
  let hasVoice = false;
  if (desktopStream && desktopStream.getAudioTracks().length > 0) {
    // If you don't want to share Audio from the desktop it should still work with just the voice.
    const source1 = context.createMediaStreamSource(desktopStream);
    const desktopGain = context.createGain();
    desktopGain.gain.value = 0.7;
    source1.connect(desktopGain).connect(destination);
    hasDesktop = true;
    states.individualAudioStreams.push(desktopStream);
  }

  if (voiceStream && voiceStream.getAudioTracks().length > 0) {
    const source2 = context.createMediaStreamSource(voiceStream);
    const voiceGain = context.createGain();
    voiceGain.gain.value = 0.7;
    source2.connect(voiceGain).connect(destination);
    hasVoice = true;
    states.individualAudioStreams.push(voiceStream);
  }
  window.audioCtx = context;

  return hasDesktop || hasVoice ? destination.stream.getAudioTracks() : [];
}


const shareScreen = async (options) => {
  const audio = options.video.audio || false;
  const mic = options.audio.audio || false;
  let desktopStream;
  let voiceStream;
  let canceled = false;
  try {
    desktopStream = await navigator.mediaDevices.getDisplayMedia({
      video: options.video.video,
      audio: audio,
    });
  } catch (error) {
    console.log(error);
    canceled = true;
    emit(
      "canceled",
      `<p class="text-orange-300 pt-10 text-lg">You need to share your screen to start recording.</p>
        <br/>
       <br/> 
       Notes: If you are sharing your screen and still see this message, please check your browser settings.

      <br/> If you are using Safari, please make sure you are using Safari 14 or later.
      <br/>
      <br/>
      <p>If you're willing to share the Webcam only, please consider switching to The Webcam Mode.</p>

      <p>Go Back <a class="text-blue-300" href="/recorder?mode=webcam#Scene">Here</a></p>
       `
    );
  }

  try {
    if (mic === true && mainStore.micGranted) {
      voiceStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: mic,
      });
    }
  } catch (error) {
    canceled = true;

    emit(
      "canceled",
      "allow access to the microphone to start recording"
    );
  }

  if (!canceled) {
    const tracks = [
      ...desktopStream.getVideoTracks(),
      ...mergeAudioStreams(desktopStream, voiceStream),
    ];
    const streams = new MediaStream(tracks);
    window.screenStream = streams;
    return true;
  }
}


const startRecording = () => {
  states.blobs = [];

  states.rec = new MediaRecorder(window.screenStream);

  try {
    window.screenStream
      .getVideoTracks()[0]
      .addEventListener("ended", () => emit("forceStopCam"));

    if (mainStore.audioSettings !== "No audio") {
      window.screenStream.getVideoTracks()[0].onended = function () {
        stopRecording();
      };
    } else {
      states.rec.onstop = function () {
        stopRecording();
      };
    }
  } catch (error) {
    emit(
      "canceled",
      "Something went wrong, please try again"
    );
    return;
  }

  states.rec.ondataavailable = handleDataAvailable;
  states.rec.start(1000);

}
const handleDataAvailable = (event) => {
  if (event.data && event.data.size > 0) {
    states.blobs.push(event.data);
  }
}

const stopRecording = async () => {
  try {
    states.individualAudioStreams.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    states.individualAudioStreams = [];
    window.screenStream.getTracks().forEach((s) => s.stop());
    window.screenStream.getVideoTracks().forEach((s) => s.stop());
    states.rec.stop();
    console.log(states.blobs)
    emit("downloadlink", states.blobs);

    await window.audioCtx.close();
  } catch (error) {
    return;
  }
}

onMounted(async () => {
  const options = getOptions();
  const ready = await shareScreen(options);
  if (ready) {
    emit("ready");
  }
});

watch(() => props.start, (val) => {
  if (val === true) {
    startRecording();
  }
}
);

watch(() => props.recording, (val) => {
  if (val === false) {
    stopRecording();
  }
}
);

onUnmounted(() => {
  if (mainStore.camerror) {
    setTimeout(() => {
      this.stopRecording();
    }, 1000);
  }
});



</script>
<template>
  <div>
    <div id="error">{{ states.screenError }}</div>
  </div>
</template>


<style scoped>
video {
  width: 70%;
  max-height: 70vh;
  margin: var(--m-margin) auto;
  display: block;
  box-shadow: var(--shadow3);
  border: 1px solid #ccc;
}
</style>
