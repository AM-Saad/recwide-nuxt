<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
defineProps({
  error: Object,
})

function handleError(): void {
  clearError({ redirect: "/" })
}
</script>

<template>
  <NuxtExample>
    <div class="relative font-sans">
      <div class="md:w-6/12 max-w-200 mx-auto py-10 px-4">
        <h1 class="text-2xl">{{ error?.message }}</h1>
        There was an error 😱
        <br />

        <NuxtLink
          class="bg-theme btn btn-big my-4 text-primary text-white"
          to="/"
        >
          Navigate home
        </NuxtLink>
      </div>
    </div>
  </NuxtExample>
</template>
