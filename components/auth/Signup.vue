<script setup>
const emit = defineEmits()
const error = ref('')
const credentials = ref({
  username: '',
  email: '',
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
    emit('authenticated')
  }
}


const switchComponent = () => {
  emit('switch', 'Signin')
}

// Handle the response, such as redirecting to the login page or showing a success message
// Handle registration error, such as showing an error message
</script>



<template>
  <form class="form" autocomplete="off" @submit.prevent="registerUser">
    <div>
      <p v-if="error" class="text-red-500 mt-3 text-xs">
        {{ error }}
      </p>
      <div class="form-group">
        <input id="signup-name-client" v-model="credentials.username" type="text" name="name" class="form-control"
          placeholder="Add Your name..." autocomplete="false | unknown-autocomplete-value" tabindex="1">
      </div>
      <div class="form-group">
        <input id="signup-email-client" v-model="credentials.email" type="email" name="email" class="form-control"
          placeholder="Add Your Email Address..." autocomplete="false | unknown-autocomplete-value" tabindex="2">
      </div>

      <div class="form-group">
        <input id="signup-password-client" v-model="credentials.password" type="password" name="password"
          class="form-control" placeholder="Write Your Password..." autocomplete="false | unknown-autocomplete-value"
          tabindex="2">
      </div>

      <div class="toggle-forms mb-2 text-sm" tabindex="4">
        You already have an account

        <a class="font-bold cursor-pointer" @click.prevent="switchComponent">
          Login
        </a>
      </div>
      <button type="submit" class="btn bg-theme btn-small" @click.prevent="handleSubmit">
        Sign Up
      </button>
    </div>
  </form>
</template>
