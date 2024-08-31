<template>
  <div>
    <component
      :is="currentComp"
      v-if="!finished"
      @switch="switchComponent"
      @re-record="rerecorde"
    />
    <p v-if="msg" class="block p-2 text-left text-sm text-yellow-600">
      {{ msg }}
    </p>

    <steps-final-step v-if="finished" @re-record="rerecorde" />
  </div>
</template>
<script setup lang="ts">
import { useMainStore } from "~/store"
import { SCENE } from "~/utils"
const SceneStep = resolveComponent('steps-scene-step')
const OptionsStep = resolveComponent('steps-options-step')

const store = useMainStore()
const router = useRouter()
const finished = computed((): boolean => store.finished)
const msg = ref(null) as Ref<string | null>
// Start with the Scene component by default
const currentComp = shallowRef(SceneStep)

// Watch for changes in the mode and update the route
watch(
  () => store.mode,
  () => {
   //  router.push({
   //    query: { mode: store.mode },
   //    hash: `#${currentComp.value.__name}`,
   //  })
  },
)

function switchComponent(compName: string, message: string): void {
  msg.value = message || ""
  console.log(compName)
  currentComp.value = compName === "SCENE" ? SceneStep : OptionsStep;

//   if (store.mode) {
//     router.push({
//       query: { mode: store.mode },
//       hash: `#${compName}`,
//     })
//   }
}

function rerecorde(compName: string): void {
  currentComp.value = !compName || compName === "SCENE" ? SceneStep : OptionsStep
  router.push({
    query: { mode: SCENE.SCREEN_AND_WEBCAM },
    hash: `#${compName}`,
  })

}

onMounted(async () => {
  const { state } = await checkPermission("microphone" as PermissionName)
  if (state === "granted") store.setMicGranted(true)
  const { state: camState } = await checkPermission("camera" as PermissionName)

  if (camState === "granted") store.setCamGranted(true)

  if (camState === "denied" || state === "denied") {
    msg.value = `Note:
      It seems that your browser has denied the permission for ${
        state && camState === "denied"
          ? "both the camera and microphone"
          : camState === "denied"
            ? "the camera"
            : "the microphone"
      }
    therefore you need to manually allow access to your camera from the browser settings to proceed.`
  }

  if (camState === "prompt" || state === "prompt") {
    msg.value = `Note:
    It seems that your browser has not yet asked for the permission for ${
      state && camState === "prompt"
        ? "both the camera and microphone"
        : camState === "prompt"
          ? "the camera"
          : "the microphone"
    }
    therefore you need to manually allow access to your camera from the browser settings to proceed.`
  }
})

onBeforeMount(() => {
  const mode = router.currentRoute.value.query.mode
  const comp = router.currentRoute.value.hash.replace("#", "")
  if (mode) store.changeMode(mode as SCENE)
  console.log(comp)
  if (comp) currentComp.value = comp === "SCENE" ? SceneStep : OptionsStep
})
</script>
