// client/src/pages/PaymentFailed.jsx
import { Link, useLocation } from 'react-router-dom'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'

export default function PaymentFailed() {
  const { state } = useLocation()
  const { orderId, reason } = state || {}

  return (
    <div className="min-h-screen bg-arena-surface">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="card rounded-xl p-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <i className="ti ti-circle-x text-5xl text-red-600" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Payment Failed</h1>
          <p className="mt-1 text-sm text-red-600">{reason || 'Your payment could not be processed.'}</p>
          {orderId ? <p className="mt-2 text-xs text-gray-500">Order ID: #ORD-{String(orderId).slice(-8).toUpperCase()}</p> : null}

          <div className="mt-4 rounded-lg border border-arena-border bg-white p-3 text-left text-sm text-gray-700">
            <p>Your order has been saved in pending state.</p>
            <p>Retry payment from checkout or your dashboard orders tab.</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link to="/checkout" className="btn-primary w-full">
              Retry Payment
            </Link>
            <Link to="/dashboard?tab=orders" className="btn-ghost w-full">
              View Orders
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
