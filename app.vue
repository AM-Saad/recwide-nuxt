<template>
  <div>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator :duration="8000" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
