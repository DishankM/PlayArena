export const getWishlistIds = (wishlist = []) =>
  wishlist
    .map((item) => {
      if (!item) return null
      if (typeof item === 'string') return item
      return item._id || null
    })
    .filter(Boolean)

export const isInWishlist = (wishlist, productId) =>
  getWishlistIds(wishlist).includes(productId)

export const getWishlistProducts = (wishlist = []) =>
  wishlist.filter((item) => item && typeof item === 'object' && item._id)
