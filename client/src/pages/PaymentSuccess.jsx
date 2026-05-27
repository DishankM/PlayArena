// client/src/pages/PaymentSuccess.jsx
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { orderId, invoiceUrl, paymentMethod, nxlUsed } = state || {}
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!state?.orderId) navigate('/dashboard')
  }, [state, navigate])

  useEffect(() => {
    const timer = setInterval(() => setCountdown((prev) => (prev > 0 ? prev - 1 : 0)), 1000)
    const redirect = setTimeout(() => navigate('/dashboard'), 10000)
    return () => {
      clearInterval(timer)
      clearTimeout(redirect)
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-arena-surface">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="card rounded-xl p-6 text-center">
          <div className="mx-auto flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-green-100">
            <i className="ti ti-circle-check text-5xl text-green-600" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Order Placed Successfully</h1>
          <p className="mt-1 text-sm text-gray-500">Order ID: #ORD-{String(orderId || '').slice(-8).toUpperCase()}</p>

          {nxlUsed ? (
            <div className="mt-4 rounded-lg bg-arena-navy p-3 text-arena-gold">You used {nxlUsed} NXL credits on this order.</div>
          ) : null}

          <p className="mt-4 text-sm text-gray-600">Paid via {String(paymentMethod || 'gateway').toUpperCase()}</p>

          {invoiceUrl ? (
            <a href={invoiceUrl} target="_blank" rel="noreferrer" className="btn-secondary mt-4 w-full">
              <i className="ti ti-file-invoice" aria-hidden="true" />
              Download Invoice
            </a>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link to="/dashboard?tab=orders" className="btn-primary w-full">
              Track Order
            </Link>
            <Link to="/store" className="btn-ghost w-full">
              Continue Shopping
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-500">Redirecting to your dashboard in {countdown} seconds...</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
