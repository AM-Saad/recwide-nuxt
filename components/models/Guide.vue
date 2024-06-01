<script>
export default {
  name: "Guide",
  props: ["show"],
  data() {
    return {
      dontShow: false,
    };
  },
  watch: {
    dontShow(val) {
      if (val == true) {
        localStorage.setItem("guideDismissed", true);
      } else {
        localStorage.setItem("guideDismissed", false);
      }
    },
  },
  created() {
    localStorage.setItem("guideDismissed", false);
  },
  methods: {
    gotit() {
      if (this.dontShow) {
        localStorage.setItem("guideDismissed", true);
      }
      this.$emit("gotit");
    },
  },
};
</script>


<template>
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <UiModel :show="show" @close="gotit">
      <template #header>
        <div class="flex flex-col">

          <div class="title font-bold text-xl">Check "Share Audio" Box</div>
          <div class="desc my-2 text-gray-500 dark:text-gray-400 text-sm">
            Please check "Share Audio" box to record system audio.
          </div>
        </div>
      </template>
      <template #body>

        <video src="@/assets/videos/share-sound.mp4" muted autoplay loop="loop" />
        <div class="flex justify-between gap-3 my-2">
          <div class="flex items-center gap-2">
            <input id="dontShow" type="checkbox" name="dontshow" @click="dontShow = !dontShow">
            <label for="dontShow" class="dark:text-gray-400">Don't Show Again</label>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-small bg-theme" @click="gotit">Got it</button>
      </template>
    </UiModel>
  </Teleport>

</template>


<style scoped>
.inner video {
  margin: auto;
  display: block;
  max-width: 90%;
  box-shadow: 0 0 6px -1px #999;
  padding: 12px;
  border-radius: 10px;
}

@media only screen and (max-width: 767px) and (min-width: 320px) {
  .inner {
    width: 90%;
  }
}
</style>
