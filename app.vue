<template>
  <div>
    <Html lang="en" />
    <Title>Recwide - Free Screen Recorder</Title>
    <Meta lang="en" name="description"
      content="Recwide is a free screen recorder that allows you to record your screen and share it with your friends, family, and colleagues."
      theme-color="#ffffff" />
    <VitePwaManifest />
    <NuxtLoadingIndicator :duration="8000" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
