<script setup lang="ts">
import { ref, computed, defineEmits, watch } from "vue";
import { useMainStore } from "~/store";

const store = useMainStore();
const emit = defineEmits(); // Define the emit function
const camGranted = computed(() => store.camGranted);
const ready = ref(false);


const startBroadcast = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    ready.value = true;
    const gumVideo = document.querySelector("#cam-broadcast") as HTMLVideoElement;

    window.boradcast = stream;
    gumVideo.srcObject = stream;
    store.setCamGranted(true);
    emit("accessGranted");

  } catch (error: any) {
    if (error.name === "NotAllowedError" || error.name === "NotFoundError") {
      ready.value = false;
      emit("accessField");
    }
  }
}
const stopBroadcast = () => {
  if (store.camGranted) {
    try {
      ready.value = false;
      window.boradcast.getTracks().forEach(track => track.stop());
    } catch (error) {
      return;
    }
  }
}
onMounted(() => {
  startBroadcast();
});

onUnmounted(() => {
  stopBroadcast();
});



watch(camGranted, (newVal, oldVal) => {
  if (newVal) {
    startBroadcast();
  } else {
    stopBroadcast();
  }
});

</script>



<template>
  <div id="cam-broadcast_wrapper" class="rounded-md w-full h-full relative">

    <video id="cam-broadcast" class="w-full rounded shadow" :class="{ hidden: !ready }" muted autoplay>
      Your browser doesn't support the video tag
    </video>

    <div class="loading-cam grid justify-center" v-if="!ready">
      <img src="@/assets/images/cam_loading.gif" class="mix-blend-multiply block m-auto" alt="loading cam" />
      <p v-if="camGranted">Cam Preview is loading...</p>
      <div v-if="!camGranted">
        <p class="text-xs text-red-400 my-1 text-center">Cannot access to camera</p>
        <div>
          <button class="btn btn-gradient font-m" @click="emit('AllowAccess')">
            Allow access to Camera
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
