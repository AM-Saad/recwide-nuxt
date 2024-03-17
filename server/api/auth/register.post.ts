import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const prisma = new PrismaClient()

const userSchema = z.object({
  username: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(10).max(100)
})

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, body => userSchema.safeParse(body)) // or `.parse` to directly throw an error
  if (!result.success) {
    // throw result.error.issues
    event.respondWith(new Response(JSON.stringify(result.error.issues), { status: 400 }))
    // return {
    //   status: 400,
    //   body: result.error.issues
    // }
  }
  try {
    // Extract user data from request body
    const body = await readBody(event)

    const { username, email, password } = body
    // Here, you should hash the password before saving it to the database

    const hashedPassword = bcrypt.hashSync(password, 10)
    // Create a new user in the database
    const newUser = await prisma.users.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
        projects: []
      }
    })

    // Return success response
    return {
      status: 200,
      body: {
        message: 'Registration successful',
        user: newUser
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    // Handle registration error, such as returning an error response
    throw new Error('Registration failed')
  }
})
