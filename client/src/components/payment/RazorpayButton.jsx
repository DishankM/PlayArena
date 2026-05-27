// client/src/components/payment/RazorpayButton.jsx
import usePayment from '../../hooks/usePayment'

const RazorpayButton = ({ orderId, amount, userDetails, disabled }) => {
  const { payWithRazorpay, processing, error } = usePayment()

  const handlePay = async () => {
    try {
      await payWithRazorpay(orderId, userDetails)
    } catch (err) {
      if (err.message !== 'Payment cancelled by user') {
        console.error('Razorpay payment error:', err.message)
      }
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePay}
        disabled={processing || disabled}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Pay with Razorpay"
      >
        {processing ? (
          <>
            <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
            Processing...
          </>
        ) : (
          <>
            <i className="ti ti-credit-card" aria-hidden="true" />
            Pay Rs. {Number(amount || 0).toLocaleString('en-IN')} with Razorpay
          </>
        )}
      </button>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <i className="ti ti-lock text-green-500" aria-hidden="true" />
          Secured by Razorpay
        </span>
        <span className="text-xs text-gray-400">UPI - Cards - Netbanking - Wallets - EMI</span>
      </div>
      {error ? <p className="mt-2 text-center text-xs text-red-500">{error}</p> : null}
    </div>
  )
}

export { RazorpayButton }
