// client/src/components/products/ProductListRow.jsx

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { addToCart } from '../../store/slices/cartSlice'
import { setCredentials } from '../../store/slices/authSlice'
import { authAPI } from '../../services/api'
import { calculateNXL, formatPrice } from '../../utils/helpers'
import { isInWishlist } from '../../utils/wishlist'
import { StarRating } from '../common/StarRating'
import useToast from '../../hooks/useToast'

export const ProductListRow = ({ product }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated, user, token } = useSelector((state) => state.auth)
  const { _id, name, slug, category, price, originalPrice, images, ratings, stock = 10 } = product
  const nxlEarn = calculateNXL(price)
  const isOutOfStock = stock === 0
  const isWishlisted = isInWishlist(user?.wishlist, _id)
  const [wishlistSaving, setWishlistSaving] = useState(false)

  const handleAddToCart = () => {
    dispatch(addToCart({
      _id, name, slug, category, price,
      image: images?.[0] || '',
      quantity: 1,
    }))
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save items')
      navigate('/login')
      return
    }

    setWishlistSaving(true)
    try {
      const res = await authAPI.patch(`/wishlist/${_id}`)
      dispatch(setCredentials({ user: res.data.data.user, token }))
      toast.success(res.data.message)
    } catch (error) {
      toast.error(error.message || 'Could not update wishlist')
    } finally {
      setWishlistSaving(false)
    }
  }

  return (
    <article className="group flex gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-all hover:border-sky-400/50 hover:shadow-xl">
      <Link to={`/store/${slug}`} className="shrink-0">
        <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-2">
          {images?.[0] ? (
            <img src={images[0]} alt={name} className="h-full w-full object-contain" />
          ) : (
            <i className="ti ti-shirt text-3xl text-gray-500" />
          )}
        </div>
      </Link>
      
      <div className="flex min-w-0 flex-1 flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            {category?.replace('-', ' ')}
          </span>
          <Link to={`/store/${slug}`}>
            <h3 className="text-base font-bold text-white hover:text-sky-400 transition-colors">
              {name}
            </h3>
          </Link>
          <div className="mt-1">
            <StarRating rating={ratings?.average || 0} count={ratings?.count} color="text-amber-400" />
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5">
            <i className="ti ti-coin text-amber-400 text-xs" />
            <span className="text-xs font-medium text-amber-300">Earn {nxlEarn} NXL</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-4 sm:mt-0">
          <div className="text-right">
            <p className="text-lg font-bold text-sky-400">{formatPrice(price)}</p>
            {originalPrice && originalPrice > price && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleToggleWishlist}
            disabled={wishlistSaving}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-gray-300 transition-all hover:border-red-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <i className={`ti ti-heart text-lg ${isWishlisted ? 'text-red-500' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
