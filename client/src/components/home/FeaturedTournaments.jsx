// client/src/components/home/FeaturedTournaments.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EventCard } from '../events/EventCard';
import { mockTournaments } from '../../data/mockData';
import { getSlotPercent } from '../../utils/helpers';

const upcoming = mockTournaments
  .filter((t) => t.status === 'open' || t.status === 'upcoming')
  .slice(0, 4);

const prizePoolStats = [
  { label: 'Total Prize Pool', value: '₹5.2L+', icon: 'ti-trophy' },
  { label: 'Active Tournaments', value: '12', icon: 'ti-calendar-event' },
  { label: 'Teams Registered', value: '48', icon: 'ti-users' },
  { label: 'Cities', value: '4', icon: 'ti-map-pin' },
];

export const FeaturedTournaments = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-arena-navy to-arena-navy-deep py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-40 left-20 h-96 w-96 rounded-full bg-arena-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-arena-gold/5 blur-3xl animate-float animation-delay-400" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-16">
        {/* Header Section */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-arena-primary/30 bg-arena-primary/10 px-4 py-1.5 backdrop-blur-sm mb-4">
              <i className="ti ti-trophy text-arena-primary text-sm" />
              <span className="text-xs font-bold uppercase tracking-wider text-arena-primary">
                Upcoming Events
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Tournaments open for{' '}
              <span className="bg-gradient-to-r from-arena-primary to-arena-gold bg-clip-text text-transparent">
                registration
              </span>
            </h2>
            <p className="mt-3 max-w-lg text-base text-gray-300">
              Slots fill fast — reserve your spot in Nashik, Pune, Mumbai, and Hyderabad.
              Join now and compete with the best!
            </p>
          </div>
          <Link 
            to="/events" 
            className="group flex items-center gap-2 rounded-lg border border-arena-primary/30 bg-white/5 px-6 py-3 font-semibold text-arena-primary backdrop-blur-sm transition-all hover:bg-arena-primary/10 hover:border-arena-primary hover:shadow-lg"
          >
            <span>View all events</span>
            <i className="ti ti-arrow-right transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Prize Pool Stats */}
        <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:grid-cols-4">
          {prizePoolStats.map((stat, idx) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-2">
                <i className={`${stat.icon} text-arena-primary text-xl`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <p className="mt-1 text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Slot Progress Bar Section */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-arena-primary/5 to-transparent p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-arena-primary/20">
                <i className="ti ti-chart-bar text-arena-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-arena-gold">Limited Slots Available</p>
                <p className="text-xs text-gray-400">Register early to secure your spot</p>
              </div>
            </div>
            <div className="text-sm font-medium text-white">
              {upcoming.reduce((acc, t) => acc + t.filledSlots, 0)} /{' '}
              {upcoming.reduce((acc, t) => acc + t.maxSlots, 0)} total slots filled
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4">
            {upcoming.slice(0, 4).map((t, idx) => (
              <div key={t._id} className="flex-1 min-w-[180px]">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-300">{t.sport}</span>
                  <span className="text-arena-gold">
                    {t.filledSlots}/{t.maxSlots}
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-arena-primary to-arena-gold transition-all duration-1000"
                    style={{ width: `${getSlotPercent(t.filledSlots, t.maxSlots)}%` }}
                  >
                    <div className="absolute right-0 top-0 h-full w-2 bg-white/30 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.map((tournament, index) => (
            <div
              key={tournament._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <EventCard tournament={tournament} />
            </div>
          ))}
        </div>

        {/* Featured Tournament Banner */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-arena-gold/30 bg-gradient-to-r from-arena-gold/10 via-transparent to-arena-gold/5 p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-arena-gold/20">
                <i className="ti ti-crown text-arena-gold text-3xl" />
              </div>
              <div>
                <p className="text-sm font-semibold text-arena-gold">🏆 Championship Series</p>
                <p className="text-xl font-bold text-white">Nashik Open 2026 - Grand Slam</p>
                <p className="text-sm text-gray-300">₹5,00,000 Prize Pool • Pro Players Welcome</p>
              </div>
            </div>
            <Link
              to="/events/nashik-open-grand-slam"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-arena-gold to-arena-gold-dark px-6 py-3 font-bold text-arena-navy transition-all hover:shadow-lg hover:shadow-arena-gold/30"
            >
              Register Now
              <i className="ti ti-arrow-right" />
            </Link>
          </div>
        </div>

        {/* Fast Filling Alert */}
        {upcoming.some(t => getSlotPercent(t.filledSlots, t.maxSlots) > 80) && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-xs font-medium text-red-400">Fast Filling</span>
            </div>
            <p className="text-xs text-gray-400">
              Some tournaments are almost full — secure your spot today!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};