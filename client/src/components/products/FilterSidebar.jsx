// client/src/components/products/FilterSidebar.jsx

import { useState } from 'react'

const CATEGORIES = [
  { id: 'shoes', label: 'Shoes' },
  { id: 'jerseys', label: 'Jerseys' },
  { id: 'rackets', label: 'Rackets' },
  { id: 'footballs', label: 'Footballs' },
  { id: 'water-bottles', label: 'Water Bottles' },
  { id: 'gym-accessories', label: 'Gym Accessories' },
]

const SPORTS = [
  { id: 'badminton', label: 'Badminton' },
  { id: 'table-tennis', label: 'Table Tennis' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'football', label: 'Football' },
  { id: 'running', label: 'Running' },
  { id: 'gym', label: 'Gym' },
]

const RATINGS = [
  { value: 0, label: 'All ratings' },
  { value: 3, label: '3★ & above' },
  { value: 4, label: '4★ & above' },
]

export const FilterSidebar = ({ filters, onFiltersChange, onClear, className = '' }) => {
  const [openSections, setOpenSections] = useState({
    categories: true,
    sports: true,
    price: true,
    rating: true,
  })

  const handleToggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCategoryToggle = (id) => {
    const next = filters.categories.includes(id)
      ? filters.categories.filter((c) => c !== id)
      : [...filters.categories, id]
    onFiltersChange({ ...filters, categories: next })
  }

  const handleSportToggle = (id) => {
    const next = filters.sports.includes(id)
      ? filters.sports.filter((s) => s !== id)
      : [...filters.sports, id]
    onFiltersChange({ ...filters, sports: next })
  }

  const SectionHeader = ({ title, sectionKey }) => (
    <button onClick={() => handleToggleSection(sectionKey)} className="flex w-full items-center justify-between py-2 text-sm font-semibold text-white">
      {title}
      <i className={`ti ${openSections[sectionKey] ? 'ti-chevron-up' : 'ti-chevron-down'} text-gray-400`} />
    </button>
  )

  return (
    <aside className={className}>
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="text-lg font-bold text-white">Filters</h2>
        <button onClick={onClear} className="text-sm font-semibold text-sky-400 hover:underline">Clear all</button>
      </div>

      {/* Categories */}
      <div className="mt-4 border-b border-white/10 pb-4">
        <SectionHeader title="Categories" sectionKey="categories" />
        {openSections.categories && (
          <ul className="mt-2 space-y-2">
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={filters.categories.includes(cat.id)} onChange={() => handleCategoryToggle(cat.id)} className="rounded border-white/20 bg-white/5 text-sky-400 focus:ring-sky-400" />
                  {cat.label}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sports */}
      <div className="mt-4 border-b border-white/10 pb-4">
        <SectionHeader title="Sport" sectionKey="sports" />
        {openSections.sports && (
          <ul className="mt-2 space-y-2">
            {SPORTS.map((sport) => (
              <li key={sport.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={filters.sports.includes(sport.id)} onChange={() => handleSportToggle(sport.id)} className="rounded border-white/20 bg-white/5 text-sky-400 focus:ring-sky-400" />
                  {sport.label}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Price Range */}
      <div className="mt-4 border-b border-white/10 pb-4">
        <SectionHeader title="Price range" sectionKey="price" />
        {openSections.price && (
          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value })} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" />
              <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-sky-400 focus:outline-none" />
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mt-4">
        <SectionHeader title="Rating" sectionKey="rating" />
        {openSections.rating && (
          <ul className="mt-2 space-y-2">
            {RATINGS.map((r) => (
              <li key={r.value}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
                  <input type="radio" name="rating-filter" checked={filters.rating === r.value} onChange={() => onFiltersChange({ ...filters, rating: r.value })} className="border-white/20 bg-white/5 text-sky-400 focus:ring-sky-400" />
                  {r.label}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}