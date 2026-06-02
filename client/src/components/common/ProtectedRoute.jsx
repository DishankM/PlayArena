
import { useLocation, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation()
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-arena-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-arena-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  if (user && !user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-arena-surface p-6">
        <div className="card p-8 max-w-md text-center">
          <i className="ti ti-ban text-5xl text-red-400 mb-4 block" aria-hidden="true"></i>
          <h2 className="text-h2 mb-2">Account Suspended</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your account has been suspended. Please contact support for assistance.
          </p>
          <a href="mailto:support@playarena.com" className="btn-primary inline-block">
            Contact Support
          </a>
        </div>
      </div>
    )
  }

  return children
}
