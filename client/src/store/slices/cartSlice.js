import { createSlice } from '@reduxjs/toolkit'

const calcTotals = (items) => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return { itemCount, total }
}

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  nxlApplied: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const incoming = action.payload
      const existing = state.items.find((item) => item._id === incoming._id)
      if (existing) {
        existing.quantity += incoming.quantity || 1
      } else {
        state.items.push({ ...incoming, quantity: incoming.quantity || 1 })
      }
      const totals = calcTotals(state.items)
      state.total = totals.total
      state.itemCount = totals.itemCount
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload)
      const totals = calcTotals(state.items)
      state.total = totals.total
      state.itemCount = totals.itemCount
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find((i) => i._id === id)
      if (item) {
        item.quantity = Math.max(1, quantity)
      }
      const totals = calcTotals(state.items)
      state.total = totals.total
      state.itemCount = totals.itemCount
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
      state.itemCount = 0
      state.nxlApplied = 0
    },
    applyNxl: (state, action) => {
      state.nxlApplied = action.payload
    },
    removeNxl: (state) => {
      state.nxlApplied = 0
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyNxl,
  removeNxl,
} = cartSlice.actions
export default cartSlice.reducer
