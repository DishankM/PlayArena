import PDFDocument from 'pdfkit'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import Order from '../models/Order.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const generateInvoicePDF = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate('user', 'name email phone address')
    .populate('items.product', 'name category')
    .lean()
  if (!order) throw new Error('Order not found for invoice')

  const invoiceNumber = `INV-${String(order._id).slice(-8).toUpperCase()}`
  const issueDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const buffers = []
    doc.on('data', (chunk) => buffers.push(chunk))
    doc.on('error', reject)
    doc.on('end', async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers)
        const result = await new Promise((res, rej) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'playarena/invoices',
              resource_type: 'raw',
              public_id: `invoice_${invoiceNumber}`,
              format: 'pdf',
            },
            (error, uploaded) => (error ? rej(error) : res(uploaded))
          )
          Readable.from(pdfBuffer).pipe(uploadStream)
        })
        resolve(result.secure_url)
      } catch (error) {
        reject(error)
      }
    })

    const user = order.user || {}
    let y = 50
    doc.fontSize(20).text('PlayArena Invoice', 50, y)
    y += 30
    doc.fontSize(11).text(`Invoice: ${invoiceNumber}`, 50, y)
    doc.text(`Date: ${issueDate}`, 320, y, { align: 'right' })
    y += 24
    doc.text(`Customer: ${user.name || 'Customer'}`, 50, y)
    doc.text(`Email: ${user.email || '-'}`, 50, y + 16)
    doc.text(`Order: #${String(order._id).slice(-8).toUpperCase()}`, 320, y, { align: 'right' })
    y += 50

    doc.fontSize(12).text('Items', 50, y)
    y += 20
    order.items.forEach((item, idx) => {
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0)
      doc.fontSize(10).text(`${idx + 1}. ${item.name}`, 50, y)
      doc.text(`Qty ${item.quantity}`, 300, y)
      doc.text(`Rs. ${lineTotal.toLocaleString('en-IN')}`, 450, y, { align: 'right' })
      y += 18
    })

    y += 18
    doc.text(`Subtotal: Rs. ${Number(order.subtotal || 0).toLocaleString('en-IN')}`, 300, y, { align: 'right' })
    y += 16
    doc.text(`Discount: -Rs. ${Number(order.discount || 0).toLocaleString('en-IN')}`, 300, y, { align: 'right' })
    y += 16
    doc.text(`NXL used: -Rs. ${Number(order.nxlUsed || 0).toLocaleString('en-IN')}`, 300, y, { align: 'right' })
    y += 16
    doc.fontSize(12).text(`Total Paid: Rs. ${Number(order.total || 0).toLocaleString('en-IN')}`, 300, y, {
      align: 'right',
    })
    y += 28
    doc.fontSize(10).text(`Payment Method: ${(order.paymentMethod || 'unknown').toUpperCase()}`, 50, y)
    doc.text(`Status: ${String(order.paymentStatus || '').toUpperCase()}`, 320, y, { align: 'right' })
    doc.end()
  })
}
