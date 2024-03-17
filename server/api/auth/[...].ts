/* eslint-disable no-console */
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import type { Session } from 'next-auth'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Prisma from '../../../prisma/utils'
import { NuxtAuthHandler } from '#auth'

export default NuxtAuthHandler({
  // TODO: SET A STRONG SECRET, SEE https://sidebase.io/nuxt-auth/configuration/nuxt-auth-handler#secret
  secret: process.env.AUTH_SECRET,
  // TODO: ADD YOUR OWN AUTHENTICATION PROVIDER HERE, READ THE DOCS FOR MORE: https://sidebase.io/nuxt-auth
  providers: [

    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    GithubProvider.default({
      clientId: process.env.GITHUB_CLIENT_ID || 'enter-your-client-id-here',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'enter-your-client-secret-here' // TODO: Replace this with an env var like "process.env.GITHUB_CLIENT_SECRET". The secret should never end up in your github repository
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: '(hint: jsmith)' },
        password: { label: 'Password', type: 'password', placeholder: '(hint: hunter2)' }
      },
      authorize: async (credentials: { username: string, password: string }) => {
        try {
          const user = await Prisma.users.findFirst({ where: { email: credentials.username } })
          if (!user) {
            return Promise.reject(new Error('No User found'))
          }

          const isMatched = await bcrypt.compare(credentials.password, user.password);
          console.log(isMatched)
          if (!isMatched) {
            return Promise.reject(new Error('Invalid credentials'))
          }
          const token = jwt.sign(
            {
              name: user.name,
              id: user.id,
              role: 'admin'
            },
            'SomeSuperAsecretBymy',
            { expiresIn: '7d' }
          )
          const mappedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            access_token: token,
            role: 'admin'
          }
          console.log('CredentialsProvider mappedUser:', mappedUser)
          return Promise.resolve(mappedUser)
        } catch (error) {
          console.error('CredentialsProvider error:', error)
          return Promise.resolve(null)
        }
      }
    })
  ],
  callbacks: {
    // Callback when the JWT is created / updated, see https://next-auth.js.org/configuration/callbacks#jwt-callback
    jwt: ({ token, user }: any) => {
      if (user) {
        token.jwt = user ? (user as any).access_token || '' : ''
        token.id = user ? user.id || '' : ''
        token.role = user ? (user as any).role || '' : ''
      }
      return Promise.resolve(token)
    },
    // Callback whenever session is checked, see https://next-auth.js.org/configuration/callbacks#session-callback
    session: ({ session, token }: any) => {
      (session as Session).uid = token.id
      return Promise.resolve(session)
    }
  },
  pages: {
    signIn: '/auth/signin' // Custom Sign-in Page
  }
})
