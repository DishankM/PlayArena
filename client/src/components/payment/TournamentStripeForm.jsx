// client/src/components/payment/TournamentStripeForm.jsx
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { paymentAPI } from '../../services/api'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const TournamentStripeInner = ({ registrationId, clientSecret, amount, onSuccess, onError }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [cardError, setCardError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setCardError('')

    try {
      const card = elements.getElement(CardElement)
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      })
      if (error) {
        setCardError(error.message || 'Card payment failed')
        setSubmitting(false)
        return
      }
      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        setCardError('Payment not completed')
        setSubmitting(false)
        return
      }
      const { data } = await paymentAPI.post('/tournament/stripe/verify', {
        registrationId,
        paymentIntentId: paymentIntent.id,
      })
      onSuccess(data.data.qrToken)
    } catch (err) {
      onError(err.message || 'Stripe verification failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-white/15 bg-white/5 p-4">
      <p className="text-sm font-semibold text-white">Complete Stripe Payment</p>
      <p className="mt-1 text-xs text-gray-400">Amount: ₹{Number(amount || 0).toLocaleString('en-IN')}</p>
      <div className="mt-3 rounded-md border border-arena-border bg-white p-3">
        <CardElement />
      </div>
      {cardError ? <p className="mt-2 text-xs text-red-400">{cardError}</p> : null}
      <button type="submit" disabled={submitting || !stripe} className="btn-primary mt-3 w-full">
        {submitting ? 'Processing...' : 'Pay with Stripe'}
      </button>
    </form>
  )
}

const TournamentStripeForm = ({ registrationId, clientSecret, amount, onSuccess, onError }) => {
  if (!registrationId || !clientSecret) return null
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <TournamentStripeInner
        registrationId={registrationId}
        clientSecret={clientSecret}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}

export { TournamentStripeForm }
