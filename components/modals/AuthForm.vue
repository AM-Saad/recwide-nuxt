<script setup lang="ts">
import { ref } from "vue"

import Signin from "../auth/SignIn.vue"
import Signup from "../auth/SignUp.vue"

const emit = defineEmits(["cancel"])
const msg = ref("")

const props = defineProps({
  show: Boolean,
})

const components = {
  Signin,
  Signup,
} as Record<string, unknown>

const currentComp = shallowRef(components.Signin)

const currentCompName = ref("Signin")

function switchComponent(compName: string, message: string): void {
  msg.value = message || ""
  currentComp.value = components[compName]
  currentCompName.value = compName
}

const closeModel = (): void => {
  emit("cancel")
}
</script>

<template>
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <UiDialogModal :show="props.show" @close="closeModel">
      <template #header>
        <h3 class="text-lg font-bold">
          {{ currentCompName }}
        </h3>
      </template>

      <template #body>
        <component
          :is="currentComp"
          @switch="switchComponent"
          @close="closeModel"
        />
      </template>
    </UiDialogModal>
  </Teleport>
</template>
