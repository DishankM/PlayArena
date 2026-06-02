// client/src/pages/admin/AdminCoupons.jsx

import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { formatDate, formatPrice } from '../../utils/helpers'

const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

const emptyCoupon = {
  code: '',
  discountType: 'percent',
  discountValue: 10,
  minOrderAmount: 500,
  maxUses: 100,
  perUserLimit: 1,
  expiresAt: '',
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyCoupon)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchCoupons = async () => {
    try {
      const res = await adminAPI.get('/coupons')
      setCoupons(res.data.data.coupons)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const couponStatus = (c) => {
    if (!c.isActive) return { label: 'Inactive', class: 'bg-gray-500/20 text-gray-400' }
    if (new Date(c.expiresAt) < new Date()) return { label: 'Expired', class: 'bg-red-500/20 text-red-400' }
    return { label: 'Active', class: 'bg-emerald-500/20 text-emerald-400' }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.post('/coupons', form)
      setModalOpen(false)
      setForm(emptyCoupon)
      fetchCoupons()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (coupon) => {
    try {
      await adminAPI.patch(`/coupons/${coupon._id}`, { isActive: !coupon.isActive })
      fetchCoupons()
    } catch (err) {
      setError(err.message)
    }
  }

  const preview = form.code &&
    `${form.code} — ${form.discountType === 'percent' ? `${form.discountValue}% off` : formatPrice(form.discountValue)} on orders above ${formatPrice(form.minOrderAmount)}`

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
            <i className="ti ti-tag text-sky-400 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Coupons</h2>
            <p className="text-sm text-gray-400">Manage discount codes</p>
          </div>
        </div>
        <button 
          type="button" 
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2.5 font-semibold text-white transition-all md:hover:scale-105 sm:w-auto"
          onClick={() => setModalOpen(true)}
        >
          <i className="ti ti-plus" /> Create Coupon
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <i className="ti ti-alert-circle mr-2" />
          {error}
        </div>
      )}

      {/* Coupons Table */}
        <div className={`${glassCard} overflow-hidden`}>
          <div className="sm:hidden p-4">
            {loading ? (
              [1,2,3].map((i) => (
                <div key={i} className="mb-3 rounded-xl bg-white/5 p-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                </div>
              ))
            ) : coupons.length === 0 ? (
              <div className="rounded-xl bg-white/5 p-6 text-center text-gray-400">No coupons</div>
            ) : (
              coupons.map((c) => (
                <div key={c._id} className="mb-3 rounded-xl bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-sky-400">{c.code}</p>
                      <p className="text-xs text-gray-300">{c.discountType === 'percent' ? `${c.discountValue}% off` : formatPrice(c.discountValue)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-300">{c.usedCount} / {c.maxUses}</p>
                      <p className="text-xs text-gray-300">{formatDate(c.expiresAt)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="rounded-xl border border-white/20 bg-white/5 px-3 py-1 text-sm text-gray-300">Edit</button>
                    <button className="text-sky-400" onClick={() => toggleActive(c)}>{c.isActive ? 'Disable' : 'Enable'}</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Min Order</th>
                <th className="px-5 py-4">Uses</th>
                <th className="px-5 py-4">Expires</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    <i className="ti ti-loader animate-spin mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const st = couponStatus(c)
                  const daysLeft = (new Date(c.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
                  return (
                    <tr key={c._id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-5 py-3 font-mono font-bold text-sky-400">{c.code}</td>
                      <td className="px-5 py-3 text-gray-300">
                        {c.discountType === 'percent' ? `${c.discountValue}% off` : formatPrice(c.discountValue)}
                      </td>
                      <td className="px-5 py-3 text-gray-300">
                        {c.minOrderAmount ? formatPrice(c.minOrderAmount) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-300">{c.usedCount} / {c.maxUses}</span>
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500"
                              style={{ width: `${Math.min((c.usedCount / c.maxUses) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className={`px-5 py-3 ${daysLeft < 7 && daysLeft > 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                        {formatDate(c.expiresAt)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs ${st.class}`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <button 
                          type="button" 
                          className="text-sky-400 transition-all hover:scale-110" 
                          onClick={() => toggleActive(c)}
                        >
                          <i className={`ti ${c.isActive ? 'ti-toggle-right text-2xl' : 'ti-toggle-left text-2xl text-gray-500'}`} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreate} className="w-full max-w-md rounded-xl border border-white/10 bg-[#0B1020] p-4 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Create Coupon</h3>
              <button type="button" className="text-gray-400 hover:text-white" onClick={() => setModalOpen(false)}>
                <i className="ti ti-x text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 font-mono uppercase text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
                placeholder="CODE"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
              
              <div className="grid gap-2 sm:grid-cols-2">
                {['percent', 'flat'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-medium capitalize transition-all ${
                      form.discountType === t 
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400' 
                        : 'border-white/20 text-gray-400 hover:bg-white/5'
                    }`}
                    onClick={() => setForm({ ...form, discountType: t })}
                  >
                    {t === 'percent' ? 'Percentage (%)' : 'Fixed (₹)'}
                  </button>
                ))}
              </div>
              
              <input
                type="number"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
                placeholder={form.discountType === 'percent' ? '10 %' : '₹50'}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              />
              
              <input
                type="number"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
                placeholder="Min order amount"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
              />
              
              <input
                type="number"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
                placeholder="Max uses"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              />
              
              <input
                type="date"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
                required
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
              
              {preview && (
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
                  <p className="text-sm font-medium text-sky-400">Preview</p>
                  <p className="mt-1 text-sm text-gray-300">{preview}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" className="rounded-xl border border-white/20 bg-white/5 px-5 py-2 text-sm text-gray-300 hover:bg-white/10" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white transition-all md:hover:scale-105 disabled:opacity-50" disabled={saving}>
                {saving ? <i className="ti ti-loader animate-spin" /> : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
