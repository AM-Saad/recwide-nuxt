
<script setup>
import Videos from '../recording/Videos.vue'
import SaveProjectBgSync from './SaveProjectBgSync.vue'
import { useMainStore } from '~/store'
const emit = defineEmits()
const { status } = useAuth()
const store = useMainStore()
const mode = computed(() => store.mode)
const audioSettings = computed(() => store.audioSettings)
const resolution = computed(() => store.resolution)
const url = computed(() => store.url)
const blobs = computed(() => store.blobs)

const loading = ref(true)
const saveTheProject = ref(false)
const register = ref(false)
const allVideos = ref([])
const converted = ref(false)
const videotype = ref('mp4')

onMounted(() => createRenderUrl())

function reRecord() {
  if (confirm('Your records will be lost, are you sure you want to leave?')) {
    converted.value = false
    allVideos.value = []
    videotype.value = 'mp4'
    emit('re-record')
  }
}

function download() {
  const temporaryDownloadLink = document.createElement('a')
  temporaryDownloadLink.style.display = 'none'
  document.body.appendChild(temporaryDownloadLink)
  for (let n = 0; n < blobs.value.length; n++) {
    const obj = blobs.value[n]
    const blob = new Blob(obj.chunks, { type: `video/${videotype.value}` })
    const url = window.URL.createObjectURL(blob)
    temporaryDownloadLink.setAttribute('href', url)
    temporaryDownloadLink.setAttribute('download', obj.name)
    temporaryDownloadLink.click()
  }
  document.body.removeChild(temporaryDownloadLink)
}

function createRenderUrl() {
  for (let n = 0; n < blobs.value.length; n++) {
    const obj = blobs.value[n]
    const blob = new Blob(obj.chunks, { type: `video/${videotype.value}` })
    const file = new File([blob], `video-${obj.name}.${videotype.value}`, {
      type: `video/${videotype.value}`,
    });
    const url = window.URL.createObjectURL(file)
    allVideos.value.push({ url, name: obj.name })
  }
  converted.value = true
  loading.value = false
}

function closeSaveModel() {
  saveTheProject.value = false
}

function openSaveModel() {
  saveTheProject.value = true
}

function closeAuthFormModel() {
  register.value = false
}

function openAuthFormModel() {
  register.value = true
}
</script>


<template>
  <div>
    <div class="head">
      <div class="goBack" @click="reRecord()">
        <i class="fas fa-arrow-left icon" />
        <span>Re-record</span>
      </div>
    </div>
    <div class="step relative">
      <Videos v-if="converted" :all-videos="allVideos" />
      <div v-else>
        'Converting...'
      </div>
      <div v-if="loading">
        Loading...
      </div>
      <div class="my-3">
        <label for="videotype">Select Type</label>
        <select v-model="videotype" class="bg-white p-2 border rounded text-gray-600 hover:bg-gray-300 w-full mt">
          <option value="webm" selected>Webm</option>
          <option value="mp4">Mp4</option>
        </select>
      </div>
      <div class="flex gap-x-4 my-2 justify-end">
        <a ref="downloadButton" class="btn " download="ams-recorder.webm" name="ams-recorder.webm"
          @click="download">Download</a>
        <a v-if="status === 'authenticated'" class="btn bg-theme" @click="openSaveModel()">Save</a>
        <a v-if="status !== 'authenticated'" class="btn bg-theme" @click="openAuthFormModel()">Login To Save...</a>
      </div>

      <SaveProjectBgSync v-if="saveTheProject" :videotype="videotype" :videos="allVideos" :blobs="blobs"
        :audio-settings="audioSettings" :mode="mode" :is-auth="status === 'authenticated'" :resolution="resolution"
        :url="url" @cancel="closeSaveModel" @finished="reRecord" @register="openAuthFormModel" />

      <ModelsAuth :show="register" @cancel="closeAuthFormModel" />
    </div>
  </div>
</template>



<style scoped>
.wrapper {
  width: 75% !important;
  margin: var(--m-margin) auto !important;
}

.head i {
  color: var(--main-color);
  margin-right: var(--m-margin);
}

.step {
  margin-top: 0;
  padding: 0;
}
</style>
