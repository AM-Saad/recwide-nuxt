<script setup lang="ts">
// Remember to disable the middleware protection from your page!

const route = useRoute()
const errorCode = computed(() => route.params.error)

</script>

<template>
  <h1>  error {{ errorCode }}. Please try again! </h1>
</template>
