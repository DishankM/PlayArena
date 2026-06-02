import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { paymentAPI } from '../../services/api'

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
      onSuccess(data.data.qrToken, data.data.qrDataUrl, data.data.registration)
    } catch (err) {
      onError(err.message || 'Stripe verification failed')
    } finally {
      setSubmitting(false)
    }
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
        disabled={submitting || !stripe}
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
