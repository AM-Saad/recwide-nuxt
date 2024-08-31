// import { z } from 'zod'
import { getServerSession } from '#auth'
import prisma from '~/prisma/utils'

// const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:8000'

// const projectBody = z.object({
//   name: z.string().min(3).max(100),
//   media: z.string().min(3).max(100),
//   mode: z.string().min(3).max(100),
//   audioSettings: z.string().min(3).max(100),
//   resolution: z.string().min(3).max(100),
//   videotype: z.string().min(3).max(100),
//   date: z.string().min(3).max(100),
// })

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

  try {
    const body = await readBody(event)
    const { name, videos, mode, audioSettings, videotype, date } = body
    const projectvideos = videos.map((i: unknown) => ({
      name: i,
      url: `/videos/${i}`,
      extension: videotype
    }))

    const slug = name
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w-]/g, '') // Remove non-alphanumeric, non-hyphen, and non-underscore characters
      .toLowerCase() // Convert to lowercase
    await prisma.projects.create({
      data: {
        name: name,
        slug: slug,
        mode: mode,
        audioSettings: audioSettings,
        media: projectvideos,
        date: date,
        user: session.uid as string // Type assertion to treat session.uid as a string
      }
    })

    const response = await $fetch(`/api/sendNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Project created',
        message: `Your project ${name} has been created successfully`
      })
    })
    console.log(response)

    return {
      status: 200,
      body: {
        message: 'Project index'
      }
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      body: {
        message: 'Internal server error'
      }
    }
  }
})
