<template>
  <router-link
:to="{ name: 'project', params: { slug: project.slug } }" class="
  project-item glass-bg">
    <div class="flex justify-between items-start gap-4 mt-1">
      <h3 class="project-title text-sm font-medium max-w-[80%] text-ellipsis overflow-hidden">{{ project.name }}</h3>
      <img v-if="project.mode === 'screenAndWebcam'" class="project-mode filter  h-3" src="@/assets/images/both.svg" >
      <img v-if="project.mode === 'screen'" class="project-mode filter  h-3" src="@/assets/images/screen.svg" >
      <img v-if="project.mode === 'webcam'" class="project-mode filter  h-3" src="@/assets/images/cam.svg" >
    </div>

    <span class="project-date block text-gray-500 text-right text-xs">{{ project.date }}</span>
  </router-link>
</template>

<script setup>

const props = defineProps({
  project: {
    type: Object,
    required: true,
  }
})



</script>
