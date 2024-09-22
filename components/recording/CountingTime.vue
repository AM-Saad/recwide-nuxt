<template>
  <div class="timer">
    <p>{{ formattedTime }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onBeforeUnmount } from "vue"

// Define reactive references
const seconds = ref(0)
const intervalId = ref<number | null>(null)

// Compute formatted time as HH:mm:ss
const formattedTime = computed(() => {
  const hours = Math.floor(seconds.value / 3600)
  const minutes = Math.floor((seconds.value % 3600) / 60)
  const secs = seconds.value % 60

  const pad = (num: number): string => String(num).padStart(2, "0")
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
})

// Function to start the timer
const startTimer = (): void => {
  if (!intervalId.value) {
    intervalId.value = setInterval(() => {
      seconds.value += 1
    }, 1000) as unknown as number
  }
}

// Function to stop the timer
const stopTimer = (): void => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

onMounted(() => {
  startTimer()
})

// Cleanup on component unmount
onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>

<style scoped>
.timer {
  font-family: "Courier New", Courier, monospace;
  font-size: 2rem;
}
button {
  margin-top: 10px;
  padding: 5px 10px;
  font-size: 1rem;
}
</style>
