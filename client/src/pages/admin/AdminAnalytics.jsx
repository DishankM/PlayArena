// client/src/pages/admin/AdminAnalytics.jsx

import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { adminAPI } from '../../services/api'
import { formatPrice } from '../../utils/helpers'
import { CHART_COLORS, ORDER_STATUS_COLORS, PIE_COLORS } from '../../utils/chartTheme'

const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

export default function AdminAnalytics() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminAPI
      .get(`/analytics?days=${days}`)
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [days])

  if (loading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${glassCard} h-64 animate-pulse`} />
        ))}
      </div>
    )
  }

  const { charts, summary } = data
  const revenueData = charts.revenueOverTime || []
  const nxlCredit = charts.nxlSummary?.find((r) => r.type === 'credit')?.total || 0
  const nxlDebit = charts.nxlSummary?.find((r) => r.type === 'debit')?.total || 0
  const nxlLineData = revenueData.map((d, i) => ({
    date: d.date,
    credited: Math.round((nxlCredit / Math.max(revenueData.length, 1)) * (i + 1)),
    redeemed: Math.round((nxlDebit / Math.max(revenueData.length, 1)) * (i + 1)),
  }))

  const radarData = (charts.categoryRevenue || []).slice(0, 4).map((c) => ({
    category: c.category,
    revenue: c.revenue / 1000,
    units: c.count,
    rating: 4,
  }))

  const kpis = [
    { label: 'Avg order value', value: formatPrice(summary.avgOrderValue), icon: 'ti-wallet' },
    { label: 'Paid orders', value: summary.paidOrders, icon: 'ti-shopping-cart' },
    { label: 'Top product', value: summary.topProduct, icon: 'ti-shirt' },
    { label: 'Top sport', value: summary.topSport, icon: 'ti-trophy' },
    { label: 'NXL in circulation', value: summary.nxlInCirculation?.toLocaleString('en-IN'), icon: 'ti-coin' },
    { label: 'Avg NXL per user', value: summary.avgNxlPerUser, icon: 'ti-users' },
    { label: 'Total revenue', value: formatPrice(summary.totalRevenue), icon: 'ti-chart-line' },
    { label: 'NXL redeemed', value: summary.totalNxlRedeemed?.toLocaleString('en-IN'), icon: 'ti-refresh' },
  ]

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Last 7 days', value: 7 },
          { label: 'Last 30 days', value: 30 },
          { label: 'Last 3 months', value: 90 },
          { label: 'Last 12 months', value: 365 },
        ].map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              days === preset.value 
                ? 'bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-lg shadow-sky-500/20' 
                : 'border border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
            onClick={() => setDays(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className={`${glassCard} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20">
            <i className="ti ti-chart-line text-sky-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Revenue over time</h3>
        </div>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0B1020', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
                formatter={(v) => formatPrice(v)}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="url(#revenueGradient)" 
                fill="url(#revenueGradientFill)" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <linearGradient id="revenueGradientFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Status */}
        <div className={`${glassCard} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
              <i className="ti ti-shopping-bag text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Orders by status</h3>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ordersByStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0B1020', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {(charts.ordersByStatus || []).map((entry, index) => (
                    <Cell
                      key={entry.status}
                      fill={ORDER_STATUS_COLORS[entry.status] || PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sport Registrations */}
        <div className={`${glassCard} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <i className="ti ti-trophy text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Sport registrations</h3>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.sportStats || []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis type="category" dataKey="sport" width={90} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0B1020', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#0EA5E9" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Performance Radar */}
      {radarData.length > 0 && (
        <div className={`${glassCard} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
              <i className="ti ti-chart-pie text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Category performance</h3>
          </div>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2D3748" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0B1020', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Radar 
                  name="Revenue (k)" 
                  dataKey="revenue" 
                  stroke="#0EA5E9" 
                  fill="#0EA5E9" 
                  fillOpacity={0.3} 
                />
                <Radar 
                  name="Units" 
                  dataKey="units" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.2} 
                />
                <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* NXL Credits Flow */}
      <div className={`${glassCard} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
            <i className="ti ti-coin text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">NXL credits flow</h3>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={nxlLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0B1020', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Line 
                type="monotone" 
                dataKey="credited" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="redeemed" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Growth */}
      <div className={`${glassCard} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
            <i className="ti ti-users text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">User growth</h3>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.userGrowth || []}>
              <defs>
                <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0B1020', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#0EA5E9" 
                fill="url(#userGrowthGradient)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${glassCard} p-4 transition-all hover:scale-105`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
                <p className="mt-1 text-xs text-gray-400">{kpi.label}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-violet-500/20">
                <i className={`${kpi.icon} text-lg text-sky-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}