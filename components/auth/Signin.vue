<script setup lang="ts">
const emit = defineEmits(["authenticated", "close", "switch"])
const { signIn, status } = useAuth()
const error = ref("")
const isLoading = ref(false)
const credentials = ref({
  username: "",
  password: "",
  rememberMe: false,
})

const handleSubmit = async (): Promise<void> => {
  if (credentials.value.username === "" || credentials.value.password === "") {
    error.value = "Please fill in all fields"
    return
  }
  isLoading.value = true
  error.value = ""
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
  emit("close")
}

const switchComponent = (): void => {
  if (status.value === "loading" || isLoading.value) return
  emit("switch", "Signup")
}
</script>

<template>
  <form
    class="form"
    autocomplete="off"
    enctype="application/x-www-form-urlencoded"
    @submit.prevent="handleSubmit"
  >
    <div class="">
      <p v-if="error" class="mt-3 text-sm text-red-400">
        {{ error }}
      </p>

      <div class="form-group mb-2">
        <label for="login-email-client" class="mb-1 text-sm dark:text-gray-300"
          >Email Address</label
        >
        <input
          id="login-email-client"
          v-model="credentials.username"
          type="email"
          name="email"
          class="form-control"
          placeholder="Your Email Address (e.g. joe@mail.com)"
          autocomplete="false | unknown-autocomplete-value"
          tabindex="1"
        />
      </div>

      <div class="form-group mb-2">
        <label
          for="login-password-client"
          class="mb-1 text-sm dark:text-gray-300"
          >Password</label
        >
        <input
          id="login-password-client"
          v-model="credentials.password"
          type="password"
          name="password"
          class="form-control"
          placeholder="Your Password"
          autocomplete="false | unknown-autocomplete-value"
          tabindex="2"
        />
      </div>

      <div class="form-group my-2 mb-2 flex items-center gap-x-2">
        <label for="login-rememberMe-client" class="text-sm dark:text-gray-300"
          >Remember Me</label
        >
        <input
          id="login-rememberMe-client"
          v-model="credentials.rememberMe"
          type="checkbox"
          name="rememberMe"
          tabindex="3"
        />
      </div>
      <div class="toggle-forms mb-2 text-sm dark:text-gray-300">
        You don't have an account
        <a
          class="cursor-pointer font-bold underline"
          tabindex="4"
          @click.prevent="switchComponent"
        >
          Signup
        </a>
      </div>
      <button
        class="btn btn-small bg-theme disabled:bg-opacity-50"
        tabindex="5"
        :disabled="isLoading"
        type="submit"
        @click.prevent="handleSubmit"
      >
        {{ status === "loading" || isLoading ? "Loading..." : "Login" }}
      </button>
    </div>
  </form>
</template>
