// client/src/pages/admin/AdminUsers.jsx

import { useCallback, useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { formatDate, formatPrice, getInitials } from '../../utils/helpers'

const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 50 })
      if (search) params.set('search', search)
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (statusFilter === 'active') params.set('status', 'active')
      if (statusFilter === 'blocked') params.set('status', 'blocked')
      const res = await adminAPI.get(`/users?${params}`)
      setUsers(res.data.data.users)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const openDetail = async (user) => {
    setSelected(user)
    try {
      const res = await adminAPI.get(`/users/${user._id}`)
      setDetail(res.data.data)
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleBlock = async (user) => {
    const action = user.isActive !== false ? 'block' : 'unblock'
    if (!window.confirm(`${action === 'block' ? 'Block' : 'Unblock'} ${user.name}?`)) return
    try {
      await adminAPI.patch(`/users/${user._id}/toggle-status`)
      fetchUsers()
      if (selected?._id === user._id) openDetail(user)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
          <i className="ti ti-users text-sky-400 text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Users</h2>
          <p className="text-sm text-gray-400">Manage player accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 focus:border-sky-500 focus:outline-none sm:w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
        <select className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 focus:border-sky-500 focus:outline-none sm:w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <i className="ti ti-alert-circle mr-2" />
          {error}
        </div>
      )}

      {/* Users Table */}
        <div className={`${glassCard} overflow-hidden`}>
          <div className="sm:hidden p-4">
            {loading ? (
              [1,2,3].map((i) => (
                <div key={i} className="mb-3 rounded-xl bg-white/5 p-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                  <div className="mt-2 h-3 w-48 animate-pulse rounded bg-white/10" />
                </div>
              ))
            ) : users.length === 0 ? (
              <div className="rounded-xl bg-white/5 p-6 text-center text-gray-400">No users</div>
            ) : (
              users.map((user) => (
                <div key={user._id} className="mb-3 rounded-xl bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${user.isActive !== false ? 'text-white' : 'text-gray-400'}`}>{user.name}</p>
                      <p className="text-xs text-gray-300">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{user.nxlCredits ?? 0} NXL</p>
                      <p className="text-xs text-gray-400">{user.orderCount ?? 0} orders</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="text-sky-400" onClick={() => openDetail(user)}>View</button>
                    <button className={user.isActive !== false ? 'text-red-400' : 'text-emerald-400'} onClick={() => toggleBlock(user)}>{user.isActive !== false ? 'Block' : 'Unblock'}</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">NXL</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    <i className="ti ti-loader animate-spin mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${user.isActive !== false ? 'bg-gradient-to-r from-sky-500 to-violet-500' : 'bg-gray-600'}`}>
                          {getInitials(user.name)}
                        </div>
                        <span className="font-medium text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">{user.nxlCredits ?? 0} NXL</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{user.orderCount ?? 0}</td>
                    <td className="px-4 py-3">
                      {user.isActive !== false ? (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">Active</span>
                      ) : (
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">Blocked</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" className="text-sky-400 transition-all hover:scale-110" onClick={() => openDetail(user)}>
                          <i className="ti ti-eye text-lg" />
                        </button>
                        <button
                          type="button"
                          className={user.isActive !== false ? 'text-red-400 hover:scale-110' : 'text-emerald-400 hover:scale-110'}
                          onClick={() => toggleBlock(user)}
                        >
                          <i className={`ti ${user.isActive !== false ? 'ti-ban' : 'ti-check'} text-lg`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selected && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-[#0B1020] p-4 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-violet-500 text-xl font-bold text-white shadow-lg">
                  {getInitials(detail.user.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-white">{detail.user.name}</h3>
                  <p className="text-sm text-gray-400">{detail.user.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-sky-500/20 px-2 py-0.5 text-xs capitalize text-sky-400">{detail.user.role}</span>
                </div>
              </div>
              <button type="button" className="text-gray-400 hover:text-white" onClick={() => setSelected(null)}>
                <i className="ti ti-x text-xl" />
              </button>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
              <div className={`${glassCard} p-3`}>
                <p className="text-xl font-bold text-white">{detail.orderCount}</p>
                <p className="text-xs text-gray-400">Orders</p>
              </div>
              <div className={`${glassCard} p-3`}>
                <p className="text-xl font-bold text-sky-400">{formatPrice(detail.totalSpent)}</p>
                <p className="text-xs text-gray-400">Spent</p>
              </div>
              <div className={`${glassCard} p-3`}>
                <p className="text-xl font-bold text-amber-400">{detail.nxlCredits} NXL</p>
                <p className="text-xs text-gray-400">Credits</p>
              </div>
              <div className={`${glassCard} p-3`}>
                <p className="text-xl font-bold text-white">{formatPrice(detail.walletBalance)}</p>
                <p className="text-xs text-gray-400">Wallet</p>
              </div>
              <div className={`${glassCard} p-3`}>
                <p className="text-xl font-bold text-white">{detail.registrationCount}</p>
                <p className="text-xs text-gray-400">Events</p>
              </div>
            </div>
            
            {detail.recentOrders?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-white">Recent orders</h4>
                <div className="mt-2 space-y-2">
                  {detail.recentOrders.map((o) => (
                    <div key={o._id} className="flex justify-between border-b border-white/10 pb-2 text-sm">
                      <span className="font-mono text-sky-400">#{String(o._id).slice(-6)}</span>
                      <span className="text-white">{formatPrice(o.total)}</span>
                      <span className="capitalize text-gray-400">{o.orderStatus}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {detail.recentTransactions?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-white">NXL transactions</h4>
                <div className="mt-2 space-y-2">
                  {detail.recentTransactions.map((t) => (
                    <div key={t._id} className="flex justify-between border-b border-white/10 pb-2 text-xs">
                      <span className="text-gray-400">{formatDate(t.createdAt)}</span>
                      <span className={t.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}>
                        {t.type === 'credit' ? '+' : '-'}{t.nxlAmount} NXL
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {detail.user.address?.city && (
              <p className="mt-4 text-sm text-gray-400">
                <i className="ti ti-map-pin mr-1" />
                {detail.user.address.street}, {detail.user.address.city}, {detail.user.address.state}
              </p>
            )}
            
            <button
              type="button"
              className={`mt-6 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all ${
                detail.user.isActive !== false 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:scale-105' 
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:scale-105'
              }`}
              onClick={() => toggleBlock(detail.user)}
            >
              {detail.user.isActive !== false ? 'Block User' : 'Unblock User'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
