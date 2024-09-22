import { getServerSession } from "#auth"
import prisma from "~/prisma/utils"

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    })
  }

  const user = await prisma.users.findUnique({
    where: {
      email: session.user!.email!,
    },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    })
  }

  const projects = await prisma.projects.findMany({
    where: {
      user: user.id,
    },
  })
  return projects
})
