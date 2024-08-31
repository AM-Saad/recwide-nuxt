import { PrismaClient } from "@prisma/client"
import { generateAuthenticationOptions } from "@simplewebauthn/server"
import type {
  AuthenticatorTransportFuture,
  Base64URLString,
} from "@simplewebauthn/types"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)
  const session = event.context.session
  if (!email) {
    event.res.statusCode = 400
    return "email is required"
  }

  const user = await prisma.users.findUnique({
    where: { email },
  })

  if (!user) {
    event.res.statusCode = 404
    return "User not found"
  }

  const userPasskeys = await prisma.publickeycreds.findMany({
    where: { passkey_user_id: user.id },
  })

  const options = await generateAuthenticationOptions({
    rpID: "localhost",
    allowCredentials: userPasskeys.map((passkey) => ({
      id: passkey.id as Base64URLString,
      transports: [] as AuthenticatorTransportFuture[],
    })),
  })

  if (session) {
    session.challenge = options.challenge
    session.email = email
  }

  return {
    status: 200,
    body: options,
  }
})
