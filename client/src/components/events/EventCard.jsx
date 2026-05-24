// client/src/components/events/EventCard.jsx

import { Link } from 'react-router-dom';
import { useState } from 'react';
import { formatDate, normalizeSport } from '../../utils/helpers';

const sportIcons = {
  badminton: 'ti-trophy',
  'table-tennis': 'ti-table',
  tennis: 'ti-ball-tennis',
  football: 'ti-ball-football',
  running: 'ti-run',
  gym: 'ti-barbell',
  cricket: 'ti-ball-cricket',
  basketball: 'ti-ball-basketball',
};

/**
 * @param {{ tournament: object }} props
 */
export const EventCard = ({ tournament }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    _id,
    name,
    sport,
    type,
    format,
    venue,
    startDate,
    maxSlots,
    filledSlots,
    entryFee,
    nxlReward,
    status,
    poster,
    prizePool,
    skillLevel,
  } = tournament;

  const fillPercent = maxSlots ? Math.min(100, (filledSlots / maxSlots) * 100) : 0;
  const sportKey = normalizeSport(sport);
  const icon = sportIcons[sportKey] || 'ti-trophy';
  const spotsLeft = maxSlots - filledSlots;
  const isAlmostFull = fillPercent > 80;
  const isSoldOut = fillPercent >= 100;
  const isFree = entryFee === 0;
  const isLive = status === 'live';
  const canRegister = !isSoldOut && (status === 'open' || status === 'live');
  
  // Get status badge properties
  const getStatusBadge = () => {
    if (isLive) {
      return { label: 'LIVE NOW', color: 'from-red-500 to-red-600', icon: 'ti-player-record' };
    }
    if (status === 'open') {
      return { label: 'OPEN', color: 'from-green-500 to-emerald-600', icon: 'ti-check' };
    }
    if (status === 'upcoming') {
      return { label: 'UPCOMING', color: 'from-blue-500 to-blue-600', icon: 'ti-clock' };
    }
    return { label: 'CLOSED', color: 'from-gray-500 to-gray-600', icon: 'ti-lock' };
  };

  const statusBadge = getStatusBadge();

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-arena-primary/50 hover:shadow-2xl hover:shadow-arena-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-arena-navy/50 to-arena-navy-deep/50">
        {!isImageLoaded && poster && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-arena-primary border-t-transparent" />
          </div>
        )}
        
        {poster ? (
          <img
            src={poster}
            alt={name}
            className={`h-full w-full object-cover transition-all duration-500 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-110' : 'scale-100'}`}
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-arena-navy to-arena-navy-deep">
            <i className={`ti ${icon} text-5xl text-arena-gold/40 transition-all duration-300 group-hover:scale-110 group-hover:text-arena-gold/60`} />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-arena-navy via-arena-navy/60 to-transparent" />

        {/* Badges Container - Top Left */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full bg-gradient-to-r ${statusBadge.color} px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-lg`}>
            <span className="flex items-center gap-1">
              <i className={`ti ${statusBadge.icon} text-[8px]`} />
              {statusBadge.label}
            </span>
          </span>
          {type && (
            <span className="rounded-full bg-gradient-to-r from-arena-primary to-arena-primary-dark px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-lg">
              {type}
            </span>
          )}
          {format && (
            <span className="rounded-full bg-gradient-to-r from-arena-gold to-arena-gold-dark px-2.5 py-1 text-[10px] font-bold uppercase text-arena-navy shadow-lg">
              {format === 'team' || format === 'doubles' ? format : 'Solo'}
            </span>
          )}
        </div>

        {/* Prize Pool Badge - Top Right */}
        {prizePool && prizePool > 0 && (
          <div className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-arena-gold/90 to-arena-gold px-2.5 py-1 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <i className="ti ti-trophy text-arena-navy text-xs" />
              <span className="text-xs font-bold text-arena-navy">
                ₹{prizePool.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Almost Full Warning */}
        {isAlmostFull && !isSoldOut && canRegister && (
          <div className="absolute bottom-3 left-3 rounded-full bg-orange-500/90 px-2.5 py-1 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              <span className="text-[10px] font-bold uppercase text-white">
                {spotsLeft} spots left!
              </span>
            </div>
          </div>
        )}

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold uppercase text-white shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Tournament Name */}
        <Link to={`/events/${_id}`}>
          <h3 className="text-base font-bold text-white line-clamp-2 transition-colors hover:text-arena-primary">
            {name}
          </h3>
        </Link>

        {/* Sport & Venue */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-300">
          <div className="flex items-center gap-1">
            <i className="ti ti-trophy text-arena-gold text-xs" />
            <span className="capitalize">{sport?.replace('-', ' ')}</span>
          </div>
          {venue && (
            <>
              <span className="text-gray-500">•</span>
              <div className="flex items-center gap-1">
                <i className="ti ti-map-pin text-arena-primary text-xs" />
                <span className="line-clamp-1">{venue}</span>
              </div>
            </>
          )}
        </div>

        {/* Date */}
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-300">
          <i className="ti ti-calendar text-arena-gold text-xs" />
          <span>{formatDate(startDate)}</span>
        </div>

        {/* Skill Level (if available) */}
        {skillLevel && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
            <i className="ti ti-chart-line text-arena-primary text-xs" />
            <span className="capitalize">{skillLevel}</span>
          </div>
        )}

        {/* Slots Progress */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-400">
              <i className="ti ti-users text-xs" />
              <span>Slots</span>
            </div>
            <span className={`font-semibold ${isAlmostFull && !isSoldOut ? 'text-orange-400' : 'text-green-400'}`}>
              {isSoldOut ? 'Full' : `${spotsLeft} left`}
            </span>
          </div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-arena-primary to-arena-gold transition-all duration-700"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* NXL Reward */}
        {nxlReward > 0 && !isSoldOut && canRegister && (
          <div className="mt-3 flex items-center gap-1.5 rounded-full bg-arena-gold/10 px-2 py-1 w-fit">
            <i className="ti ti-coin text-arena-gold text-xs" />
            <span className="text-xs font-medium text-arena-gold">
              Earn {nxlReward} NXL
            </span>
          </div>
        )}

        {/* Price and Register Button - Fixed Layout */}
        <div className="mt-4 pt-3 border-t border-white/10">
          {/* Price */}
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-0.5">Entry Fee</p>
            {isFree ? (
              <span className="text-xl font-bold text-green-400">FREE</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-arena-primary">
                  ₹{entryFee.toLocaleString()}
                </span>
                {entryFee > 1000 && (
                  <span className="text-xs text-gray-500 line-through">
                    ₹{Math.floor(entryFee * 1.2).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Register Button - Full width for better visibility */}
          {canRegister ? (
            <Link
              to={`/events/${_id}/register`}
              className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-arena-primary to-arena-primary-dark py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-arena-primary/30 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                <i className="ti ti-calendar-plus text-base" />
                Register Now
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
            </Link>
          ) : isSoldOut ? (
            <button
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-700 py-2.5 text-sm font-semibold text-gray-400"
            >
              <i className="ti ti-ban text-base" />
              Sold Out
            </button>
          ) : status === 'upcoming' ? (
            <button
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-700 py-2.5 text-sm font-semibold text-gray-400"
            >
              <i className="ti ti-clock text-base" />
              Coming Soon
            </button>
          ) : (
            <button
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-700 py-2.5 text-sm font-semibold text-gray-400"
            >
              <i className="ti ti-lock text-base" />
              Registration Closed
            </button>
          )}
        </div>

        {/* Registration Closing Soon Alert */}
        {canRegister && spotsLeft <= 10 && spotsLeft > 0 && (
          <p className="mt-2 text-center text-[10px] text-orange-400">
            ⚡ Hurry! Only {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      {/* Hover Border Effect */}
      <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-arena-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </article>
  );
};