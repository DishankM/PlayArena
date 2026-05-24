// client/src/pages/Products.jsx

import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'
import { ProductCard } from '../components/products/ProductCard'
import { ProductListRow } from '../components/products/ProductListRow'
import { FilterSidebar } from '../components/products/FilterSidebar'
import { mockProducts } from '../data/mockData'

const defaultFilters = {
  categories: [],
  sports: [],
  minPrice: '',
  maxPrice: '',
  rating: 0,
}

export default function Products() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState('featured')
  const [view, setView] = useState('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    const sport = searchParams.get('sport')
    if (sport) {
      setFilters((prev) => ({ ...prev, sports: [sport] }))
    }
  }, [searchParams])

  const searchQuery = searchParams.get('search')?.toLowerCase() || ''

  const filteredProducts = useMemo(() => {
    let list = [...mockProducts]

    if (searchQuery) {
      list = list.filter((p) => p.name.toLowerCase().includes(searchQuery))
    }
    if (filters.categories.length) {
      list = list.filter((p) => filters.categories.includes(p.category))
    }
    if (filters.sports.length) {
      list = list.filter((p) => filters.sports.includes(p.sport))
    }
    if (filters.minPrice) {
      list = list.filter((p) => p.price >= Number(filters.minPrice))
    }
    if (filters.maxPrice) {
      list = list.filter((p) => p.price <= Number(filters.maxPrice))
    }
    if (filters.rating > 0) {
      list = list.filter((p) => (p.ratings?.average || 0) >= filters.rating)
    }

    switch (sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break
      case 'price-desc': list.sort((a, b) => b.price - a.price); break
      case 'newest': list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break
      case 'rating': list.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0)); break
      default: list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }
    return list
  }, [filters, sort, searchQuery])

  const handleClearFilters = () => setFilters(defaultFilters)
  const handleCloseMobileFilters = () => setMobileFiltersOpen(false)

  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 backdrop-blur-sm mb-3">
            <i className="ti ti-shopping-bag text-sky-400 text-sm" />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Store</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Sports gear &amp; accessories</h1>
          <p className="mt-2 text-gray-400">Shop premium sports equipment and earn NXL credits</p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <div className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
              <FilterSidebar filters={filters} onFiltersChange={setFilters} onClear={handleClearFilters} />
            </div>
          </div>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-400">{filteredProducts.length} products found</p>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => setMobileFiltersOpen(true)} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white lg:hidden">
                  <i className="ti ti-adjustments" />
                  Filters
                </button>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white focus:border-sky-400 focus:outline-none">
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Top Rated</option>
                </select>
                <div className="flex rounded-xl border border-white/20 bg-white/5">
                  <button onClick={() => setView('grid')} className={`px-3 py-2 ${view === 'grid' ? 'bg-sky-500/20 text-sky-400' : 'text-gray-400'}`}>
                    <i className="ti ti-layout-grid" />
                  </button>
                  <button onClick={() => setView('list')} className={`px-3 py-2 ${view === 'list' ? 'bg-sky-500/20 text-sky-400' : 'text-gray-400'}`}>
                    <i className="ti ti-list" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] py-16 text-center">
                <i className="ti ti-mood-sad text-5xl text-gray-500" />
                <h2 className="mt-4 text-xl font-bold text-white">No products found</h2>
                <p className="mt-2 text-gray-400">Try adjusting your filters</p>
                <button onClick={handleClearFilters} className="mt-6 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-2.5 font-semibold text-white">Clear filters</button>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredProducts.map((product) => (
                  <ProductListRow key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <>
          <button className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={handleCloseMobileFilters} />
          <div className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto rounded-r-2xl border-r border-white/10 bg-[#0B1020] p-5 shadow-2xl lg:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Filters</h2>
              <button onClick={handleCloseMobileFilters} className="text-gray-400 hover:text-white">
                <i className="ti ti-x text-xl" />
              </button>
            </div>
            <FilterSidebar filters={filters} onFiltersChange={setFilters} onClear={() => { handleClearFilters(); handleCloseMobileFilters() }} />
          </div>
        </>
      )}

      <Footer />
    </div>
  )
}