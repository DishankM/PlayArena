// client/src/pages/Checkout.jsx
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'
import { orderAPI } from '../services/api'
import usePayment from '../hooks/usePayment'
import { RazorpayButton } from '../components/payment/RazorpayButton'
import { StripeForm } from '../components/payment/StripeForm'

export default function Checkout() {
  const { items } = useSelector((state) => state.cart)
  const user = useSelector((state) => state.auth.user) || {}
  const wallet = useSelector((state) => state.wallet)
  const nxlBalance = wallet.nxlCredits || user.nxlCredits || 0
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0), [items])
  const delivery = subtotal >= 999 ? 0 : 49
  const total = subtotal + delivery

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [address, setAddress] = useState({
    name: user.name || '',
    phone: user.phone || '',
    street: user.address?.street || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    pincode: user.address?.pincode || '',
    country: user.address?.country || 'India',
  })
  const [currentOrderId, setCurrentOrderId] = useState('')
  const [stripeClientSecret, setStripeClientSecret] = useState('')
  const [useNxl, setUseNxl] = useState(false)
  const [nxlToUse, setNxlToUse] = useState(0)
  const [localError, setLocalError] = useState('')

  const { createStripeIntent, payWithNxl, processing, error } = usePayment()

  const remaining = Math.max(total - (useNxl ? nxlToUse : 0), 0)
  const fullNxlEligible = nxlBalance >= total

  const createPendingOrder = async () => {
    const payload = {
      items: items.map((item) => ({ product: item._id, quantity: item.quantity })),
      shippingAddress: address,
      paymentMethod,
    }
    const { data } = await orderAPI.post('/', payload)
    return data.data.order
  }

  const handleProceedToPayment = async (e) => {
    e.preventDefault()
    setLocalError('')
    try {
      const order = await createPendingOrder()
      setCurrentOrderId(order._id)
      if (useNxl && nxlToUse > 0) {
        const nxlResult = await payWithNxl(order._id, nxlToUse)
        if (!nxlResult.requiresGateway) return
      }
      if (paymentMethod === 'stripe') {
        const intent = await createStripeIntent(order._id)
        setStripeClientSecret(intent.clientSecret)
      }
      setStep(2)
    } catch (err) {
      setLocalError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-arena-surface">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="card p-5">
            {step === 1 ? (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <h2 className="text-lg font-semibold">Address</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.keys(address).map((field) => (
                    <input
                      key={field}
                      required
                      value={address[field]}
                      placeholder={field[0].toUpperCase() + field.slice(1)}
                      onChange={(e) => setAddress((prev) => ({ ...prev, [field]: e.target.value }))}
                      className="input-field"
                    />
                  ))}
                </div>

                <h2 className="pt-2 text-lg font-semibold">Payment Method</h2>
                <div className="grid gap-2 sm:grid-cols-3">
                  {['razorpay', 'stripe', 'nxl'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-md border px-3 py-2 text-sm capitalize ${paymentMethod === method ? 'border-arena-primary bg-arena-primary-bg' : 'border-arena-border'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {paymentMethod !== 'nxl' ? (
                  <div className="rounded-md border border-arena-border p-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={useNxl} onChange={(e) => setUseNxl(e.target.checked)} />
                      Apply NXL credits
                    </label>
                    {useNxl ? (
                      <div className="mt-2">
                        <input
                          type="range"
                          min={0}
                          max={Math.min(nxlBalance, total)}
                          value={nxlToUse}
                          onChange={(e) => setNxlToUse(Number(e.target.value))}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-600">
                          Applying {nxlToUse} NXL. Remaining amount: Rs. {remaining.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {paymentMethod === 'nxl' ? (
                  <p className={`text-sm ${fullNxlEligible ? 'text-green-600' : 'text-red-600'}`}>
                    {fullNxlEligible ? 'You can pay full amount with NXL.' : 'Insufficient NXL for full payment.'}
                  </p>
                ) : null}

                <button type="submit" disabled={processing || (paymentMethod === 'nxl' && !fullNxlEligible)} className="btn-primary">
                  Continue to Pay
                </button>
                {localError || error ? <p className="text-sm text-red-600">{localError || error}</p> : null}
              </form>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Complete Payment</h2>
                {paymentMethod === 'razorpay' ? (
                  <RazorpayButton
                    orderId={currentOrderId}
                    amount={remaining}
                    userDetails={{ name: address.name, email: user.email || '', phone: address.phone }}
                    disabled={!currentOrderId}
                  />
                ) : null}
                {paymentMethod === 'stripe' ? (
                  <StripeForm orderId={currentOrderId} amount={remaining} clientSecret={stripeClientSecret} />
                ) : null}
                {paymentMethod === 'nxl' ? (
                  <button className="btn-primary" onClick={() => payWithNxl(currentOrderId, total)} disabled={processing || !currentOrderId}>
                    Pay with NXL
                  </button>
                ) : null}
                <Link to="/cart" className="btn-ghost">
                  Back to cart
                </Link>
              </div>
            )}
          </section>

          <aside className="card h-fit p-5">
            <h3 className="font-semibold">Order Summary</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {items.map((item) => (
                <li key={item._id} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>Rs. {(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-arena-border pt-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{delivery ? `Rs. ${delivery}` : 'FREE'}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>Rs. {total.toLocaleString('en-IN')}</span></div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
