import axios from 'axios'
import { clearSession, getAccessToken } from './auth'

function resolveApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (!configured || configured === 'http://localhost:8000/api/v1' || configured === 'http://127.0.0.1:8000/api/v1') {
    return '/api/v1'
  }

  if (typeof window !== 'undefined') {
    try {
      const url = new URL(configured, window.location.origin)
      if (['localhost', '127.0.0.1'].includes(url.hostname) && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        return '/api/v1'
      }
      return url.toString()
    } catch {
      return configured.startsWith('/') ? configured : '/api/v1'
    }
  }

  return configured
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearSession()
    }
    return Promise.reject(error)
  },
)
