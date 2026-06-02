import crypto from 'crypto'

export const generateReceipt = (userId) => `rcpt_${String(userId).slice(-6)}_${Date.now()}`

export const generatePaymentRef = () => `PAY_${crypto.randomBytes(8).toString('hex').toUpperCase()}`

export const calculateOrderTotal = (subtotal, discount, nxlUsed, deliveryFee) => {
  const afterDiscount = Number(subtotal || 0) - Number(discount || 0)
  const afterNxl = afterDiscount - Number(nxlUsed || 0)
  const total = afterNxl + Number(deliveryFee || 0)
  return {
    subtotal: Number(subtotal || 0),
    discount: Number(discount || 0),
    nxlUsed: Number(nxlUsed || 0),
    deliveryFee: Number(deliveryFee || 0),
    total: Math.max(total, 0),
  }
}

export const calculateDeliveryFee = (subtotal) => (Number(subtotal || 0) >= 999 ? 0 : 49)

export const validatePaymentAmount = (paidAmount, expectedAmount) =>
  Math.abs(Number(paidAmount || 0) - Number(expectedAmount || 0)) <= 1

export const formatAmount = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`

export const isNxlEligible = (orderTotal, userNxlBalance) => Number(userNxlBalance || 0) > 0 && Number(orderTotal || 0) > 0
