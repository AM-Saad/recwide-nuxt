<template>

    <button class="mode focus:outline-1 focus:outline-offset-1 outline-slate-100 dark:outline-stone-800"
        :class="{ 'active': currentMode === mode }" @dblclick="switchComponent('Options', mode)"
        @click="changeScene(mode)" tabindex="1">
        <NuxtImg :src="full_image" :alt="title" :placeholder="[30, 20]" class="h-8 w-8" />
        <h3>{{ title }}</h3>
    </button>

</template>

<script setup lang="ts">
import { useMainStore } from '~/store'
import { SCENE } from '~/utils/constents';


const props = defineProps({
    image: String,
    title: String,
    mode: {
        type: String as PropType<SCENE>,
        default: SCENE.SCREEN_AND_WEBCAM
    },
})
const emit = defineEmits(["switch"])

const store = useMainStore()
const currentMode = computed(() => store.mode)

const full_image = `/images/${props.image}`

// Methods
const switchComponent = (comp: string, mode?: SCENE): void => {
    if (mode) store.changeMode(mode)
    emit("switch", comp)
}

const changeScene = (mode: SCENE): void => store.changeMode(mode)


</script>