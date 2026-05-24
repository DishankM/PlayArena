// client/src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { ProtectedRoute } from './components/common/ProtectedRoute'

import Home from './pages/Home'
import About from './pages/About'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import EventRegister from './pages/EventRegister'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminLayout from './pages/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
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
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
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
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminOverview />} />
            <Route path="events" element={<AdminOverview />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}
