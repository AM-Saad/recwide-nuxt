<template>
  <form class="form" autocomplete="off" enctype="application/x-www-form-urlencoded" @submit.prevent="login">
    <div class="">

      <h3 class="title">Login</h3>
      <p class="hint">Login to your account.</p>

      <p v-if="userStore.msg" class="text-red-500 mt-3 text-xs">
        {{ userStore.msg }}
      </p>

      <div class="form-group">
        <input
id="login-email-client" v-model="state.email" type="email" name="email"
          class="form-control" placeholder="Add Your Email Address..."
          autocomplete="false | unknown-autocomplete-value" tabindex="1" >
      </div>

      <div class="form-group">
        <input
id="login-password-client" v-model="state.password" type="password" name="password"
          class="form-control" placeholder="Write Your Password..."
          autocomplete="false | unknown-autocomplete-value" tabindex="2" >
      </div>

      <div class="form-group flex items-center gap-x-2 my-2">
        <label for="login-rememberMe-client" class=" m-t-3">Remember Me</label>
        <input
id="login-rememberMe-client" v-model="state.rememberMe" class="m-l-3" type="checkbox" name="rememberMe"
          tabindex="3" >
      </div>

      <div v-if="!state.loading" class="toggle-forms mb-2" tabindex="4">
        You don't have an account
        <router-link class="font-bold" to="/signup">Signup</router-link>
      </div>
      <button type="submit" class="btn bg-theme" :disabled="state.loading" @click.prevent="login"> Login </button>

    </div>
  </form>
</template>


<script setup lang="ts">

import { useUserStore } from '@/modules/user/store/index';
const userStore = useUserStore();

const state = reactive({
  loading: false,
  email: "",
  password: "",
  error: null,
  rememberMe: false,
});


const login = async () => {
  state.loading = true;
  await userStore.login({
    email: state.email,
    password: state.password,
    rememberMe: state.rememberMe,
  });
  state.loading = false;

}

</script>