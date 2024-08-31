<script setup lang="ts">
const minutes = ref("00")

const seconds = ref("00")

const totalSeconds = ref(0)

onMounted(() => {
  startCounting()
})

const startCounting = (): void => {
  setInterval(setTime, 1000)
}

const setTime = (): void => {
  totalSeconds.value += 1
  seconds.value = pad(totalSeconds.value % 60)
  minutes.value = pad(parseInt(totalSeconds.value / 60))
}

const pad = (val): string => {
  const valString = val + ""
  if (valString.length < 2) {
    return "0" + valString
  } else {
    return valString
  }
}

onUnmounted(() => {
  totalSeconds.value = 0
})
</script>

<template>
  <p class="timer">
    <label id="minutes" ref="minutes">{{ minutes }}</label>
    <label id="colon">:</label>
    <label id="seconds" ref="seconds">{{ seconds }}</label>
  </p>
</template>

<style scoped>
.timer {
  text-align: center;
}

#seconds {
  font-size: 5em;
}

#minutes {
  font-size: 5em;
}

#colon {
  font-size: 5em;
}
</style>
