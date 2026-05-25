// client/src/pages/Events.jsx

import { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { EventCard } from '../components/events/EventCard';
import { tournamentAPI } from '../services/api';

const typeTabs = [
  { id: 'all', label: 'All Events', icon: 'ti-calendar' },
  { id: 'indoor', label: 'Indoor', icon: 'ti-building' },
  { id: 'outdoor', label: 'Outdoor', icon: 'ti-sun' },
];

const sportPills = [
  { id: 'all', label: 'All Sports', icon: 'ti-trophy' },
  { id: 'badminton', label: 'Badminton', icon: 'ti-trophy' },
  { id: 'football', label: 'Football', icon: 'ti-ball-football' },
  { id: 'table tennis', label: 'Table Tennis', icon: 'ti-table' },
  { id: 'tennis', label: 'Tennis', icon: 'ti-ball-tennis' },
  { id: 'running', label: 'Running', icon: 'ti-run' },
  { id: 'gym', label: 'Fitness', icon: 'ti-dumbbell' },
];

const statusOptions = [
  { id: 'all', label: 'All Status', color: 'text-gray-400' },
  { id: 'open', label: 'Open 🔓', color: 'text-green-400' },
  { id: 'upcoming', label: 'Upcoming ⏰', color: 'text-blue-400' },
  { id: 'ongoing', label: 'Ongoing ⚡', color: 'text-orange-400' },
  { id: 'completed', label: 'Completed ✓', color: 'text-gray-500' },
];

const stats = [
  { icon: 'ti-trophy', label: '48 Tournaments hosted', value: '48+', gradient: 'from-arena-primary to-arena-primary-dark' },
  { icon: 'ti-users', label: 'Players participated', value: '1,200+', gradient: 'from-blue-500 to-blue-600' },
  { icon: 'ti-coin', label: 'Total prizes distributed', value: '₹2.4L+', gradient: 'from-arena-gold to-arena-gold-dark' },
  { icon: 'ti-ball-tennis', label: 'Sports covered', value: '6+', gradient: 'from-emerald-500 to-emerald-600' },
];

export default function Events() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('date');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (typeFilter !== 'all') params.set('type', typeFilter);
        if (sportFilter !== 'all') params.set('sport', sportFilter);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        const res = await tournamentAPI.get(`/?${params.toString()}`);
        let list = res.data.data.tournaments || [];
        if (sort === 'fee-low') list = [...list].sort((a, b) => a.entryFee - b.entryFee);
        if (sort === 'fee-high') list = [...list].sort((a, b) => b.entryFee - a.entryFee);
        if (sort === 'slots') list = [...list].sort((a, b) => (a.filledSlots / a.maxSlots) - (b.filledSlots / b.maxSlots));
        setFiltered(list);
      } catch (apiError) {
        setError(apiError.message || 'Unable to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, [typeFilter, sportFilter, statusFilter, sort]);

  const clearFilters = () => {
    setTypeFilter('all');
    setSportFilter('all');
    setStatusFilter('all');
    setSort('date');
  };

  const hasActiveFilters = typeFilter !== 'all' || sportFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-b from-arena-navy to-arena-navy-deep">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-arena-navy to-arena-navy-deep px-6 py-16 md:px-16">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-arena-primary/10 blur-3xl" />
          <div className="absolute -left-20 bottom-20 h-80 w-80 rounded-full bg-arena-gold/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-arena-primary/30 bg-arena-primary/10 px-4 py-1.5 backdrop-blur-sm mb-4">
                <i className="ti ti-trophy text-arena-primary text-sm" />
                <span className="text-xs font-bold uppercase tracking-wider text-arena-primary">
                  Live Events
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-5xl">
                Tournaments &amp;{' '}
                <span className="bg-gradient-to-r from-arena-primary to-arena-gold bg-clip-text text-transparent">
                  Events
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-base text-gray-300">
                Register for indoor and outdoor sports tournaments across India. 
                Earn <span className="font-semibold text-arena-gold">NXL credits</span> on every registration.
              </p>
            </div>

            {/* Results Count */}
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <p className="text-sm text-gray-300">
                <span className="font-bold text-arena-primary">{filtered.length}</span> events found
              </p>
            </div>
          </div>

          {/* Type Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            {typeTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={`group flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  typeFilter === tab.id
                    ? 'bg-gradient-to-r from-arena-primary to-arena-primary-dark text-white shadow-lg shadow-arena-primary/30'
                    : 'border border-white/20 bg-white/5 text-gray-400 backdrop-blur-sm hover:border-arena-primary/50 hover:text-white'
                }`}
              >
                <i className={`${tab.icon} text-base`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="border-y border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 py-6 md:grid-cols-4 md:px-16">
          {stats.map((s) => (
            <div key={s.label} className="group flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-white/5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${s.gradient} bg-opacity-20`}>
                <i className={`ti ${s.icon} text-xl text-white`} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sticky top-[72px] z-40 border-b border-white/10 bg-arena-navy/95 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 py-4 md:px-16">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Toggle for Mobile */}
            <button
              onClick={() => setIsFiltersVisible(!isFiltersVisible)}
              className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white md:hidden"
            >
              <i className="ti ti-filter" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 h-2 w-2 rounded-full bg-arena-primary" />
              )}
            </button>

            {/* Sport Pills */}
            <div className={`flex flex-wrap gap-2 ${isFiltersVisible ? 'flex' : 'hidden md:flex'}`}>
              {sportPills.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSportFilter(p.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    sportFilter === p.id
                      ? 'border-arena-primary bg-arena-primary/10 text-arena-primary'
                      : 'border-white/20 bg-white/5 text-gray-400 hover:border-white/40 hover:text-white'
                  }`}
                >
                  <i className={`${p.icon} text-xs`} />
                  {p.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className={`${isFiltersVisible ? 'flex' : 'hidden md:flex'}`}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white backdrop-blur-sm focus:border-arena-primary focus:outline-none"
                aria-label="Filter by status"
              >
                {statusOptions.map((o) => (
                  <option key={o.id} value={o.id} className="bg-arena-navy">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className={`ml-auto flex gap-2 ${isFiltersVisible ? 'flex' : 'hidden md:flex'}`}>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white backdrop-blur-sm focus:border-arena-primary focus:outline-none"
                aria-label="Sort events"
              >
                <option value="date">Date (Soonest First)</option>
                <option value="fee-low">Entry Fee (Low to High)</option>
                <option value="fee-high">Entry Fee (High to Low)</option>
                <option value="prize">Prize Pool (High to Low)</option>
                <option value="slots">Availability (Low to High)</option>
              </select>

              {/* View Toggle */}
              <div className="hidden rounded-lg border border-white/20 bg-white/5 p-1 sm:flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md px-2 py-1 transition-all ${
                    viewMode === 'grid' ? 'bg-arena-primary text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <i className="ti ti-layout-grid" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-md px-2 py-1 transition-all ${
                    viewMode === 'list' ? 'bg-arena-primary text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <i className="ti ti-list" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400">Active filters:</span>
              {typeFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-arena-primary/20 px-2 py-0.5 text-xs text-arena-primary">
                  {typeTabs.find(t => t.id === typeFilter)?.label}
                  <button onClick={() => setTypeFilter('all')} className="ml-1 hover:text-white">
                    <i className="ti ti-x text-xs" />
                  </button>
                </span>
              )}
              {sportFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-arena-primary/20 px-2 py-0.5 text-xs text-arena-primary">
                  {sportPills.find(p => p.id === sportFilter)?.label}
                  <button onClick={() => setSportFilter('all')} className="ml-1 hover:text-white">
                    <i className="ti ti-x text-xs" />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-arena-primary/20 px-2 py-0.5 text-xs text-arena-primary">
                  {statusOptions.find(o => o.id === statusFilter)?.label}
                  <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-white">
                    <i className="ti ti-x text-xs" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-arena-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-16">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-2xl bg-white/10" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 py-20 text-center">
            <p className="text-red-300">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-20 text-center backdrop-blur-sm">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5">
              <i className="ti ti-calendar-off text-5xl text-gray-500" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-white">No events match your filters</h2>
            <p className="mt-2 text-gray-400">Try adjusting your search or browse all events</p>
            <button
              onClick={clearFilters}
              className="mt-6 rounded-lg bg-gradient-to-r from-arena-primary to-arena-primary-dark px-6 py-2.5 font-semibold text-white transition-all hover:shadow-lg"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filtered.map((tournament, index) => (
              <div
                key={tournament._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <EventCard tournament={tournament} />
              </div>
            ))}
          </div>
        )}

        {/* Load More Section (if applicable) */}
        {filtered.length >= 6 && (
          <div className="mt-12 text-center">
            <button className="group flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:border-arena-primary hover:bg-arena-primary/20">
              <span>Load More Events</span>
              <i className="ti ti-arrow-down transition-transform group-hover:translate-y-1" />
            </button>
          </div>
        )}
      </main>

      {/* Newsletter Section */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-16">
        <div className="overflow-hidden rounded-2xl border border-arena-gold/30 bg-gradient-to-r from-arena-gold/10 via-transparent to-arena-gold/5 p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-arena-gold/20">
                <i className="ti ti-mail-forward text-arena-gold text-2xl" />
              </div>
              <div>
                <p className="text-sm font-semibold text-arena-gold">Stay Updated</p>
                <p className="text-xl font-bold text-white">Get notified about new tournaments</p>
                <p className="text-sm text-gray-400">Be the first to know when new events are announced</p>
              </div>
            </div>
            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-gray-400 focus:border-arena-primary focus:outline-none"
              />
              <button className="rounded-lg bg-gradient-to-r from-arena-primary to-arena-primary-dark px-6 py-2.5 font-semibold text-white transition-all hover:shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
