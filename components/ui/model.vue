<script setup>
const props = defineProps({
  show: Boolean
})
const emit = defineEmits('close')

onMounted(() => {
  // close on escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      emit('close')
    }

  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      emit('close')

    }
  })
})

</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="inner absolute left-[50%] top-[50%] p-3 rounded-md shadow-lg bg-white glass-bg
      transform -translate-x-1/2 -translate-y-1/2 w-96">
        <div class="modal-header flex items-center justify-between">
          <slot name="header">default header</slot>
          <button class="modal-default-button dark:text-gray-400 p-1 place-self-start"
            @click="$emit('close')">X</button>
        </div>

        <div class="modal-body">
          <slot name="body">default body</slot>
        </div>

        <div class="modal-footer">
          <slot name="footer">
            <!-- <button class="btn btn-small" @click="$emit('close')">Close</button> -->
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.modal-mask {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  transition: opacity 0.3s ease;
}


.modal-header h3 {
  margin-top: 0;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

@media (prefers-color-scheme: dark) {
  .modal-container {
    @apply bg-zinc-800
  }
}
</style>
