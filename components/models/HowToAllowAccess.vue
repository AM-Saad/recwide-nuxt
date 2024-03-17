<script>
export default {
  name: "HowToAllowAccess",
  props: ["needGuide", "show"],
  methods: {
    gotit() {
      this.$emit("close");
    },
  },
};
</script>


<template>
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <UiModel :show="show" @close="gotit">
      <template #header>
        <div class="title font-bold text-xl">Get {{ needGuide }} Permission</div>
        <div class="desc my-2 text-gray-500 text-sm">
          Please click the lock button in the browser address bar to set
          permissions.
        </div>
      </template>

      <template #body>
        <video class="m-auto block w-11/12 rounded shadow" v-if="(needGuide === 'Microphone')"
          src="@/assets/videos/allow-mic.mp4" muted autoplay loop="loop"></video>
        <video class="m-auto block w-11/12 rounded shadow" v-if="needGuide === 'Webcam'"
          src="@/assets/videos/allow-cam.mp4" muted autoplay loop="loop"></video>
        <p></p>
      </template>
    </UiModel>
  </Teleport>

</template>
