
import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'
import { StarRating } from '../components/common/StarRating'
import { ProductCard } from '../components/products/ProductCard'
import { addToCart } from '../store/slices/cartSlice'
import { setCredentials } from '../store/slices/authSlice'
import { authAPI, productAPI } from '../services/api'
import useToast from '../hooks/useToast'
import {
  formatPrice,
  calculateNXL,
  isNewProduct,
  getDiscountPercent,
} from '../utils/helpers'
import { isInWishlist } from '../utils/wishlist'

const sportIcons = {
  badminton: 'ti-trophy',
  'table-tennis': 'ti-table',
  tennis: 'ti-ball-tennis',
  football: 'ti-ball-football',
  running: 'ti-run',
  gym: 'ti-barbell',
  general: 'ti-shirt',
}

const mockReviews = [
  { user: 'Aditya K.', rating: 5, title: 'Excellent quality!', body: 'Been using these for 3 months now. Great grip and very comfortable for long matches.', date: '2026-01-15' },
  { user: 'Neha P.', rating: 4, title: 'Solid value for money', body: 'Good build quality and true to size. Delivery was quick to Pune.', date: '2026-01-08' },
  { user: 'Vikram S.', rating: 5, title: 'Perfect for tournaments', body: 'Used these at the Nashik Open — excellent court feel and ankle support.', date: '2025-12-22' },
]

const ratingBreakdown = [
  { stars: 5, percent: 62 },
  { stars: 4, percent: 24 },
  { stars: 3, percent: 9 },
  { stars: 2, percent: 3 },
  { stars: 1, percent: 2 },
]

