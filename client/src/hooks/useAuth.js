import { useSelector, useDispatch } from 'react-redux'
import { setCredentials, logout } from '../store/slices/authSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)

  const login = (user, token) => {
    dispatch(setCredentials({ user, token }))
  }

  const signOut = () => {
    dispatch(logout())
  }

  const isAdmin = auth.user?.role === 'admin'

  return {
    ...auth,
    login,
    signOut,
    isAdmin,
  }
}
