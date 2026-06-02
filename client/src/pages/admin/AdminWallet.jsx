// client/src/pages/admin/AdminWallet.jsx

import { useCallback, useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { formatDate, formatPrice } from '../../utils/helpers'

const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

export default function AdminWallet() {
  const [overview, setOverview] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [adjustForm, setAdjustForm] = useState({
    userId: '',
    userSearch: '',
    type: 'credit',
    nxlAmount: '',
    reason: '',
  })
  const [users, setUsers] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadOverview = async () => {
    const res = await adminAPI.get('/wallet/overview')
    setOverview(res.data.data)
  }

  const loadTransactions = useCallback(async () => {
    const params = new URLSearchParams({ limit: 30 })
    if (typeFilter) params.set('type', typeFilter)
    if (search) params.set('search', search)
    const res = await adminAPI.get(`/wallet/transactions?${params}`)
    setTransactions(res.data.data.transactions)
  }, [typeFilter, search])

  useEffect(() => {
    Promise.all([loadOverview(), loadTransactions()])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [loadTransactions])

  const searchUsers = async (q) => {
    setAdjustForm((f) => ({ ...f, userSearch: q }))
    if (q.length < 2) return
    try {
      const res = await adminAPI.get(`/users?search=${encodeURIComponent(q)}&limit=5`)
      setUsers(res.data.data.users)
    } catch {
      setUsers([])
    }
  }

  const applyAdjustment = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await adminAPI.post('/wallet/adjust', {
        userId: adjustForm.userId,
        type: adjustForm.type,
        nxlAmount: Number(adjustForm.nxlAmount),
        reason: adjustForm.reason,
      })
      setSuccess(res.data.message)
      setAdjustForm({ userId: '', userSearch: '', type: 'credit', nxlAmount: '', reason: '' })
      loadOverview()
      loadTransactions()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className={`${glassCard} p-8 text-center text-gray-400`}>Loading wallet data...</div>
  }

  const issued = overview?.totalNxlIssued || 0
  const redeemed = overview?.totalNxlRedeemed || 0
  const outstanding = overview?.outstandingNxl || 0
  const redeemPct = issued ? Math.round((redeemed / issued) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
          <i className="ti ti-coin text-sky-400 text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">NXL & Wallet</h2>
          <p className="text-sm text-gray-400">Manage credits and transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-4 sm:rounded-2xl sm:p-6">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-500/20 blur-2xl" />
          <p className="text-sm text-gray-300">Total NXL Issued</p>
          <p className="mt-2 break-words text-2xl font-bold text-amber-400 sm:text-3xl">{issued.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-xs text-gray-400">= {formatPrice(issued)} in value</p>
        </div>
        
        <div className={`${glassCard} p-4 sm:p-6`}>
          <p className="text-sm text-gray-400">Total NXL Redeemed</p>
          <p className="mt-2 break-words text-2xl font-bold text-white sm:text-3xl">{redeemed.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-xs text-gray-400">{redeemPct}% of issued credits</p>
        </div>
        
        <div className={`${glassCard} p-4 sm:p-6`}>
          <p className="text-sm text-gray-400">Outstanding NXL</p>
          <p className="mt-2 break-words text-2xl font-bold text-sky-400 sm:text-3xl">{outstanding.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-xs text-gray-400">Est. liability: {formatPrice(outstanding)}</p>
        </div>
      </div>

      {/* Cashback Rules */}
      <div className={`${glassCard} p-4 sm:p-6`}>
        <h3 className="text-lg font-semibold text-white">Cashback Rules</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-400">
              <tr className="border-b border-white/10">
                <th className="py-2 text-left">Rule</th>
                <th>Value</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="py-2 text-white">Per ₹100 spent</td>
                <td className="font-medium text-amber-400">5 NXL</td>
                <td className="text-gray-400">Standard purchase cashback</td>
               </tr>
              <tr className="border-b border-white/10">
                <td className="py-2 text-white">Tournament registration</td>
                <td className="font-medium text-amber-400">Variable</td>
                <td className="text-gray-400">nxlReward per event</td>
               </tr>
              <tr>
                <td className="py-2 text-white">First purchase bonus</td>
                <td className="font-medium text-amber-400">100 NXL</td>
                <td className="text-gray-400">One-time new user reward</td>
               </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-500">Rule changes apply to future transactions only.</p>
      </div>

      {/* Manual Adjustment */}
      <div className="rounded-xl border-l-4 border-l-sky-500 bg-gradient-to-r from-sky-500/10 to-transparent p-4 sm:rounded-2xl sm:p-6">
        <h3 className="text-lg font-semibold text-white">Manual NXL Adjustment</h3>
        <p className="mt-1 text-sm text-amber-400">Use with caution. All manual adjustments are logged.</p>
        
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        {success && <p className="mt-2 text-sm text-emerald-400">{success}</p>}
        
        <form onSubmit={applyAdjustment} className="mt-4 space-y-3">
          <div className="relative">
            <input
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-500 focus:outline-none"
              placeholder="Search user by name or email"
              value={adjustForm.userSearch}
              onChange={(e) => searchUsers(e.target.value)}
            />
            {users.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-xl border border-white/10 bg-[#0B1020] shadow-xl">
                {users.map((u) => (
                  <li key={u._id}>
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 transition-all hover:bg-white/5"
                      onClick={() => {
                        setAdjustForm((f) => ({ ...f, userId: u._id, userSearch: `${u.name} (${u.email})` }))
                        setUsers([])
                      }}
                    >
                      {u.name} — {u.email}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flex gap-4">
            {['credit', 'deduct'].map((t) => (
              <label key={t} className="flex cursor-pointer items-center gap-2 text-sm capitalize text-gray-300">
                <input
                  type="radio"
                  checked={adjustForm.type === t}
                  onChange={() => setAdjustForm((f) => ({ ...f, type: t }))}
                  className="h-4 w-4 border-white/20 bg-white/5 text-sky-400 focus:ring-sky-400"
                />
                {t}
              </label>
            ))}
          </div>
          
            <input
            type="number"
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
            placeholder="NXL amount"
            required
            min={1}
            value={adjustForm.nxlAmount}
            onChange={(e) => setAdjustForm((f) => ({ ...f, nxlAmount: e.target.value }))}
          />
          
          <textarea
            className="min-h-[80px] w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
            placeholder="Reason (required)"
            required
            value={adjustForm.reason}
            onChange={(e) => setAdjustForm((f) => ({ ...f, reason: e.target.value }))}
          />
          
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2.5 font-semibold text-white transition-all md:hover:scale-105 disabled:opacity-50 sm:w-auto" disabled={saving || !adjustForm.userId}>
            {saving ? <i className="ti ti-loader animate-spin" /> : 'Apply Adjustment'}
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className={`${glassCard} overflow-hidden`}>
        <div className="flex flex-col gap-2 border-b border-white/10 p-4 sm:flex-row sm:flex-wrap">
          <select className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-gray-300 focus:border-sky-500 focus:outline-none sm:w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-2 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
              placeholder="Search user"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">NXL</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3">Balance After</th>
               </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className={`border-b border-white/10 ${t.type === 'credit' ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
                  <td className="px-4 py-3 text-gray-400">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3 text-white">{t.user?.name}</td>
                  <td className="px-4 py-3 capitalize text-gray-300">{t.type}</td>
                  <td className={`px-4 py-3 font-medium ${t.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'credit' ? '+' : '-'}{t.nxlAmount}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-300">{t.description}</td>
                  <td className="px-4 py-3 text-gray-400">{t.nxlAfter ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
