<template>
  <div v-if="props.project">
    <router-link
      :to="{ name: 'project', params: { slug: props.project.slug || '.n.c' } }"
      class="project-item glass-bg"
    >
      <div class="flex justify-between items-start gap-4 mt-1">
        <h3
          class="project-title text-sm font-medium max-w-[80%] text-ellipsis overflow-hidden"
        >
          {{ props.project.name }}
        </h3>
        <img
          v-if="props.project.mode === 'screenAndWebcam'"
          class="project-mode filter h-3"
          src="@/assets/images/both.svg"
        />
        <img
          v-if="props.project.mode === 'screen'"
          class="project-mode filter h-3"
          src="@/assets/images/screen.svg"
        />
        <img
          v-if="props.project.mode === 'webcam'"
          class="project-mode filter h-3"
          src="@/assets/images/cam.svg"
        />
      </div>
      <span class="project-date block text-gray-500 text-right text-xs">{{
        props.project.date
      }}</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
defineComponent({
  name: "ProjectCard",
})

const props = defineProps({ project: Object }) as {
  project: {
    name: string
    mode: string
    date: string
    slug: string
  }
}
</script>
