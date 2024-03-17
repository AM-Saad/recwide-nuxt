<template v-slot="{ toggleForms }">
  <form method="post" action="/form" autocomplete="off" @submit.prevent="updateInfo()">
    <div class="">
      <h3>Change Info</h3>
      <p v-if="error" class="login-error text-red-500 mt-2">
        {{ error }}
      </p>
      <p v-if="message" class="login-error text-green-500 mt-2">
        {{ message }}
      </p>

      <div class="form-group">
        <input type="email" id="login-email-client" name="email" class="form-control"
          placeholder="Add Your Email Address..." autocomplete="false | unknown-autocomplete-value" v-model="email"
          tabindex="1" />
      </div>
      <div class="form-group">
        <input type="nname" id="login-nname-client" name="nname" class="form-control" placeholder="Write Your name..."
          v-model="name" autocomplete="false | unknown-autocomplete-value" tabindex="2" />
      </div>

      <button tabindex="3" class="btn btn-small btn-success" v-if="!loading" type="submit">
        Change
      </button>
      <button disabled="disabled" class="btn btn-small btn-success" v-if="loading">
        <div class="spinner">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: "UpdateInfo",
  data() {
    return {
      loading: false,
      email: "",
      name: "",
      error: null,
      message: null,
    };
  },
  methods: {
    async updateInfo() {
      this.error = null;
      if (!this.email || !this.name) {
        this.error = "Please add your informations";
        return;
      }
      this.loading = true;
      const res = await this.$store.dispatch({
        type: "user/changeInfo",
        data: {
          email: this.email,
          name: this.name,
        },
      });
      this.loading = false;
      if (!res.state) {
        this.error = res.msg;
        return;
      }
      this.message = "information Updated.";
    },
  },
};
</script>

<style scoped>
input:invalid {
  border: rgb(255, 110, 110) solid;
}
</style>
