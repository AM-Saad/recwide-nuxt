<script>
export default {
  name: "Guide",
  data() {
    return {
      dontShow: false,
    };
  },
  props: ["show"],
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
  watch: {
    dontShow(val) {
      if (val == true) {
        localStorage.setItem("guideDismissed", true);
      } else {
        localStorage.setItem("guideDismissed", false);
      }
    },
  },
};
</script>


<template>
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <UiModel :show="show" @close="gotit">
      <template #header>

        <div class="title font-bold text-xl">Check "Share Audio" Box</div>
        <div class="desc my-2 text-gray-500 text-sm">
          Please check "Share Audio" box to record system audio.
        </div>
      </template>
      <template #body>

        <video src="@/assets/videos/share-sound.mp4" muted autoplay loop="loop"></video>
        <div class="flex justify-between gap-3 my-2">
          <div class="flex items-center gap-2">
            <input @click="dontShow = !dontShow" type="checkbox" name="dontshow" id="dontShow" />
            <label for="dontShow" class="dark:text-gray-400">Don't Show Again</label>
          </div>
        </div>
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
