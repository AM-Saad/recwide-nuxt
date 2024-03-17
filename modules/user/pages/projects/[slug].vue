<!-- eslint-disable no-console -->

<script setup lang="ts">

import { ref } from 'vue'
import { useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const project: any = ref(null)
const config = useRuntimeConfig()

const id = route.params.slug
const headers = useRequestHeaders(['cookie']) as HeadersInit

const { data, pending }: any = await useFetch(`/api/projects/${id}`, { headers })
const rawProjects = toRaw(data.value.body.project)
project.value = rawProjects



const deleteProject = async (e: Event, id: string) => {
  e.preventDefault()
  const { data } = useLazyFetch(`/api/projects/${id}`, {
    method: 'DELETE',
    headers
  })
  console.log(data)
  router.replace({ name: 'projects' })
}


</script>

<template>
  <div>
    <div class="wrapper mt-12">
      <main v-if="project" class="">

        <div class="dashborad-header">
          <router-link to="/projects" class="dark:text-gray-200">My Projects</router-link>
          <div class="flex justify-between my-2">
            <h1 class="title">{{ project.name }}</h1>
            <div class="flex gap-2 items-center">
              <button class="btn btn-small bg-red-500 text-white" @click="deleteProject($event, project.id)">
                Delete
              </button>
              <button class="btn btn-small bg-red-300 text-white">
                <div class="spinner">
                  <div class="double-bounce1" />
                  <div class="double-bounce2" />
                </div>
              </button>
              <router-link :to="{ name: 'edit', params: { slug: project.slug } }" class="btn btn-small">
                Edit
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="pending">
          Loading...
        </div>

        <div class="grid md:grid-flow-col">
          <div v-for="i in project.media" :key="i._id"
            class="video-wrapper m-2 shadow rounded-lg overflow-hidden flex flex-col justify-between">
            <video :src="config.public.SERVER_URL + i.url + '.mp4'" controls class="w-full h-full" />
            <div class="flex gap-2 m-2">
              <a download :href="config.public.SERVER_URL + i.url + '.mp4'" class="btn bg-theme">Download</a>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>
