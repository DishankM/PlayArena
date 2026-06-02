import { useState } from 'react'
import { paymentAPI } from '../../services/api'

const TournamentRazorpayButton = ({ registrationId, amount, userDetails, onSuccess, onError, disabled }) => {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handlePayment = async () => {
    setProcessing(true)
    setError('')

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK')
      }

      // Create Razorpay order
      const { data: orderRes } = await paymentAPI.post('/tournament/razorpay/create-order', {
        registrationId,
      })

      const options = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        order_id: orderRes.data.razorpayOrderId,
        name: 'PlayArena',
        description: 'Tournament Registration',
        prefill: {
          name: userDetails?.name || '',
          email: userDetails?.email || '',
          contact: userDetails?.phone || '',
        },
        theme: {
          color: '#E8420A',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false)
            onError?.('Payment cancelled')
          },
        },
        handler: async (response) => {
          try {
            const { data: verifyRes } = await paymentAPI.post(
              '/tournament/razorpay/verify',
              {
                registrationId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }
            )
            onSuccess?.(verifyRes.data.qrToken, verifyRes.data.qrDataUrl, verifyRes.data.registration)
          } catch (err) {
            onError?.(err.message || 'Verification failed')
          } finally {
            setProcessing(false)
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment failed')
        setProcessing(false)
        onError?.(response.error?.description || 'Payment failed')
      })
      rzp.open()
    } catch (err) {
      setError(err.message || 'Payment initiation failed')
      setProcessing(false)
      onError?.(err.message)
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
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-blue-800">
          <div className="flex items-center gap-1.5">
            <i className="ti ti-phone text-lg" />
            UPI
          </div>
          <div className="flex items-center gap-1.5">
            <i className="ti ti-credit-card text-lg" />
            Cards
          </div>
          <div className="flex items-center gap-1.5">
            <i className="ti ti-building-bank text-lg" />
            Netbanking
          </div>
          <div className="flex items-center gap-1.5">
            <i className="ti ti-wallet text-lg" />
            Wallets
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3">
          <i className="ti ti-alert-circle text-lg text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
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
        onClick={handlePayment}
        disabled={processing || disabled}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
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

export { TournamentRazorpayButton }
