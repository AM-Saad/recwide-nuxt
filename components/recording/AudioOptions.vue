<script setup lang="ts">
import { AUDIO, SCENE } from '#imports';
import { computed } from 'vue'
import { useMainStore } from '~/store'

type Options = {
  name: string;
  isActive: boolean;
  hide?: boolean;
  needPermissions: boolean;
  icon: string;
}

const store = useMainStore()
const currentResolution: Ref<number> = ref(1080);

const options = computed(() => [
  {
    name: AUDIO.MIC_AND_SYSTEM,
    isActive: store.audioSettings === AUDIO.MIC_AND_SYSTEM,
    hide: store.mode === SCENE.WEBCAM_ONLY,
    needPermissions: !store.micGranted && store.audioSettings === AUDIO.MIC_AND_SYSTEM,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 125" style="enable-background:new 0 0 100 100;" xml:space="preserve"><path d="M64,9H36c-4.4,0-8,3.6-8,8v66c0,4.4,3.6,8,8,8h28c4.4,0,8-3.6,8-8V17C72,12.6,68.4,9,64,9z M70,83c0,3.3-2.7,6-6,6H36  c-3.3,0-6-2.7-6-6V17c0-3.3,2.7-6,6-6h2c0.5,0,1,0.5,1,1v1c0,1.1,0.9,2,2,2h18c1.1,0,2-0.9,2-2v-1c0-0.5,0.5-1,1-1h2  c3.3,0,6,2.7,6,6V83z"/><path d="M61.2,49.9c-0.6,0-1,0.5-1,1V54c0,5.6-4.6,10.2-10.2,10.2S39.8,59.6,39.8,54v-3.1c0-0.6-0.5-1-1-1s-1,0.5-1,1V54  c0,6.4,4.9,11.6,11.2,12.2v4.1h-6.1c-0.6,0-1,0.5-1,1s0.5,1,1,1h14.2c0.6,0,1-0.5,1-1s-0.5-1-1-1H51v-4.1  c6.3-0.5,11.2-5.8,11.2-12.2v-3.1C62.2,50.3,61.8,49.9,61.2,49.9z"/><circle cx="46.9" cy="41.7" r="1"/><circle cx="53.1" cy="41.7" r="1"/><circle cx="50" cy="41.7" r="1"/><circle cx="48.5" cy="38.7" r="1"/><circle cx="51.5" cy="38.7" r="1"/><circle cx="46.9" cy="44.8" r="1"/><circle cx="53.1" cy="44.8" r="1"/><circle cx="50" cy="44.8" r="1"/><circle cx="46.9" cy="47.8" r="1"/><circle cx="53.1" cy="47.8" r="1"/><circle cx="50" cy="47.8" r="1"/><path d="M50,33.6c-3.9,0-7.1,3.2-7.1,7.1V54c0,3.9,3.2,7.1,7.1,7.1s7.1-3.2,7.1-7.1V40.7C57.1,36.8,53.9,33.6,50,33.6z M50,35.6  c2.8,0,5.1,2.3,5.1,5.1v9.2H44.9v-9.2C44.9,37.9,47.2,35.6,50,35.6z M50,59c-2.8,0-5.1-2.3-5.1-5.1v-2h10.2v2  C55.1,56.8,52.8,59,50,59z"/></svg>`,
  },
  {
    name: AUDIO.MIC,
    isActive: store.audioSettings === AUDIO.MIC,
    needPermissions: !store.micGranted && store.audioSettings === AUDIO.MIC,
    icon: `<svg
          xmlns:dc="http://purl.org/dc/elements/1.1/" 
          xmlns:cc="http://creativecommons.org/ns#" 
          xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
          xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" 
          xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" 
          xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" 
         viewBox="0 0 47.999997 60" version="1.1" x="0px" y="0px"
          className=" dark:stroke-slate-50 dark:fill-slate-50"
         >
        <path className="dark:stroke-slate-50 dark:fill-slate-50"
         d="M 24 0 C 22.27316 0 20.54631 0.44704375 19 1.3398438 C 15.90737 3.1256438 14 6.4286 14 10 L 14 24 C 14 27.5715 15.90737 30.874356 19 32.660156 C 20.54631 33.552956 22.27316 34 24 34 C 25.72684 34 27.45368 33.552956 29 32.660156 C 32.09263 30.874356 34 27.5715 34 24 L 34 10 C 34 6.4286 32.09263 3.1256438 29 1.3398438 C 27.45368 0.44704375 25.72684 -7.2280145e-20 24 0 z M 24 2 C 25.38085 2 26.7617 2.3571656 28 3.0722656 C 30.47658 4.5022656 32 7.1399 32 10 L 32 24 C 32 26.8601 30.47658 29.497734 28 30.927734 C 26.7617 31.642834 25.38085 32 24 32 C 22.61915 32 21.23829 31.642734 20 30.927734 C 17.52342 29.497734 16 26.8601 16 24 L 16 10 C 16 7.1399 17.52342 4.5022656 20 3.0722656 C 21.23829 2.3572656 22.61915 2 24 2 z M 20 14 A 1 1 0 0 0 19 15 A 1 1 0 0 0 20 16 A 1 1 0 0 0 21 15 A 1 1 0 0 0 20 14 z M 24 14 A 1 1 0 0 0 23 15 A 1 1 0 0 0 24 16 A 1 1 0 0 0 25 15 A 1 1 0 0 0 24 14 z M 28 14 A 1 1 0 0 0 27 15 A 1 1 0 0 0 28 16 A 1 1 0 0 0 29 15 A 1 1 0 0 0 28 14 z M 20 18 A 1 1 0 0 0 19 19 A 1 1 0 0 0 20 20 A 1 1 0 0 0 21 19 A 1 1 0 0 0 20 18 z M 24 18 A 1 1 0 0 0 23 19 A 1 1 0 0 0 24 20 A 1 1 0 0 0 25 19 A 1 1 0 0 0 24 18 z M 28 18 A 1 1 0 0 0 27 19 A 1 1 0 0 0 28 20 A 1 1 0 0 0 29 19 A 1 1 0 0 0 28 18 z M 11 23 C 10.44772 23 10 23.4477 10 24 C 10 29.0003 12.66977 33.6248 17 36.125 C 18.86433 37.2014 20.92099 37.811437 23 37.960938 L 23 46 L 16 46 C 15.446 46 15 46.446 15 47 C 15 47.554 15.446 48 16 48 L 32 48 C 32.554 48 33 47.554 33 47 C 33 46.446 32.554 46 32 46 L 25 46 L 25 37.960938 C 27.08047 37.813038 29.13159 37.2038 31 36.125 C 35.33023 33.6248 38 29.0003 38 24 C 38 23.4477 37.55228 23 37 23 C 36.44772 23 36 23.4477 36 24 C 36 28.289 33.7142 32.248078 30 34.392578 C 28.14523 35.463478 26.06885 35.9986 24 36 C 21.92595 36.001 19.85943 35.466178 18 34.392578 C 14.2858 32.248078 12 28.289 12 24 C 12 23.4477 11.55228 23 11 23 z " transform="translate(-1.9073486e-6,0)" display="inline" overflow="visible" visibility="visible"  fill-opacity="1" fill-rule="evenodd" stroke="none" marker="none"/></svg>`,
  },
  {
    name: AUDIO.SYSTEM,
    isActive: store.audioSettings === AUDIO.SYSTEM,
    hide: store.mode === "webcam",
    needPermissions: false,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 64 80" x="0px" y="0px"><path d="M30.778,49.122A4,4,0,0,0,37,45.8V18.2a4,4,0,0,0-6.222-3.325h0l-9.413,6.288a2.722,2.722,0,0,1-1.516.46H13.5a5.506,5.506,0,0,0-5.5,5.5v9.75a5.506,5.506,0,0,0,5.5,5.5h6.349a2.716,2.716,0,0,1,1.515.46ZM13.5,40.375a3.5,3.5,0,0,1-3.5-3.5v-9.75a3.5,3.5,0,0,1,3.5-3.5h6.349a4.723,4.723,0,0,0,2.627-.8l9.413-6.288h0A2,2,0,0,1,35,18.2V45.8a2,2,0,0,1-3.111,1.662l-9.414-6.288a4.717,4.717,0,0,0-2.626-.8Z"/><path d="M48.456,17.392a1,1,0,1,0-.912,1.779C51.406,21.149,54,26.305,54,32s-2.594,10.851-6.456,12.829A1,1,0,0,0,48,46.719a.982.982,0,0,0,.455-.111C52.968,44.3,56,38.427,56,32S52.968,19.7,48.456,17.392Z"/><path d="M42.456,21.312a1,1,0,1,0-.912,1.779C44.209,24.456,46,28.036,46,32s-1.791,7.544-4.456,8.909A1,1,0,0,0,42,42.8a.982.982,0,0,0,.455-.111C45.824,40.965,48,36.769,48,32S45.824,23.035,42.456,21.312Z"/></svg>`,
  },
  {
    name: AUDIO.NONE,
    isActive: store.audioSettings === AUDIO.NONE,
    needPermissions: false,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 512 640" style="enable-background:new 0 0 512 512;" xml:space="preserve"><title>Mute volume</title><g><path d="M465.3,314.3c0,0-0.1-0.1-0.1-0.1L407,256l58.2-58.2c2.3-2.4,2.3-6.2-0.1-8.5c-2.3-2.3-6-2.3-8.4,0l-58.2,58.2l-58.2-58.2   c-2.4-2.3-6.2-2.3-8.5,0.1c-2.3,2.3-2.3,6.1,0,8.4l58.2,58.2l-58.2,58.2c-2.4,2.3-2.4,6.1-0.1,8.5c2.3,2.4,6.1,2.4,8.5,0.1   c0,0,0,0,0.1-0.1l58.2-58.2l58.2,58.2c2.3,2.4,6.1,2.4,8.5,0.1C467.6,320.5,467.6,316.7,465.3,314.3z"/><path d="M280.2,60.9c-2.1,0-4.1,0.6-5.8,1.8L129.8,164.4H91c-25.4,0-46,20.6-46,46v91.3c0,25.4,20.6,46,46,46h38.8l144.7,101.7   c4.5,3.2,10.8,2.1,13.9-2.4c1.2-1.7,1.8-3.7,1.8-5.8V70.9C290.2,65.3,285.8,60.9,280.2,60.9z M278.2,437.3l-140.5-98.7   c-1.1-1.8-3-2.9-5.2-2.9H91c-18.8,0-34-15.2-34-34v-91.3c0-18.8,15.2-34,34-34h41.6c2.1,0,4.1-1.1,5.2-2.9l140.5-98.7V437.3z"/></g><text x="0" y="527" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">Created by Icongeek26</text><text x="0" y="532" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">from the Noun Project</text></svg>`,
  }] as Options[]
);

