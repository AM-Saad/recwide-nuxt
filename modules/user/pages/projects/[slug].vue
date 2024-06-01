<!-- eslint-disable no-console -->

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

import { ref } from 'vue'
import { useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

const id = route.params.slug
const headers = useRequestHeaders(['cookie']) as HeadersInit

const { data, pending, error }: any = await useLazyFetch(`/api/projects/${id}`,
  {
    headers,
    transform: _data => _data
  })

if (error.value) {
  router.push({ name: 'projects' })
}
const rawProject = toRaw(data)


const deleteProject = async (e: Event, id: string) => {
  e.preventDefault()
  const { data } = useLazyFetch(`/api/projects/${id}`, {
    method: 'DELETE',
    headers
  })
  router.push({ name: 'projects' })
}


</script>

<template>
  <div>
    <div class="wrapper my-4">
      <main v-if="!pending && rawProject" class="">

        <div class="dashborad-header">
          <div class="group inline-flex">
            <router-link to="/projects"
              class="goBack flex items-center justify-center relative transform transition-all duration-300 group-hover:-translate-x-2">
              <IconsArrowback />
              My Projects
            </router-link>
          </div>
          <div class="flex justify-between my-2">
            <h1 class="title">{{ rawProject.name }}</h1>
            <div class="flex gap-2 items-center">
              <button class="btn btn-small bg-red-500 text-white" @click="deleteProject($event, rawProject.id)">
                Delete
              </button>

              <router-link :to="{ name: 'edit', params: { slug: rawProject.slug } }" class="btn btn-small">
                Edit
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="pending">
          Loading...
        </div>

        <div class="grid md:grid-flow-col gap-4">
          <div v-for="i in rawProject.media" :key="i._id"
            class="video-wrapper shadow rounded-lg overflow-hidden flex flex-col gap-2 justify-between bg-white/50 dark:bg-black/30">
            <video :src="config.public.SERVER_URL + i.url + '.mp4'" controls class="w-full h-full">
              Your browser does not support the video tag.
            </video>
            <div class="flex gap-2 m-2 mb-4">
              <a download :href="config.public.SERVER_URL + i.url + '.mp4'" class="btn btn-small bg-theme">Download</a>
            </div>
          </div>
          <div v-if="rawProject.media.length === 0">
            No media found!
          </div>
        </div>

      </main>
    </div>
  </div>
</template>
