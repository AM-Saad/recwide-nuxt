<template>
  <div class="max-w-4xl mx-auto px-2 flex flex-col justify-between h-screen">
    <nav id="nav" class="flex justify-between border p-2 rounded-b-lg border-t-0 glass-bg relative z-20">
      <div class="flex items-center">
        <router-link to="/">
          <img class="w-28 dark:filter dark:invert-[1]" src="~/assets/images/full_logo.png" alt="recwide-logo">
        </router-link>
      </div>

      <div v-if="status !== 'authenticated'" class="flex gap-5">
        <router-link class="btn btn-small" to="/auth/signin">
          Login
        </router-link>

        <router-link class="btn btn-small bg-theme text-white" to="/auth/signup">
          Signup
        </router-link>
      </div>

      <div v-if="status === 'authenticated'" class="flex gap-5">
        <Dropdown />
      </div>

    </nav>

    <div class="flex-1">
      <slot />
    </div>

    <footer class="glass-bg p-2 rounded-t-lg">
      <div class="footer-wrapper grid">
        <div class="footer-social">
          <ul>
            <li>
              <a href=""><i class="fab fa-facebook-f" /></a>
            </li>
            <li>
              <a href=""><i class="fab fa-twitter" /></a>
            </li>
            <li>
              <a href=""><i class="fab fa-instagram" /></a>
            </li>
            <li>
              <a href=""><i class="fab fa-google" /></a>
            </li>
          </ul>
          <ul class="flex gap-5 justify-center">
            <li class="text-lg dark:text-gray-300">
              <a href="/">Support</a>
            </li>
            <li class="text-lg dark:text-gray-300">
              <router-link to="/about">About</router-link>
            </li>
            <li class="text-lg dark:text-gray-300">
              <a href="/">Contact </a>
            </li>
          </ul>
        </div>
      </div>
      <p class="text-center my-2 dark:text-gray-300 text-sm">
        Provided by <a class="underline" href="https://amsaad.cc">Abdelrahman Saad</a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Dropdown from '~/components/ui/Dropdown.vue';


const { status } = useAuth()

</script>
