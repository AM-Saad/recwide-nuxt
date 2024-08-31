<script setup lang="ts">

import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import { useUserStore } from "@/modules/user/store/index.js"
import type Project from "@/types/Project"

const route = useRoute()
const { getToken, url } = useUserStore()
const config = useRuntimeConfig()

const project = ref<Project | null>(null)
const thumbnails = ref([])
const fetching = ref(true)

onMounted(async () => {
  // TODO: Fetch video handle error and if the video not found

  const id = route.params.slug
  const token = getToken

  const res = await fetch(`${config.public.SERVER_URL}/user/projects/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await res.json()
  project.value = data.project

  project.value!.media.forEach((video) => {
   
    getThumbnails()
  })
  fetching.value = false
})

const getThumbnails =  ():void => {
  // const { thumbnails } = useThumbnails(`${url}/videos/${project.slug}.mp4`)
  // const id = route.params.slug;
  // const token = getToken;
  // const res = await fetch(`${url}/user/projects/${id}/thumbnails/${videoName}`, {
  //     headers: {
  //         Authorization: `Bearer ${token}`,
  //     },
  // });
  // const data = await res.json();
  // thumbnails.value.push({
  //     name: videoName,
  //     frames: data.thumbnails,
  // });
}

const seeking = (e: Event):void => {
  console.log(e)
}

const seeked = (e: Event):void => {
  console.log(e)
}
</script>


<template>
  <div>
    <div class="wrapper">
      <!-- <DashboardNav /> -->
      <main v-if="project">
        <div class="dashborad-header">
          <router-link to="/projects"> My Projects </router-link>
          <div class="flex justify-between my-2">
            <h1 class="title">
              {{ project.name }}
            </h1>
          </div>
        </div>

        <div v-if="fetching">Loading...</div>
        <div
v-if="!fetching"
class="grid grid-cols-4">
          <div ></div>
          <div class="col-span-3">
            <div
              class="video-wrapper shadow rounded-lg overflow-hidden flex flex-col justify-between"
            >
              <video
                class="w-full h-full"
                :src="`${url}/videos/${project.slug}.mp4`"
                controls
                @seeking="seeking"
                @seeked="seeked"
              ></video>
            </div>

            <section
              id="timeline"
              class="p-2 bg-gray-200 my-2 shadow-inner shadow-slate-400 rounded overflow-hidden box-content relative"
            >
              <span
                id="split"
                class="absolute h-full w-2 bg-gray-500 z-10 cursor-col-resize hover:bg-slate-400"
              ></span>

              <div class="flex">
                <div
v-for="i in thumbnails"
:key="i.name" class="flex h-10">
                  <img
                    v-for="thumbnail in i.frames"
                    :key="thumbnail"
                    :src="url + '/thumbnails/' + i.name + '/' + thumbnail"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
