export interface Media {
  name: string
  url: string
  id: string
  extension: string
}

export interface Project {
  audioSettings: string
  date: string
  mode: string
  name: string
  slug: string
  user: string
  id: string
  media: Media[]
}
