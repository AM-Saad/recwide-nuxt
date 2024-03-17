<script setup>
const emit = defineEmits()
const { signIn } = useAuth()
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
    console.log(result)
    if (result.error) {
        error.value = result.error
    } else {
        emit('authenticated')
        emit('close')
    }
}

const switchComponent = () => {
    emit('switch', 'Signup')
}

</script>


<template>
    <form class="form" autocomplete="off" @submit.prevent="handleSubmit">
        <div class="">
            <p v-if="error" class="text-red-500 mt-3 text-xs">
                {{ error }}
            </p>

            <div class="form-group">
                <input id="login-email-client" v-model="credentials.username" type="email" name="email"
                    class="form-control" placeholder="Add Your Email Address..."
                    autocomplete="false | unknown-autocomplete-value" tabindex="1">
            </div>

            <div class="form-group">
                <input id="login-password-client" v-model="credentials.password" type="password" name="password"
                    class="form-control" placeholder="Write Your Password..."
                    autocomplete="false | unknown-autocomplete-value" tabindex="2">
            </div>

            <div class="form-group flex items-center gap-x-2 my-2 dark:text-gray-300">
                <label for="login-rememberMe-client">Remember Me</label>
                <input id="login-rememberMe-client" v-model="credentials.rememberMe" type="checkbox" name="rememberMe"
                    tabindex="3">
            </div>

            <div class="toggle-forms mb-2 text-sm dark:text-gray-300" tabindex="4">
                You don't have an account
                <a class="font-bold cursor-pointer underline" @click.prevent="switchComponent">
                    Signup
                </a>
            </div>
            <button type="submit" class="btn bg-theme btn-small" @click.prevent="handleSubmit">
                Login
            </button>
        </div>
    </form>
</template>
