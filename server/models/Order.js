import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number,
        name: String,
      },
    ],
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    nxlUsed: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'wallet', 'nxl'],
    },
    paymentId: String,
    razorpayOrderId: String,
    stripePaymentIntentId: String,
    paidAt: Date,
    partialNxlApplied: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    couponCode: String,
    invoiceUrl: String,
    refundStatus: {
      type: String,
      enum: ['none', 'initiated', 'processed'],
      default: 'none',
    },
    refundReason: String,
  },
  { timestamps: true }
)

orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ paymentStatus: 1 })
orderSchema.index({ orderStatus: 1 })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ 'items.product': 1 })
orderSchema.index({ razorpayOrderId: 1 }, { sparse: true })
orderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true })

export default mongoose.model('Order', orderSchema)
