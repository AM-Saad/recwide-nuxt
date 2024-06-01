<template>
  <div>
    <component :is="currentComp" v-if="!finished" @switch="switchComponent" @re-record="rerecorde" />
    <p v-if="msg" class="block text-left text-yellow-600 text-sm p-2" v-html="msg"> </p>

    <Final v-if="finished" @re-record="rerecorde" />
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from '~/store'
import Scene from '~/components/steps/Scene.vue'
import Options from '~/components/steps/Options.vue'
import Recording from '~/components/steps/Recording.vue'
import Final from '~/components/steps/Final.vue'
import { SCENE } from '~/utils'

const store = useMainStore()
const router = useRouter()
const finished = computed((): boolean => store.finished)
const msg = ref(null) as Ref<string | null>

// Set up your components
const components = {
  Scene,
  Options,
  Recording,
  Final
} as Record<string, any>


// Start with the Scene component by default
const currentComp = shallowRef(components.Scene)


// Watch for changes in the mode and update the route
watch(() => store.mode, () => {
  router.push({ query: { mode: store.mode }, hash: `#${currentComp.value.__name}` })
})


function switchComponent(compName: string, message: string) {
  msg.value = message || ''
  currentComp.value = components[compName]

  if (store.mode) {
    router.push({ query: { mode: store.mode }, hash: `#${compName}` })
  }
}


function rerecorde(compName: string) {
  store.reRecord()
  currentComp.value = components[compName] || components.Scene
  router.push({ query: { mode: SCENE.SCREEN_AND_WEBCAM }, hash: `#SCENE` })
}



onMounted(async () => {
  const { state } = await checkPermission('microphone' as PermissionName)

  if (state === 'granted') store.setMicGranted(true)


  const { state: camState, granted: camGranted } = await checkPermission('camera' as PermissionName)

  if (camState === 'granted') store.setCamGranted(true)


  if (camState === 'denied' || state === 'denied') {
    msg.value = `Note: 
    It seems that your browser has denied the permission for ${state && camState === 'denied' ? 'both the camera and microphone' : camState === 'denied' ? 'the camera' : 'the microphone'}
    therefore you need to manually allow access to your camera from the browser settings to proceed.`
  }

  if (camState === 'prompt' || state === 'prompt') {
    msg.value = `Note: 
    It seems that your browser has not yet asked for the permission for ${state && camState === 'prompt' ? 'both the camera and microphone' : camState === 'prompt' ? 'the camera' : 'the microphone'}
    therefore you need to manually allow access to your camera from the browser settings to proceed.`
  }

})

onBeforeMount(() => {
  const mode = router.currentRoute.value.query.mode
  const comp = router.currentRoute.value.hash.replace('#', '')
  if (mode) store.changeMode(mode as SCENE)
  if (comp) currentComp.value = components[comp] || components.Scene
})
</script>
