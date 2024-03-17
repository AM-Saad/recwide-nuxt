<!-- eslint-disable no-console -->
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const headers = useRequestHeaders(['cookie']) as HeadersInit
const { signOut } = useAuth()
const { data: projects, pending } = await useLazyFetch('/api/projects', {
  headers,
  transform: _data => _data.body.projects
})
const rawProjects = toRaw(projects)
const logout = async () => {
  await signOut()
  window.location.href = '/'
}
</script>

<template>
  <div class="my-4">
    <h1 class="title mb-5">My Projects</h1>
    <div v-if="pending" class="text-center">
      Loading...
    </div>
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 ">
      <div v-for="(project, index) in rawProjects" :key="index">
        <Project :project="project" />
      </div>
    </div>
  </div>
</template>