const changeSoundOpts = (mode: AUDIO) => {
  store.recSettings(mode)
}
const checkKeyPressed = (e: KeyboardEvent, mode: AUDIO) => {
  if (e.key === "Enter") {
    changeSoundOpts(mode);
  }
}
</script>


<template>
  <div>
    <div v-if="store.audioSettings" id="modes" class="flex flex-col justify-center md:justify-between flex-wrap gap-5">
      <div v-for="(opt, idx) in options" :key="opt.name">
        <div class="mode" :class="[{ 'active': opt.isActive }, { none: opt.hide }]"
          @click="changeSoundOpts(opt.name as AUDIO)" @keydown="checkKeyPressed($event, opt.name as AUDIO)"
          :tabindex="idx + 1">
          <div class="flex items-center dark:text-gray-100 gap-x-2">
            <div class="icon h-6 w-6 stroke-1 dark:stroke-slate-50 dark:fill-slate-50 " v-html="opt.icon"> </div>
            <span>{{ opt.name }}</span>
          </div>
          <div v-if="opt.needPermissions">
            <p class="text-xs text-red-400 mt-1" @click="$emit('openAllowAccess', opt.name)">
              Allow access to mic
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="grid mt-5 gap-y-2">
      <label for="resolution" class=" dark:text-gray-200">Resolution</label>
      <select id="resolution" class="p-2 border rounded-lg text-gray-600 glass-bg" v-model="currentResolution"
        tabindex="5">
        <option v-for="i in store.resolutions" :key="i.height" :value="i.height">
          {{ i.height }}
        </option>
      </select>
    </div>
  </div>
</template>
