// client/src/components/admin/OrderStatusBadge.jsx

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const OrderStatusBadge = ({ status }) => (
  <span
    className={`badge capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}
  >
    {status}
  </span>
)
