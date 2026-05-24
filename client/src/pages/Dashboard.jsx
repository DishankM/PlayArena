import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'
import { logout } from '../store/slices/authSlice'
import {
  mockOrders,
  mockWalletTransactions,
  mockRegistrations,
  mockUser,
} from '../data/mockData'
import {
  formatPrice,
  formatDate,
  getInitials,
  getNxlTier,
} from '../utils/helpers'

const navItems = [
  { id: 'overview', label: 'Overview', icon: 'ti-layout-dashboard' },
  { id: 'orders', label: 'My Orders', icon: 'ti-shopping-bag' },
  { id: 'wallet', label: 'Wallet & NXL', icon: 'ti-coin' },
  { id: 'registrations', label: 'My Registrations', icon: 'ti-calendar-event' },
  { id: 'wishlist', label: 'Wishlist', icon: 'ti-heart' },
  { id: 'profile', label: 'Profile', icon: 'ti-user' },
]

const statusBadge = {
  delivered: 'bg-emerald-500/20 text-emerald-400',
  shipped: 'bg-sky-500/20 text-sky-400',
  processing: 'bg-amber-500/20 text-amber-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user) || mockUser
  const wallet = useSelector((state) => state.wallet)

  const [activeTab, setActiveTab] = useState('overview')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrModalToken, setQrModalToken] = useState('')
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    ...user.address,
  })

  const walletBalance = wallet.balance || mockUser.walletBalance
  const nxlCredits = wallet.nxlCredits || mockUser.nxlCredits
  const tier = getNxlTier(nxlCredits)

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleOpenQr = (token) => {
    setQrModalToken(token)
    setQrModalOpen(true)
  }

  const Sidebar = () => (
    <aside className={`${glassCard} w-full shrink-0 p-5 lg:w-[260px]`}>
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-violet-500 text-sm font-bold text-white shadow-lg">
          {getInitials(user.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs text-gray-400">{user.email}</p>
        </div>
      </div>
      <nav className="mt-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-all ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-sky-500/20 to-violet-500/20 text-sky-400'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <i className={`ti ${item.icon} text-base`} />
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
        >
          <i className="ti ti-logout text-base" />
          Sign Out
        </button>
      </nav>
    </aside>
  )

  const OverviewTab = () => (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Welcome back, {user.name.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-gray-400">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Wallet Balance',
            value: formatPrice(walletBalance),
            icon: 'ti-wallet',
            iconBg: 'from-emerald-500/20 to-emerald-600/20 text-emerald-400',
          },
          {
            label: 'NXL Credits',
            value: `${nxlCredits.toLocaleString('en-IN')} credits`,
            icon: 'ti-coin',
            iconBg: 'from-amber-500/20 to-amber-600/20 text-amber-400',
          },
          {
            label: 'Total Orders',
            value: String(mockOrders.length),
            icon: 'ti-shopping-bag',
            iconBg: 'from-sky-500/20 to-sky-600/20 text-sky-400',
          },
          {
            label: 'Tournaments',
            value: String(mockRegistrations.length),
            icon: 'ti-trophy',
            iconBg: 'from-violet-500/20 to-violet-600/20 text-violet-400',
          },
        ].map((stat) => (
          <div key={stat.label} className={`${glassCard} p-4`}>
            <div className={`inline-flex rounded-xl bg-gradient-to-br p-2 ${stat.iconBg}`}>
              <i className={`ti ${stat.icon} text-lg`} />
            </div>
            <p className="mt-3 text-xs text-gray-400">{stat.label}</p>
            <p className="text-lg font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
          <div className="mt-3 space-y-3">
            {mockOrders.slice(0, 2).map((order) => (
              <div key={order._id} className={`${glassCard} p-4`}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-sky-400">#{order._id.toUpperCase()}</span>
                  <span className="text-gray-400">{formatDate(order.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-300">
                  {order.items.map((i) => i.name).join(', ')}
                </p>
                <p className="mt-2 font-bold text-sky-400">{formatPrice(order.total)}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white">Recent NXL Activity</h3>
          <div className="mt-3 space-y-3">
            {mockWalletTransactions.slice(0, 3).map((tx) => (
              <div key={tx._id} className={`${glassCard} flex justify-between p-4 text-sm`}>
                <div>
                  <p className="font-medium text-white">{tx.description}</p>
                  <p className="text-gray-400">{formatDate(tx.createdAt)}</p>
                </div>
                <span
                  className={`font-bold ${
                    tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {tx.type === 'credit' ? '+' : '-'}{tx.nxlAmount} NXL
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )

  const OrdersTab = () => (
    <>
      <h2 className="text-2xl font-bold text-white">My Orders</h2>
      <div className="mt-6 space-y-4">
        {mockOrders.map((order) => (
          <article key={order._id} className={`${glassCard} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-sky-400">#{order._id.toUpperCase()}</p>
                <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-300">
                  {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sky-400">{formatPrice(order.total)}</p>
                <div className="mt-1 flex gap-1">
                  <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs capitalize text-gray-300">
                    {order.paymentStatus}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusBadge[order.orderStatus] || 'bg-gray-700 text-gray-300'}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              className="mt-4 text-sm text-sky-400 hover:underline"
            >
              View Details
            </button>
            {expandedOrder === order._id && (
              <ul className="mt-4 border-t border-white/10 pt-4 text-sm text-gray-300">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between py-1">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
                {order.nxlEarned > 0 && (
                  <li className="mt-2 flex items-center gap-1.5 text-amber-400">
                    <i className="ti ti-coin" />
                    Earned {order.nxlEarned} NXL on this order
                  </li>
                )}
              </ul>
            )}
          </article>
        ))}
      </div>
    </>
  )

  const WalletTab = () => (
    <>
      <h2 className="text-2xl font-bold text-white">Wallet &amp; NXL</h2>
      
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Wallet Balance Card */}
        <div className={`${glassCard} p-6`}>
          <i className="ti ti-wallet text-2xl text-emerald-400" />
          <p className="mt-2 text-sm text-gray-400">Wallet balance</p>
          <p className="text-3xl font-bold text-white">{formatPrice(walletBalance)}</p>
          <button className="mt-4 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:scale-105">
            Add Money
          </button>
        </div>
        
        {/* NXL Credits Card */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">NXL Credits</p>
          <p className="mt-2 text-3xl font-bold text-white">{nxlCredits.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-300">= {formatPrice(nxlCredits)} redeemable value</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${tier.progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-gray-300">{tier.label} tier</p>
          <button className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-400 transition-all hover:bg-amber-500/20">
            Redeem at checkout
          </button>
        </div>
      </div>

      {/* How to Earn */}
      <div className={`${glassCard} mt-6 p-6`}>
        <h3 className="text-lg font-semibold text-white">How to earn NXL Credits</h3>
        <ul className="mt-4 space-y-2 text-sm text-gray-300">
          <li className="flex items-center gap-2"><i className="ti ti-shopping-bag text-amber-400" /> ₹1,000 purchase → 50 NXL</li>
          <li className="flex items-center gap-2"><i className="ti ti-shopping-cart text-amber-400" /> ₹2,000 purchase → 100 NXL</li>
          <li className="flex items-center gap-2"><i className="ti ti-trophy text-amber-400" /> Tournament registration → 50–250 NXL</li>
          <li className="flex items-center gap-2"><i className="ti ti-gift text-amber-400" /> First purchase bonus → 100 NXL</li>
        </ul>
      </div>

      {/* Transaction History */}
      <div className={`${glassCard} mt-6 overflow-x-auto p-0`}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="p-4 font-semibold text-white">Date</th>
              <th className="p-4 font-semibold text-white">Description</th>
              <th className="p-4 font-semibold text-white">NXL Credits</th>
              <th className="p-4 font-semibold text-white">Balance</th>
            </tr>
          </thead>
          <tbody>
            {mockWalletTransactions.map((tx) => (
              <tr key={tx._id} className="border-b border-white/10">
                <td className="p-4 text-gray-400">{formatDate(tx.createdAt)}</td>
                <td className="p-4 text-gray-300">{tx.description}</td>
                <td className={`p-4 font-semibold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.nxlAmount}
                </td>
                <td className="p-4 text-gray-300">{tx.nxlAfter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )

  const RegistrationsTab = () => (
    <>
      <h2 className="text-2xl font-bold text-white">My Tournament Registrations</h2>
      <div className="mt-6 space-y-4">
        {mockRegistrations.map((reg) => (
          <article key={reg._id} className={`${glassCard} flex gap-4 p-4`}>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-violet-500/20">
              <i className="ti ti-trophy text-3xl text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-white">{reg.tournament.name}</h3>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-400">
                  {reg.tournament.type}
                </span>
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-400">
                  {reg.type}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                {formatDate(reg.tournament.startDate)} · {reg.tournament.venue}
              </p>
              <p className="text-xs text-gray-500">ID: {reg._id.toUpperCase()}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400 capitalize">
                  {reg.paymentStatus}
                </span>
                {reg.attended ? (
                  <span className="text-sm text-emerald-400">✓ Attended</span>
                ) : (
                  <span className="text-sm text-gray-500">Not yet checked in</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleOpenQr(reg.qrToken)}
                className="mt-3 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-1.5 text-sm text-sky-400 transition-all hover:bg-white/10"
              >
                <i className="ti ti-qrcode" />
                QR Pass
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  )

  const contentMap = {
    overview: OverviewTab,
    orders: OrdersTab,
    wallet: WalletTab,
    registrations: RegistrationsTab,
    wishlist: () => (
      <>
        <h2 className="text-2xl font-bold text-white">Wishlist</h2>
        <div className={`${glassCard} mt-6 py-16 text-center`}>
          <i className="ti ti-heart text-5xl text-gray-600" />
          <p className="mt-4 text-gray-400">Your wishlist is empty. Save items from the store.</p>
          <button className="mt-4 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-2 font-semibold text-white">
            Browse Store
          </button>
        </div>
      </>
    ),
    profile: () => (
      <>
        <h2 className="text-2xl font-bold text-white">My Profile</h2>
        <form className={`${glassCard} mt-6 grid gap-4 p-6 sm:grid-cols-2`}>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-300">Name</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-300">Email</label>
            <input value={profile.email} readOnly className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-gray-400 cursor-not-allowed" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-300">Phone</label>
            <input
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-300">Street</label>
            <input
              value={profile.street}
              onChange={(e) => setProfile((p) => ({ ...p, street: e.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">City</label>
            <input
              value={profile.city}
              onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">State</label>
            <input
              value={profile.state}
              onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none"
            />
          </div>
          <button type="button" className="mt-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 py-2.5 font-semibold text-white transition-all hover:scale-[1.02] sm:col-span-2">
            Save Changes
          </button>
        </form>
        
        <div className={`${glassCard} mt-6 p-6`}>
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
          <div className="mt-4 space-y-3">
            <input type="password" placeholder="Current password" className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" />
            <input type="password" placeholder="New password" className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" />
            <input type="password" placeholder="Confirm new password" className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" />
          </div>
          <button className="mt-4 rounded-xl border border-white/20 bg-white/5 px-6 py-2 font-semibold text-white transition-all hover:bg-white/10">
            Update Password
          </button>
        </div>
      </>
    ),
  }

  const ActiveContent = contentMap[activeTab]

  return (
    <div className="min-h-screen bg-[#0B1020]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row">
          <Sidebar />
          <div className="min-w-0 flex-1">
            {ActiveContent && <ActiveContent />}
          </div>
        </div>
      </main>
      <Footer />

      {/* QR Modal */}
      {qrModalOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setQrModalOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0B1020] p-6 text-center shadow-2xl">
            <h3 className="text-xl font-bold text-white">Your QR Pass</h3>
            <div className="mx-auto mt-4 flex h-40 w-40 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <i className="ti ti-qrcode text-6xl text-sky-400" />
            </div>
            <p className="mt-4 font-mono text-xs text-amber-400 break-all">{qrModalToken}</p>
            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 py-2.5 font-semibold text-white transition-all hover:scale-[1.02]"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  )
}