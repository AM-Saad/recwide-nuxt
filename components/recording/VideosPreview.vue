<template>
  <div
    id="video-mask"
    ref="videomask"
    class="video-player relative my-2 h-full w-full overflow-hidden rounded-md bg-white/80 p-2 shadow"
  >
    <div class="grid grid-cols-2 gap-4">
      <video
        id="main_video"
        ref="main_element"
        class="h-full w-full"
        src=""
        @loadedmetadata="videoLoaded"
        @timeupdate="updateProgress"
      >
        Your browser doesn't support the video tag
      </video>
      <video
        id="cam-recorded-video"
        ref="secondary_element"
        class="h-full w-full"
        src=""
        muted
      >
        Your browser doesn't support the video tag
      </video>
    </div>
    <div
      id="controls"
      class="inset-1 bottom-0 flex h-12 items-center gap-x-4 rounded-md bg-[#eaeaea57] text-gray-800 backdrop-blur-lg"
    >
      <!-- Control Buttons -->
      <div class="flex items-center gap-x-2">
        <button @click="playPause">
          <IconsPlay v-if="!controlsState.isPlaying" />
          <IconsPause v-else />
        </button>
        <button @click="stop">
          <IconsStop />
        </button>
        <VideoTimeline
          :total="controlsState.duration"
          :current="controlsState.progress"
        />
      </div>
      <!-- Progress Bar -->
      <div class="progress-bar relative w-3/5">
        <input
          id="progress"
          v-model="controlsState.progress"
          type="range"
          class="vertical-align h-3 w-full rounded bg-gray-300"
          :max="controlsState.duration"
          min="0"
          @input="selectTime"
        />
      </div>
      <!-- Volume and Mute -->
      <div class="flex items-center justify-between gap-x-4">
        <button @click="toggleMute">
          <IconsMute v-if="controlsState.muted" />
          <IconsUnmute v-else />
        </button>
        <input
          id="volume"
          v-model="controlsState.volume"
          type="range"
          min="0"
          max="100"
          @input="changeVolume"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VideoTimeline from "./VideoTimeline.vue"

const props = defineProps({
  allVideos: {
    type: Array as PropType<{ url: string }[]>,
    required: true,
  },
})
const ready = ref(false)

const secondary_element: Ref<HTMLVideoElement | null> = ref(null)
const main_element: Ref<HTMLVideoElement | null> = ref(null)

const videomask: Ref<HTMLDivElement | null> = ref(null)

const controlsState = reactive({
  isPlaying: false,
  muted: false,
  fullscreen: false,
  duration: 0,
  volume: 0,
  progress: 0,
})

// methods
const addVideosUrl = async (): Promise<boolean> => {
  const mainElm = main_element.value
  const secondaryElm = secondary_element.value

  mainElm!.onloadedmetadata = function (): void {
    // mainElm!.ontimeupdate = function () {
    //   console.log("time update")
    //   selectTime();
    //   return;
    // }
  }

  for (let n = 0; n < props.allVideos.length; n++) {
    const vid = props.allVideos[n] as { url: string }
    const url = vid.url
    console.log(url)
    if (n == 0) mainElm!.src = url
    if (n == 1) secondaryElm!.src = url
  }
  getDuration(props.allVideos[0].url, 
  (duration: number) => {
    mainElm!.currentTime = (1 * duration) / 100
    controlsState.duration = duration
  })

  return true
}

const videoLoaded = (): void => {
  controlsState.duration = main_element.value!.duration
}

const updateProgress = (): void => {
  controlsState.progress = main_element.value!.currentTime
}

const selectTime = (): void => {
  const newTime = controlsState.progress
  main_element.value!.currentTime = newTime
  if (secondary_element.value) {
    secondary_element.value.currentTime = newTime
  }
}

const playPause = (): void => {
  if (!controlsState.isPlaying) {
    main_element.value!.play()
    if (secondary_element.value) {
      secondary_element.value.play()
    }
  } else {
    main_element.value!.pause()
    if (secondary_element.value) {
      secondary_element.value.pause()
    }
  }
  controlsState.isPlaying = !controlsState.isPlaying
}

const stop = (): void => {
  main_element.value!.currentTime = 0
  main_element.value!.pause()
  if (secondary_element.value) {
    secondary_element.value.currentTime = 0
    secondary_element.value.pause()
  }
  controlsState.isPlaying = false
  controlsState.progress = 0
}

const toggleMute = (): void => {
  controlsState.muted = !controlsState.muted
  main_element.value!.muted = controlsState.muted
}

const changeVolume = (): void => {
  const volumeLevel = controlsState.volume / 100
  main_element.value!.volume = volumeLevel
}

const getDuration = (url: string, next: (duration: number) => void): void => {
  const _player = new Audio(url)
  _player.addEventListener(
    "durationchange",
    function () {
      if (this.duration != Infinity) {
        const duration = this.duration
        _player.remove()
        next(duration)
      }
    },
    false,
  )
  _player.load()
  _player.currentTime = 24 * 60 * 60 // fake big time
  _player.volume = 0
  _player.play()
}

onMounted(async (): Promise<void> => {
  try {
    const isReady = await addVideosUrl()

    if (isReady) ready.value = true
  } catch (error) {
    console.log(error)
  }
})
</script>

<style scoped>
#controls > *:focus {
  outline: none;
}

#controls i[class^="flaticon-"] {
  padding: 3px;
  font-size: 13px;
}

#progress2::-webkit-progress-bar {
  overflow: hidden;
  -webkit-appearance: none;
  height: 13px;
  border-radius: 3px;
  background: #eee;
}

#progress2::-webkit-progress-value {
  background: #cc942c;
}

#progress2::-moz-progress-bar {
  overflow: hidden;
  height: 13px;
  border-radius: 3px;
  background: #eee;
}

#progress2::-moz-progress-value {
  background: #cc942c;
}

#volume::-webkit-slider-runnable-track {
  -webkit-appearance: none;
  width: 100%;
  height: 3px;
  border: none;
  background: #fff;
}

#volume::-moz-range-track {
  width: 100%;
  height: 3px;
  border: none;
  background: #fff;
}

#volume::-ms-track {
  width: 100%;
  height: 3px;
  border: none;
  background: #fff;
}

#volume::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 5px;
  margin-top: -6px;
  height: 15px;
  border: none;
  background: #eee;
}

#volume::-moz-range-thumb {
  width: 5px;
  height: 15px;
  border: none;
  background: #eee;
}

#volume::-ms-thumb {
  width: 5px;
  height: 15px;
  border: none;
  background: #eee;
}
</style>
