// client/src/utils/helpers.js

export const formatPrice = (price) => '₹' + price.toLocaleString('en-IN')

export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const calculateNXL = (amount) => Math.floor(amount / 100) * 5

export const getSlotPercent = (filled, max) =>
  Math.min(Math.round((filled / max) * 100), 100)

export const isNewProduct = (createdAt) => {
  const diff = Date.now() - new Date(createdAt).getTime()
  return diff < 7 * 24 * 60 * 60 * 1000
}

export const truncate = (str, n) => (str.length > n ? str.slice(0, n) + '...' : str)

export const getStars = (rating) => {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return { full, half, empty }
}

export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const normalizeSport = (sport) =>
  sport?.toLowerCase().replace(/\s+/g, '-').replace('table-tennis', 'table-tennis') || ''

export const getDiscountPercent = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export const getInitials = (name) =>
  name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

export const getNxlTier = (credits) => {
  if (credits >= 2000) return { label: 'Platinum', progress: 100 }
  if (credits >= 1000) return { label: 'Gold', progress: ((credits - 1000) / 1000) * 100 }
  if (credits >= 500) return { label: 'Silver', progress: ((credits - 500) / 500) * 100 }
  return { label: 'Bronze', progress: (credits / 500) * 100 }
}
