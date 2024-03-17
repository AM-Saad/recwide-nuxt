<script setup lang="ts">
import { ref, reactive, watchEffect } from 'vue';
import { defineProps, defineEmits } from 'vue';

// Define your component's emits
const emit = defineEmits(['cancel', 'register', 'submitPorject']);
const config = useRuntimeConfig()


type WorkerMessage = {
  type: string;
  data: {
    message: string
    identifier: string
    index: number
    totalChunks: number
  };
};

interface SaveProjectData {
  // Keep only the necessary properties for UI
  uploading: boolean;
  uploadError: boolean;
  uploaded: boolean;
  saving: boolean;
  saved: boolean;
  totalSize: number;
  totalMBSize: number;
  totalMbDone: number;
  currentFileIndex: number;
  currentPercent: number;
  videosNames: string[];
  name: string;
  cancled: boolean;
  error: string | null;

}

// Define your project properties as before
const props = defineProps({
  videotype: String,
  isAuth: Boolean,
  mode: String,
  audioSettings: Object,
  resolution: String,
  videos: Array,
  blobs: Array,
  url: String
}) as {
  videotype: string;
  isAuth: boolean;
  mode: string;
  audioSettings: Record<string, unknown>;
  resolution: string;
  videos: string[];
  blobs: any[];
  url: string;
};

// Reactive state for upload data
const state = reactive<SaveProjectData>({
  uploading: false,
  uploadError: false,
  uploaded: false,
  saving: false,
  saved: false,
  totalSize: 0,
  totalMBSize: 0,
  totalMbDone: 0,
  currentFileIndex: 0,
  currentPercent: 0,
  videosNames: [],
  cancled: false,
  name: '',
  error: null
});

const worker = ref<Worker>();

// Initialize the Web Worker
watchEffect(() => {
  worker.value = new Worker('/service-worker/uploadWorker.js', { type: 'module' });
  console.log('Worker initialized');
  worker.value.onmessage = (event: MessageEvent<WorkerMessage>) => {
    const { type, data } = event.data as WorkerMessage;
    // Handle different types of messages: progress, error, completed
    switch (type) {
      case 'progress':
        // Update currentPercent in state based on the totalChunks and index
        state.currentPercent = Math.floor((data.index / data.totalChunks) * 100);
        state.totalMbDone = (data.index * 5) / 100;
        break;
      case 'fileComplete':
        // Handle upload completion
        console.log('fileComplete', data);
        state.currentFileIndex++;
        state.currentPercent = 0;
        state.videosNames.push(data.identifier);
        break;
      case 'error':
        // Handle an upload error
        state.uploadError = true;
        state.error = data.message;
        break;

      case 'allComplete':
        state.uploaded = true;
        state.uploading = false;
        state.currentPercent = .9999
        submitPorject();
        break;
    }
  };
});


onMounted(() => {
  // Register for push notifications

  registerNotfification();

});

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: any) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}



const registerNotfification = async () => {

  try {
    const registration = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      throw new Error('Permission not granted for Notification');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.public.VAPID_PUBLIC_KEY),
    });

    // Send the subscription object to the server
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    console.log('Subscription successful');
  } catch (error) {
    console.error('Error during push notification registration:', error);
  }

}


// Function to start uploading files
const startUploading = () => {
  state.error = null;
  if (!props.blobs.length) return;
  if (state.name === '') return state.error = "Please enter a project name";
  const files = props.blobs.map((blob, index) => {
    let converted = new Blob(blob.chunks, { type: `video/${props.videotype}` });

    const file = new File([converted], `video-${index}.${props.videotype}`, {
      type: `video/${props.videotype}`,
    });
    return file;
  });

  // Start the upload process by sending the files to the worker
  worker.value?.postMessage({ files, uploadUrl: `${config.public.SERVER_URL}/user/projects/upload/chunk` });
  state.uploading = true;
};

const cancel = (e: MouseEvent): void => {
  e.preventDefault();
  e.stopPropagation();
  emit('cancel');
  state.cancled = true;
};


