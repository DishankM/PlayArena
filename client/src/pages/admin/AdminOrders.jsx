// client/src/pages/admin/AdminOrders.jsx

import { useCallback, useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { OrderStatusBadge } from '../../components/admin/OrderStatusBadge'
import { formatDate, formatPrice } from '../../utils/helpers'

const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const STATUS_OPTIONS = STATUSES.filter((s) => s !== 'all')
const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      const res = await adminAPI.get(`/orders?${params}`)
      setOrders(res.data.data.orders)
      setTotalPages(res.data.data.totalPages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search, dateFrom, dateTo])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateStatus = async (orderId, status) => {
    setSavingId(orderId)
    try {
      const res = await adminAPI.patch(`/orders/${orderId}/status`, { status })
      const updated = res.data.data.order
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)))
      if (selectedOrder?._id === orderId) setSelectedOrder(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingId(null)
    }
  }

  const exportCsv = () => {
    const header = 'OrderID,Customer,Email,Items,Total,PaymentMethod,Status,Date'
    const rows = orders.map((o) => {
      const items = o.items?.map((i) => i.name || i.product?.name).join('; ') || ''
      return [
        o._id,
        o.user?.name,
        o.user?.email,
        items,
        o.total,
        o.paymentMethod,
        o.orderStatus,
        new Date(o.createdAt).toISOString(),
      ].join(',')
    })
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `playarena-orders-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const stepIndex = (status) => steps.indexOf(status)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
            <i className="ti ti-shopping-cart text-sky-400 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Orders</h2>
            <p className="text-sm text-gray-400">Manage customer orders</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all ${
              statusFilter === s 
                ? 'bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-lg shadow-sky-500/20' 
                : 'border border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
            onClick={() => {
              setStatusFilter(s)
              setPage(1)
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-3">
        <input 
          type="date" 
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-gray-300 focus:border-sky-500 focus:outline-none" 
          value={dateFrom} 
          onChange={(e) => setDateFrom(e.target.value)} 
        />
        <input 
          type="date" 
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-gray-300 focus:border-sky-500 focus:outline-none" 
          value={dateTo} 
          onChange={(e) => setDateTo(e.target.value)} 
        />
        <div className="relative flex-1 min-w-[200px]">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-2 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
            placeholder="Order ID or user email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          type="button" 
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-white/10"
          onClick={exportCsv}
        >
          <i className="ti ti-download" /> Export CSV
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <i className="ti ti-alert-circle mr-2" />
          {error}
        </div>
      )}

      {/* Orders Table / Mobile Cards */}
      <div className={`${glassCard} overflow-hidden`}>
        {/* Mobile stacked cards */}
        <div className="sm:hidden p-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mb-3 rounded-xl bg-white/5 p-4">
                <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                <div className="mt-3 h-3 w-48 animate-pulse rounded bg-white/10" />
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="rounded-xl bg-white/5 p-6 text-center text-gray-400">No orders</div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="mb-3 rounded-xl bg-white/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-sm text-sky-400">#{String(order._id).slice(-8)}</p>
                    <p className="mt-1 font-medium text-white">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                    <p className="mt-2 text-sm text-gray-300">{order.items?.length} items • {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sky-400">{formatPrice(order.total)}</p>
                    <p className="mt-2 text-xs text-gray-300">{order.paymentMethod}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <select
                    className="rounded-xl border border-white/20 bg-white/5 px-3 py-1 text-xs text-gray-300 focus:border-sky-500 focus:outline-none"
                    value={order.orderStatus}
                    disabled={savingId === order._id}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <button className="text-sky-400" onClick={() => setSelectedOrder(order)}>View</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-gray-400">
                    <i className="ti ti-loader animate-spin mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        className="font-mono text-sm text-sky-400 hover:underline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        #{String(order._id).slice(-8)}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-white">{order.user?.name}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-300">
                      {order.items?.length} items
                    </td>
                    <td className="px-5 py-3 font-medium text-sky-400">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3 capitalize text-gray-300">{order.paymentMethod}</td>
                    <td className="px-5 py-3">
                      <select
                        className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs capitalize text-gray-300 focus:border-sky-500 focus:outline-none"
                        value={order.orderStatus}
                        disabled={savingId === order._id}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        className="text-sky-400 transition-all hover:scale-110"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <i className="ti ti-eye text-lg" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-5 py-3">
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-gray-300 transition-all hover:bg-white/10 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-gray-300 transition-all hover:bg-white/10 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1020] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Order #{String(selectedOrder._id).slice(-8)}</h3>
                <p className="text-sm text-gray-400">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button type="button" className="text-gray-400 hover:text-white" onClick={() => setSelectedOrder(null)}>
                <i className="ti ti-x text-xl" />
              </button>
            </div>
            
            <div className="mt-3 flex gap-2">
              <OrderStatusBadge status={selectedOrder.orderStatus} />
              <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs capitalize text-sky-400">
                {selectedOrder.paymentMethod}
              </span>
            </div>
            
            {/* Customer Info */}
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="font-medium text-white">{selectedOrder.user?.name}</p>
              <p className="text-sm text-gray-400">{selectedOrder.user?.email}</p>
              {selectedOrder.user?.phone && <p className="text-sm text-gray-400">{selectedOrder.user.phone}</p>}
              {selectedOrder.shippingAddress?.street && (
                <p className="mt-2 text-sm text-gray-400">
                  {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {' '}
                  {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}
                </p>
              )}
            </div>
            
            {/* Order Items */}
            <table className="mt-4 w-full text-sm">
              <thead className="text-xs text-gray-400">
                <tr className="border-b border-white/10">
                  <th className="py-2 text-left">Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="py-2 text-white">{item.name || item.product?.name}</td>
                    <td className="text-gray-300">{item.quantity}</td>
                    <td className="text-gray-300">{formatPrice(item.price)}</td>
                    <td className="text-sky-400">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Totals */}
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Discount</span>
                <span className="text-emerald-400">-{formatPrice(selectedOrder.discount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">NXL Used</span>
                <span className="text-amber-400">{selectedOrder.nxlUsed || 0}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
                <span className="text-white">Total</span>
                <span className="text-sky-400">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
            
            {/* Status Steps */}
            <div className="mt-4 flex flex-wrap gap-3">
              {steps.map((step, i) => {
                const current = stepIndex(selectedOrder.orderStatus)
                const done = i <= current && selectedOrder.orderStatus !== 'cancelled'
                const active = i === current
                return (
                  <div key={step} className="flex items-center gap-1 text-xs capitalize">
                    {done ? (
                      <i className="ti ti-circle-check text-emerald-400" />
                    ) : active ? (
                      <div className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
                    ) : (
                      <i className="ti ti-circle text-gray-500" />
                    )}
                    <span className={done ? 'text-emerald-400' : active ? 'text-sky-400' : 'text-gray-500'}>
                      {step}
                    </span>
                  </div>
                )
              })}
            </div>
            
            {/* Update Status */}
            <div className="mt-4">
              <select
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none"
                value={selectedOrder.orderStatus}
                onChange={(e) => updateStatus(selectedOrder._id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}