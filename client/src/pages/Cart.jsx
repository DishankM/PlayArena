// client/src/pages/Cart.jsx

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'
import { updateQuantity, removeFromCart } from '../store/slices/cartSlice'
import { mockCoupons, mockUser } from '../data/mockData'
import { formatPrice, calculateNXL } from '../utils/helpers'

const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

export default function Cart() {
  const dispatch = useDispatch()
  const { items, total, itemCount } = useSelector((state) => state.cart)
  const wallet = useSelector((state) => state.wallet)
  const nxlBalance = wallet.nxlCredits || mockUser.nxlCredits

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [useNxl, setUseNxl] = useState(false)
  const [nxlToUse, setNxlToUse] = useState(0)

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0
    if (total < appliedCoupon.minOrderAmount) return 0
    return appliedCoupon.discountType === 'percent'
      ? Math.round((total * appliedCoupon.discountValue) / 100)
      : appliedCoupon.discountValue
  }, [appliedCoupon, total])

  const delivery = total - discount >= 999 || total === 0 ? 0 : 49
  const subtotalAfterDiscount = Math.max(0, total - discount)
  const maxNxl = Math.min(nxlBalance, subtotalAfterDiscount + delivery)
  const nxlApplied = useNxl ? Math.min(nxlToUse || maxNxl, maxNxl) : 0
  const grandTotal = Math.max(0, subtotalAfterDiscount + delivery - nxlApplied)
  const nxlToEarn = calculateNXL(grandTotal)

  const handleApplyCoupon = () => {
    setCouponError('')
    setCouponSuccess('')
    const found = mockCoupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase())
    if (!found) {
      setCouponError('Invalid coupon code.')
      return
    }
    if (total < found.minOrderAmount) {
      setCouponError(`Minimum order amount is ${formatPrice(found.minOrderAmount)}.`)
      return
    }
    setAppliedCoupon(found)
    setCouponSuccess(`Coupon ${found.code} applied successfully!`)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponSuccess('')
    setCouponError('')
  }

  const handleUpdateQty = (id, qty) => dispatch(updateQuantity({ id, quantity: qty }))
  const handleRemove = (id) => dispatch(removeFromCart(id))

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-[#0B1020]">
        <Navbar />
        <main className="mx-auto max-w-lg px-6 py-24 text-center">
          <div className="flex flex-col items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/5">
              <i className="ti ti-shopping-cart-off text-5xl text-gray-500" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-white">Your cart is empty</h1>
            <p className="mt-2 text-gray-400">Looks like you haven't added anything yet.</p>
            <Link to="/store" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02]">
              <i className="ti ti-shopping-bag" />
              Continue Shopping
            </Link>
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
        <h1 className="text-3xl font-bold text-white">Shopping Cart ({itemCount} items)</h1>
        
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item._id} className={`${glassCard} flex gap-4 p-4`}>
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-2">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                  ) : (
                    <i className="ti ti-shirt text-2xl text-gray-500" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                    {item.category?.replace('-', ' ')}
                  </span>
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5">
                    <i className="ti ti-coin text-amber-400 text-xs" />
                    <span className="text-xs font-medium text-amber-300">Earn {calculateNXL(item.price * item.quantity)} NXL</span>
                  </div>
                  <button onClick={() => handleRemove(item._id)} className="mt-2 flex items-center gap-1 text-sm text-red-400 hover:text-red-300">
                    <i className="ti ti-trash text-xs" />
                    Remove
                  </button>
                </div>
                
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center rounded-xl border border-white/20 bg-white/[0.03]">
                    <button onClick={() => handleUpdateQty(item._id, item.quantity - 1)} className="px-2 py-1 text-gray-400 hover:text-white">
                      <i className="ti ti-minus text-sm" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => handleUpdateQty(item._id, item.quantity + 1)} className="px-2 py-1 text-gray-400 hover:text-white">
                      <i className="ti ti-plus text-sm" />
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-sky-400">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                </div>
              </div>
            ))}
            
            <Link to="/store" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors">
              <i className="ti ti-arrow-left" />
              Continue shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className={`${glassCard} sticky top-24 h-fit p-6`}>
            <h2 className="text-lg font-bold text-white">Order Summary</h2>
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{formatPrice(total)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery</span>
                <span className={delivery === 0 ? 'font-semibold text-green-400' : 'text-white'}>
                  {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                </span>
              </div>
            </div>

            <div className="my-4 border-t border-white/10" />

            {/* Coupon */}
            <label className="text-sm font-medium text-gray-300">Coupon code</label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="PLAY10"
                disabled={!!appliedCoupon}
                className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none disabled:opacity-50"
              />
              {!appliedCoupon ? (
                <button onClick={handleApplyCoupon} className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white">Apply</button>
              ) : (
                <button onClick={handleRemoveCoupon} className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-gray-400 hover:text-white">
                  <i className="ti ti-x" />
                </button>
              )}
            </div>
            {couponError && <p className="mt-1 text-sm text-red-400">{couponError}</p>}
            {couponSuccess && <p className="mt-1 flex items-center gap-1 text-sm text-green-400"><i className="ti ti-check" />{appliedCoupon?.code} applied</p>}

            {/* NXL Credits */}
            <div className="mt-6 rounded-xl bg-amber-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Use NXL credits</span>
                <button onClick={() => setUseNxl(!useNxl)} className={`relative h-6 w-11 rounded-full transition-colors ${useNxl ? 'bg-amber-500' : 'bg-gray-600'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${useNxl ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">Balance: {nxlBalance.toLocaleString()} NXL</p>
              {useNxl && (
                <input type="number" min={1} max={maxNxl} value={nxlToUse} onChange={(e) => setNxlToUse(Math.min(maxNxl, Math.max(0, Number(e.target.value))))} className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-white" />
              )}
            </div>

            <div className="my-4 border-t border-white/10" />
            
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total</span>
              <span className="text-sky-400">{formatPrice(grandTotal)}</span>
            </div>
            
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1">
              <i className="ti ti-coin text-amber-400 text-sm" />
              <span className="text-sm font-medium text-amber-300">You'll earn {nxlToEarn} NXL on this order</span>
            </div>

            <Link to="/checkout" className="mt-6 block w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 py-3 text-center font-semibold text-white transition-all hover:scale-[1.02]">
              Proceed to Checkout
            </Link>

            <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><i className="ti ti-lock" /> Secure checkout</span>
              <span className="flex items-center gap-1"><i className="ti ti-shield-check" /> SSL encrypted</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}