import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { store } from './store'
import { setCredentials, setLoading, logout } from './store/slices/authSlice'
import { authAPI } from './services/api'

const restoreSession = async () => {
  store.dispatch(setLoading(true))
  const token = localStorage.getItem('accessToken')

  if (!token) {
    store.dispatch(setLoading(false))
    return
  }

  store.dispatch(setCredentials({ token }))

  try {
    const meRes = await authAPI.get('/me')
    store.dispatch(setCredentials({ user: meRes.data.data.user, token }))
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        const refreshRes = await authAPI.post('/refresh-token')
        const newToken = refreshRes.data.data.accessToken
        if (newToken) {
          localStorage.setItem('accessToken', newToken)
          store.dispatch(setCredentials({ token: newToken }))
          const meRes = await authAPI.get('/me')
          store.dispatch(setCredentials({ user: meRes.data.data.user, token: newToken }))
        } else {
          throw new Error('Refresh failed')
        }
      } catch {
        localStorage.removeItem('accessToken')
        store.dispatch(logout())
      }
    }
  } finally {
    store.dispatch(setLoading(false))
  }
}

restoreSession()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
