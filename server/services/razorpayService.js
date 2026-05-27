// server/services/razorpayService.js
import crypto from 'crypto'
import Razorpay from 'razorpay'

let razorpayClient

const getRazorpayClient = () => {
  if (razorpayClient) return razorpayClient
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.')
  }
  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
  return razorpayClient
}

export const createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  const razorpay = getRazorpayClient()
  const options = {
    amount: Math.round(Number(amount || 0) * 100),
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    payment_capture: 1,
  }
  return razorpay.orders.create(options)
}

export const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body)
    .digest('hex')

  const expected = Buffer.from(expectedSignature, 'hex')
  const received = Buffer.from(String(razorpaySignature || ''), 'hex')
  if (!expected.length || expected.length !== received.length) return false
  return crypto.timingSafeEqual(expected, received)
}

export const verifyWebhookSignature = (rawBody, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
    .update(rawBody)
    .digest('hex')
  const expected = Buffer.from(expectedSignature, 'utf8')
  const received = Buffer.from(String(signature || ''), 'utf8')
  if (!expected.length || expected.length !== received.length) return false
  return crypto.timingSafeEqual(expected, received)
}

export const fetchRazorpayPayment = async (paymentId) => {
  const razorpay = getRazorpayClient()
  return razorpay.payments.fetch(paymentId)
}

export const initiateRazorpayRefund = async (paymentId, amount) =>
  getRazorpayClient().payments.refund(paymentId, {
    amount: Math.round(Number(amount || 0) * 100),
    speed: 'normal',
    notes: { reason: 'Order cancellation refund - PlayArena' },
  })

export const fetchRazorpayPayments = async (from, to, count = 20) =>
  getRazorpayClient().payments.all({ from, to, count })
