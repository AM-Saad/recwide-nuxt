import { getServerSession } from '#auth'
import prisma from '~/prisma/utils'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const projects = await prisma.projects.findMany({
    where: {
      user: session.uid
    }
  })
  return projects
})
