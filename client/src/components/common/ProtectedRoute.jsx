
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * @param {{ children: import('react').ReactNode, adminOnly?: boolean }} props
 */
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
