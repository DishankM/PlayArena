// client/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { store } from './store'
import { setCredentials } from './store/slices/authSlice'
import { authAPI } from './services/api'

const token = localStorage.getItem('accessToken')
if (token) {
  store.dispatch(setCredentials({ token }))
  authAPI
    .get('/me')
    .then((res) => store.dispatch(setCredentials({ user: res.data.data.user, token })))
    .catch(() => localStorage.removeItem('accessToken'))
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
