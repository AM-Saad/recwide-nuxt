<script setup>
import Videos from '../recording/Videos.vue'
import SaveProject from './SaveProject.vue'
import { useMainStore } from '~/store'
const emit = defineEmits()
const { status } = useAuth()
const store = useMainStore()
const blobs = computed(() => store.blobs)

const loading = ref(true)
const showSaveModel = ref(false)
const showRegisterModel = ref(false)
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


</script>


<template>
  <div class="mt-12">
    <div class="head mb-5 group">
      <button tabindex="7" type="button"
        class="goBack flex items-center justify-center relative transform transition-all duration-300 group-hover:-translate-x-2"
        @click="reRecord()">
        <IconsArrowback />
        <span class="text-xs">Re-Record</span>
      </button>
    </div>
    <div class="step relative">
      <Videos v-if="converted" :all-videos="allVideos" />
      <div v-else>Converting...</div>
      <div v-if="loading">Loading...</div>

      <div class="my-3">
        <label for="videotype" class="dark:text-gray-300 mb-2">Select Type</label>
        <select v-model="videotype" id="videotype"
          class="bg-white p-2 border rounded text-gray-600 hover:bg-gray-300 w-full mt">
          <option value="webm" selected>Webm</option>
          <option value="mp4">Mp4</option>
        </select>
      </div>

      <div class="flex gap-x-4 my-2 justify-end">
        <a ref="downloadButton" class="btn glass-bg" download="ams-recorder.webm" name="ams-recorder.webm"
          @click="download">Download</a>
        <a v-if="status === 'authenticated'" class="btn bg-theme" @click="showSaveModel = true">Save</a>
        <a v-if="status !== 'authenticated'" class="btn bg-theme" @click="showRegisterModel = true">Login To
          Save</a>
      </div>

      <SaveProject v-if="showSaveModel" :videotype="videotype" :videos="allVideos" @cancel="showSaveModel = false"
        @finished="reRecord" @register="showRegisterModel = true" />

      <ModelsAuth :show="showRegisterModel" @cancel="showRegisterModel = false" />
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
