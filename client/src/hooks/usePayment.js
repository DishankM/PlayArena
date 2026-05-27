// client/src/hooks/usePayment.js
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCart } from '../store/slices/cartSlice'
import { paymentAPI } from '../services/api'

const usePayment = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const payWithRazorpay = async (orderId, userDetails) => {
    setProcessing(true)
    setError('')
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Failed to load Razorpay. Check your internet connection.')
      const { data: createRes } = await paymentAPI.post('/razorpay/create-order', { orderId })
      const { razorpayOrderId, amount, currency, keyId } = createRes.data.data

      return await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          name: 'PlayArena',
          description: 'Order payment',
          order_id: razorpayOrderId,
          prefill: { name: userDetails.name, email: userDetails.email, contact: userDetails.phone },
          theme: { color: '#E8420A' },
          modal: {
            ondismiss: () => {
              setProcessing(false)
              reject(new Error('Payment cancelled by user'))
            },
          },
          handler: async (response) => {
            try {
              const { data: verifyRes } = await paymentAPI.post('/razorpay/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId,
              })
              dispatch(clearCart())
              setProcessing(false)
              navigate('/payment/success', {
                state: { orderId, invoiceUrl: verifyRes.data.invoiceUrl, paymentMethod: 'razorpay' },
              })
              resolve(verifyRes.data)
            } catch (verifyError) {
              setProcessing(false)
              navigate('/payment/failed', { state: { orderId, reason: verifyError.message } })
              reject(verifyError)
            }
          },
        })
        rzp.on('payment.failed', (response) => {
          setProcessing(false)
          const reason = response.error?.description || 'Payment failed'
          navigate('/payment/failed', { state: { orderId, reason } })
          reject(new Error(reason))
        })
        rzp.open()
      })
    } catch (err) {
      setProcessing(false)
      setError(err.message)
      throw err
    }
  }

  const createStripeIntent = async (orderId) => {
    setProcessing(true)
    setError('')
    try {
      const { data } = await paymentAPI.post('/stripe/create-intent', { orderId })
      setProcessing(false)
      return data.data
    } catch (err) {
      setProcessing(false)
      setError(err.message)
      throw err
    }
  }

  const confirmStripePayment = async (orderId, paymentIntentId) => {
    setProcessing(true)
    setError('')
    try {
      const { data } = await paymentAPI.post('/stripe/verify', { orderId, paymentIntentId })
      dispatch(clearCart())
      setProcessing(false)
      navigate('/payment/success', { state: { orderId, invoiceUrl: data.data.invoiceUrl, paymentMethod: 'stripe' } })
      return data.data
    } catch (err) {
      setProcessing(false)
      navigate('/payment/failed', { state: { orderId, reason: err.message } })
      throw err
    }
  }

  const payWithNxl = async (orderId, nxlAmount) => {
    setProcessing(true)
    setError('')
    try {
      const { data } = await paymentAPI.post('/nxl', { orderId, nxlAmount })
      if (!data.data.requiresGateway) {
        dispatch(clearCart())
        navigate('/payment/success', {
          state: { orderId, invoiceUrl: data.data.invoiceUrl, paymentMethod: 'nxl', nxlUsed: nxlAmount },
        })
      }
      setProcessing(false)
      return data.data
    } catch (err) {
      setProcessing(false)
      setError(err.message)
      throw err
    }
  }

  return { processing, error, payWithRazorpay, createStripeIntent, confirmStripePayment, payWithNxl, setError }
}

export default usePayment
