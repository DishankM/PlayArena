// server/models/AuditLog.js
import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'REGISTER',
        'PASSWORD_RESET',
        'PASSWORD_CHANGED',
        'ACCOUNT_LOCKED',
        'SUSPICIOUS_TOKEN_REUSE',
        'LOGIN_FAILED',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'PAYMENT_VERIFIED',
        'REFUND_INITIATED',
        'NXL_CREDITED',
        'NXL_DEDUCTED',
        'PRODUCT_CREATED',
        'PRODUCT_UPDATED',
        'PRODUCT_DELETED',
        'ORDER_STATUS_UPDATED',
        'USER_BLOCKED',
        'USER_UNBLOCKED',
        'TOURNAMENT_CREATED',
        'TOURNAMENT_UPDATED',
        'COUPON_CREATED',
        'COUPON_DEACTIVATED',
        'NXL_MANUAL_ADJUST',
        'QR_SCAN',
        'QR_GENERATED',
        'CORS_VIOLATION',
        'RATE_LIMIT_HIT',
        'INJECTION_ATTEMPT',
      ],
    },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    targetModel: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success',
    },
  },
  { timestamps: true }
)

auditLogSchema.index({ action: 1, createdAt: -1 })
auditLogSchema.index({ performedBy: 1, createdAt: -1 })
auditLogSchema.index({ createdAt: -1 })
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 })

export default mongoose.model('AuditLog', auditLogSchema)