const submitPorject = async () => {


  // state.totalMbDone = state.totalMBSize;

  state.saving = true;
  //   $(".file__value").remove();
  const today = new Date();
  const date = `${today.getFullYear()}/${(today.getMonth() + 1)}/${today.getDate()}`
  console.log(date);
  console.log(state.videosNames);
  const payload = {
    videos: state.videosNames,
    name: state.name,
    mode: props.mode,
    audioSettings: props.audioSettings,
    resolution: props.resolution,
    videotype: props.videotype,
    date: date
  }


  const res = await fetch(`/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })

  const data = await res.json();
  console.log(data);
  state.saving = false;


  state.saved = true;

  // setTimeout(() => {
  //   // this.$emit("finished");
  //   return this.$router.push(`/project/${res.json.projectId}`);
  // }, 100);
}
const calcMegabytes = () => {
  for (let i = 0; i < props.blobs.length; i++) {
    const element = props.blobs[i];
    const myFile = new File(
      [props.blobs[i]],
      element.name + "." + props.videotype,
      {
        type: `video/${props.videotype}`
      }
    );
    state.totalMBSize += myFile.size;

    let obj = props.blobs[i];
    let blob = new Blob(obj.chunks, { type: `video/${props.videotype}` });

    state.totalSize += blob.size;
  }
  state.totalMBSize = Math.ceil(state.totalSize / 1048576);
}



const register = (): void => {
  emit('register');
};



// Add other methods as needed, e.g., for handling UI actions
</script>

<template>
  <div class="backdrop fixed top-0 left-0 w-full h-screen bg-black/50 z-50" @click="cancel">
    <div class="inner absolute left-[50%] top-[50%] p-3 rounded-md shadow-lg bg-white glass-bg
      transform -translate-x-1/2 -translate-y-1/2 w-96" @click.stop>

      <h3 class="font-bold my-4 text-lg">Create New Project</h3>

      <div>
        <div class="flex justify-between items-center">

          <p id="Uploaded" class="text-gray-700">
            <span id="mb"> {{ state.totalMbDone }}</span> / {{ state.totalMBSize }} MB
          </p>

          <div class="text-gray-200 h-8 w-8 rounded-full text-xs bg-gray-700 flex items-center justify-center">
            <p class="timer" data-from="0" :data-to="state.currentPercent" data-speed="800">
              <span v-if="!state.uploaded"> {{ state.currentFileIndex }} </span>
              <span v-if="state.uploaded"> {{ state.currentFileIndex + 1 }} </span> / {{ props.blobs.length }}
            </p>
          </div>
        </div>

        <div class="progress-bar relative w-full my-4" :style="'--progress:' + '00.' + state.currentPercent">

          <div class="box h-8 relative w-full m-auto bg-[#eaeaea57]">

            <p :class="{ hidden: state.uploaded }"
              class="absolute h-full left-0 loading-text text-center text-gray-500 top-[3px] w-full z-10 transition-all">
              Loading <span id="percent">:0</span>%
            </p>

            <p :class="{ 'done-text': !state.uploaded }"
              class="absolute h-full left-0 loading-text text-center text-gray-500 top-[5px] w-full z-10 transition-all">
              Video('s) Successfully Uploaded 🎉</p>

            <div class="box-front absolute left-0 bottom-0 bg-gray-400 w-full h-2 transition-all duration-1000">
            </div>

            <div class="box-bottom absolute left-0 bottom-0 blur-sm bg-black/50 w-full h-1"></div>

          </div>

        </div>

        <div class="mt-2 mb-5">
          <input type="text" name="name" id="name"
            class="w-full border border-gray-200 rounded-md text-sm px-4 mb-2 h-8 text-center"
            placeholder="Project Name.." v-model="state.name" autoComplete="false" />
          <div v-if="state.uploadError || state.error">
            <p class="text-red-400 text-sm">{{ state.error }}</p>
          </div>
        </div>

      </div>

      <div class="flex items-center gap-2 justify-end">
        <button class="btn btn-small glass-bg" @click="cancel">Cancel</button>



        <button class="btn btn-small bg-theme" @click="startUploading"
          v-if="!state.uploading && !state.saving && !state.uploaded && props.isAuth">
          Upload Videos
        </button>

        <button class="btn btn-small bg-theme" @click="register" v-if="!isAuth">Login To Upload</button>

        <button class="btn btn-small bg-theme" @click="submitPorject"
          v-if="!state.uploading && !state.saving && state.uploaded && !state.saved">Save Project</button>

        <button class="btn btn-small btn-success" v-if="state.saved && isAuth">Saved!</button>

        <button class="btn btn-small bg-theme" disabled v-if="state.saving">
          <div class="spinner">
            <div class="double-bounce1"></div>
            <div class="double-bounce2"></div>
          </div>
        </button>

      </div>


    </div>
  </div>
</template>



<style scoped>
@media only screen and (max-width: 767px) and (min-width: 320px) {
  .inner {
    width: 90%;
  }
}

#uploads {
  margin: auto;
  display: block;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 5px;
}

#uploads div {
  padding: 5px;
  background-color: #eee;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

#uploads div .delete {
  background-color: red;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px;
}

.wrap {
  border-radius: 4px;
  background-color: #2e4261;
  box-shadow: 0 1px 2px 0 #c9ced1;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  min-height: 40vh;
}

.progress-bar {
  --progress: 0;
  perspective: 200px;
}

.progress-bar .box {
  transform-style: preserve-3d;
  transform: rotateX(0);
  transition: transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform: rotateX(22deg);
}

.progress-bar.done .box {
  transform: rotateX(0);
}

.progress-bar .box-front {
  transform-origin: center bottom;
  transform: rotateX(95deg);
  transition: transform 1s;
}


.progress-bar.done .box p.loading-text {
  opacity: 0;
  visibility: hidden;
}

.progress-bar:not(.done) .box p.done-text {
  opacity: 0;
  visibility: hidden;
}

.progress-bar .box-bottom {
  transform-origin: center bottom;
  transform: translateZ(-20px);
}

.progress-bar .box::after {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background: #68ff95;
  transform-origin: top left;
  transform: scaleX(var(--progress));
  transition: transform 0.1s;
  box-shadow: 0px 0px 17px 3px rgb(0 255 35 / 71%);
  border-radius: 3px;
}

.progress-bar .box-front::after {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background: #68ff95;
  opacity: 0.3;
  transform-origin: top left;
  transform: scaleX(var(--progress));
  transition: transform 0.1s;
  box-shadow: 0px 0px 20px rgba(100, 255, 121, 0.4);
  border-radius: 3px;
}

@media only screen and (max-width: 767px) and (min-width: 320px) {
  .wrapper {
    width: 90%;
  }
}
</style>
