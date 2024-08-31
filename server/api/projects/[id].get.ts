import { getServerSession } from '#auth'
import prisma from '~/prisma/utils'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const session = await getServerSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const project = await prisma.projects.findFirst({
    where: {
      slug: id
    }
  })
  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Project not found'
    })
  }

  return project
})
