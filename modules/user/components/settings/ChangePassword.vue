<template v-slot="{ toggleForms }">
  <form
method="post" action="/form" autocomplete="off" enctype="application/x-www-form-urlencoded"
    @submit.prevent="changePassword()">
    <div class="">
      <h3>Change Info</h3>

      <p v-if="error" class="login-error" style="color: red; margin-top: 10px">
        {{ error }}
      </p>
      <p v-if="message" class="login-error" style="color: green; margin-top: 10px">
        {{ message }}
      </p>
      <div class="form-group">
        <label for="oldPassword">Current Password</label>
        <input
id="oldPassword" v-model="password" class="form-control" placeholder="Write current password..."
          type="password" name="oldPassword" tabindex="4" >
      </div>
      <div class="form-group">
        <label for="newPassword">New Password</label>

        <input
id="newPassword" v-model="newpassword" class="form-control" placeholder="Write new password..."
          type="password" name="newPassword" tabindex="5" >
      </div>
      <div class="form-group">
        <label for="confirmPassword">Cofirm New Password</label>

        <input
id="confirmPassword" v-model="confpassword" class="form-control" placeholder="Confirm password.."
          type="password" name="confirmPassword" tabindex="6" >
      </div>

      <button v-if="!loading" tabindex="6" class="btn btn-small btn-success" type="submit">
        Change
      </button>
      <button v-if="loading" disabled="disabled" class="btn btn-small btn-success">
        <div class="spinner">
          <div class="double-bounce1"/>
          <div class="double-bounce2"/>
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
      password: null,
      newpassword: null,
      confpassword: null,
      loading: false,
      error: null,
      message: null,
    };
  },
  methods: {
    async changePassword() {
      this.error = null;
      if (!this.password || !this.newpassword || !this.confpassword) {
        this.error = "Please add your informations";
        return;
      }
      this.loading = true;
      const res = await this.$store.dispatch({
        type: "user/changePassword",
        data: {
          oldPassword: this.password,
          newPassword: this.newpassword,
          confirmPassword: this.confpassword,
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
