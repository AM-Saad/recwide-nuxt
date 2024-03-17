import { getServerSession } from '#auth'
import prisma from '~/prisma/utils'
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const session = await getServerSession(event)
  if (!session) {
    return {
      status: 401,
      body: {
        message: 'Unauthorized'
      }
    }
  }

  const project = await prisma.projects.findFirst({
    where: {
      slug: id
    }
  })
  return {
    status: 200,
    body: {
      message: 'Project index',
      project
    }
  }
})
