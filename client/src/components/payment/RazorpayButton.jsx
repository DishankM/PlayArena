import { useState } from 'react'
import usePayment from '../../hooks/usePayment'

const RazorpayButton = ({ orderId, amount, userDetails, disabled }) => {
  const { payWithRazorpay, processing, error } = usePayment()
  const [localError, setLocalError] = useState('')

  const handlePay = async () => {
    setLocalError('')
    try {
      await payWithRazorpay(orderId, userDetails)
    } catch (err) {
      if (err.message !== 'Payment cancelled by user') {
        setLocalError(err.message || 'Payment failed')
        console.error('Razorpay payment error:', err.message)
      }
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-arena-border bg-white p-6">
      <div className="flex items-center gap-2 border-b border-arena-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          <i className="ti ti-wallet text-lg text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-arena-navy">Razorpay Payment</p>
          <p className="text-xs text-gray-500">Multiple payment options</p>
        </div>
      </div>

      <div className="space-y-2 rounded-md bg-blue-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-900">Accepted Payment Methods</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <i className="ti ti-phone text-base" />
            UPI
          </div>
          <div className="flex items-center gap-2">
            <i className="ti ti-credit-card text-base" />
            Credit/Debit Cards
          </div>
          <div className="flex items-center gap-2">
            <i className="ti ti-building-bank text-base" />
            Netbanking
          </div>
          <div className="flex items-center gap-2">
            <i className="ti ti-wallet text-base" />
            Digital Wallets
          </div>
          <div className="flex items-center gap-2">
            <i className="ti ti-discount-2 text-base" />
            EMI Options
          </div>
          <div className="flex items-center gap-2">
            <i className="ti ti-brand-apple text-base" />
            Apple/Google Pay
          </div>
        </div>
      </div>

      {(error || localError) && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3">
          <i className="ti ti-alert-circle text-lg text-red-500" />
          <p className="text-sm text-red-700">{error || localError}</p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-md bg-green-50 p-3">
        <span className="flex items-center gap-2 text-xs font-medium text-green-700">
          <i className="ti ti-lock text-green-600" />
          Secured by Razorpay
        </span>
        <span className="text-xs text-green-600">RBI Approved</span>
      </div>

      <div className="space-y-2 border-t border-arena-border pt-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="font-semibold text-arena-navy">₹{Number(amount || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePay}
        disabled={processing || disabled}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Pay with Razorpay"
      >
        {processing ? (
          <>
            <i className="ti ti-loader-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <i className="ti ti-lock" />
            Pay with Razorpay
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        Your payment information is encrypted and secure
      </p>
    </div>
  )
}

export { RazorpayButton }
