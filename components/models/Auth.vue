<script setup lang="ts">
import { ref } from 'vue'

import Signin from '../auth/Signin.vue'
import Signup from '../auth/Signup.vue';
const emit = defineEmits()
const msg = ref('')

const props = defineProps({
  show: Boolean,
})

const components = {
  Signin,
  Signup
} as Record<string, any>

const currentComp = shallowRef(components.Signin)

const currentCompName = ref('Signin')


function switchComponent(compName: string, message: string) {
  msg.value = message || ''
  currentComp.value = components[compName]
  currentCompName.value = compName
}

const closeModel = () => {
  emit('cancel')
}

</script>

<template>
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <UiModel :show="props.show" @close="closeModel">
      <template #header>
        <h3 class="font-bold text-lg">{{ currentCompName }}</h3>
      </template>

      <template #body>
        <component :is="currentComp" @switch="switchComponent" @close="closeModel" />
      </template>
    </UiModel>
  </Teleport>
</template>
