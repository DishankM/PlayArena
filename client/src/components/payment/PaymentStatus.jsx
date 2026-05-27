// client/src/components/payment/PaymentStatus.jsx
const PaymentStatus = ({ status, message }) => {
  const map = {
    success: 'text-green-600 bg-green-50 border-green-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    pending: 'text-amber-700 bg-amber-50 border-amber-200',
  }
  const classes = map[status] || map.pending
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${classes}`}>
      <i className={`ti ${status === 'success' ? 'ti-circle-check' : status === 'error' ? 'ti-alert-circle' : 'ti-loader-2 animate-spin'} mr-2`} />
      {message}
    </div>
  )
}

export { PaymentStatus }
