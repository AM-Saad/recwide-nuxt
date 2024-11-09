/* eslint-disable no-console */
// file: ~/server/api/auth/[...].ts
import GoogleProvider from "next-auth/providers/google"
import { NuxtAuthHandler } from "#auth"
import { AuthService } from "~/services/auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { verificationCode } from "~/utils/verificationCode.server"
const prisma = new PrismaClient()
const config = useRuntimeConfig()

export default NuxtAuthHandler({
  secret: config.public.AUTH_SECRET,
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    GoogleProvider.default({
      clientId: config.public.GOOGLE_CLIENT_ID,
      clientSecret: config.public.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline", // Needed to get `refresh_token`
          include_granted_scopes: true,
        },
      },
    }),
    // @ts-expect-error Use .default here for it to work during SSR.
    CredentialsProvider.default({
      name: "Credentials",
      credentials: {
        email: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: {
        email: string
        password: string
      }): Promise<unknown> {
        // Add logic to verify credentials here
        if (!credentials) {
          throw new Error("Invalid Credentials - Email Not Provided")
        }
        const { email, password } = credentials
        // Fetch user and password hash from your database
        const user = await prisma.users.findUnique({ where: { email } })
        if (!user) {
          throw new Error("Invalid Credentials - Email Not Registered")
        }

        if (!user.email_verified) {
          throw new Error(
            `Account not verified, click <a class='font-bold' href='/auth/verifyAccount?email=${email}'>here</a> to verify your account`,
          )
        }

        if (!user.password) {
          const newVerificationCode = await verificationCode()

          //  const token = jwt.sign(
          //    {
          //      email: user.email,
          //      password_verification: newVerificationCode,
          //    },
          //    process.env.AUTH_SECRET!,
          //    {
          //      expiresIn: "1h",
          //    },
          //  )

          await prisma.users.update({
            where: { email },
            data: {
              password_verification: newVerificationCode,
            },
          })
          throw new Error(
            `Invalid Credentials - Password not set up.  <br/> Please use the provider to login or create a password from <a class='font-bold' href='/auth/editPassword?newPassword=true'>here</a>`,
          )
        }

        // Compare the provided password with the hashed password from the database
        const valid = await bcrypt.compare(password, user.password)
        console.log("authorize -> valid", valid)
        if (!valid) {
          throw new Error("Invalid password")
        }
        // If the password is valid, return the user object
        console.log("authorize -> user", user)
        return user
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
  events: {
    signIn: async (params) => {
      // console.log("Event -> signIn", params)
      const { email, name } = params.user
      if (params.account && params.account.provider === "google" && email) {
        try {
          const user = await prisma.users.findFirst({
            where: {
              email,
            },
          })
          if (!user) {
            await AuthService.register_user({
              name: name || email,
              email: email,
              provider: "google",
            })
          }
        } catch (error) {
          console.error("Failed to verify user:", error)
        }
      }
      if (params.profile && params.isNewUser && email) {
        await AuthService.register_user({
          name: name || email,
          email: email,
          provider: "google",
        })
      }
    },
    signOut: async (message): Promise<void> => {
      console.log("signOut", message)
    },
    createUser: async (): Promise<void> => {
      // console.log("createUser", message)
    },
    updateUser: async (): Promise<void> => {
      // console.log("updateUser", message)
    },
    linkAccount: async (): Promise<void> => {
      // console.log("linkAccount", message)
    },
    session: async (message): Promise<void> => {
      console.log("Event -> session", message)
    },
  },
  callbacks: {
    redirect(params) {
      console.log("callbacks -> redirect -> params", params)
      return "/"
    },
    //  async jwt({ token, user, account }) {
    //    console.log("callbacks -> jwt -> token", token)
    //    console.log("callbacks -> jwt -> user", user)
    //    console.log("callbacks -> jwt -> account", account)
    //    if (account) {
    //      // First-time login, save the `access_token`, its expiry and the `refresh_token`
    //      return {
    //        ...token,
    //        access_token: account.access_token,
    //        expires_at: Math.floor(Date.now() / 1000) + account.expires_at!,
    //        refresh_token: account.refresh_token ?? token.refresh_token,
    //      }
    //    } else if (
    //      Math.floor(Date.now() / 1000) <
    //      (token.expires_at as number) * 1000
    //    ) {
    //      // Subsequent logins, but the `access_token` is still valid
    //      return token
    //    } else {
    //      // Subsequent logins, but the `access_token` has expired, try to refresh it
    //      if (!token.refresh_token) throw new TypeError("Missing refresh_token")
    //      try {
    //        // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
    //        // at their `/.well-known/openid-configuration` endpoint.
    //        // i.e. https://accounts.google.com/.well-known/openid-configuration
    //        const response = await fetch("https://oauth2.googleapis.com/token", {
    //          method: "POST",
    //          body: new URLSearchParams({
    //            client_id: useRuntimeConfig().public.GOOGLE_CLIENT_ID,
    //            client_secret: useRuntimeConfig().public.GOOGLE_CLIENT_SECRET,
    //            grant_type: "authorization_code",
    //          }),
    //        })

    //        const tokensOrError = await response.json()

    //        console.log("callbacks -> jwt -> tokensOrError", tokensOrError)
    //        if (!response.ok) throw tokensOrError
    //        const newTokens = tokensOrError as {
    //          access_token: string
    //          expires_in: number
    //          refresh_token?: string
    //        }

    //        token.access_token = newTokens.access_token
    //        token.expires_at = Math.floor(
    //          Date.now() / 1000 + newTokens.expires_in,
    //        )
    //        console.log("callbacks -> jwt -> Refreshed access_token", token)
    //        // Some providers only issue refresh tokens once, so preserve if we did not get a new one
    //        if (newTokens.refresh_token)
    //          token.refresh_token = newTokens.refresh_token
    //        return token
    //      } catch (error) {
    //        console.error(
    //          "callbacks -> jwt -> Error refreshing access_token",
    //          error,
    //        )
    //        // If we fail to refresh the token, return an error so we can handle it on the page
    //        token.error = "RefreshTokenError"
    //        return token
    //      }
    //    }
    //  },
    async jwt({ token, user, account }) {
      // Check if it's the first time logging in (account object exists only on first login)
      if (account) {
        if (account.provider === "google") {
          // Google OAuth login
          return {
            ...token,
            access_token: account.access_token,
            expires_at: Math.floor(Date.now() / 1000) + account.expires_at!,
            refresh_token: account.refresh_token ?? token.refresh_token,
            provider: "google",
          }
        }
        // Optionally handle other OAuth providers here...
      }

      // If the user is logging in via credentials (user exists on first credentials login)
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          provider: "credentials",
        }
      }

      // For subsequent logins, return the existing token (for both Google and Credentials)
      return token
    },

    async session({ session, token }) {
      // Token we injected into the JWT callback above.
      console.log("callbacks -> session -> token", token)
      const { sessionToken } = token
      // console.log("callbacks -> session -> token", token)
      // console.log("callbacks -> session -> token", token)
      // console.log("session", { session, token, sessionToken })
      // Fetch data OR add previous data from the JWT callback.
      // const additionalUserData = await $fetch(`/api/session/${sessionToken}`)
      // console.log("additionalUserData", additionalUserData)
      // Return the modified session
      // console.log("callbacks -> session -> session", session)
      return {
        ...session,
        id: token.id,
      }
    },

    async signIn(params) {
      // console.log("callback signIn -> params", params)
      return true
      // const profile = params.profile as GoogleProfile
      // const account = params.account as Account
      // const email = params.email as { verificationRequest: boolean }
      // console.log("callback signIn -> account", account)
      // console.log("callback signIn -> profile", profile)
      // if (account && account.provider === "google") {
      //   console.log(
      //     "callback signIn -> account -> email_verified",
      //     profile.email_verified,
      //   )
      //   //   return profile && profile.email_verified
      // }
      // return true // Do different verification for other providers that don't have `email_verified`
    },
  },
})
