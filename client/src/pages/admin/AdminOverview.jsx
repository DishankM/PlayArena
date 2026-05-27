// client/src/pages/admin/AdminOverview.jsx

import { Link } from 'react-router-dom'

const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

const quickActions = [
  { to: '/admin/products', label: 'Add Product', icon: 'ti-package', color: 'from-sky-500 to-sky-600' },
  { to: '/admin/tournaments', label: 'Create Tournament', icon: 'ti-trophy', color: 'from-violet-500 to-violet-600' },
  { to: '/admin/coupons', label: 'Create Coupon', icon: 'ti-tag', color: 'from-emerald-500 to-emerald-600' },
  { to: '/admin/qr-scanner', label: 'QR Scanner', icon: 'ti-qrcode', color: 'from-amber-500 to-amber-600' },
]

const recentActivity = [
  { action: 'New user registered', user: 'Rajesh Kumar', time: '2 mins ago', icon: 'ti-user-plus', color: 'text-emerald-400' },
  { action: 'Order #ORD-12345 placed', user: 'Priya Singh', time: '15 mins ago', icon: 'ti-shopping-cart', color: 'text-sky-400' },
  { action: 'Tournament registration', user: 'Amit Sharma', time: '1 hour ago', icon: 'ti-trophy', color: 'text-violet-400' },
  { action: 'NXL credits redeemed', user: 'Neha Patel', time: '3 hours ago', icon: 'ti-coin', color: 'text-amber-400' },
]

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
          <i className="ti ti-dashboard text-sky-400 text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Admin Overview</h2>
          <p className="text-sm text-gray-400">Quick access to admin tools</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={`${glassCard} group flex flex-col items-center p-6 text-center transition-all hover:scale-105`}
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${action.color} shadow-lg transition-all group-hover:scale-110`}>
              <i className={`${action.icon} text-2xl text-white`} />
            </div>
            <p className="mt-3 font-semibold text-white">{action.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className={`${glassCard} overflow-hidden`}>
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="divide-y divide-white/10">
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-center gap-3 p-4 transition-all hover:bg-white/5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5`}>
                <i className={`${activity.icon} text-xl ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{activity.action}</p>
                <p className="text-xs text-gray-400">{activity.user}</p>
              </div>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help & Support */}
      <div className={`${glassCard} overflow-hidden`}>
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="font-semibold text-white">Need Help?</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-400">
            For support or feature requests, contact the development team at{' '}
            <a href="mailto:support@playarena.in" className="text-sky-400 hover:underline">
              support@playarena.in
            </a>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/docs/admin"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-white/10"
            >
              <i className="ti ti-file-text" />
              Documentation
            </a>
            <a
              href="/support"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-white/10"
            >
              <i className="ti ti-headset" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}