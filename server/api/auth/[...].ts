// file: ~/server/api/auth/[...].ts
import GoogleProvider from "next-auth/providers/google"
import { NuxtAuthHandler } from "#auth"
useRuntimeConfig()
export default NuxtAuthHandler({
  secret: useRuntimeConfig().public.AUTH_SECRET,
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    GoogleProvider.default({
      clientId: useRuntimeConfig().public.GOOGLE_CLIENT_ID,
      clientSecret: useRuntimeConfig().public.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline", // Needed to get `refresh_token`
          include_granted_scopes: true,
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signIn",
    signOut: "/auth/signOut",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  //   events: {
  //     signIn: async (params) => {
  //       console.log("signIn", params)
  //       return
  //     },
  //     signOut: async (): Promise<void> => {
  //       // console.log("signOut", message)
  //     },
  //     createUser: async (): Promise<void> => {
  //       // console.log("createUser", message)
  //     },
  //     updateUser: async (): Promise<void> => {
  //       // console.log("updateUser", message)
  //     },
  //     linkAccount: async (): Promise<void> => {
  //       // console.log("linkAccount", message)
  //     },
  //     session: async (): Promise<void> => {
  //       // console.log("Event -> session", message)
  //     },
  //     //  error: async (): Promise<void> => {
  //     //    // console.log("error", message)
  //     //  },
  //   },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // First-time login, save the `access_token`, its expiry and the `refresh_token`
        return {
          ...token,
          access_token: account.access_token,
          expires_at: Math.floor(Date.now() / 1000) + account.expires_at!,
          refresh_token: account.refresh_token ?? token.refresh_token,
        }
      } else if (
        Math.floor(Date.now() / 1000) <
        (token.expires_at as number) * 1000
      ) {
        // Subsequent logins, but the `access_token` is still valid
        return token
      } else {
        // Subsequent logins, but the `access_token` has expired, try to refresh it
        if (!token.refresh_token) throw new TypeError("Missing refresh_token")
        try {
          // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
          // at their `/.well-known/openid-configuration` endpoint.
          // i.e. https://accounts.google.com/.well-known/openid-configuration
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
              client_id: useRuntimeConfig().public.GOOGLE_CLIENT_ID,
              client_secret: useRuntimeConfig().public.GOOGLE_CLIENT_SECRET,
              grant_type: "authorization_code",
            }),
          })

          const tokensOrError = await response.json()

          console.log("tokensOrError", tokensOrError)
          if (!response.ok) throw tokensOrError
          const newTokens = tokensOrError as {
            access_token: string
            expires_in: number
            refresh_token?: string
          }

          token.access_token = newTokens.access_token
          token.expires_at = Math.floor(
            Date.now() / 1000 + newTokens.expires_in,
          )
          console.log("Refreshed access_token", token)
          // Some providers only issue refresh tokens once, so preserve if we did not get a new one
          if (newTokens.refresh_token)
            token.refresh_token = newTokens.refresh_token
          return token
        } catch (error) {
          console.error("Error refreshing access_token", error)
          // If we fail to refresh the token, return an error so we can handle it on the page
          token.error = "RefreshTokenError"
          return token
        }
      }
    },
    async session({ session, token }) {
      // Token we injected into the JWT callback above.
      const { sessionToken } = token
      // console.log("session", { session, token, sessionToken })
      // Fetch data OR add previous data from the JWT callback.
      const additionalUserData = await $fetch(`/api/session/${sessionToken}`)
      // console.log("additionalUserData", additionalUserData)
      // Return the modified session
      return {
        ...session,
      }
    },
  },
})
