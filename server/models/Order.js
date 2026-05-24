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
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
