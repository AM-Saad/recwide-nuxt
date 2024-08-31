import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#imports'

interface User {
  name?: string
  email: string
  password: string
  rememberMe?: boolean
}

interface State {
  msg: string | null
  user: User | null
  isAuth: boolean
  projects: Array<unknown>
  url: string
  networkconnections: boolean
}

export const useUserStore = defineStore('userStore', {
  state: (): State => ({
    msg: null,
    user: null,
    isAuth: false,
    projects: [],
    url: 'http://localhost:8000',
    networkconnections: false
  }),

  getters: {
    getToken(): string | null {
      return localStorage.getItem('ut')
    }
  },
  actions: {
    async signup(user: User) {
      if (!user || !user.email || !user.password || !user.name)
        return (this.msg = 'Please enter a valid name, email, and password')
      const router = useRouter()
      const config = useRuntimeConfig()
      try {
        const response = await fetch(`${config.public.serverURL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user)
        })
        const data = await response.json()
        if (response.status === 201) {
          return router.push('/login')
        }
        this.msg = data.msg
      } catch (err) {
        this.msg = err.message || 'Something went wrong'
        console.error(err)
      }
    },
    async login(user: User) {
      if (!user || !user.email || !user.password)
        return (this.msg = 'Please enter a valid email and password')
      const { $approuter } = useNuxtApp()

      const config = useRuntimeConfig()
      try {
        const response = await fetch(`${config.public.serverURL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user)
        })
        const data = await response.json()
        if (data.user) {
          this.user = data.user
          this.isAuth = true
          localStorage.setItem('ut', data.token)
          console.log($approuter)
          $approuter.push({ name: 'projects' })
        }
        this.msg = data.message
      } catch (err) {
        this.msg = err.message || 'Something went wrong'
        console.error(err)
      }
    },
    async getProjects() {
      const config = useRuntimeConfig()
      const token = localStorage.getItem('ut')
      try {
        const response = await fetch(
          `${config.public.serverURL}/user/projects`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        const data = await response.json()
        console.log(data)
        this.projects = data.projects
      } catch (err) {
        this.msg = err.message || 'Something went wrong'
        console.error(err)
      }
    },
    checkAuth() {
      const token = localStorage.getItem('ut')
      console.log(token)
      if (!token) return (this.isAuth = false)
      this.isAuth = true
    },
    setAuth(payload: boolean) {
      this.isAuth = payload
    },
    async checkConnection() {
      try {
        await fetch('http://info.cern.ch/')
        this.networkconnections = !this.networkconnections
      } catch (err) {
        console.error(err)
      }
    }
  }
})
