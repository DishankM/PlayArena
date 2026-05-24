import { useSelector, useDispatch } from 'react-redux'
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from '../store/slices/cartSlice'

export const useCart = () => {
  const dispatch = useDispatch()
  const cart = useSelector((state) => state.cart)

  return {
    ...cart,
    addItem: (product) => dispatch(addToCart(product)),
    removeItem: (id) => dispatch(removeFromCart(id)),
    setQuantity: (id, quantity) => dispatch(updateQuantity({ id, quantity })),
    emptyCart: () => dispatch(clearCart()),
  }
}