const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = useToast()
  const { isAuthenticated, user, token } = useSelector((state) => state.auth)
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [descOpen, setDescOpen] = useState(true)
  const [wishlistSaving, setWishlistSaving] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setNotFound(false)
    productAPI
      .get(`/${slug}`)
      .then(async (res) => {
        const nextProduct = res.data.data.product
        setProduct(nextProduct)
        const relatedRes = await productAPI.get(`/?category=${nextProduct.category}&limit=4`)
        setRelated((relatedRes.data.data.products || []).filter((item) => item._id !== nextProduct._id))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1020] text-white">
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="h-96 animate-pulse rounded-2xl bg-white/10" />
            <div className="space-y-4">
              <div className="h-10 animate-pulse rounded bg-white/10" />
              <div className="h-6 animate-pulse rounded bg-white/10" />
              <div className="h-24 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#0B1020]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 py-24 text-center">
          <div className="flex flex-col items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/5">
              <i className="ti ti-shirt-off text-5xl text-gray-500" />
            </div>
            <h1 className="mt-6 text-4xl font-bold text-white">Product not found</h1>
            <p className="mt-3 text-gray-400">This item may have been removed from the store.</p>
            <Link to="/store" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02]">
              <i className="ti ti-arrow-left" />
              Back to Store
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const {
    _id,
    name,
    category,
    sport,
    price,
    originalPrice,
    stock,
    description,
    ratings,
    images,
    createdAt,
  } = product

  const discount = getDiscountPercent(price, originalPrice)
  const nxlEarn = calculateNXL(price * quantity)
  const icon = sportIcons[sport] || 'ti-shirt'
  const imageList = images || []
  const thumbs = imageList.length ? imageList : [null, null, null]
  const reviews = product.reviews?.length ? product.reviews : mockReviews
  const wishlisted = isInWishlist(user?.wishlist, _id)

  const handleAddToCart = () => {
    dispatch(addToCart({
      _id: product._id,
      name,
      slug: product.slug,
      category,
      price,
      image: imageList?.[0] || '',
      quantity,
    }))
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/checkout')
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
  const handleDecreaseQty = () => setQuantity((q) => Math.max(1, q - 1))
  const handleIncreaseQty = () => setQuantity((q) => Math.min(stock || 99, q + 1))

  const stockLabel = stock === 0 ? (
    <span className="font-semibold text-red-400">Out of Stock</span>
  ) : stock <= 10 ? (
    <span className="font-semibold text-orange-400">Only {stock} left</span>
  ) : (
    <span className="font-semibold text-green-400">In Stock</span>
  )

  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link to="/" className="hover:text-sky-400">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/store" className="hover:text-sky-400">Store</Link>
          <span className="mx-2">/</span>
          <Link to={`/store?category=${category}`} className="capitalize hover:text-sky-400">
            {category?.replace('-', ' ')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left - Images */}
          <div>
            <div className="relative flex h-96 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              {imageList[selectedImage] ? (
                <img src={imageList[selectedImage]} alt={name} className="max-h-full max-w-full object-contain" />
              ) : (
                <i className={`ti ${icon} text-8xl text-gray-500`} />
              )}
              {isNewProduct(createdAt) && (
                <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 text-xs font-bold uppercase text-white shadow-lg">
                  New
                </span>
              )}
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {thumbs.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border ${
                    selectedImage === i ? 'border-sky-400' : 'border-white/20'
                  } bg-white/[0.03] transition-all hover:border-sky-400`}
                >
                  {img ? (
                    <img src={img} alt="" className="h-full w-full object-contain p-2" />
                  ) : (
                    <i className={`ti ${icon} text-2xl text-gray-500`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right - Product Info */}
          <div>
            <span className="inline-block rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase text-sky-400">
              {category?.replace('-', ' ')}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{name}</h1>
            
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StarRating rating={ratings.average} count={ratings.count} size="md" color="text-amber-400" />
              <button className="text-sm text-sky-400 hover:underline">Write a review</button>
            </div>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-sky-400">{formatPrice(price)}</span>
              {originalPrice > price && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5">
              <i className="ti ti-coin text-amber-400" />
              <span className="text-sm font-medium text-amber-300">Earn {nxlEarn} NXL credits</span>
            </div>

            <p className="mt-3 text-sm">{stockLabel}</p>

            {/* Quantity */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-300">Quantity</span>
              <div className="flex items-center rounded-xl border border-white/20 bg-white/[0.03]">
                <button onClick={handleDecreaseQty} className="px-3 py-2 text-gray-400 hover:text-white">
                  <i className="ti ti-minus" />
                </button>
                <span className="min-w-[2rem] text-center font-semibold">{quantity}</span>
                <button onClick={handleIncreaseQty} disabled={stock > 0 && quantity >= stock} className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-40">
                  <i className="ti ti-plus" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleAddToCart} disabled={stock === 0} className="flex-1 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:border-sky-400 hover:bg-sky-500/10 disabled:opacity-50">
                <i className="ti ti-shopping-cart mr-2" />
                Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={stock === 0} className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50">
                Buy Now
              </button>
            </div>

            <button onClick={handleToggleWishlist} disabled={wishlistSaving} className="mt-4 flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 disabled:cursor-not-allowed disabled:opacity-60">
              <i className={`ti ti-heart ${wishlisted ? 'text-red-500' : ''}`} />
              {wishlistSaving ? 'Updating...' : wishlisted ? 'Saved to wishlist' : 'Add to Wishlist'}
            </button>

            {/* Delivery Info */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: 'ti-truck', label: 'Free delivery above ₹999' },
                { icon: 'ti-refresh', label: '7-day easy returns' },
                { icon: 'ti-shield-check', label: '100% genuine product' },
              ].map((item) => (
                <div key={item.icon} className="flex items-center gap-2 rounded-xl bg-white/[0.03] p-3 text-sm text-gray-300">
                  <i className={`ti ${item.icon} text-sky-400`} />
                  {item.label}
                </div>
              ))}
            </div>

            {/* Description Toggle */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <button onClick={() => setDescOpen(!descOpen)} className="flex w-full items-center justify-between font-semibold text-white">
                Product Description
                <i className={`ti ${descOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`} />
              </button>
              {descOpen && <p className="mt-3 text-gray-300 leading-relaxed">{description}</p>}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16">
          <div className="flex flex-wrap gap-2 border-b border-white/10">
            {['reviews', 'specifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-5 py-3 text-sm font-semibold capitalize transition-all ${
                  activeTab === tab ? 'border-sky-400 text-sky-400' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'reviews' && (
            <>
              <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
                <div className={`${glassCard} p-6 text-center`}>
                  <p className="text-5xl font-bold text-white">{ratings.average}</p>
                  <StarRating rating={ratings.average} size="md" color="text-amber-400" />
                  <p className="mt-2 text-sm text-gray-400">{ratings.count} reviews</p>
                </div>
                <div className="space-y-2">
                  {ratingBreakdown.map((row) => (
                    <div key={row.stars} className="flex items-center gap-3 text-sm">
                      <span className="w-8 text-gray-400">{row.stars}★</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-sky-400" style={{ width: `${row.percent}%` }} />
                      </div>
                      <span className="w-10 text-gray-400">{row.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {reviews.map((review) => (
                  <div key={review._id || review.user} className={`${glassCard} p-5`}>
                    <div className="flex items-center justify-between">
                      <StarRating rating={review.rating} color="text-amber-400" />
                      <span className="text-sm text-gray-400">{review.date}</span>
                    </div>
                    <h3 className="mt-2 font-semibold text-white">{review.title}</h3>
                    <p className="mt-1 text-gray-300">{review.body}</p>
                    <p className="mt-2 text-sm text-gray-400">- {review.user?.name || review.user}</p>
                  </div>
                ))}
              </div>

              {isAuthenticated && (
                <form className={`${glassCard} mt-8 p-6`}>
                  <h3 className="text-lg font-semibold text-white">Write a Review</h3>
                  <div className="mt-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewRating(star)}>
                        <i className="ti ti-star-filled text-xl" style={{ color: star <= reviewRating ? '#F7C948' : '#4B5563' }} />
                      </button>
                    ))}
                  </div>
                  <input type="text" placeholder="Review title" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} className="mt-4 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" />
                  <textarea placeholder="Share your experience..." value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} rows={4} className="mt-3 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" />
                  <button type="submit" className="mt-4 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-2.5 font-semibold text-white transition-all hover:scale-[1.02]">Submit Review</button>
                </form>
              )}
            </>
          )}

          {activeTab === 'specifications' && (
            <div className={`${glassCard} mt-8 p-6`}>
              <h2 className="text-xl font-bold text-white">Product Specifications</h2>
              <div className="mt-4 space-y-3">
                {[
                  { label: 'Brand', value: 'PlayArena' },
                  { label: 'Category', value: category?.replace('-', ' ') },
                  { label: 'Sport', value: sport },
                  { label: 'Material', value: 'Premium Quality' },
                  { label: 'Warranty', value: '1 Year' },
                ].map((spec) => (
                  <div key={spec.label} className="flex border-b border-white/10 py-2">
                    <span className="w-32 text-gray-400">{spec.label}</span>
                    <span className="text-white">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-white">You might also like</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
