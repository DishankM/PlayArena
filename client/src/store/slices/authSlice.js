// client/src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit'

const token = localStorage.getItem('accessToken') || null
const userStr = localStorage.getItem('user')
const user = userStr ? JSON.parse(userStr) : null

const initialState = {
  user,
  token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = !!token
      state.error = null
      if (token) localStorage.setItem('accessToken', token)
      if (user) localStorage.setItem('user', JSON.stringify(user))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setCredentials, logout, setLoading, setError } = authSlice.actions
export default authSlice.reducer
