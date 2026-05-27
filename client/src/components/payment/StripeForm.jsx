// client/src/components/payment/StripeForm.jsx
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import usePayment from '../../hooks/usePayment'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

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
    <form onSubmit={handleSubmit}>
      <div className="mb-4 rounded-md border border-arena-border bg-white p-3 transition-colors focus-within:border-arena-primary">
        <CardElement
          options={{
            style: {
              base: { fontSize: '14px', color: '#1A1A1A', fontFamily: 'Inter, system-ui, sans-serif', '::placeholder': { color: '#9CA3AF' } },
              invalid: { color: '#DC2626' },
            },
          }}
        />
      </div>
      {cardError ? <p className="mb-3 text-xs text-red-500">{cardError}</p> : null}
      <button type="submit" disabled={!stripe || submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? (
          <>
            <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
            Processing...
          </>
        ) : (
          <>
            <i className="ti ti-lock" aria-hidden="true" />
            Pay Rs. {Number(amount || 0).toLocaleString('en-IN')} securely
          </>
        )}
      </button>
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
