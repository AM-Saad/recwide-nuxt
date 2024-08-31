<template>
  <div>
    <h1>Login</h1>
    <input
v-model="email" placeholder="email"
autocomplete="webauthn" />
    <button @click="startAuthenticate">Login</button>
  </div>
</template>

<script lang="ts">
import { startAuthentication } from "@simplewebauthn/browser"

 definePageMeta({
   title: 'Login',
   auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/' },
 });
 export default {
   data(): { email: string } {
     return {
       email: '',
     };
   },
   methods: {
     async startAuthenticate():Promise<void> {
      let asseResp
       try {
         const response = await fetch('/api/passkeys/authenticate', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email: this.email }),
             credentials: 'include',
         });
         const registration = await response.json();
         asseResp = await startAuthentication(registration.body);

        } catch (error) {
         console.error('Authentication failed', error);
         alert('Authentication failed');
       }

 // POST the response to the endpoint that calls
    // @simplewebauthn/server -> verifyAuthenticationResponse()
    const verificationResp = await fetch('/api/passkeys/authenticate/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asseResp),
    });

    // Wait for the results of verification
    const verificationJSON = await verificationResp.json();

    // Show UI appropriate for the `verified` status
    if (verificationJSON.body && verificationJSON.body.verified) {
      alert('Authentication successful');
    } else {
      alert('Authentication failed');
    }
    }

        //  const credential = await navigator.credentials.get({
        //    publicKey: options,
        //  });

        //  if (!credential) {
        //    alert('Authentication failed');
        //    return;
        //  }
        //  const credentialResponse = {
        //    id: credential.id,
        //    rawId: this.arrayBufferToBase64(credential.rawId),
        //    response: {
        //      authenticatorData: this.arrayBufferToBase64(credential.response.authenticatorData),
        //      clientDataJSON: this.arrayBufferToBase64(credential.response.clientDataJSON),
        //      signature: this.arrayBufferToBase64(credential.response.signature),
        //      userHandle: this.arrayBufferToBase64(credential.response.userHandle),
        //    },
        //    type: credential.type,
        //  };

        //  await fetch('/api/passkeys/authenticate/verify', {
        //    method: 'POST',
        //    headers: { 'Content-Type': 'application/json' },
        //    body: JSON.stringify(credentialResponse),
        //  });

        //  alert('Authentication successful');


   },
 };
</script>
