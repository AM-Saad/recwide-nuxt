<script setup lang="ts">
const emit = defineEmits()
const { signIn, status } = useAuth()
const error = ref('')
const isLoading = ref(false)
const credentials = ref({
    username: '',
    password: ''
})

const handleSubmit = async () => {
    if (credentials.value.username === '' || credentials.value.password === '') return error.value = 'Please fill in all fields'

    isLoading.value = true
    error.value = ''
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
    emit('close')
}

const switchComponent = () => {
    if (status === 'loading' || isLoading.value) return
    emit('switch', 'Signup')
}

</script>


<template>
    <form class="form" autocomplete="off" enctype="application/x-www-form-urlencoded" @submit.prevent="handleSubmit">
        <div class="">
            <p v-if="error" class="text-red-400 mt-3 text-sm">
                {{ error }}
            </p>

            <div class="form-group mb-2">
                <label for="login-email-client" class="text-sm dark:text-gray-300 mb-1">Email Address</label>
                <input id="login-email-client" v-model="credentials.username" type="email" name="email"
                    class="form-control" placeholder="Your Email Address (e.g. joe@mail.com)"
                    autocomplete="false | unknown-autocomplete-value" tabindex="1">
            </div>

            <div class="form-group mb-2">
                <label for="login-password-client" class="text-sm dark:text-gray-300 mb-1">Password</label>
                <input id="login-password-client" v-model="credentials.password" type="password" name="password"
                    class="form-control" placeholder="Your Password" autocomplete="false | unknown-autocomplete-value"
                    tabindex="2">
            </div>

            <div class="form-group mb-2 flex items-center gap-x-2 my-2">
                <label for="login-rememberMe-client" class="text-sm dark:text-gray-300">Remember Me</label>
                <input id="login-rememberMe-client" v-model="credentials.rememberMe" type="checkbox" name="rememberMe"
                    tabindex="3">
            </div>
            <div class="toggle-forms mb-2 text-sm dark:text-gray-300">
                You don't have an account
                <a class="font-bold cursor-pointer underline" tabindex="4" @click.prevent="switchComponent">
                    Signup
                </a>
            </div>
            <button class="btn bg-theme btn-small disabled:bg-opacity-50" tabindex="5" :disabled="isLoading"
                type="submit" @click.prevent="handleSubmit">
                {{ status === 'loading' || isLoading ? 'Loading...' : 'Login' }}
            </button>
        </div>
    </form>
</template>
