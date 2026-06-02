// client/src/App.jsx

import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { ProtectedRoute } from './components/common/ProtectedRoute'

import Home from './pages/Home'
import About from './pages/About'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFailed'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import EventRegister from './pages/EventRegister'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTournaments from './pages/admin/AdminTournaments'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminWallet from './pages/admin/AdminWallet'
import AdminQRScanner from './pages/admin/AdminQRScanner'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import NetworkError from './pages/NetworkError'
import NotFound from './pages/NotFound'

export default function App() {
  const [networkError, setNetworkError] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )

  useEffect(() => {
    const showNetworkError = () => setNetworkError(true)
    const clearNetworkError = () => setNetworkError(false)

    window.addEventListener('offline', showNetworkError)
    window.addEventListener('api-network-error', showNetworkError)
    window.addEventListener('online', clearNetworkError)

    return () => {
      window.removeEventListener('offline', showNetworkError)
      window.removeEventListener('api-network-error', showNetworkError)
      window.removeEventListener('online', clearNetworkError)
    }
  }, [])

  return (
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ErrorBoundary>
          {networkError ? (
            <NetworkError />
          ) : (
            <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route
            path="/events/:id/register"
            element={
              <ProtectedRoute>
                <EventRegister />
              </ProtectedRoute>
            }
          />
          <Route path="/store" element={<Products />} />
          <Route path="/store/:slug" element={<ProductDetail />} />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/failed"
            element={
              <ProtectedRoute>
                <PaymentFailed />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/orders" element={<Navigate to="/dashboard?tab=orders" replace />} />
          <Route path="/wallet" element={<Navigate to="/dashboard?tab=wallet" replace />} />
          <Route path="/settings" element={<Navigate to="/dashboard?tab=profile" replace />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="tournaments" element={<AdminTournaments />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="wallet" element={<AdminWallet />} />
            <Route path="qr-scanner" element={<AdminQRScanner />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
          <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  )
}
