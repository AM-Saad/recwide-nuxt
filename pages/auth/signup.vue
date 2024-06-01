<template>
  <form class="form sm:mt-20 mt-4" autocomplete="off" enctype="application/x-www-form-urlencoded"
    @submit.prevent="registerUser">
    <div>
      <h3 class="title">Sign up</h3>
      <p class="hint">Create a free account now.</p>

      <p v-if="status === 'error'" class="text-red-400 mt-3 text-sm">
        An error occurred. Please try again.
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
        <router-link class="font-bold" to="/auth/signin"> Login </router-link>
      </div>
      <button type="submit" class="btn bg-theme btn-small" :disabled="status === 'loading'"
        @click.prevent="registerUser">
        Sign Up
      </button>
    </div>
  </form>
</template>

<script setup>
const username = ref("");
const email = ref("");
const password = ref("");
const status = ref("stale");
const { signup } = useAuth()
const router = useRouter()
const registerUser = async () => {
  // Handle form validation
  if (!username.value || !email.value || !password.value) {
    return;
  }

  status.value = "loading";
  // Handle form submission



  const result = await signup('credentials', {
    redirect: true,
    username: username,
    password: password
  })

  if (result.error) {
    status.value = "error";

  } else {
    router.push('/projects')
  }

  // Redirect to the login page
  router.push("/auth/signin");
};

</script>
