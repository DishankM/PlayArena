// client/src/services/api.js
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const attachInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken')
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
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }

      const responseData = error.response?.data
      if (responseData?.errors?.length) {
        error.message = responseData.errors.join(' | ')
      } else {
        error.message = responseData?.message || error.message
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
export const adminAPI = createAPI('/admin')
export const paymentAPI = createAPI('/payment')

export default api
