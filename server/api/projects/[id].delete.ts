import { getServerSession } from "#auth"
import prisma from "~/prisma/utils"

const config = useRuntimeConfig()
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  try {
    const session = await getServerSession(event)
    if (!session?.user) {
      return {
        status: 401,
        body: { message: "Unauthorized" },
      }
    }

    const user = await prisma.users.findUnique({
      where: {
        email: session.user.email!,
      },
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      })
    }

    const project = await prisma.projects.findFirst({
      where: {
        id: id,
        user: user?.id,
      },
    })
    if (!project) {
      return createError({
        statusCode: 404,
        statusMessage: "Project not found",
      })
    }

    const unlinkMedia = await $fetch(
      `${config.public.SERVER_URL}/user/projects/unlink`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ media: project.media }),
      },
    )

    console.log(unlinkMedia)

    await prisma.projects.delete({
      where: {
        id: id,
      },
    })

    return {
      status: 200,
      body: {
        message: "Project Deleted",
        project,
      },
    }
  } catch (e) {
    console.log(e)
    return createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    })
  }
})
