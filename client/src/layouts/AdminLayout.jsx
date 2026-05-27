// client/src/layouts/AdminLayout.jsx

import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { adminAPI } from '../services/api'
import { logout } from '../store/slices/authSlice'
import { getInitials } from '../utils/helpers'
import logo from '../assets/logo.png'

const navSections = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: 'ti-layout-dashboard', end: true }],
  },
  {
    label: 'Store Management',
    items: [
      { to: '/admin/products', label: 'Products', icon: 'ti-shirt' },
      { to: '/admin/orders', label: 'Orders', icon: 'ti-shopping-bag' },
      { to: '/admin/coupons', label: 'Coupons', icon: 'ti-tag' },
    ],
  },
  {
    label: 'Events',
    items: [
      { to: '/admin/tournaments', label: 'Tournaments', icon: 'ti-trophy' },
      { to: '/admin/qr-scanner', label: 'QR Scanner', icon: 'ti-qrcode' },
    ],
  },
  {
    label: 'Users & Finance',
    items: [
      { to: '/admin/users', label: 'Users', icon: 'ti-users' },
      { to: '/admin/wallet', label: 'NXL & Wallet', icon: 'ti-coin' },
    ],
  },
  {
    label: 'Reports',
    items: [{ to: '/admin/analytics', label: 'Analytics', icon: 'ti-chart-bar' }],
  },
]

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/orders': 'Orders',
  '/admin/coupons': 'Coupons',
  '/admin/tournaments': 'Tournaments',
  '/admin/qr-scanner': 'QR Scanner',
  '/admin/users': 'Users',
  '/admin/wallet': 'NXL & Wallet',
  '/admin/analytics': 'Analytics',
}

const SidebarContent = ({ onNavigate, onSignOut }) => (
  <>
    <div className="border-b border-white/10 px-5 py-6">
      <Link to="/admin" className="flex items-center gap-0.5 text-xl font-bold tracking-tight text-white" onClick={onNavigate}>
        <img src={logo} alt="PlayArena Logo" className="h-12 w-auto" />
      </Link>
      <p className="mt-1 text-xs text-gray-400">Admin Console</p>
    </div>
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {navSections.map((section) => (
        <div key={section.label} className="mb-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            {section.label}
          </p>
          {section.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/20 to-violet-500/20 text-sky-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <i className={`ti ${item.icon} text-base`} />
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
    
    <div className="border-t border-white/10 px-3 py-4">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-all hover:bg-white/5 hover:text-white"
      >
        <i className="ti ti-external-link" />
        View Store
      </a>
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400"
        onClick={() => {
          onNavigate?.()
          onSignOut?.()
        }}
      >
        <i className="ti ti-logout" />
        Sign Out
      </button>
    </div>
  </>
)

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [pendingOrders, setPendingOrders] = useState(0)

  const pageTitle = pageTitles[location.pathname] || 'Admin'

  useEffect(() => {
    adminAPI
      .get('/dashboard')
      .then((res) => setPendingOrders(res.data.data?.stats?.pendingOrders ?? 0))
      .catch(() => {})
  }, [location.pathname])

  const handleSignOut = () => {
    dispatch(logout())
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-screen bg-[#0B1020]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-[#0B1020] lg:flex">
        <SidebarContent onSignOut={handleSignOut} />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex h-full w-64 flex-col border-r border-white/10 bg-[#0B1020] shadow-2xl">
            <SidebarContent
              onNavigate={() => setSidebarOpen(false)}
              onSignOut={handleSignOut}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0B1020]/95 px-4 py-3 backdrop-blur-lg md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="ti ti-menu-2 text-xl" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{pageTitle}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Manage your PlayArena platform
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Link
              to="/admin/orders"
              className="relative rounded-xl p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              aria-label="Notifications"
            >
              <i className="ti ti-bell text-xl" />
              {pendingOrders > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-1 text-[9px] font-bold text-white">
                  {pendingOrders > 9 ? '9+' : pendingOrders}
                </span>
              )}
            </Link>
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-violet-500 text-sm font-bold text-white shadow-lg">
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <div className="flex items-center gap-1">
                  <i className="ti ti-shield-locked text-xs text-sky-400" />
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              type="button"
              className="hidden rounded-xl px-3 py-2 text-sm text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400 sm:block"
              onClick={handleSignOut}
            >
              <i className="ti ti-logout mr-1" />
              Logout
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}