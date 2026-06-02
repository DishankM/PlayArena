// client/src/services/api.js
import axios from 'axios'
import { store } from '../store'
import { setCredentials, logout } from '../store/slices/authSlice'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const clearAuthData = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
  store.dispatch(logout())
}

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
    async (error) => {
      const originalRequest = error.config
      const status = error.response?.status
      const requestUrl = originalRequest?.url || ''
      const isRefreshEndpoint = requestUrl.includes('/refresh-token')
      const isLoginEndpoint = requestUrl.includes('/login')
      const isRegisterEndpoint = requestUrl.includes('/register')
      const canRefresh = !isRefreshEndpoint && !isLoginEndpoint && !isRegisterEndpoint
      const isNetworkError = !error.response && error.request

      if (isNetworkError) {
        error.isNetworkError = true
        error.message = 'Network error. Please check your connection and try again.'
        window.dispatchEvent(new CustomEvent('api-network-error'))
        return Promise.reject(error)
      }

      if (status === 401 && canRefresh && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          const { data } = await axios.post(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true })
          const newToken = data.data.accessToken
          if (newToken) {
            localStorage.setItem('accessToken', newToken)
            store.dispatch(setCredentials({ token: newToken }))
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return instance(originalRequest)
          }
        } catch (refreshError) {
          clearAuthData()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }

      if (status === 401 && canRefresh) {
        clearAuthData()
        window.location.href = '/login'
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
      withCredentials: true,
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
