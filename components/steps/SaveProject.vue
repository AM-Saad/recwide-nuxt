<script setup lang="ts">

interface SaveProjectData {
  dontShow: boolean;
  name: string;
  socket: any;
  uploading: boolean;
  uploadError: boolean;
  uploaded: boolean;
  saving: boolean;
  saved: boolean;
  fReader: any;
  totalSize: number;
  totalMBSize: number;
  totalMbDone: number;
  allDone: boolean;
  currentFile: any;
  currentFileIndex: number;
  lastPercent: number;
  currentPercent: number;
  videosNames: any[];
  cancled: boolean;
  uploadedBytes: number;
  isReading: boolean;
  readQueue: any[];
}
import io from 'socket.io-client'


const emit = defineEmits()
const state = reactive({
  dontShow: false,
  name: '',
  socket: null,
  uploading: false,
  uploadError: false,
  uploaded: false,
  saving: false,
  saved: false,
  fReader: null,
  totalSize: 0,
  totalMBSize: 0,
  totalMbDone: 0,
  allDone: false,
  currentFile: null,
  currentFileIndex: 0,
  lastPercent: 0,
  currentPercent: 0,
  videosNames: [],
  cancled: false,
  uploadedBytes: 0,
  isReading: false,
  readQueue: [],
}) as SaveProjectData;

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
  audioSettings: any;
  resolution: string;
  videos: any[];
  blobs: any[];
};

const socketState = reactive({
  connected: false,
  fooEvents: [],
  barEvents: [],
});

const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:8000';

const socket = io(URL, {
  transports: ['websocket'],
  upgrade: false,
  reconnection: false,
});

socket.on('more-data', function (data: any): void {
  updateProgressBar(data.Percent)
  calcMegabytesDone()
  handleMoreData(data)

});

socket.on('Done', function (): void {
  if (props.blobs.length > state.currentFileIndex + 1) {
    console.log('Done');

    setTimeout(() => {
      state.currentFileIndex = state.currentFileIndex + 1;
      startUploading();
    }, 2000);

  } else {
    state.uploaded = true;
    state.uploading = false;
    state.currentPercent = 99
    state.videosNames.forEach(function (value, i): void {
      localStorage.removeItem(`video/${i}`);
    });
    state.totalMbDone = Math.round(((state.currentPercent / 100.0) * state.currentFile?.size) / 1048576);
  }
});

socket.on('error', function (): void {
  console.log('error');
  state.uploadError = true;
});



const handleMoreData = (data: any): void => {


  // Calculate and read the next chunk
  const nextChunkStart = data.Place * 524288
  const nextChunkEnd = Math.min(nextChunkStart + 524288, state.currentFile?.size)
  const newFile = state.currentFile?.slice(nextChunkStart, nextChunkEnd)
  state.fReader?.readAsArrayBuffer(newFile)
}



const startUploading = (): void => {
  state.uploading = true;
  state.cancled = false;

  const { selectedFile, name } = getReadyToUploadVideo();

  state.videosNames.push(name);

  state.currentFile = selectedFile;
  state.fReader = new FileReader();

  state.fReader.onload = function (e: any): void {
    socket.emit('upload', {
      Name: name,
      Data: e.target.result,
    });
  };

  state.fReader.onerror = (error: any): void => {
    console.error('Error reading file:', error)
  }


  socket.emit('start', {
    Name: name,
    Size: state.currentFile.size,
  });
};

const getReadyToUploadVideo = () => {
  const alreadyStarted = localStorage.getItem(`video/${state.currentFileIndex}`);

  let name;

  if (!alreadyStarted) {
    name = createVideoNameAndSaveToStorage();
  } else {
    name = alreadyStarted;
  }
  let obj: any = props.blobs[state.currentFileIndex];
  let blob = new Blob(obj.chunks, { type: `video/${props.videotype}` });
  const selectedFile = new File([blob], name + '.' + props.videotype, {
    type: `video/${props.videotype}`,
  });
  return { selectedFile, name };
};



