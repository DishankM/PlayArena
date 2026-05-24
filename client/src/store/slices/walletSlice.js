import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  balance: 0,
  nxlCredits: 0,
  transactions: [],
  loading: false,
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWallet: (state, action) => {
      const { balance, nxlCredits, transactions } = action.payload
      if (balance !== undefined) state.balance = balance
      if (nxlCredits !== undefined) state.nxlCredits = nxlCredits
      if (transactions) state.transactions = transactions
    },
    updateBalance: (state, action) => {
      const { balance, nxlCredits } = action.payload
      if (balance !== undefined) state.balance = balance
      if (nxlCredits !== undefined) state.nxlCredits = nxlCredits
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload)
    },
    setWalletLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setWallet, updateBalance, addTransaction, setWalletLoading } =
  walletSlice.actions
export default walletSlice.reducer
