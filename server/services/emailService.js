// server/services/emailService.js
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const sendMail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return { sent: false }
    await transporter.sendMail({
      from: `"PlayArena" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
    return { sent: true }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { sent: false }
  }
}

export const sendWelcomeEmail = (to, name) =>
  sendMail({
    to,
    subject: `Welcome to PlayArena, ${name}!`,
    html: `<div style="font-family:Arial,sans-serif"><h1 style="background:#1A1A2E;color:#fff;padding:18px">PlayArena</h1><p>Welcome ${name}, your arena is ready.</p><a style="background:#1A1A2E;color:#fff;padding:12px 18px;text-decoration:none" href="${process.env.CLIENT_URL}">Start exploring</a></div>`,
  })

export const sendOrderConfirmEmail = (to, order) =>
  sendMail({
    to,
    subject: `Order Confirmed - PlayArena #ORD${String(order._id).slice(-6).toUpperCase()}`,
    html: `<div style="font-family:Arial,sans-serif"><h2>Order confirmed</h2><table>${order.items
      .map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>Rs. ${item.price}</td></tr>`)
      .join('')}</table><p>Total: Rs. ${order.total}</p><p>Your order should arrive in 5-7 business days.</p></div>`,
  })

export const sendQRPassEmail = (to, registration, tournament) =>
  sendMail({
    to,
    subject: `Your QR Pass - ${tournament.name}`,
    html: `<div style="font-family:Arial,sans-serif"><h2>${tournament.name}</h2><p>Show this QR token at check-in.</p><div style="border:1px solid #1A1A2E;padding:14px;font-size:20px">${registration.qrToken}</div></div>`,
  })

export const sendPasswordResetEmail = (to, resetToken) =>
  sendMail({
    to,
    subject: 'Reset your PlayArena password',
    html: `<div style="font-family:Arial,sans-serif"><p>You requested a password reset.</p><a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">Reset password</a><p>Link expires in 1 hour.</p></div>`,
  })
