// server/api/auth/register.post.ts
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { sendEmail } from "~/utils/sendGrid.server"
import { verificationCode } from "~/utils/verificationCode.server"
const prisma = new PrismaClient()

const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password Must be 8 or more characters long" })
    .max(30, { message: "Password Must be 30 or less characters long" }),
  confirmPassword: z
    .string()
    .min(8, { message: "Password Must be 8 or more characters long" })
    .max(30, {
      message: "Confirm Password Must be 30 or less characters long",
    }),
  provider: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    userSchema.safeParse(body),
  ) // or `.parse` to directly throw an error
  if (!result.success) {
    event.respondWith(
      new Response(
        JSON.stringify({ message: result.error.issues[0].message }),
        {
          status: 422,
        },
      ),
    )
  }
  try {
    // Extract user data from request body
    const body = await readBody(event)

    const { name, email, password, confirmPassword, provider } = body

    const existingUser = await prisma.users.findFirst({
      where: {
        email,
      },
    })

    if (existingUser) {
      const existingUserProvider = existingUser.auth_provider
      if (
        (existingUserProvider === "credentials" && existingUser.password) ||
        (existingUserProvider === "google" && existingUser.email_verified)
      ) {
        throw createError({
          status: 400,
          statusMessage: "User already exists",
          message: `User already exists, if you forgot your password, you can reset it by clicking <a class='text-blue-500 underline font-semibold' href='/auth/editPassword'>here</a>`,
        })
      }

      if (
        existingUserProvider != "credentials" &&
        !existingUser.email_verified
      ) {
        setResponseStatus(event, 400)
        return {
          message: `User was already registered with another provider ( e.g. Google )
          <br /> please use the same provider or you can verify your email address by clicking <a class='text-blue-500 underline font-semibold' href='/auth/verifyAccount?email=${email}'>here</a>`,
        }
      }
    }

    if (provider === "credentials" && password !== confirmPassword) {
      throw createError({
        status: 400,
        statusMessage: "Passwords do not match",
        message: "Passwords do not match",
      })
    }

    const hashedPassword =
      provider === "credentials" ? bcrypt.hashSync(password, 10) : null

    let newVerificationCode: null | string = null

    if (provider === "credentials") {
      newVerificationCode = await verificationCode()
      await sendEmail(email, newVerificationCode)
    }

    // Create a new user in the database
    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        projects: [],
        passkey_user_id: null,
        auth_provider: provider,
        register_verification: newVerificationCode,
        account_verified: provider === "credentials" ? false : true,
      },
    })

    return {
      message: `Account created successfully, and verification code has been sent to your email ${newVerificationCode}. You will be redirected to verify your account in: `,
      body: {
        redirect: `/auth/verifyAccount?email=${email}&&code=sent`,
      },
    }
  } catch (error) {
    return error
  }
})
