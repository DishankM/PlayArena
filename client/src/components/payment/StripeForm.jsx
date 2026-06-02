import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import usePayment from '../../hooks/usePayment'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: '#1A1A2E',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': { color: '#D1D5DB' },
      lineHeight: '1.6',
      letterSpacing: '0.5px',
    },
    invalid: { color: '#EF4444' },
  },
}

const CheckoutForm = ({ orderId, amount, clientSecret }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { confirmStripePayment } = usePayment()
  const [cardError, setCardError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setCardError('')
    const cardElement = elements.getElement(CardElement)
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })
    if (error) {
      setCardError(error.message || 'Payment failed')
      setSubmitting(false)
      return
    }
    if (paymentIntent?.status === 'succeeded') await confirmStripePayment(orderId, paymentIntent.id)
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-arena-border bg-white p-6">
      <div className="flex items-center gap-2 border-b border-arena-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-arena-primary/10">
          <i className="ti ti-credit-card text-lg text-arena-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-arena-navy">Stripe Payment</p>
          <p className="text-xs text-gray-500">Secure card payment</p>
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Card Details</p>
        <div className="rounded-md border border-arena-border bg-arena-surface p-4 transition-colors focus-within:border-arena-primary">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {cardError && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3">
          <i className="ti ti-alert-circle text-lg text-red-500" />
          <p className="text-sm text-red-700">{cardError}</p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-md bg-green-50 p-3">
        <span className="flex items-center gap-2 text-xs font-medium text-green-700">
          <i className="ti ti-lock text-green-600" />
          Secured by Stripe
        </span>
        <span className="text-xs text-green-600">PCI Compliant</span>
      </div>

      <div className="space-y-2 border-t border-arena-border pt-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="font-semibold text-arena-navy">₹{Number(amount || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <i className="ti ti-loader-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <i className="ti ti-lock" />
            Pay securely with Stripe
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        Your payment information is encrypted and secure
      </p>
    </form>
  )
}

const StripeForm = ({ orderId, amount, clientSecret }) => {
  if (!clientSecret) return null
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm orderId={orderId} amount={amount} clientSecret={clientSecret} />
    </Elements>
  )
}

export { StripeForm }
