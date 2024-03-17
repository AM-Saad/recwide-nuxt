<script setup lang="ts">
import { ref, onMounted, computed, watch, defineEmits } from 'vue';
import { useMainStore } from '~/store'

const store = useMainStore()
const emit = defineEmits(["switch"]);

const mediaRequested = ref(false);
const showMissingPermissionModel: Ref<boolean> = ref(false);
const showHowToAccessModel: Ref<boolean> = ref(false);
const needGuide: Ref<string> = ref("");
const camPreviewInitiated = ref(false);
const missingPermissionsConfirmed = ref(false)

const isMissingPermissions = computed(() => {
  return {
    screenAndWebcam: !store.camGranted || (!store.micGranted && store.audioSettings !== AUDIO.NONE && store.audioSettings !== AUDIO.SYSTEM),
    webcam: !store.camGranted || ((store.audioSettings == AUDIO.MIC || store.audioSettings === AUDIO.MIC_AND_SYSTEM) && !store.micGranted),
    screen: (store.audioSettings === AUDIO.MIC_AND_SYSTEM || store.audioSettings === AUDIO.MIC) && !store.micGranted,
  }
})


const canProceedWithWebcam = computed(() => {
  if (store.mode === SCENE.WEBCAM_ONLY) {
    return store.camGranted;
  }
  return true;
}
);
const canProceed = computed(() => (mediaRequested.value && camPreviewInitiated.value && canProceedWithWebcam.value));


function openHowToAllowAccessModel(reqGuide: any) {
  needGuide.value = reqGuide;
  showHowToAccessModel.value = true;
}

function switchComponent(comp: string) {
  emit("switch", comp);
}



function proceed(): void {
  if (missingPermissionsConfirmed.value) {
    showMissingPermissionModel.value = true;
  } else {
    emit("switch", "Recording");
  }
}


function proceedAnyway(): void {
  showMissingPermissionModel.value = false;

  if (store.mode === SCENE.WEBCAM_ONLY && !store.camGranted) {
    showHowToAccessModel.value = true;
  }

  if (store.mode === SCENE.SCREEN_AND_WEBCAM && !store.camGranted) {
    store.changeMode(SCENE.SCREEN_ONLY);
    emit("switch", "Recording");
  }

  if (store.mode != SCENE.SCREEN_ONLY && store.camGranted) {
    emit("switch", "Recording");
  }

  if (store.mode == SCENE.SCREEN_ONLY && (!store.micGranted || !store.camGranted)) {
    emit("switch", "Recording");
  }

}



onMounted(async () => {
  if (isMissingPermissions.value[store.mode]) {
    await requestUserMedia();
  } else {
    mediaRequested.value = true;
  }

  if (store.mode !== SCENE.WEBCAM_ONLY && store.mode !== SCENE.SCREEN_AND_WEBCAM) {
    camPreviewInitiated.value = true;
  }

})

const requestUserMedia = async () => {
  console.log("Requesting User Media");
  try {
    await navigator.mediaDevices.getUserMedia({
      video: store.mode === SCENE.WEBCAM_ONLY || store.mode === SCENE.SCREEN_AND_WEBCAM && !store.camGranted,
      audio: store.audioSettings === AUDIO.MIC || store.audioSettings === AUDIO.MIC_AND_SYSTEM
    });
    store.setCamGranted(true);
    store.setMicGranted(true);
    missingPermissionsConfirmed.value = false;
    mediaRequested.value = true;


  } catch (error) {
    const { state, granted: camGranted } = await checkPermission('camera' as PermissionName);
    const { state: micState, granted: micGranted } = await checkPermission('microphone' as PermissionName);
    if (state === "denied" || micState === "denied") {
      missingPermissionsConfirmed.value = true;
    }
    store.setCamGranted(camGranted);
    store.setMicGranted(micGranted);
    mediaRequested.value = true;
    return;
  }

}

onUnmounted(() => {
  try {
    window.camstream.getTracks().forEach((track) => track.stop());
    window.boradcast.getTracks().forEach((track) => track.stop());
  } catch (error) {
    return;
  }
});

</script>

<template>
  <div class="step step-scene-select active mt-12">
    <h1 class="title text-left">Audio Options</h1>

    <div class="head mb-5">
      <button tabindex="7" type="button" class="goBack flex items-center justify-center"
        @click="switchComponent('Scene')">
        <IconsArrowback />
        <span class="text-xs">Back To Recording Scene</span>
      </button>
    </div>

    <ModelsHowToAllowAccess @close="showHowToAccessModel = false" :show="showHowToAccessModel" :needGuide="needGuide" />

    <ModelsWarningMissingPermissions @gotit="showMissingPermissionModel = false" :show="showMissingPermissionModel"
      @proceedAnyway="proceedAnyway" />

    <div class="grid mb-3 md:grid-cols-2 gap-5">
      <div class="step-cam-preview w-full h-full">
        <RecordingAudioOptions @openAllowAccess="openHowToAllowAccessModel" />
      </div>
      <RecordingCamPreview v-if="store.mode === SCENE.SCREEN_AND_WEBCAM || store.mode === SCENE.WEBCAM_ONLY"
        :ready="mediaRequested" v-on:AllowAccess="openHowToAllowAccessModel('Webcam')"
        @accessGranted="camPreviewInitiated = true" @accessField="camPreviewInitiated = true" />
    </div>

    <button class="btn glass-bg" v-if="canProceed" @click="proceed()" tabindex="6">
      Start Recording
    </button>
    <button class="btn glass-bg" style="opacity: 0.5" tabindex="6" v-if="!canProceed">
      Start Recording
    </button>

  </div>
</template>
