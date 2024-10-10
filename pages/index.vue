<template>
  <div>
    <Title>Recwide - Free Screen Recorder</Title>

    <section
      class="header my-5 flex w-full flex-col items-center justify-center"
    >
      <img
        class="mx-auto mb-4 w-48 dark:invert-[1] dark:filter"
        src="~/assets/images/full_logo.png"
        alt="recwide logo"
        srcset=""
      />
      <p class="mb-4 max-w-md text-center text-xl text-gray-500">
        Screen recorder has never been this easy, free and timeless before
      </p>
      <router-link
        class="btn btn-big bg-theme place-self-center"
        to="/recorder"
      >
        Start Record
        <IconsPlay />
      </router-link>
    </section>

    <div class="wrapper">
      <section class="brands my-10 flex flex-wrap justify-between gap-3">
        <NuxtImg
          src="/images/brands/youtube.png"
          :placeholder="[30, 20]"
          format="webp"
          alt="alt_recwide_youtube"
          class="h-6 grayscale-[1] filter"
        />
        <NuxtImg
          src="/images/brands/tiktok.png"
          :placeholder="[30, 20]"
          format="webp"
          alt="alt_recwide_tiktok"
          class="h-6 grayscale-[1] filter"
        />
        <NuxtImg
          src="/images/brands/twitch.png"
          :placeholder="[30, 20]"
          format="webp"
          alt="alt_recwide_twitch"
          class="h-6 grayscale-[1] filter"
        />
        <NuxtImg
          src="/images/brands/instagram.png"
          :placeholder="[30, 20]"
          format="webp"
          alt="alt_recwide_instagram"
          class="h-6 grayscale-[1] filter"
        />
      </section>

      <section id="services" class="my-5 p-5">
        <h2 class="my-5 text-2xl font-bold">Why Choose Recwide</h2>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="services-item glass-bg relative overflow-hidden filter">
            <div class="relative z-10">
              <div class="head">
                <div class="icon">
                  <img
                    src="~/assets/images/free.png"
                    class="h-2/4"
                    alt=""
                    srcset=""
                  />
                </div>
                <h3>Free</h3>
              </div>
              <p>
                You don't need to pay anything, no credit card required.<br /><strong>
                  Enjoy it now</strong
                >
              </p>
            </div>
          </div>

          <div class="services-item glass-bg relative overflow-hidden filter">
            <div class="relative z-10">
              <div class="head">
                <div class="icon">
                  <img
                    class="h-2/4"
                    src="~/assets/images/nodown.png"
                    alt=""
                    srcset=""
                  />
                </div>
                <h3>
                  Online <span class="text-xs">( No Download Required )</span>
                </h3>
              </div>
              <p>
                START is all that it takes, however, since it's a PWA you could
                install it to make it available on your device.
              </p>
            </div>
          </div>

          <div class="services-item glass-bg relative overflow-hidden filter">
            <div class="relative z-10">
              <div class="head">
                <div class="icon">
                  <img
                    class="h-2/4"
                    src="~/assets/images/screen.png"
                    alt="screen-icon"
                  />
                </div>
                <h3>Flexible Recording</h3>
              </div>
              <p>
                Whether you want to record screen, record webcam, a browser tab,
                entire screen or all of them combined it's up to you.
              </p>
            </div>
          </div>

          <div class="services-item glass-bg relative overflow-hidden filter">
            <div class="relative z-10">
              <div class="head">
                <div class="icon">
                  <img
                    class="h-2/4"
                    src="~/assets/images/mic.png"
                    alt="mic-icon"
                  />
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
definePageMeta({
  title: "Recwide - Free Screen Recorder",
  description:
    "Screen recorder has never been this easy, free and timeless before",
  image: "/images/og/recwide.png",
  auth: false,
})
// If you want to use it in setup, import from the nuxtApp.
const { $pwa } = useNuxtApp()

onMounted(() => {
  if ($pwa.offlineReady) console.log("App is offline ready")
  else console.log("App is not offline ready")
})
</script>
