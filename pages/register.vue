<template>
  <div>
    <h1>Register</h1>
    <input
v-model="username" class="p-2 m-2 border"
placeholder="Username"  autocomplete="webauthn"/>
    <button @click="startRegistaring">Register</button>
  </div>
</template>

<script lang="ts">
 import { startRegistration } from "@simplewebauthn/browser"
definePageMeta({
   title: 'Register',
   auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/' },
 });

export default {
  data(): { username: string } {
    return {
      username: "",
    }
  },
  methods: {
    async startRegistaring(): Promise<void> {
      let registration
      try {
        const response = await fetch("/api/passkeys/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.username }),
        })
        const options = await response.json()
        console.log(options)

        registration = await startRegistration(options.body)
      } catch (error) {
        console.error("Registration failed", error)
        alert("Registration failed")
      }

      // POST the response to the endpoint that calls
      // @simplewebauthn/server -> verifyRegistrationResponse()
      const verificationResp = await fetch(
        "/api/passkeys/register/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registration),
        }, 
      )

      // Wait for the results of verification
      const verificationJSON = await verificationResp.json()

      // Show UI appropriate for the `verified` status
      if (verificationJSON && verificationJSON.verified) {
         alert("Registration successful")
      } else {
         alert("Registration failed" + verificationJSON)
      }
    },
   //  base64ToArrayBuffer(base64: Base64URLString): ArrayBuffer {
   //    // Handle URL-safe Base64
   //    base64 = base64.replace(/-/g, "+").replace(/_/g, "/")

   //    // Pad the string with '=' to make it a multiple of 4
   //    while (base64.length % 4) {
   //      base64 += "="
   //    }

   //    const binaryString = atob(base64)
   //    const length = binaryString.length
   //    const bytes = new Uint8Array(length)
   //    for (let i = 0; i < length; i++) {
   //      bytes[i] = binaryString.charCodeAt(i)
   //    }
   //    return bytes.buffer
   //  },
   //  arrayBufferToBase64(buffer: ArrayBuffer): Base64URLString {
   //    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
   //  },
  },
}
</script>
