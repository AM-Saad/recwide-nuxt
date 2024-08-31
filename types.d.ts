declare module "next-auth" {
  interface Session {
    uid?: string // Assuming uid is a string and optional
    challenge?: string
    email?: string
  }
}

declare module "web-push"

declare module "socket.io-client"
declare module "bcryptjs"
interface Window {
  camstream: MediaStream
  boradcast: MediaStream
  mediaCamRecorder: MediaRecorder
  screenStream: MediaStream
  audioCtx: AudioContext
}

// extend tha blob interface to add chunks and name properties
declare interface Blob {
  chunks: unknown[]
  name: string
}
