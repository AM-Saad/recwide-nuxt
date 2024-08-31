interface Media {
  name: string
  url: string
  _id: string
  extension: string
}

interface Project {
  audioSettings: string
  date: string
  mode: string
  name: string
  slug: string
  user: string
  _id: string
  media: Media[]
}

export default Project
