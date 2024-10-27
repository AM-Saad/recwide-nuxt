<template>
  <div class="video-timeline flex items-center gap-1">
    <div class="current-time">
      {{ formattedCurrentTime }}
    </div>
    /
    <div class="total-duration">
      {{ formattedTotalDuration }}
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    total: {
      type: Number,
      required: true,
    },
    current: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    formattedTotalDuration(): string {
      return this.formatTime(this.total)
    },
    formattedCurrentTime(): string {
      return this.formatTime(this.current)
    },
    progressBarStyle(): { width: string } {
      const percentage = (this.current / this.total) * 100
      return {
        width: `${percentage}%`,
      }
    },
  },
  methods: {
    formatTime(timeInSeconds: number): string {
      const minutes = Math.floor(timeInSeconds / 60)
      const seconds = timeInSeconds % 60
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds.toFixed(0)}`
    },
  },
}
</script>

<style scoped>
.progress-bar-container {
  flex-grow: 1;
  height: 5px;
  background-color: #ccc;
  margin: 0 10px;
}

.progress-bar {
  height: 100%;
  background-color: blue;
}
</style>
