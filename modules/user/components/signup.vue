<template>
    <form class="form" autocomplete="off" @submit.prevent="signup">
        <div class="">

            <h3 class="title">Sign up</h3>
            <p class="hint">Create a free account now.</p>

            <p v-if="userStore.msg" class="text-red-500 mt-3">
                {{ userStore.msg }}
            </p>

            <div class="form-group">
                <input type="text" id="signup-name-client" name="name" class="form-control"
                    placeholder="Add Your name..." autocomplete="false | unknown-autocomplete-value"
                    v-model="state.name" tabindex="1" />
            </div>
            <div class="form-group">
                <input type="email" id="signup-email-client" name="email" class="form-control"
                    placeholder="Add Your Email Address..." autocomplete="false | unknown-autocomplete-value"
                    v-model="state.email" tabindex="2" />
            </div>

            <div class="form-group">
                <input type="password" id="signup-password-client" name="password" class="form-control"
                    placeholder="Write Your Password..." v-model="state.password"
                    autocomplete="false | unknown-autocomplete-value" tabindex="2" />
            </div>


            <div class="toggle-forms mb-2" tabindex="4" v-if="!state.loading">
                You already have an account
                <router-link class="font-bold" to="/login">Login</router-link>
            </div>
            <button @click.prevent="signup" type="submit" class="btn bg-theme" :disabled="state.loading"> Sign Up
            </button>

        </div>
    </form>
</template>


<script setup lang="ts">

import { useUserStore } from '@/modules/user/store/index';
const userStore = useUserStore();

const state = reactive({
    loading: false,
    email: "",
    password: "",
    name: "",
    error: null,

});

const signup = async () => {
    state.loading = true;
    await userStore.signup({
        email: state.email,
        password: state.password,
        name: state.name,
    });
    state.loading = false;
}

</script>