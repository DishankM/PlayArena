import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'
import { ProductCard } from '../components/products/ProductCard'
import { authAPI } from '../services/api'
import { setCredentials } from '../store/slices/authSlice'
import { getWishlistProducts } from '../utils/wishlist'

export default function Wishlist() {
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    authAPI
      .get('/me')
      .then((res) => {
        if (active) {
          dispatch(setCredentials({ user: res.data.data.user, token }))
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [dispatch, token])

  const products = getWishlistProducts(user?.wishlist)

  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-1.5">
              <i className="ti ti-heart text-sm text-red-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-300">Wishlist</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Saved products</h1>
            <p className="mt-2 text-gray-400">Keep track of gear you want to buy later.</p>
          </div>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all hover:border-sky-400 hover:bg-sky-500/10"
          >
            <i className="ti ti-shopping-bag" />
            Browse Store
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-2xl bg-white/10" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} showWishlistRemove />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-16 text-center">
            <i className="ti ti-heart text-5xl text-gray-600" />
            <h2 className="mt-4 text-xl font-bold">Your wishlist is empty</h2>
            <p className="mt-2 text-gray-400">Save products from the store and they will appear here.</p>
            <Link
              to="/store"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-2.5 font-semibold text-white transition-all hover:scale-[1.02]"
            >
              <i className="ti ti-shopping-bag" />
              Browse Store
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
