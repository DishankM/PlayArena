// client/src/pages/Checkout.jsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'
import { formatPrice, calculateNXL } from '../utils/helpers'

const steps = ['Address', 'Payment', 'Confirm']
const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

export default function Checkout() {
  const { items, total } = useSelector((state) => state.cart)
  const wallet = useSelector((state) => state.wallet)
  const user = useSelector((state) => state.auth.user) || {}
  const nxlCredits = wallet.nxlCredits || user.nxlCredits || 0

  const [step, setStep] = useState(1)
  const [address, setAddress] = useState({
    name: user.name || '',
    phone: user.phone || '',
    street: user.address?.street || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    pincode: user.address?.pincode || '',
    country: user.address?.country || 'India',
  })
  const [saveAddress, setSaveAddress] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [processing, setProcessing] = useState(false)
  const [orderId, setOrderId] = useState('')

  const delivery = total >= 999 ? 0 : 49
  const orderTotal = total + delivery
  const nxlEarned = calculateNXL(orderTotal)
  const nxlInsufficient = paymentMethod === 'nxl' && nxlCredits < orderTotal

  const handleAddressChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleContinueToPayment = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePlaceOrder = () => {
    if (nxlInsufficient) return
    setProcessing(true)
    setTimeout(() => {
      setOrderId('Payment integration coming Day 5')
      setProcessing(false)
      setStep(3)
    }, 2000)
  }

  const StepIndicator = () => (
    <div className="mb-10 flex items-center justify-center gap-4">
      {steps.map((label, i) => {
        const num = i + 1
        const done = step > num
        const active = step === num
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
              done ? 'bg-green-500 text-white' : active ? 'bg-sky-500 text-white' : 'bg-white/10 text-gray-400'
            }`}>
              {done ? <i className="ti ti-check" /> : num}
            </div>
            <span className={`hidden text-sm sm:inline ${active ? 'font-semibold text-white' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < steps.length - 1 && <div className="mx-2 hidden h-px w-12 bg-white/10 sm:block" />}
          </div>
        )
      })}
    </div>
  )

  const OrderSummary = () => (
    <div className={`${glassCard} sticky top-24 p-6`}>
      <h2 className="text-lg font-bold text-white">Your Order</h2>
      <ul className="mt-4 max-h-48 space-y-3 overflow-y-auto">
        {items.map((item) => (
          <li key={item._id} className="flex gap-3 text-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <i className="ti ti-shirt text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{item.name}</p>
              <p className="text-xs text-gray-400">Qty {item.quantity}</p>
            </div>
            <p className="font-semibold text-sky-400">{formatPrice(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="my-4 border-t border-white/10" />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>{formatPrice(total)}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Delivery</span><span className="text-green-400">{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span></div>
      </div>
      <div className="my-4 border-t border-white/10" />
      <div className="flex justify-between font-bold">
        <span className="text-white">Total</span>
        <span className="text-sky-400">{formatPrice(orderTotal)}</span>
      </div>
      {paymentMethod !== 'nxl' && step < 3 && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1">
          <i className="ti ti-coin text-amber-400 text-sm" />
          <span className="text-sm font-medium text-amber-300">Earn {nxlEarned} NXL</span>
        </div>
      )}
    </div>
  )

  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#0B1020]">
        <Navbar />
        <main className="mx-auto max-w-lg px-6 py-16 text-center">
          <div className={`${glassCard} p-8`}>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <i className="ti ti-check text-4xl text-green-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-white">Order Placed Successfully! 🎉</h1>
            <p className="mt-2 text-gray-400">Order ID: #ORD-{orderId}</p>
            <div className="mt-6 rounded-xl bg-amber-500/10 p-4">
              <p className="font-semibold text-amber-400">You earned {nxlEarned} NXL credits on this order!</p>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/dashboard" className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-2.5 font-semibold text-white">View Order</Link>
              <Link to="/store" className="rounded-xl border border-white/20 bg-white/5 px-6 py-2.5 font-semibold text-white hover:bg-white/10">Continue Shopping</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <h1 className="text-3xl font-bold text-white">Checkout</h1>
        <StepIndicator />
        
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column */}
          <div>
            {step === 1 && (
              <form onSubmit={handleContinueToPayment} className={`${glassCard} p-6`}>
                <h2 className="text-xl font-bold text-white">Delivery Address</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-300">Full name</label>
                    <input name="name" value={address.name} onChange={handleAddressChange} className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-300">Phone</label>
                    <input name="phone" value={address.phone} onChange={handleAddressChange} className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-300">Street / House no.</label>
                    <input name="street" value={address.street} onChange={handleAddressChange} className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">City</label>
                    <input name="city" value={address.city} onChange={handleAddressChange} className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">State</label>
                    <input name="state" value={address.state} onChange={handleAddressChange} className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Pincode</label>
                    <input name="pincode" value={address.pincode} onChange={handleAddressChange} className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Country</label>
                    <input name="country" value={address.country} onChange={handleAddressChange} className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" required />
                  </div>
                </div>
                <label className="mt-4 flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="rounded border-white/20 bg-white/5 text-sky-400" />
                  Save this address
                </label>
                <button type="submit" className="mt-6 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02]">Continue to Payment</button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Payment Method</h2>
                {[
                  { id: 'razorpay', title: 'Razorpay', letter: 'R', letterBg: 'bg-sky-600', sub: 'UPI, Credit/Debit Cards, Netbanking', tags: ['UPI', 'VISA', 'Mastercard'] },
                  { id: 'stripe', title: 'Stripe', letter: 'S', letterBg: 'bg-purple-600', sub: 'International Cards, 3D Secure', tags: ['VISA', 'Mastercard', 'AMEX'] },
                  { id: 'nxl', title: 'NXL Credits / Wallet', letter: null, sub: `${nxlCredits.toLocaleString()} NXL available (= ${formatPrice(nxlCredits)})`, tags: [], gold: true },
                ].map((opt) => (
                  <label key={opt.id} className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-all ${paymentMethod === opt.id ? 'border-sky-400 bg-sky-500/10' : 'border-white/10 bg-white/[0.03]'}`}>
                    <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} className="mt-1" />
                    {opt.gold ? (
                      <i className="ti ti-coin text-3xl text-amber-400" />
                    ) : (
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-bold ${opt.letterBg}`}>{opt.letter}</span>
                    )}
                    <div>
                      <p className="font-semibold text-white">{opt.title}</p>
                      <p className="text-sm text-gray-400">{opt.sub}</p>
                      {opt.id === 'nxl' && nxlCredits < orderTotal && <p className="mt-1 text-sm text-red-400">Insufficient NXL credits</p>}
                      <div className="mt-2 flex flex-wrap gap-1">{opt.tags.map((t) => (<span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-400">{t}</span>))}</div>
                    </div>
                  </label>
                ))}
                <button onClick={handlePlaceOrder} disabled={processing || nxlInsufficient} className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 py-3 font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50">
                  {processing ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column */}
          <OrderSummary />
        </div>
      </main>
      <Footer />
    </div>
  )
}
