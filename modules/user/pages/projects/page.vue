<script setup lang="ts">
definePageMeta({ middleware: "auth" })
const headers = useRequestHeaders(["cookie"]) as HeadersInit
const { data: projects } = await useLazyFetch("/api/projects", {
  headers,
  transform: (_data) => _data,
})
const rawProjects = toRaw(projects)
</script>

<template>
  <div class="my-4">
    <div class="flex">
      <h1 class="title mb-5">My Projects</h1>
      <router-link to="/recorder" class="btn btn-small bg-green-400 ml-auto"
        >Create New</router-link
      >
    </div>

    <div
      v-if="rawProjects?.length"
      class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      <div
v-for="(project, index) in rawProjects"
:key="index">
        <project-card :project="project" />
      </div>
    </div>
    <div
v-if="!rawProjects?.length"
class="text-center dark:text-gray-400">
      No projects found!
    </div>
  </div>
</template>
