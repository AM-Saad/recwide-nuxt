<script setup lang="ts">
// Remember to disable the middleware protection from your page!
definePageMeta({
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: "/" },
})

const { signIn, getProviders } = useAuth()
const router = useRouter()
const providers = await getProviders()
const loading = ref(false)
const error = ref("")
const mappedProviders = Object.values(providers).filter(
  (provider) => provider?.name !== "Credentials",
)

const credentials = ref({
  email: "",
  password: "",
})

const handleSubmit = async (): Promise<void> => {
  error.value = ""
  if (!credentials.value.email || !credentials.value.password) {
    error.value = "Please add your information"
    return
  }

  if (!navigator.onLine) {
    // Register a sync event
    const registration = await navigator.serviceWorker.ready
    await registration.sync.register("syncForm", {
      email: credentials.value.email,
      password: credentials.value.password,
    })

    if ("indexedDB" in window) {
      const db: IDBDatabase = await indexedDB.open("recwide_db", 1, {
        upgrade(db) {
          db.createObjectStore("forms")
        },
      })

      db.onsuccess = function (event: Event): void {
        const target = event.target as IDBOpenDBRequest

        const tx = target.result.transaction("forms", "readwrite")
        const store = tx.objectStore("forms")
        store.put({
          email: credentials.value.email,
          password: credentials.value.password,
        })

        tx.oncomplete = function (): void {
          console.log("Form data saved locally.")
        }

        tx.onerror = function (): void {
          console.log("Form data not saved locally.")
        }

        console.log("Form data saved locally and sync event registered.")
      }

      console.log("Form data saved locally and sync event registered.")
    }
    console.log("Form data saved locally and sync event registered.")
  } else {
    loading.value = true

    try {
      const result = await signIn("credentials", {
        redirect: true,
        email: credentials.value.email,
        password: credentials.value.password,
      })
      console.log("User logged in successfully.", result)
      if (result && result.error) {
        error.value = result.error
        return
      }
      router.push("/")
    } catch (err) {
      console.log("Error logging in.", err)
      const serverError = err as Error
      error.value = serverError.message || "An error occurred"
    } finally {
      loading.value = false
    }
  }
}
</script>

<template>
  <div
    class="flex items-center justify-center flex-col w-full max-w-md mx-auto mt-6 sm:mt-20 bg-gray-50 dark:bg-transparent p-8 rounded-lg border"
  >
    <form
      ref="login"
      method="post"
      class="form w-full focus:bg-gray-100"
      autocomplete="test"
      @submit.prevent="handleSubmit"
    >
      <h1 class="title">Login</h1>
      <p class="text-gray-400 text-xs mb-3 mt-1">Login to your account</p>
      <shared-error-message :error="error" />

      <div class="form-group">
        <input
          id="login-email-client"
          v-model="credentials.email"
          type="email"
          name="email"
          class="input"
          placeholder="Add Your Email Address..."
          autocomplete="false | unknown-autocomplete-value"
          tabindex="1"
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
          title="Please enter a valid email address"
        />
      </div>

      <div class="form-group">
        <input
          id="login-password-client"
          v-model="credentials.password"
          type="password"
          name="password"
          class="input"
          placeholder="Write Your Password..."
          autocomplete="false | unknown-autocomplete-value"
          tabindex="2"
        />
      </div>

      <div class="toggle-forms mb-2 text-sm dark:text-gray-200">
        You don't have an account
        <router-link
          tabindex="3"
          class="font-semibold underline"
          to="/auth/signup"
        >
          Signup
        </router-link>
      </div>
      <div class="toggle-forms mb-2 text-sm dark:text-gray-200">
        Forgot your password
        <router-link
          tabindex="3"
          class="font-semibold underline"
          to="/auth/editPassword"
        >
          Reset Password
        </router-link>
      </div>
      <div>
        <button
          type="submit"
          class="btn btn-small bg-theme disabled:opacity-50"
          :disabled="loading"
          tabindex="4"
          @click.prevent="handleSubmit"
        >
          Login
        </button>
      </div>
    </form>
    <div
      v-if="mappedProviders.length"
      class="flex flex-col justify-center mt-4"
    >
      <p class="text-center text-gray-400 text-xs mt-4 mb-2">
        Or sign in with a social account below 👇
      </p>
      <button
        v-for="provider in mappedProviders"
        :key="provider?.id"
        class="btn btn-small bg-white dark:bg-[#eb4034] disabled:opacity-50 dark:ring-white"
        :disabled="loading"
        type="button"
        tabindex="5"
        @click="signIn(provider?.id)"
      >
        Sign in with {{ provider?.name }}
      </button>
    </div>
  </div>
</template>
