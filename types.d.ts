declare module 'next-auth' {
  interface Session {
    uid?: string; // Assuming uid is a string and optional
  }
}

declare module 'socket.io-client';
declare module 'bcryptjs';
interface Window {
  camstream: MediaStream;
  boradcast: MediaStream;
}

// extend tha blob interface to add chunks and name properties
declare interface Blob {
  chunks: any[];
  name: string;
}