<template>
  <div>
    <Title>Recwide - Free Screen Recorder</Title>
    <section class="header flex w-full items-center justify-center my-5">
      <div class="header-intro">
        <img class="mx-auto mb-4 w-48  dark:filter dark:invert-[1]" src="~/assets/images/full_logo.png"
          alt="recwide logo" srcset="">
        <p class="text-gray-500 mb-4 text-center text-xl max-w-md">
          Screen recorder has never been this easy, free
          and timeless before
        </p>
        <div class="flex justify-center items-center">
          <router-link class="btn btn-big glass-bg" to="/recorder">
            Start Record For Free
            <IconsPlay class="text-2xl" />
          </router-link>
        </div>
      </div>
      <div class="header-img" />
    </section>
    <!-- You can use $pwa directly in templates! -->
    <div v-if="$pwa.needRefresh" class="fixed bottom-2 right-2 p-2 rounded-lg shadow-lg glass-bg z-40">
      <span class="text-sm dark:text-gray-100 my-2 block">
        New content available,
        click on reload button to update.
      </span>

      <button class="btn btn-small glass-bg" @click="$pwa.updateServiceWorker()">
        Reload
      </button>
    </div>
    <div class="wrapper">
      <section class="flex justify-between flex-wrap gap-3 my-10 brands">

        <NuxtImg src="/images/brands/youtube.png" :placeholder="[30, 20]" format="webp" alt="alt_recwide_youtube"
          class="h-6 filter grayscale-[1]" />
        <NuxtImg src="/images/brands/tiktok.png" :placeholder="[30, 20]" format="webp" alt="alt_recwide_tiktok"
          class="h-6 filter grayscale-[1]" />
        <NuxtImg src="/images/brands/twitch.png" :placeholder="[30, 20]" format="webp" alt="alt_recwide_twitch"
          class="h-6 filter grayscale-[1]" />
        <NuxtImg src="/images/brands/instagram.png" :placeholder="[30, 20]" format="webp" alt="alt_recwide_instagram"
          class="h-6 filter grayscale-[1]" />
      </section>

      <section id="services" class="my-5 p-5">
        <h2 class="font-bold my-5 text-2xl">Why Choose Recwide</h2>

        <div class="grid sm:grid-cols-2 gap-5">

          <div class="services-item filter relative overflow-hidden  glass-bg">
            <div class="relative z-10">
              <div class="head">
                <div class="icon">
                  <img class="h-2/4" src="~/assets/images/free.png" alt="">
                </div>
                <h3>Free</h3>
              </div>
              <p>
                You don't need to pay
                anything, no credit card required.<br><strong> Enjoy it now</strong>
              </p>
            </div>
          </div>

          <div class="services-item filter relative overflow-hidden  glass-bg">
            <div class="relative z-10">
              <div class="head">
                <div class="icon">
                  <img class="h-2/4" src="~/assets/images/nodown.png" alt="">
                </div>
                <h3> Online(No Downlaod Required)</h3>
              </div>
              <p>
                START is all that it takes, however, since it's a PWA you
                could install it to make it available on your computer
              </p>
            </div>

          </div>

          <div class="services-item filter relative overflow-hidden  glass-bg">
            <div class="relative z-10">
              <div class="head">
                <div class="icon">
                  <img class="h-2/4" src="~/assets/images/screen.png" alt="">
                </div>
                <h3>Flexable Recording</h3>
              </div>
              <p>
                Whether you want to record screen, record webcam, a browser tab,
                entire screen or all of them combined it's up to you.
              </p>
            </div>
          </div>

          <div class="services-item filter relative overflow-hidden  glass-bg">
            <div class="relative z-10">

              <div class="head">
                <div class="icon">
                  <img class="h-2/4" src="~/assets/images/mic.png" alt="">
                </div>
                <h3>Audio Options</h3>
              </div>
              <p>
                Audio can be recorded simultaneously if you prefer. Choose
                between audio options to control your audios
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
// If you want to use it in setup, import from the nuxtApp.
const { $pwa } = useNuxtApp()

onMounted(() => {
  console.log('PWA Plugin:', $pwa)
  if ($pwa.offlineReady)
    console.log('App is offline ready')
  else
    console.log('App is not offline ready')
})
</script>
