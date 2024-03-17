import { getServerSession } from '#auth'
import prisma from '~/prisma/utils'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    return {
      status: 401,
      body: {
        message: 'Unauthorized',
        projects: []
      }
    }
  }

  const projects = await prisma.projects.findMany({
    where: {
      user: session.uid
    }
  })
  return {
    status: 200,
    body: {
      message: 'Project index',
      projects
    }
  }
})
