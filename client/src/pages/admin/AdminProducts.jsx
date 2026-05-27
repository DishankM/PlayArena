// client/src/pages/admin/AdminProducts.jsx

import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { adminAPI, productAPI } from '../../services/api'
import { formatPrice, slugify } from '../../utils/helpers'

const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

const CATEGORIES = ['shoes', 'jerseys', 'rackets', 'footballs', 'perfumes', 'water-bottles', 'gym-accessories', 'other']
const SPORTS = ['badminton', 'table-tennis', 'tennis', 'football', 'running', 'gym', 'general']

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  originalPrice: '',
  category: 'shoes',
  sport: 'general',
  stock: '',
  nxlEarnRate: 5,
  isFeatured: false,
  isActive: true,
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      const res = await adminAPI.get(`/products?${params}`)
      setProducts(res.data.data.products)
      setTotalPages(res.data.data.totalPages)
      setTotalCount(res.data.data.totalCount)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, categoryFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const openAdd = () => {
    setEditProduct(null)
    setForm(emptyForm)
    setImages([])
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditProduct(product)
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category,
      sport: product.sport || 'general',
      stock: product.stock,
      nxlEarnRate: product.nxlEarnRate ?? 5,
      isFeatured: product.isFeatured,
      isActive: product.isActive !== false,
    })
    setImages([])
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (form.description.length < 50) {
      setError('Description must be at least 50 characters')
      return
    }
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
      images.forEach((file) => fd.append('images', file))

      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const token = localStorage.getItem('accessToken')
      const url = editProduct ? `${baseURL}/products/${editProduct._id}` : `${baseURL}/products`
      await axios({
        method: editProduct ? 'patch' : 'post',
        url,
        data: fd,
        headers: { Authorization: `Bearer ${token}` },
      })
      setModalOpen(false)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Remove ${product.name} from store?`)) return
    try {
      await productAPI.delete(`/${product._id}`)
      setProducts((prev) => prev.filter((p) => p._id !== product._id))
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleFeatured = async (product) => {
    try {
      await productAPI.patch(`/${product._id}`, { isFeatured: !product.isFeatured })
      setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, isFeatured: !p.isFeatured } : p)))
    } catch (err) {
      setError(err.message)
    }
  }

  const stockClass = (stock) => {
    if (stock > 20) return 'text-emerald-400'
    if (stock >= 5) return 'text-amber-400'
    return 'text-red-400'
  }

  const from = (page - 1) * 20 + 1
  const to = Math.min(page * 20, totalCount)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
            <i className="ti ti-package text-sky-400 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Products</h2>
            <p className="text-sm text-gray-400">{totalCount} total products</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-2 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <select
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-gray-300 focus:border-sky-500 focus:outline-none"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 font-semibold text-white transition-all hover:scale-105" onClick={openAdd}>
            <i className="ti ti-plus" /> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <i className="ti ti-alert-circle mr-2" />
          {error}
        </div>
      )}

      {/* Products Table */}
        <div className={`${glassCard} overflow-hidden`}>
          {/* Mobile cards */}
          <div className="sm:hidden p-4">
            {loading ? (
              [1,2,3].map((i) => (
                <div key={i} className="mb-3 rounded-xl bg-white/5 p-4">
                  <div className="h-10 w-10 animate-pulse rounded bg-white/10" />
                  <div className="mt-2 h-4 w-40 animate-pulse rounded bg-white/10" />
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="rounded-xl bg-white/5 p-6 text-center text-gray-400">No products</div>
            ) : (
              products.map((p) => (
                <div key={p._id} className="mb-3 rounded-xl bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center">
                      {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <i className="ti ti-photo text-gray-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{p.name}</p>
                      <p className="text-xs text-gray-300">{p.category} • {formatPrice(p.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${stockClass(p.stock)}`}>{p.stock}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="rounded-xl border border-white/20 bg-white/5 px-3 py-1 text-sm text-gray-300">Edit</button>
                    <button className="rounded-xl border border-white/20 bg-white/5 px-3 py-1 text-sm text-red-400">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    <i className="ti ti-loader animate-spin mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">
                          <i className="ti ti-photo text-gray-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs capitalize text-sky-400">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-sky-400">{formatPrice(p.price)}</td>
                    <td className={`px-4 py-3 font-medium ${stockClass(p.stock)}`}>
                      {p.stock < 5 && <i className="ti ti-alert-triangle mr-1" />}
                      {p.stock}
                    </td>
                    <td className="px-4 py-3 text-amber-400">
                      <i className="ti ti-star-filled" /> {p.ratings?.average?.toFixed(1)} ({p.ratings?.count})
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(p)}
                        className={`relative h-6 w-11 rounded-full transition-all ${p.isFeatured ? 'bg-sky-500' : 'bg-white/20'}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p.isFeatured ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${p.isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {p.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="mr-2 text-sky-400 transition-all hover:scale-110" onClick={() => openEdit(p)}>
                        <i className="ti ti-edit" />
                      </button>
                      <button className="text-red-400 transition-all hover:scale-110" onClick={() => handleDelete(p)}>
                        <i className="ti ti-trash" />
                      </button>
                    </td>
                   </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
          <span className="text-sm text-gray-400">Showing {from}-{to} of {totalCount} products</span>
          <div className="flex gap-2">
            <button className="rounded-xl border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-gray-300 transition-all hover:bg-white/10 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span className="px-2 py-1 text-sm text-gray-400">{page} / {totalPages || 1}</span>
            <button className="rounded-xl border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-gray-300 transition-all hover:bg-white/10 disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1020] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{editProduct ? `Edit - ${editProduct.name}` : 'Add Product'}</h3>
              <button type="button" className="text-gray-400 hover:text-white" onClick={() => setModalOpen(false)}>
                <i className="ti ti-x text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none" placeholder="Product name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editProduct ? form.slug : slugify(e.target.value) })} />
              <input className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none" placeholder="Slug" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              
              <div className="grid gap-3 sm:grid-cols-2">
                <select className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 focus:border-sky-500 focus:outline-none" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
                <select className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 focus:border-sky-500 focus:outline-none" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
                  {SPORTS.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="number" className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none" placeholder="Price" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                <input type="number" className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none" placeholder="Original price" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="number" className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none" placeholder="Stock" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                <input type="number" className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none" placeholder="NXL earn rate" value={form.nxlEarnRate} onChange={(e) => setForm({ ...form, nxlEarnRate: e.target.value })} />
              </div>
              
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded border-white/20 bg-white/5" />
                Featured product
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-white/20 bg-white/5" />
                Active (visible on store)
              </label>
              
              <textarea className="min-h-[100px] w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-gray-300 placeholder-gray-400 focus:border-sky-500 focus:outline-none" placeholder="Description (min 50 chars)" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              
              <div className="cursor-pointer rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center transition-all hover:border-sky-500" onClick={() => document.getElementById('product-images')?.click()}>
                <i className="ti ti-cloud-upload mb-2 text-3xl text-gray-400" />
                <p className="text-sm text-gray-400">Drag images here or click to browse</p>
                <input id="product-images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => setImages([...e.target.files])} />
              </div>
              {images.length > 0 && <p className="text-sm text-sky-400">{images.length} file(s) selected</p>}
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-xl border border-white/20 bg-white/5 px-5 py-2 text-sm text-gray-300 hover:bg-white/10" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50" disabled={saving}>
                {saving ? <i className="ti ti-loader animate-spin" /> : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}