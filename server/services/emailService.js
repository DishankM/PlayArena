import nodemailer from 'nodemailer'

const PLACEHOLDER_VALUES = ['your@gmail.com', 'your_app_password', 'your_email', 'changeme']

const isEmailConfigured = () => {
  const user = process.env.EMAIL_USER?.trim()
  const pass = process.env.EMAIL_PASS?.trim()
  if (!user || !pass) return false
  const lowerUser = user.toLowerCase()
  const lowerPass = pass.toLowerCase()
  if (PLACEHOLDER_VALUES.some((p) => lowerUser.includes(p.replace('@', '')) || lowerPass === p)) return false
  if (lowerUser.includes('your@') || lowerPass.includes('your_')) return false
  return true
}

let transporter

const getTransporter = () => {
  if (!isEmailConfigured()) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }
  return transporter
}

const sendMail = async ({ to, subject, html }) => {
  const mailer = getTransporter()
  if (!mailer) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[email] Skipped (EMAIL_USER / EMAIL_PASS not configured in server/.env)')
    }
    return { sent: false, skipped: true }
  }

  try {
    await mailer.sendMail({
      from: `"PlayArena" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
    return { sent: true }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[email] Failed to send:', error.message)
    }
    return { sent: false }
  }
}

const safeSend = (promise) => promise.catch(() => ({ sent: false }))

export const sendWelcomeEmail = (to, name) =>
  safeSend(
    sendMail({
      to,
      subject: `Welcome to PlayArena, ${name}!`,
      html: `<div style="font-family:Arial,sans-serif"><h1 style="background:#1A1A2E;color:#fff;padding:18px">PlayArena</h1><p>Welcome ${name}, your arena is ready.</p><a style="background:#1A1A2E;color:#fff;padding:12px 18px;text-decoration:none" href="${process.env.CLIENT_URL}">Start exploring</a></div>`,
    })
  )

export const sendOrderConfirmEmail = (to, order) =>
  safeSend(
    sendMail({
      to,
      subject: `Order Confirmed - PlayArena #ORD${String(order._id).slice(-6).toUpperCase()}`,
      html: `<div style="font-family:Arial,sans-serif"><h2>Order confirmed</h2><table>${(order.items || [])
        .map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>Rs. ${item.price}</td></tr>`)
        .join('')}</table><p>Total: Rs. ${order.total}</p>${order.invoiceUrl ? `<p><a href="${order.invoiceUrl}">Download invoice</a></p>` : ''}<p>Your order should arrive in 5-7 business days.</p></div>`,
    })
  )

export const sendQRPassEmail = (to, registration, tournament) =>
  safeSend(
    sendMail({
      to,
      subject: `Your QR Pass - ${tournament.name}`,
      html: `<div style="font-family:Arial,sans-serif"><h2>${tournament.name}</h2><p>Show this QR token at check-in.</p><div style="border:1px solid #1A1A2E;padding:14px;font-size:20px">${registration.qrToken}</div></div>`,
    })
  )

export const sendPasswordResetEmail = (to, resetToken) =>
  safeSend(
    sendMail({
      to,
      subject: 'Reset your PlayArena password',
      html: `<div style="font-family:Arial,sans-serif"><p>You requested a password reset.</p><a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">Reset password</a><p>Link expires in 1 hour.</p></div>`,
    })
  )