const submitPorject = async () => {
  if (!state.name) return (document.querySelector('.video-error')!.innerHTML = 'Please add project name. ');
  let bar: any = document.getElementsByClassName('progress-bar')[0];
  bar.classList.add('done');

  bar.style = `--progress: 1`;
  state.currentPercent = 100;

  document.getElementById('percent')!.innerHTML = '100';
  state.totalMbDone = state.totalMBSize;

  state.saving = true;
  //   $(".file__value").remove();
  const today = new Date();
  const date = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();

  const payload = {
    videos: state.videosNames,
    name: state.name,
    mode: props.mode,
    audioSettings: props.audioSettings,
    resolution: props.resolution,
    videotype: props.videotype,
    date: date,
  };

  const headers = useRequestHeaders(['cookie']) as HeadersInit
  // const { data: projects, pending } = await useFetch(`/api/projects`,
  //   {
  //     method: 'POST' as string,
  //     body: JSON.stringify(payload),
  //   })
  const { data }: any = await $fetch(`/api/projects`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  })

  console.log(data)

  state.saving = false;

  window.onbeforeunload = null;
  state.saved = true;

  setTimeout((): void => {
    emit("finished");
    // return router.push(`/project/${res.json.projectId}`);
  }, 100);
};


const updateProgressBar = (percent: any): void => {
  state.lastPercent = state.lastPercent;
  state.currentPercent = percent;

  let bar: any = document.getElementsByClassName('progress-bar')[0];
  if (state.currentPercent >= 0.45) {
    // $(".box p").addClass("c-b");
  }
  bar.style = `--progress: 00.${state.currentPercent}`;

  document.getElementById('percent')!.innerHTML = `${Math.round(state.currentPercent * 100) / 100}`
};
const calcMegabytes = (): void => {
  for (let i = 0; i < props.blobs.length; i++) {
    const element: any = props.blobs[i];
    const myFile = new File([props.blobs[i]], element.name + '.' + props.videotype, {
      type: `video/${props.videotype}`,
    });
    state.totalMBSize += myFile.size;

    let obj: any = props.blobs[i];
    let blob = new Blob(obj.chunks, { type: `video/${props.videotype}` });

    state.totalSize += blob.size;
  }
  state.totalMBSize = Math.ceil(state.totalSize / 1048576);
};
const calcMegabytesDone = (): void => {
  let MBDone = Math.round(((state.currentPercent / 100.0) * state.currentFile?.size) / 1048576);
  const total = state.totalMbDone + MBDone;
  state.totalMbDone = total;
};

const createVideoNameAndSaveToStorage = (): string => {
  var today = new Date();
  var date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate();
  var time = today.getHours() + '_' + today.getMinutes() + '_' + today.getSeconds();

  var random_number = Math.floor(Math.random() * 10);

  let completeName = date + '_' + time + random_number;

  localStorage.setItem(`video/${state.currentFileIndex}`, completeName);
  return completeName;
};

const cancel = (): void => {
  emit('cancel');
  state.cancled = true;
};

const checkBroswerSupport = (): void => {
  let bar: any = document.getElementsByClassName('progress-bar')[0];
  bar.style = `--progress: ${0}`;
  window.addEventListener('load', Ready);
  calcMegabytes();

  function Ready() {
    if (window.File && window.FileReader) {
      //These are the relevant HTML5 objects that we are going to use
    } else {
      document.getElementById('UploadArea')!.innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
    }
  }
};


const register = (): void => {
  emit('register');
};
</script>

<template>
  <div class="backdrop">
    <div class="inner">
      <div class="inner-title">Create New Project</div>
      <div>
        <div class="flex justify-between">
          <div class="mb">
            <span id="Uploaded" class="none">
              <span id="mb">{{ state.totalMbDone }}</span>/{{ state.totalMBSize }} MB</span>
          </div>
          <div class="circulr">
            <span class="title timer" data-from="0" :data-to="state.currentPercent" data-speed="800"><span
                v-if="!state.uploaded">{{ state.currentFileIndex }}</span> <span v-if="state.uploaded">{{
                  state.currentFileIndex + 1 }}</span> /
              {{ props.blobs.length }}</span>
          </div>
        </div>
        <div class="progress-bar" :style="'--progress:' + '00.' + state.currentPercent">
          <div class="box">
            <p :class="{ none: state.uploaded }" class="loading-text">Loading <span id="percent">:0</span>%</p>
            <p :class="{ 'done-text': !state.uploaded }">Video('s) Successfully Uploaded 🎉</p>
            <div class="box-front"></div>
            <div class="box-bottom"></div>
          </div>
        </div>

        <span id="UploadArea"> </span>
        <div v-if="!state.uploading && !state.saving && state.uploaded && !state.saved">
          <input type="text" name="name" id="name" class="form-control" placeholder="Add Project Name.."
            v-model="state.name" autoComplete="false" />
          <p class="video-error c-r"></p>
        </div>
      </div>
      <div class="flex f-space-between">
        <button class="btn" @click="cancel">Cancel</button>
        <button class="btn btn-gradient" @click="startUploading"
          v-if="!state.uploading && !state.saving && !state.uploaded && props.isAuth">
          Upload Videos
        </button>
        <button class="btn btn-gradient" @click="register" v-if="!isAuth">Login To Upload</button>
        <button class="btn btn-info" @click="submitPorject"
          v-if="!state.uploading && !state.saving && state.uploaded && !state.saved">
          Save Project
        </button>
        <button class="btn btn-success" v-if="state.saved && isAuth">Saved!</button>
        <button class="btn btn-info" disabled v-if="state.saving">
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
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.782);
  z-index: 99999999;
}

