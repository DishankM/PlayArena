// client/src/components/products/ProductListRow.jsx

import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { addToCart } from '../../store/slices/cartSlice'
import { calculateNXL, formatPrice } from '../../utils/helpers'
import { StarRating } from '../common/StarRating'

export const ProductListRow = ({ product }) => {
  const dispatch = useDispatch()
  const { _id, name, slug, category, price, originalPrice, images, ratings, stock = 10 } = product
  const nxlEarn = calculateNXL(price)
  const isOutOfStock = stock === 0

  const handleAddToCart = () => {
    dispatch(addToCart({
      _id, name, slug, category, price,
      image: images?.[0] || '',
      quantity: 1,
    }))
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