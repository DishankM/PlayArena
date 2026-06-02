// client/src/components/products/ProductCard.jsx

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart } from '../../store/slices/cartSlice';
import { setCredentials } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import { isNewProduct, calculateNXL } from '../../utils/helpers';
import { isInWishlist } from '../../utils/wishlist';
import { StarRating } from '../common/StarRating';
import useToast from '../../hooks/useToast';

/**
 * @param {{ product: object, showWishlistRemove?: boolean }} props
 */
export const ProductCard = ({ product, showWishlistRemove = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const wishlist = user?.wishlist || [];
  const isWishlisted = isInWishlist(wishlist, product._id);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [wishlistSaving, setWishlistSaving] = useState(false);

  const {
    _id,
    name,
    slug,
    category,
    price,
    originalPrice,
    images,
    ratings,
    nxlEarnRate,
    createdAt,
    stock = 10,
    discount,
  } = product;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await dispatch(
        addToCart({
          _id,
          name,
          slug,
          category,
          price,
          image: images?.[0] || '',
          nxlEarnRate,
          quantity: 1,
        })
      );
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setTimeout(() => setIsAddingToCart(false), 500);
    }
  };

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
  };

  const showNew = createdAt && isNewProduct(createdAt);
  const nxlEarn = calculateNXL(price);
  const discountPercentage = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : discount || 0;
  const isLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock === 0;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#0B1020] to-[#16213E]">
        {/* Loading Skeleton */}
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          </div>
        )}
        
        {/* Product Image */}
        {images?.[0] ? (
          <img
            src={images[0]}
            alt={name}
            className={`h-full w-full object-contain p-4 transition-all duration-500 group-hover:scale-110 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <i className="ti ti-shirt text-6xl text-gray-600 transition-colors group-hover:text-sky-500/40" />
          </div>
        )}

        {/* Badges Container */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {showNew && (
            <span className="rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-lg">
              New
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-lg">
              {discountPercentage}% OFF
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-lg">
              Only {stock} left
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-gray-700 px-2.5 py-1 text-[10px] font-bold uppercase text-gray-300 shadow-lg">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={wishlistSaving}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur transition-all hover:scale-110 hover:border-sky-500 hover:bg-sky-500/20"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i
            className={`ti ti-heart text-lg transition-colors ${
              isWishlisted ? 'text-red-500 fill-red-500' : 'text-white/70 hover:text-red-400'
            }`}
          />
        </button>

        {/* Quick View Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-[#0B1020] via-[#0B1020]/60 to-transparent opacity-0 transition-opacity duration-300 ${
            isHovered && !isOutOfStock ? 'opacity-100' : ''
          }`}
        />
        
        <div
          className={`absolute bottom-3 left-3 right-3 translate-y-2 transform transition-all duration-300 ${
            isHovered && !isOutOfStock ? 'translate-y-0 opacity-100' : 'opacity-0'
          }`}
        >
          <Link
            to={`/store/${slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
          >
            <i className="ti ti-eye" />
            Quick View
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">
          {category?.replace('-', ' ') || 'Uncategorized'}
        </p>
        
        {/* Product Name */}
        <Link to={`/store/${slug}`}>
          <h3 className="mt-1 text-base font-bold text-white line-clamp-2 transition-colors hover:text-sky-400">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2">
          <StarRating 
            rating={ratings?.average || 0} 
            count={ratings?.count || 0}
            color="text-amber-400"
          />
        </div>

        {/* Price Section */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold text-sky-400">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* NXL Credits */}
        <div className="mt-2 flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-1 w-fit">
          <i className="ti ti-coin text-amber-400 text-xs" />
          <span className="text-xs font-medium text-amber-300">
            Earn {nxlEarn} NXL
          </span>
        </div>

        {/* Stock Status */}
        {isLowStock && !isOutOfStock && (
          <p className="mt-2 text-xs text-orange-400">
            ⚡ Only {stock} left
          </p>
        )}

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingToCart}
          className={`relative mt-4 w-full overflow-hidden rounded-xl font-semibold transition-all duration-300 ${
            isOutOfStock
              ? 'cursor-not-allowed bg-gray-700 text-gray-400'
              : 'bg-gradient-to-r from-sky-500 to-violet-500 text-white hover:shadow-lg hover:shadow-sky-500/30 active:scale-95'
          } ${!isOutOfStock && 'group-hover:shadow-md'}`}
          aria-label={`Add ${name} to cart`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2 py-2.5">
            {isAddingToCart ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <i className="ti ti-shopping-cart text-sm" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </>
            )}
          </span>
          {!isOutOfStock && !isAddingToCart && (
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          )}
        </button>

        {showWishlistRemove && isWishlisted && (
          <button
            type="button"
            onClick={handleToggleWishlist}
            disabled={wishlistSaving}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 py-2 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className="ti ti-heart-minus text-sm" />
            {wishlistSaving ? 'Removing...' : 'Remove from Wishlist'}
          </button>
        )}

        {/* Free Shipping Indicator */}
        {price >= 999 && !isOutOfStock && (
          <p className="mt-2 text-center text-xs text-emerald-400">
            🚚 Free Shipping
          </p>
        )}
      </div>

      {/* Hover Border Effect */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-sky-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </article>
  );
};
