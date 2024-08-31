<template>
  <form
    class="form"
    autocomplete="off"
    enctype="application/x-www-form-urlencoded"
    @submit.prevent="signup"
  >
    <div class="">
      <h3 class="title">Sign up</h3>
      <p class="hint">Create a free account now.</p>

      <p v-if="userStore.msg" class="text-red-500 mt-3">
        {{ userStore.msg }}
      </p>

      <div class="form-group">
        <input
          id="signup-name-client"
          v-model="state.name"
          type="text"
          name="name"
          class="form-control"
          placeholder="Add Your name..."
          autocomplete="false | unknown-autocomplete-value"
          tabindex="1"
        />
      </div>
      <div class="form-group">
        <input
          id="signup-email-client"
          v-model="state.email"
          type="email"
          name="email"
          class="form-control"
          placeholder="Add Your Email Address..."
          autocomplete="false | unknown-autocomplete-value"
          tabindex="2"
        />
      </div>

      <div class="form-group">
        <input
          id="signup-password-client"
          v-model="state.password"
          type="password"
          name="password"
          class="form-control"
          placeholder="Write Your Password..."
          autocomplete="false | unknown-autocomplete-value"
          tabindex="2"
        />
      </div>

      <div
        v-if="!state.loading"
        id="login-link"
        class="toggle-forms mb-2"
        tabindex="4"
      >
        You already have an account
        <router-link class="font-bold" to="/login"> Login </router-link>
      </div>
      <button
        type="submit"
        class="btn bg-theme"
        :disabled="state.loading"
        @click.prevent="signup"
      >
        Sign Up
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useUserStore } from "@/modules/user/store/index"

const userStore = useUserStore()

const state = reactive({
  loading: false,
  email: "",
  password: "",
  name: "",
  error: null,
})
const signup = async (): Promise<void> => {
  state.loading = true
  console.log("state", state)
  await userStore.signup({
    email: state.email,
    password: state.password,
    name: state.name,
  })
  state.loading = false
}
</script>
