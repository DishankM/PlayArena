import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { adminAPI } from '../../services/api'
import { OrderStatusBadge } from '../../components/admin/OrderStatusBadge'
import { formatDate, formatPrice } from '../../utils/helpers'
import { CHART_COLORS, PIE_COLORS } from '../../utils/chartTheme'

const glassCard = 'rounded-xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10 sm:rounded-2xl'

const StatSkeleton = () => (
  <div className={`${glassCard} animate-pulse p-4 sm:p-5`}>
    <div className="h-10 w-10 rounded-full bg-white/10" />
    <div className="mt-4 h-8 w-24 rounded bg-white/10" />
    <div className="mt-2 h-4 w-32 rounded bg-white/10" />
  </div>
)

const formatChartDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminAPI.get('/dashboard')
        setData(res.data.data)
      } catch (err) {
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <div className={`${glassCard} h-72 animate-pulse`} />
          <div className={`${glassCard} h-72 animate-pulse`} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${glassCard} p-6 text-center`}>
        <i className="ti ti-alert-circle mb-2 text-2xl text-red-400" />
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  const { stats, charts, recent } = data
  const revenueData = (charts.last7Days || []).map((d) => ({
    ...d,
    label: formatChartDate(d.date),
  }))
  const pieData = charts.categoryRevenue || []
  const sportData = charts.sportStats || []

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Revenue */}
        <div className={`${glassCard} flex items-start justify-between gap-3 p-4 transition-all md:hover:scale-105 sm:p-5`}>
          <div className="min-w-0">
            <p className="break-words text-2xl font-bold text-white">{formatPrice(stats.totalRevenue)}</p>
            <p className="mt-1 text-sm text-gray-400">Total revenue earned</p>
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-400">
              <i className="ti ti-trending-up" /> Paid orders: {stats.orders}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
            <i className="ti ti-currency-rupee text-xl text-emerald-400" />
          </div>
        </div>

        {/* Paid Orders */}
        <div className={`${glassCard} flex items-start justify-between gap-3 p-4 transition-all md:hover:scale-105 sm:p-5`}>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-white">{stats.orders}</p>
            <p className="mt-1 text-sm text-gray-400">Paid orders</p>
            <p className="mt-2 text-xs text-orange-400">{stats.pendingOrders} pending action</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
            <i className="ti ti-shopping-bag text-xl text-blue-400" />
          </div>
        </div>

        {/* Active Players */}
        <div className={`${glassCard} flex items-start justify-between gap-3 p-4 transition-all md:hover:scale-105 sm:p-5`}>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-white">{stats.users?.toLocaleString()}</p>
            <p className="mt-1 text-sm text-gray-400">Active players</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20">
            <i className="ti ti-users text-xl text-purple-400" />
          </div>
        </div>

        {/* NXL Credits Issued */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-4 transition-all md:hover:scale-105 sm:rounded-2xl sm:p-5">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-500/20 blur-2xl" />
          <div className="relative">
            <p className="break-words text-2xl font-bold text-amber-400">
              {stats.totalNxlIssued?.toLocaleString('en-IN')} NXL
            </p>
            <p className="mt-1 text-sm text-gray-300">Credits issued total</p>
          </div>
          <div className="relative mt-2 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20">
            <i className="ti ti-coin text-xl text-amber-400" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Revenue Chart */}
        <div className={`${glassCard} p-4 sm:p-5`}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20">
              <i className="ti ti-chart-line text-sky-400" />
            </div>
            <h2 className="text-base font-semibold text-white sm:text-lg">Revenue — last 7 days</h2>
          </div>
          <div className="mt-4 h-64 overflow-x-auto sm:h-72">
            <ResponsiveContainer width="100%" minWidth={360} height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#0B1020', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => [
                    name === 'revenue' ? formatPrice(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Orders',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS.primary}
                  fill="url(#revenueFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category Pie Chart */}
        <div className={`${glassCard} p-4 sm:p-5`}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
              <i className="ti ti-chart-pie text-violet-400" />
            </div>
            <h2 className="text-base font-semibold text-white sm:text-lg">Revenue by category</h2>
          </div>
          <div className="mt-4 h-56 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  dataKey="revenue" 
                  nameKey="category" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius="72%"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0B1020', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  formatter={(v) => formatPrice(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-2 text-xs min-[420px]:grid-cols-2">
            {pieData.map((item, i) => (
              <span key={item.category} className="flex min-w-0 items-center gap-1.5 text-gray-300">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="truncate capitalize">{item.category}</span>
                <span className="ml-auto text-sky-400">{formatPrice(item.revenue)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className={`${glassCard} overflow-hidden`}>
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4 sm:px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <i className="ti ti-package text-emerald-400" />
          </div>
          <h2 className="text-base font-semibold text-white sm:text-lg">Top 5 selling products</h2>
        </div>
        <div className="space-y-3 p-4 sm:hidden">
          {(charts.topProducts || []).length === 0 ? (
            <p className="rounded-xl bg-white/5 p-4 text-center text-sm text-gray-400">No product sales yet</p>
          ) : (
            (charts.topProducts || []).map((p, i) => (
              <div key={p.productId} className="rounded-xl bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="mt-1 text-xs capitalize text-gray-400">{p.category}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-400">#{i + 1}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-400">{p.totalSold} units</span>
                  <span className="font-medium text-sky-400">{formatPrice(p.revenue)}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Units Sold</th>
                <th className="px-5 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(charts.topProducts || []).map((p, i) => (
                <tr key={p.productId} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-5 py-3">
                    {i === 0 && <i className="ti ti-crown text-amber-400" />}
                    {i === 1 && <i className="ti ti-medal text-gray-400" />}
                    {i === 2 && <i className="ti ti-medal text-amber-700" />}
                    {i > 2 && <span className="text-gray-500">{i + 1}</span>}
                  </td>
                  <td className="px-5 py-3 font-medium text-white">{p.name}</td>
                  <td className="px-5 py-3 capitalize text-gray-300">{p.category}</td>
                  <td className="px-5 py-3 text-gray-300">{p.totalSold}</td>
                  <td className="px-5 py-3 font-medium text-sky-400">{formatPrice(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Recent Orders */}
        <div className={`${glassCard} p-4 sm:p-5`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20">
                <i className="ti ti-shopping-cart text-sky-400" />
              </div>
              <h2 className="text-base font-semibold text-white sm:text-lg">Recent orders</h2>
            </div>
            <Link to="/admin/orders" className="text-sm font-medium text-sky-400 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {(recent.orders || []).map((order) => (
              <div
                key={order._id}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">#{String(order._id).slice(-8)}</p>
                  <p className="text-xs text-gray-400">{order.user?.name}</p>
                </div>
                <div className="min-[420px]:text-right">
                  <p className="text-sm font-medium text-sky-400">{formatPrice(order.total)}</p>
                  <OrderStatusBadge status={order.orderStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className={`${glassCard} p-4 sm:p-5`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                <i className="ti ti-trophy text-purple-400" />
              </div>
              <h2 className="text-base font-semibold text-white sm:text-lg">Recent registrations</h2>
            </div>
            <Link to="/admin/tournaments" className="text-sm font-medium text-sky-400 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {(recent.registrations || []).map((reg) => (
              <div
                key={reg._id}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{reg.tournament?.name}</p>
                  <p className="text-xs text-gray-400">{reg.user?.name}</p>
                </div>
                <div className="min-[420px]:text-right">
                  <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-400">
                    {reg.tournament?.sport}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">{formatDate(reg.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registrations by Sport */}
      {sportData.length > 0 && (
        <div className={`${glassCard} p-4 sm:p-5`}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <i className="ti ti-chart-bar text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-white sm:text-lg">Registrations by sport</h2>
          </div>
          <div className="mt-4 h-72 overflow-x-auto sm:h-80">
            <ResponsiveContainer width="100%" minWidth={360} height="100%">
              <BarChart data={sportData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis type="category" dataKey="sport" width={100} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0B1020', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
