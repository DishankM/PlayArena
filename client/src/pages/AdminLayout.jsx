// client/src/pages/AdminLayout.jsx

import { Outlet, NavLink } from 'react-router-dom'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/events', label: 'Events' },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-arena-surface">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-12 md:px-16">
        <aside className="hidden w-48 shrink-0 md:block">
          <p className="section-label">Admin</p>
          <nav className="mt-2 flex flex-col gap-1">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-arena-navy text-arena-gold'
                      : 'text-gray-600 hover:bg-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
