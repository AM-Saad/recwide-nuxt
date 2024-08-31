import { prisma } from '@/prisma/utils'

export default defineEventHandler(async (event) => {
  try {
    const subscription = await readBody(event)

    await prisma.subscription.deleteMany({})
    // Store the subscription in MongoDB using Prisma
    const savedSubscription = await prisma.subscription.create({
      data: {
        endpoint: subscription.endpoint,
        keys: subscription.keys
      }
    })

    return {
      success: true,
      message: 'Subscription saved',
      data: savedSubscription
    }
  } catch (error) {
    console.error('Failed to save subscription:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
