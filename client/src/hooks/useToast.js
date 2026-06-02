// client/src/hooks/useToast.js
import toast from 'react-hot-toast'

const useToast = () => ({
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  loading: (msg) => toast.loading(msg),
  dismiss: (id) => toast.dismiss(id),
  nxl: (credits) =>
    toast(`🪙 +${credits} NXL credits earned!`, {
      style: {
        background: '#1A1A2E',
        color: '#F7C948',
        fontWeight: '600',
      },
      duration: 4000,
    }),
  cartAdded: (productName) =>
    toast.success(`${productName} added to cart`, { duration: 2000 }),
  paymentSuccess: () =>
    toast.success('Payment successful! Order confirmed.', { duration: 5000 }),
})

export default useToast
