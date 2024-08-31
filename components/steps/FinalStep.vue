<script setup lang="ts">
import SaveProject from "./SaveProject.vue"
import { useMainStore } from "~/store"

const emit = defineEmits(["re-record"])
const { status } = useAuth()
const store = useMainStore()
const blobs = computed(() => store.blobs)

const loading = ref(true)
const showSaveModel = ref(false)
const showRegisterModel = ref(false)
const allVideos = ref([]) as Ref<{ url: string; name: string }[]>
const converted = ref(false)
const videotype = ref("mp4")

onMounted(() => createRenderUrl())

function reRecord() : void {
  if (confirm("Your records will be lost, are you sure you want to leave?")) {
    converted.value = false
    allVideos.value = []
    videotype.value = "mp4"
    emit("re-record")
  }
}

function download():void {
  const temporaryDownloadLink = document.createElement("a")
  temporaryDownloadLink.style.display = "none"
  document.body.appendChild(temporaryDownloadLink)
  for (let n = 0; n < blobs.value.length; n++) {
    const obj = blobs.value[n] as { name: string; chunks: BlobPart[] }
    const blob = new Blob(obj.chunks, { type: `video/${videotype.value}` })
    const url = window.URL.createObjectURL(blob)
    temporaryDownloadLink.setAttribute("href", url)
    temporaryDownloadLink.setAttribute("download", obj.name)
    temporaryDownloadLink.click()
  }
  document.body.removeChild(temporaryDownloadLink)
}

function createRenderUrl():void {
  for (let n = 0; n < blobs.value.length; n++) {
    const obj = blobs.value[n] as { name: string; chunks: BlobPart[] }
    const blob = new Blob(obj.chunks, { type: `video/${videotype.value}` })
    const file = new File([blob], `video-${obj.name}.${videotype.value}`, {
      type: `video/${videotype.value}`,
    })
    const url = window.URL.createObjectURL(file)
    allVideos.value.push({ url, name: obj.name })
  }
  converted.value = true
  loading.value = false
}
</script>

<template>
  <div class="mt-12">
    <div class="head group mb-5">
      <button
        tabindex="7"
        type="button"
        class="goBack relative flex transform items-center justify-center transition-all duration-300 group-hover:-translate-x-2"
        @click="reRecord()"
      >
        <IconsArrowback />
        <span class="text-xs">Re-Record</span>
      </button>
    </div>
    <div class="step relative">
      <recording-videos-preview v-if="converted" :all-videos="allVideos" />
      <div v-else>Converting...</div>
      <div v-if="loading">Loading...</div>

      <div class="my-3">
        <label for="videotype" class="mb-2 dark:text-gray-300"
          >Select Type</label
        >
        <select
          id="videotype"
          v-model="videotype"
          class="mt w-full rounded border bg-white p-2 text-gray-600 hover:bg-gray-300"
        >
          <option value="webm" selected>Webm</option>
          <option value="mp4">Mp4</option>
        </select>
      </div>

      <div class="my-2 flex justify-end gap-x-4">
        <a
          ref="downloadButton"
          class="btn glass-bg"
          download="ams-recorder.webm"
          name="ams-recorder.webm"
          @click="download"
          >Download</a
        >
        <a
          v-if="status === 'authenticated'"
          class="btn bg-theme"
          @click="showSaveModel = true"
          >Save</a
        >
        <a
          v-if="status !== 'authenticated'"
          class="btn bg-theme"
          @click="showRegisterModel = true"
          >Login To Save</a
        >
      </div>

      <SaveProject
        v-if="showSaveModel"
        :videotype="videotype"
        :videos="allVideos"
        @cancel="showSaveModel = false"
        @finished="reRecord"
        @register="showRegisterModel = true"
      />

      <ModelsAuth
        :show="showRegisterModel"
        @cancel="showRegisterModel = false"
      />
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
