<script setup>
const emit = defineEmits()
const error = ref('')
const isLoading = ref(false)
const credentials = ref({
  username: '',
  email: '',
  password: ''
})

const handleSubmit = async () => {
  isLoading.value = true
  const result = await signIn('credentials', {
    redirect: false,
    username: credentials.value.username,
    password: credentials.value.password
  })

  isLoading.value = false
  if (result.error) {
    return error.value = result.error
  }
  emit('authenticated')

}


const switchComponent = () => {
  if (isLoading.value) return
  emit('switch', 'Signin')
}

// Handle the response, such as redirecting to the login page or showing a success message
// Handle registration error, such as showing an error message
</script>



<template>
  <form class="form" autocomplete="off" enctype="application/x-www-form-urlencoded" @submit.prevent="registerUser">
    <div>
      <p v-if="error" class="text-red-400 mt-3 text-sm">
        {{ error }}
      </p>
      <div class="form-group mb-2">
        <label for="signup-name-client" class="text-sm dark:text-gray-300 mb-1">Name</label>
        <input id="signup-name-client" v-model="credentials.username" type="text" name="name" class="form-control"
          placeholder="Your Name (e.g. Joe)" autocomplete="false | unknown-autocomplete-value" tabindex="1">
      </div>
      <div class="form-group mb-2">
        <label for="signup-email-client" class="text-sm dark:text-gray-300 mb-1">Email Address</label>
        <input id="signup-email-client" v-model="credentials.email" type="email" name="email" class="form-control"
          placeholder="Your Email Address (e.g. joe@mail.com)" autocomplete="false | unknown-autocomplete-value"
          tabindex="2">
      </div>

      <div class="form-group mb-2">
        <label for="signup-password-client" class="text-sm dark:text-gray-300 mb-1">Password</label>
        <input id="signup-password-client" v-model="credentials.password" type="password" name="password"
          class="form-control" placeholder="Your Password" autocomplete="false | unknown-autocomplete-value"
          tabindex="2">
      </div>



      <div class="toggle-forms mb-2 text-sm dark:text-gray-300">
        You already have an account
        <a class="font-bold cursor-pointer underline" tabindex="4" @click.prevent="switchComponent">
          Login
        </a>
      </div>
      <button type="submit" tabindex="5" class="btn bg-theme btn-small" @click.prevent="handleSubmit">
        Sign Up
      </button>
    </div>
  </form>
</template>