.inner {
  background-color: #fff;
  border-radius: var(--m-radius);
  border: 1px solid #ccc;
  padding: var(--m-padding);
  position: absolute;
  width: 40%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.inner-title {
  font-weight: bold;
  margin: var(--m-margin) 0;
  font-size: 22px;
}

input[type='text'] {
  height: 80px;
  margin-top: var(--s-margin);
  margin-bottom: var(--m-margin);
}

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

.circulr {
  color: #fff;
  line-height: 50px;
  height: 35px;
  width: 35px;
  background: #000;
  line-height: 35px;
  margin-top: 10px;
  text-align: center;
  border-radius: 50px;
  padding: 1px;
  font-size: 13px;
}

.progress-bar {
  --progressbar-color: rgb(255, 255, 255);
  --progress-color: rgba(104, 255, 149, 1);
  --progress: 0;
  --box-side-height: 6px;
  position: relative;
  width: 100%;
  height: 75px;
  perspective: 200px;
  margin: 15px 0;
}

.progress-bar .box {
  position: relative;
  width: 100%;
  height: 30px;
  background: var(--progressbar-color);
  transform-style: preserve-3d;
  transform: rotateX(0);
  transition: transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform: rotateX(12deg);
  border-radius: 3px;
  margin: auto;
}

.progress-bar.done .box {
  transform: rotateX(0);
}

.progress-bar .box-front {
  position: absolute;
  background: #b9b8b8;
  width: 100%;
  height: 22px;
  left: 0;
  bottom: 0;
  transform-origin: center bottom;
  transform: rotateX(95deg);
  transition: transform 1s;
  border-radius: 3px;
}

.progress-bar .box p {
  position: absolute;
  top: 5px;
  left: 0;
  color: #333;
  text-align: center;
  width: 100%;
  height: 100%;
  line-height: 100%;
  z-index: 99;
  transition:
    opacity 1s,
    visibility 1s;
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
  position: absolute;
  background: #111;
  opacity: 0.4;
  width: 100%;
  height: var(--box-side-height);
  left: 0;
  bottom: 0;
  transform-origin: center bottom;
  transform: translateZ(-30px);
  transition: transform 1s;
  filter: blur(10px);
}

.progress-bar .box::after {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background: var(--progress-color);
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
  background: var(--progress-color);
  opacity: 0.3;
  transform-origin: top left;
  transform: scaleX(var(--progress));
  transition: transform 0.1s;
  box-shadow: 0px 0px 20px rgba(100, 255, 121, 0.4);
  border-radius: 3px;
}

.mb {
  margin: 10px;
  font-size: 19px;
  color: #333;
}

#UploadButton {
  border: 0;
  border-radius: 3px;
  background-color: #ff9445;
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 18%);
  padding: 0.9375rem 1.0625rem;
  margin: -0.9375rem -1.0625rem;
  color: white;
  cursor: pointer;
  /* float: right; */
  display: block;
  margin: auto;
}

.footer-copyright {
  background-color: #ff9445;
  text-align: center;
  padding: 5px;
  border-radius: 5px;
  color: #333;
  position: absolute;
  bottom: 0;
  width: 100%;
}

@media only screen and (max-width: 767px) and (min-width: 320px) {
  .wrapper {
    width: 90%;
  }
}
</style>
