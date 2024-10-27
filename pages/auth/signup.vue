<script setup lang="ts">
import { RESOURCES } from "~/utils/constants/resources.enum"

definePageMeta({
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: "/" },
})
const { getProviders, signIn } = useAuth()
const router = useRouter()

const providers = await getProviders()
const mappedProviders = Object.values(providers).filter(
  (provider) => provider?.name !== "Credentials",
)

const credentials = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
})
const fieldTypes = reactive({
  password: "password",
  confirmPassword: "password",
}) as { [key: string]: string }

const error = ref("")
const success = ref("")
const loading = ref(false)

const handleSubmit = async (): Promise<void> => {
  error.value = ""
  if (
    !credentials.value.name ||
    !credentials.value.email ||
    !credentials.value.password
  ) {
    error.value = "Please add your information"
    return
  }

  if (credentials.value.password !== credentials.value.confirmPassword) {
    error.value = "Passwords do not match"
    return
  }
  loading.value = true
  try {
    const response = await fetch(RESOURCES.AUTH_REGISTER_USER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...credentials.value, provider: "credentials" }),
    })

    const data = await response.json()
    if (!response.ok) {
      error.value = data.message
      return
    }
    success.value = data.message

    router.push(data.body.redirect)
  } catch (err) {
    const serverError = err as Error
    error.value = serverError.message || "An error occurred"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="flex items-center justify-center flex-col w-full max-w-md mx-auto mt-6 sm:mt-18 bg-gray-50 dark:bg-transparent p-8 rounded-lg border"
  >
    <form
      ref="signup"
      method="post"
      class="form"
      autocomplete="test"
      @submit.prevent="handleSubmit()"
    >
      <h1 class="title">Sign up</h1>
      <p class="text-gray-400 text-xs mb-3 mt-1">
        By register you will be able to save your projects and retrieve them
        anytime you need it.
      </p>
      <shared-error-message :error="error" />
      <shared-success-message :message="success ? `${success}` : undefined" />

      <div class="form-group">
        <input
          id="name-client"
          v-model="credentials.name"
          type="text"
          name="input-account"
          class="input"
          placeholder="Add Your Name..."
          title="Please enter your name"
          tabindex="1"
        />
      </div>

      <div class="form-group">
        <input
          id="email-client"
          v-model="credentials.email"
          type="email"
          name="input-account-connection"
          class="input"
          placeholder="Add Your Email address..."
          title="Please enter a valid email address"
          tabindex="2"
        />
      </div>

      <div class="form-group">
        <input
          id="password-client"
          v-model="credentials.password"
          :type="fieldTypes.password"
          name="password"
          class="input"
          placeholder="Write Your Password..."
          tabindex="3"
        />
      </div>

      <div class="form-group">
        <input
          id="confirm-password-client"
          v-model="credentials.confirmPassword"
          :type="fieldTypes.confirmPassword"
          name="confirmPassword"
          class="input"
          placeholder="Confirm Your Password..."
          tabindex="4"
        />
      </div>

      <div class="toggle-forms mb-2 text-sm dark:text-gray-200">
        Already have an account
        <router-link
          class="font-semibold underline"
          tabindex="4"
          to="/auth/signIn"
        >
          Login
        </router-link>
      </div>
      <div>
        <button
          type="submit"
          class="btn btn-small bg-theme disabled:opacity-50"
          :disabled="loading"
          tabindex="5"
          @click.prevent="handleSubmit"
        >
          Sign up
        </button>
      </div>
    </form>
    <div
      v-if="mappedProviders.length"
      class="flex flex-col justify-center mt-4"
    >
      <p class="text-center text-gray-400 text-xs mt-4 mb-2">
        Or sign up with a social account below 👇
      </p>
      <button
        v-for="provider in mappedProviders"
        :key="provider?.id"
        class="btn btn-small bg-white dark:bg-[#eb4034] dark:ring-white"
        type="button"
        tabindex="6"
        @click="signIn(provider?.id)"
      >
        Sign up with {{ provider?.name }}
      </button>
    </div>
  </div>
</template>
