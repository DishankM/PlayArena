// client/src/pages/admin/AdminTournaments.jsx

import { useCallback, useEffect, useState } from 'react'
import { adminAPI, tournamentAPI } from '../../services/api'
import { formatDate, formatPrice, getSlotPercent } from '../../utils/helpers'

const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

const STATUS_TABS = ['all', 'upcoming', 'open', 'ongoing', 'completed', 'cancelled']
const SPORTS = ['Badminton', 'Table Tennis', 'Tennis', 'Football', 'Running', 'Cricket', 'Gym', 'Other']

const emptyForm = {
  name: '',
  description: '',
  sport: 'Badminton',
  type: 'indoor',
  format: 'solo',
  startDate: '',
  endDate: '',
  venue: '',
  maxSlots: 32,
  entryFee: 0,
  prize: '',
  nxlReward: 50,
  status: 'open',
  rules: [''],
  posterFile: null,
  posterPreview: '',
}

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [regModal, setRegModal] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchTournaments = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const res = await adminAPI.get(`/tournaments${params}`)
      setTournaments(res.data.data.tournaments)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchTournaments()
  }, [fetchTournaments])

  const openRegistrations = async (tournament) => {
    setRegModal(tournament)
    try {
      const res = await tournamentAPI.get(`/${tournament._id}/registrations`)
      setRegistrations(res.data.data.registrations)
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleAttended = async (regId, attended) => {
    try {
      await adminAPI.patch(`/registrations/${regId}/attended`, { attended })
      setRegistrations((prev) =>
        prev.map((r) => (r._id === regId ? { ...r, attended, attendedAt: attended ? new Date() : null } : r))
      )
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const rules = form.rules.filter((r) => r.trim())
    if (!rules.length) {
      setError('At least one rule is required')
      return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('description', form.description)
      formData.append('sport', form.sport)
      formData.append('type', form.type)
      formData.append('format', form.format)
      formData.append('startDate', form.startDate)
      formData.append('endDate', form.endDate)
      formData.append('venue', form.venue)
      formData.append('maxSlots', Number(form.maxSlots))
      formData.append('entryFee', Number(form.entryFee))
      formData.append('prize', form.prize)
      formData.append('nxlReward', Number(form.nxlReward))
      formData.append('status', form.status)
      formData.append('rules', JSON.stringify(rules))
      if (form.posterFile) {
        formData.append('poster', form.posterFile)
      }
      
      if (editItem) {
        await tournamentAPI.patch(`/${editItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await tournamentAPI.post('/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      setModalOpen(false)
      setForm(emptyForm)
      fetchTournaments()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tournament) => {
    if (!window.confirm(`Are you sure you want to delete tournament "${tournament.name}"?`)) return
    try {
      setError('')
      await tournamentAPI.delete(`/${tournament._id}`)
      fetchTournaments()
    } catch (err) {
      setError(err.message || 'Failed to delete tournament')
    }
  }

  const statusBadge = (status) => {
    const map = {
      upcoming: 'bg-gray-500/20 text-gray-400',
      open: 'bg-emerald-500/20 text-emerald-400',
      ongoing: 'bg-sky-500/20 text-sky-400',
      completed: 'bg-purple-500/20 text-purple-400',
      cancelled: 'bg-red-500/20 text-red-400',
    }
    return <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${map[status] || ''}`}>{status}</span>
  }

  const paidCount = registrations.filter((r) => r.paymentStatus === 'paid').length
  const attendedCount = registrations.filter((r) => r.attended).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
            <i className="ti ti-trophy text-sky-400 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Tournaments</h2>
            <p className="text-sm text-gray-400">{tournaments.length} events</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2.5 font-semibold text-white transition-all hover:scale-105"
          onClick={() => {
            setEditItem(null)
            setForm(emptyForm)
            setModalOpen(true)
          }}
        >
          <i className="ti ti-plus" /> Create Tournament
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all ${
              statusFilter === s 
                ? 'bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-lg shadow-sky-500/20' 
                : 'border border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <i className="ti ti-alert-circle mr-2" />
          {error}
        </div>
      )}

      {/* Tournaments Table */}
        <div className={`${glassCard} overflow-hidden`}>
          <div className="sm:hidden p-4">
            {loading ? (
              [1,2,3].map((i) => (
                <div key={i} className="mb-3 rounded-xl bg-white/5 p-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
                </div>
              ))
            ) : tournaments.length === 0 ? (
              <div className="rounded-xl bg-white/5 p-6 text-center text-gray-400">No tournaments</div>
            ) : (
              tournaments.map((t) => (
                <div key={t._id} className="mb-3 rounded-xl bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{t.name}</p>
                      <p className="text-xs text-gray-300">{t.sport} • {formatDate(t.startDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-300">{t.filledSlots}/{t.maxSlots}</p>
                      <p className="mt-1">{statusBadge(t.status)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="rounded-xl border border-white/20 bg-white/5 px-3 py-1 text-sm text-gray-300" onClick={() => openRegistrations(t)}>Regs</button>
                    <button
                      className="text-amber-400 text-sm font-medium"
                      onClick={() => {
                        setEditItem(t)
                        setForm({ ...emptyForm, ...t, startDate: t.startDate?.slice(0, 16), endDate: t.endDate?.slice(0, 16) || '', rules: t.rules?.length ? t.rules : [''] })
                        setModalOpen(true)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-400 text-sm font-medium ml-2"
                      onClick={() => handleDelete(t)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Sport</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Slots</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    <i className="ti ti-loader animate-spin mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : (
                tournaments.map((t) => (
                  <tr key={t._id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-400">{t.sport}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${t.type === 'indoor' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{formatDate(t.startDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-300">{t.filledSlots}/{t.maxSlots}</span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500" style={{ width: `${getSlotPercent(t.filledSlots, t.maxSlots)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {t.entryFee ? (
                        <span className="text-sky-400">{formatPrice(t.entryFee)}</span>
                      ) : (
                        <span className="text-emerald-400">Free</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{statusBadge(t.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" className="text-sky-400 transition-all hover:scale-110" onClick={() => openRegistrations(t)}>
                          <i className="ti ti-users text-lg" />
                        </button>
                        <button type="button" className="text-amber-400 transition-all hover:scale-110" onClick={() => {
                          setEditItem(t)
                          setForm({ ...emptyForm, ...t, startDate: t.startDate?.slice(0, 16), endDate: t.endDate?.slice(0, 16) || '', rules: t.rules?.length ? t.rules : [''] })
                          setModalOpen(true)
                        }}>
                          <i className="ti ti-edit text-lg" />
                        </button>
                        <button
                          type="button"
                          className="text-red-400 transition-all hover:scale-110"
                          onClick={() => handleDelete(t)}
                        >
                          <i className="ti ti-trash text-lg" />
                        </button>
                        <select
                          className="rounded-xl border border-white/20 bg-white/5 px-2 py-1 text-xs text-white focus:border-sky-500 focus:outline-none"
                          value={t.status}
                          onChange={async (e) => {
                            await tournamentAPI.patch(`/${t._id}/status`, { status: e.target.value })
                            fetchTournaments()
                          }}
                        >
                          {STATUS_TABS.filter((s) => s !== 'all').map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tournament Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1020] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{editItem ? 'Edit Tournament' : 'Create Tournament'}</h3>
              <button type="button" className="text-gray-400 hover:text-white" onClick={() => setModalOpen(false)}>
                <i className="ti ti-x text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Tournament Image</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="tournamentImage"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => setForm({ ...form, posterPreview: e.target?.result, posterFile: file })
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <label htmlFor="tournamentImage" className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-6 transition hover:border-sky-500 hover:bg-sky-500/10">
                    {form.posterPreview || editItem?.poster ? (
                      <div className="flex flex-col items-center">
                        <img src={form.posterPreview || editItem?.poster} alt="Tournament" className="max-h-24 rounded" />
                        <p className="mt-2 text-xs text-gray-300">Click to change image</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <i className="ti ti-photo text-3xl text-gray-400" />
                        <p className="mt-2 text-sm text-gray-300">Click to upload tournament image</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              <input className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-sky-500 focus:outline-none" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <textarea className="min-h-[80px] w-full rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-sky-500 focus:outline-none" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              
              <select className="w-full rounded-xl border border-white/30 bg-slate-800 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
                {SPORTS.map((s) => (<option key={s}>{s}</option>))}
              </select>
              
              <div className="grid gap-2 sm:grid-cols-2">
                {['indoor', 'outdoor'].map((type) => (
                  <label key={type} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 capitalize transition-all ${form.type === type ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-white/30 text-gray-300'}`}>
                    <input type="radio" className="sr-only" checked={form.type === type} onChange={() => setForm({ ...form, type })} />
                    <i className={`ti ${type === 'indoor' ? 'ti-building' : 'ti-sun'}`} />
                    {type}
                  </label>
                ))}
              </div>
              
              <div className="grid gap-2 sm:grid-cols-3">
                {['solo', 'team', 'doubles'].map((format) => (
                  <label key={format} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 capitalize transition-all ${form.format === format ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-white/30 text-gray-300'}`}>
                    <input type="radio" className="sr-only" checked={form.format === format} onChange={() => setForm({ ...form, format })} />
                    <i className={`ti ${format === 'solo' ? 'ti-user' : 'ti-users'}`} />
                    {format}
                  </label>
                ))}
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="datetime-local" className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                <input type="datetime-local" className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              
              <input className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-sky-500 focus:outline-none" placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
              
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="number" className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-sky-500 focus:outline-none" placeholder="Max slots" value={form.maxSlots} onChange={(e) => setForm({ ...form, maxSlots: e.target.value })} />
                <input type="number" className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-sky-500 focus:outline-none" placeholder="Entry fee" value={form.entryFee} onChange={(e) => setForm({ ...form, entryFee: e.target.value })} />
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-sky-500 focus:outline-none" placeholder="Prize" value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })} />
                <input type="number" className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-sky-500 focus:outline-none" placeholder="NXL reward" value={form.nxlReward} onChange={(e) => setForm({ ...form, nxlReward: e.target.value })} />
              </div>
              
              {form.rules.map((rule, i) => (
                <div key={i} className="flex gap-2">
                  <input className="flex-1 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-sky-500 focus:outline-none" value={rule} onChange={(e) => {
                    const rules = [...form.rules]
                    rules[i] = e.target.value
                    setForm({ ...form, rules })
                  }} />
                  <button type="button" className="rounded-xl border border-white/20 bg-white/5 px-3 text-red-400 hover:bg-red-500/10" onClick={() => setForm({ ...form, rules: form.rules.filter((_, j) => j !== i) })}>
                    <i className="ti ti-x" />
                  </button>
                </div>
              ))}
              <button type="button" className="text-sm text-sky-400 hover:underline" onClick={() => setForm({ ...form, rules: [...form.rules, ''] })}>
                + Add rule
              </button>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-xl border border-white/20 bg-white/5 px-5 py-2 text-sm text-gray-300 hover:bg-white/10" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50" disabled={saving}>
                {saving ? <i className="ti ti-loader animate-spin" /> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Registrations Modal */}
      {regModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1020] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Registrations — {regModal.name}</h3>
                <p className="text-sm text-gray-400">Manage player check-ins</p>
              </div>
              <button type="button" className="text-gray-400 hover:text-white" onClick={() => setRegModal(null)}>
                <i className="ti ti-x text-xl" />
              </button>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div className={`${glassCard} p-3`}>
                <p className="text-2xl font-bold text-white">{registrations.length}</p>
                <p className="text-xs text-gray-400">Registered</p>
              </div>
              <div className={`${glassCard} p-3`}>
                <p className="text-2xl font-bold text-emerald-400">{paidCount}</p>
                <p className="text-xs text-gray-400">Paid</p>
              </div>
              <div className={`${glassCard} p-3`}>
                <p className="text-2xl font-bold text-sky-400">{attendedCount}</p>
                <p className="text-xs text-gray-400">Attended</p>
              </div>
              <div className={`${glassCard} p-3`}>
                <p className="text-2xl font-bold text-amber-400">{regModal.maxSlots - regModal.filledSlots}</p>
                <p className="text-xs text-gray-400">Remaining</p>
              </div>
            </div>
            
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 text-xs text-gray-400">
                  <tr>
                    <th className="py-2 text-left">Player</th>
                    <th>Payment</th>
                    <th>QR Token</th>
                    <th>Attended</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r._id} className="border-b border-white/10">
                      <td className="py-2 text-white">{r.user?.name}</td>
                      <td className="capitalize text-gray-300">{r.paymentStatus}</td>
                      <td className="font-mono text-xs text-gray-400">{r.qrToken?.slice(0, 16)}...</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={r.attended}
                          onChange={(e) => toggleAttended(r._id, e.target.checked)}
                          className="h-4 w-4 rounded border-white/20 bg-white/5 text-sky-400 focus:ring-sky-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}