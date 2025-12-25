import axios from 'axios'
import { getToken, clearToken, clearUser } from './auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearToken();
      clearUser();
      // Optionally redirect on 401 in views after catching
    }
    return Promise.reject(error)
  }
)

export default api
