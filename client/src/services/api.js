import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

const attachInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }
  )

  return instance
}

const createAPI = (path) =>
  attachInterceptors(
    axios.create({
      baseURL: `${baseURL}${path}`,
      headers: { 'Content-Type': 'application/json' },
    })
  )

const api = createAPI('')
export const authAPI = createAPI('/auth')
export const productAPI = createAPI('/products')
export const orderAPI = createAPI('/orders')
export const tournamentAPI = createAPI('/tournaments')
export const walletAPI = createAPI('/wallet')

export default api
