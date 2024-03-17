<template>
  <form class="form sm:mt-20 mt-4" autocomplete="off" @submit.prevent="registerUser">
    <div>
      <h3 class="title">
        Sign up
      </h3>
      <p class="hint">
        Create a free account now.
      </p>

      <div class="form-group">
        <input id="signup-name-client" v-model="username" type="text" name="name" class="form-control"
          placeholder="Add Your name..." autocomplete="false | unknown-autocomplete-value" tabindex="1">
      </div>
      <div class="form-group">
        <input id="signup-email-client" v-model="email" type="email" name="email" class="form-control"
          placeholder="Add Your Email Address..." autocomplete="false | unknown-autocomplete-value" tabindex="2">
      </div>

      <div class="form-group">
        <input id="signup-password-client" v-model="password" type="password" name="password" class="form-control"
          placeholder="Write Your Password..." autocomplete="false | unknown-autocomplete-value" tabindex="2">
      </div>

      <div class="toggle-forms mb-2 text-sm dark:text-gray-200" tabindex="4">
        You already have an account
        <router-link class="font-bold" to="/auth/signin">
          Login
        </router-link>
      </div>
      <button type="submit" class="btn bg-theme btn-small" @click.prevent="registerUser">
        Sign Up
      </button>
    </div>
  </form>
</template>

<script setup>
const username = ref('')
const email = ref('')
const password = ref('')
const registerUser = () => {
  // Handle form validation
  // Handle form submission
  const { data } = useLazyFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username.value,
      email: email.value,
      password: password.value
    })
  })
  const response = toRaw(data.value)
  console.log('Registration response:', response)
}

// Handle the response, such as redirecting to the login page or showing a success message
// Handle registration error, such as showing an error message
</script>
