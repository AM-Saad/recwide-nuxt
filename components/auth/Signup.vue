<script setup lang="ts">
import { defineEmits, ref } from "vue"

const emit = defineEmits(["authenticated", "close", "switch"])
const error = ref("")
const isLoading = ref(false)
const credentials = ref({
  username: "",
  email: "",
  password: "",
})

const handleSubmit = async (): Promise<void> => {
  isLoading.value = true
  const result = await signIn("credentials", {
    redirect: false,
    username: credentials.value.username,
    password: credentials.value.password,
  })

  isLoading.value = false
  if (result.error) {
    error.value = result.error
    return
  }
  emit("authenticated")
}

const switchComponent = (): void => {
  if (isLoading.value) return
  emit("switch", "Signin")
}

// Handle the response, such as redirecting to the login page or showing a success message
// Handle registration error, such as showing an error message
</script>

<template>
  <form
    class="form"
    autocomplete="off"
    enctype="application/x-www-form-urlencoded"
    @submit.prevent="registerUser"
  >
    <div>
      <p v-if="error" class="mt-3 text-sm text-red-400">
        {{ error }}
      </p>
      <div class="form-group mb-2">
        <label for="signup-name-client" class="mb-1 text-sm dark:text-gray-300"
          >Name</label
        >
        <input
          id="signup-name-client"
          v-model="credentials.username"
          type="text"
          name="name"
          class="form-control"
          placeholder="Your Name (e.g. Joe)"
          autocomplete="false | unknown-autocomplete-value"
          tabindex="1"
        />
      </div>
      <div class="form-group mb-2">
        <label for="signup-email-client" class="mb-1 text-sm dark:text-gray-300"
          >Email Address</label
        >
        <input
          id="signup-email-client"
          v-model="credentials.email"
          type="email"
          name="email"
          class="form-control"
          placeholder="Your Email Address (e.g. joe@mail.com)"
          autocomplete="false | unknown-autocomplete-value"
          tabindex="2"
        />
      </div>

      <div class="form-group mb-2">
        <label
          for="signup-password-client"
          class="mb-1 text-sm dark:text-gray-300"
          >Password</label
        >
        <input
          id="signup-password-client"
          v-model="credentials.password"
          type="password"
          name="password"
          class="form-control"
          placeholder="Your Password"
          autocomplete="false | unknown-autocomplete-value"
          tabindex="2"
        />
      </div>

      <div class="toggle-forms mb-2 text-sm dark:text-gray-300">
        You already have an account
        <a
          class="cursor-pointer font-bold underline"
          tabindex="4"
          @click.prevent="switchComponent"
        >
          Login
        </a>
      </div>
      <button
        type="submit"
        tabindex="5"
        class="btn btn-small bg-theme"
        @click.prevent="handleSubmit"
      >
        Sign Up
      </button>
    </div>
  </form>
</template>
