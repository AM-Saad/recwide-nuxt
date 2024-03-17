<template>
  <form class="form" autocomplete="off" @submit.prevent="login">
    <div class="">

      <h3 class="title">Login</h3>
      <p class="hint">Login to your account.</p>

      <p v-if="userStore.msg" class="text-red-500 mt-3 text-xs">
        {{ userStore.msg }}
      </p>

      <div class="form-group">
        <input type="email" id="login-email-client" name="email" class="form-control"
          placeholder="Add Your Email Address..." autocomplete="false | unknown-autocomplete-value"
          v-model="state.email" tabindex="1" />
      </div>

      <div class="form-group">
        <input type="password" id="login-password-client" name="password" class="form-control"
          placeholder="Write Your Password..." v-model="state.password"
          autocomplete="false | unknown-autocomplete-value" tabindex="2" />
      </div>

      <div class="form-group flex items-center gap-x-2 my-2">
        <label for="login-rememberMe-client" class=" m-t-3">Remember Me</label>
        <input class="m-l-3" type="checkbox" id="login-rememberMe-client" name="rememberMe" v-model="state.rememberMe"
          tabindex="3" />
      </div>

      <div class="toggle-forms mb-2" tabindex="4" v-if="!state.loading">
        You don't have an account
        <router-link class="font-bold" to="/signup">Signup</router-link>
      </div>
      <button @click.prevent="login" type="submit" class="btn bg-theme" :disabled="state.loading"> Login </button>

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