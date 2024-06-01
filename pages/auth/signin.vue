<script setup>
const { signIn } = useAuth()
const router = useRouter()

const error = ref('')
const credentials = ref({
  username: '',
  password: ''
})

const handleSubmit = async () => {
  const result = await signIn('credentials', {
    redirect: false,
    username: credentials.value.username,
    password: credentials.value.password
  })

  if (result.error) {
    error.value = result.error
  } else {
    router.push('/projects')
  }
}

</script>


<template>
  <form
class="form sm:mt-20 mt-4" autocomplete="off" enctype="application/x-www-form-urlencoded"
    @submit.prevent="handleSubmit">
    <div class="">
      <h3 class="title">
        Login
      </h3>
      <p class="hint">
        Login to your account
      </p>

      <p v-if="error" class="text-red-400 mt-3 text-sm">
        {{ error }}
      </p>

      <div class="form-group">
        <input
id="login-email-client" v-model="credentials.username" type="email" name="email" class="form-control"
          placeholder="Add Your Email Address..." autocomplete="false | unknown-autocomplete-value" tabindex="1"
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" title="Please enter a valid email address" required >
      </div>

      <div class="form-group">
        <input
id="login-password-client" v-model="credentials.password" type="password" name="password"
          class="form-control" placeholder="Write Your Password..." autocomplete="false | unknown-autocomplete-value"
          tabindex="2" >
      </div>

      <div class="form-group flex items-center gap-x-2 my-2 dark:text-gray-200">
        <label for="login-rememberMe-client">Remember Me</label>
        <input
id="login-rememberMe-client" v-model="credentials.rememberMe" type="checkbox" name="rememberMe"
          tabindex="3" >
      </div>

      <div class="toggle-forms mb-2 text-sm dark:text-gray-200" tabindex="4">
        You don't have an account
        <router-link class="font-bold" to="/auth/signup">
          Signup
        </router-link>
      </div>
      <button type="submit" class="btn bg-theme btn-small" @click.prevent="handleSubmit">
        Login
      </button>
    </div>
  </form>
</template>
