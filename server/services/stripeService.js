// server/services/stripeService.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })

export const createPaymentIntent = async (amount, currency = 'inr', metadata = {}) =>
  stripe.paymentIntents.create({
    amount: Math.round(Number(amount || 0) * 100),
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: { platform: 'PlayArena', ...metadata },
  })

export const retrievePaymentIntent = async (paymentIntentId) => stripe.paymentIntents.retrieve(paymentIntentId)

export const verifyStripeWebhook = (rawBody, signature) =>
  stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)

export const createStripeRefund = async (paymentIntentId, amount) =>
  stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: Math.round(Number(amount || 0) * 100),
    reason: 'requested_by_customer',
  })

export const getPaymentStatus = async (paymentIntentId) => {
  const intent = await retrievePaymentIntent(paymentIntentId)
  return intent.status
}
