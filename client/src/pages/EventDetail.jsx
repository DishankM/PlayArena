
import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'

import { mockTournaments } from '../data/mockData'

import {
  formatDate,
  getSlotPercent,
  normalizeSport,
} from '../utils/helpers'

const sportIcons = {
  badminton: 'ti-trophy',
  'table-tennis': 'ti-table',
  tennis: 'ti-ball-tennis',
  football: 'ti-ball-football',
  running: 'ti-run',
  gym: 'ti-dumbbell',
  cricket: 'ti-ball-cricket',
}

const mockSchedule = [
  {
    time: '09:00 AM',
    label: 'Registration & check-in',
    icon: 'ti-checklist',
  },
  {
    time: '10:00 AM',
    label: 'Opening matches begin',
    icon: 'ti-player-play',
  },
  {
    time: '02:00 PM',
    label: 'Quarter-finals',
    icon: 'ti-trophy',
  },
  {
    time: '06:00 PM',
    label: 'Semi-finals & prize ceremony',
    icon: 'ti-crown',
  },
]

const faqs = [
  {
    q: 'What should I bring?',
    a: 'Valid ID proof, your QR code and sports gear.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Refunds are available up to 7 days before the event.',
  },
  {
    q: 'How do NXL credits work?',
    a: '1 NXL credit = ₹1 usable in checkout.',
  },
]

const glassCard =
  'rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

export default function EventDetail() {
  const { id } = useParams()

  const [activeTab, setActiveTab] = useState('details')
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const tournament = mockTournaments.find((t) => t._id === id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#0B1020]">
        <Navbar />

        <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-24">
          <div className="text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white/5">
              <i className="ti ti-calendar-off text-5xl text-gray-500" />
            </div>

            <h1 className="mt-6 text-4xl font-bold text-white">
              Event not found
            </h1>

            <p className="mt-3 text-gray-400">
              The tournament does not exist.
            </p>

            <Link
              to="/events"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02]"
            >
              <i className="ti ti-arrow-left" />
              Browse Events
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  const {
    _id,
    name,
    sport,
    type,
    format,
    venue,
    startDate,
    endDate,
    entryFee,
    prize,
    maxSlots,
    filledSlots,
    nxlReward,
    status,
    rules,
    description,
    poster,
    skillLevel = 'Intermediate',
  } = tournament

  const sportKey = normalizeSport(sport)
  const icon = sportIcons[sportKey] || 'ti-trophy'

  const fillPercent = getSlotPercent(filledSlots, maxSlots)

  const slotsLeft = maxSlots - filledSlots

  const canRegister =
    status === 'open' || status === 'upcoming'

  const multiDay =
    endDate &&
    new Date(endDate).getDate() !==
      new Date(startDate).getDate()

  const isAlmostFull = fillPercent > 80

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href)
    alert('Link copied!')
  }

  // Get related tournaments (excluding current one)
  const relatedTournaments = mockTournaments
    .filter((t) => t._id !== _id && t.sport === sport)
    .slice(0, 3)

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0B1020] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[540px] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {poster && (
            <img
              src={poster}
              alt={name}
              onLoad={() => setIsImageLoaded(true)}
              className={`h-full w-full object-cover transition-opacity duration-700 ${
                isImageLoaded ? 'opacity-30' : 'opacity-0'
              }`}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1020]/95 via-[#0B1020]/80 to-[#0B1020]/95" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28">
          <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between">
            {/* LEFT */}
            <div className="max-w-3xl">
              {/* badges */}
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-sky-500/10 px-4 py-1 text-xs font-bold uppercase tracking-wide text-sky-400">
                  {type}
                </span>

                <span className="rounded-full bg-violet-500/10 px-4 py-1 text-xs font-bold uppercase tracking-wide text-violet-400">
                  {format}
                </span>

                {status === 'open' && (
                  <span className="rounded-full bg-green-500/10 px-4 py-1 text-xs font-bold uppercase tracking-wide text-green-400">
                    Registrations Open
                  </span>
                )}
              </div>

              {/* title */}
              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {name}
              </h1>

              {/* info */}
              <div className="mt-6 flex flex-wrap gap-5 text-sm text-gray-300">
                <span className="flex items-center gap-2">
                  <i className={`ti ${icon} text-sky-400`} />
                  {sport}
                </span>

                <span className="flex items-center gap-2">
                  <i className="ti ti-map-pin text-violet-400" />
                  {venue}
                </span>

                <span className="flex items-center gap-2">
                  <i className="ti ti-calendar text-amber-400" />
                  {formatDate(startDate)}
                  {multiDay && ` – ${formatDate(endDate)}`}
                </span>

                <span className="flex items-center gap-2">
                  <i className="ti ti-chart-line text-green-400" />
                  {skillLevel}
                </span>
              </div>

              {/* progress */}
              <div className="mt-8 max-w-xl">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Slot Availability
                  </span>

                  <span
                    className={`font-semibold ${
                      isAlmostFull
                        ? 'text-orange-400'
                        : 'text-green-400'
                    }`}
                  >
                    {slotsLeft} spots left
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-700"
                    style={{
                      width: `${fillPercent}%`,
                    }}
                  />
                </div>
              </div>

              {/* rewards */}
              {nxlReward > 0 && (
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2">
                  <i className="ti ti-coin text-amber-400" />

                  <span className="text-sm font-medium text-amber-300">
                    Earn {nxlReward} NXL Credits
                  </span>
                </div>
              )}

              {/* actions */}
              <div className="mt-8 flex flex-wrap gap-4">
                {canRegister && (
                  <Link
                    to={`/events/${_id}/register`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-8 py-4 font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-2xl"
                  >
                    <i className="ti ti-calendar-plus" />
                    Register Now
                  </Link>
                )}

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white transition-all hover:bg-white/10"
                >
                  <i className="ti ti-share" />
                  Share
                </button>
              </div>
            </div>

            {/* RIGHT CARD - Not sticky in hero */}
            <div
              className={`${glassCard} w-full max-w-sm p-6 backdrop-blur-md`}
            >
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Entry Fee
                </p>

                <p className="mt-2 text-5xl font-black text-sky-400">
                  {entryFee === 0
                    ? 'FREE'
                    : `₹${entryFee}`}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div className="rounded-2xl bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold text-white">
                    {prize}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Prize Pool
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold text-white">
                    {maxSlots}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Slots
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
        {/* tabs */}
        <div className="mb-10 overflow-x-auto border-b border-white/10">
          <div className="flex min-w-max gap-3">
            {['details', 'schedule', 'venue', 'faq'].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap border-b-2 px-5 py-4 text-sm font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? 'border-sky-400 text-sky-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {tab === 'faq' ? 'FAQ' : tab}
                </button>
              )
            )}
          </div>
        </div>

        {/* grid */}
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* left */}
          <div className="space-y-8">
            {/* DETAILS */}
            {activeTab === 'details' && (
              <>
                <div className={`${glassCard} p-8`}>
                  <h2 className="text-2xl font-bold">
                    About Tournament
                  </h2>

                  <p className="mt-5 leading-8 text-gray-300">
                    {description}
                  </p>
                </div>

                <div className={`${glassCard} p-8`}>
                  <h2 className="text-2xl font-bold">
                    Rules & Regulations
                  </h2>

                  <div className="mt-6 space-y-4">
                    {rules?.map((rule, index) => (
                      <div
                        key={index}
                        className="flex gap-3 rounded-2xl bg-white/[0.03] p-4"
                      >
                        <i className="ti ti-check text-sky-400" />

                        <p className="text-gray-300">
                          {rule}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* schedule */}
            {activeTab === 'schedule' && (
              <div className={`${glassCard} p-8`}>
                <h2 className="text-2xl font-bold">
                  Event Schedule
                </h2>

                <div className="mt-8 space-y-5">
                  {mockSchedule.map((s) => (
                    <div
                      key={s.time}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10">
                        <i
                          className={`ti ${s.icon} text-xl text-sky-400`}
                        />
                      </div>

                      <div>
                        <p className="font-semibold">
                          {s.time}
                        </p>

                        <p className="text-sm text-gray-400">
                          {s.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* venue */}
            {activeTab === 'venue' && (
              <div className={`${glassCard} p-8`}>
                <h2 className="text-2xl font-bold">
                  Venue Information
                </h2>

                <div className="mt-6 rounded-3xl bg-white/[0.03] p-6">
                  <div className="flex items-center gap-3">
                    <i className="ti ti-map-pin text-2xl text-sky-400" />

                    <div>
                      <p className="font-semibold">
                        {venue}
                      </p>

                      <p className="text-sm text-gray-400">
                        Maharashtra, India
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      venue
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-400 transition-all hover:bg-sky-500/20"
                  >
                    <i className="ti ti-map" />
                    Open in Maps
                  </a>
                </div>
              </div>
            )}

            {/* faq */}
            {activeTab === 'faq' && (
              <div className={`${glassCard} p-8`}>
                <h2 className="text-2xl font-bold">
                  Frequently Asked Questions
                </h2>

                <div className="mt-8 space-y-5">
                  {faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <p className="font-semibold text-sky-400">
                        {faq.q}
                      </p>

                      <p className="mt-2 text-gray-300">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* sidebar - FIXED STICKY BEHAVIOR */}
          <div className="relative">
            {/* Registration Card - Sticky */}
            <div className="lg:sticky lg:top-24">
              <div
                className={`${glassCard} overflow-hidden p-6 backdrop-blur-md`}
              >
                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Registration Fee
                  </p>

                  <p className="mt-2 text-5xl font-black text-sky-400">
                    {entryFee === 0
                      ? 'FREE'
                      : `₹${entryFee}`}
                  </p>
                </div>

                <div className="mt-8">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-gray-400">
                      Availability
                    </span>

                    <span className={`font-semibold ${isAlmostFull ? 'text-orange-400' : 'text-green-400'}`}>
                      {slotsLeft} left
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-700"
                      style={{
                        width: `${fillPercent}%`,
                      }}
                    />
                  </div>
                </div>

                {nxlReward > 0 && (
                  <div className="mt-6 rounded-2xl bg-amber-500/10 p-3 text-center">
                    <i className="ti ti-coin text-amber-400" />
                    <span className="ml-2 text-sm text-amber-300">
                      +{nxlReward} NXL Credits
                    </span>
                  </div>
                )}

                {canRegister ? (
                  <Link
                    to={`/events/${_id}/register`}
                    className="mt-8 block rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 py-4 text-center font-semibold transition-all hover:scale-[1.01] hover:shadow-xl"
                  >
                    Register Now
                  </Link>
                ) : (
                  <button
                    disabled
                    className="mt-8 w-full cursor-not-allowed rounded-2xl bg-gray-700 py-4 font-semibold text-gray-400"
                  >
                    Registration Closed
                  </button>
                )}

                {/* organizer */}
                <div className="mt-8 border-t border-white/10 pt-6">
                  <h3 className="font-semibold">
                    Organizer
                  </h3>

                  <div className="mt-4 space-y-3 text-sm text-gray-300">
                    <p>PlayArena Events Team</p>

                    <p className="flex items-center gap-2">
                      <i className="ti ti-mail text-sky-400" />
                      events@playarena.in
                    </p>

                    <p className="flex items-center gap-2">
                      <i className="ti ti-phone text-violet-400" />
                      +91 98765 43210
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Events - NOT STICKY (scrolls naturally) */}
            <div className={`${glassCard} mt-6 p-6`}>
              <h3 className="text-lg font-bold">
                Similar Events
              </h3>

              <div className="mt-5 space-y-3">
                {relatedTournaments.length > 0 ? (
                  relatedTournaments.map((event) => (
                    <Link
                      key={event._id}
                      to={`/events/${event._id}`}
                      className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-4 transition-all hover:bg-white/[0.05] hover:translate-x-1"
                    >
                      <div>
                        <p className="font-medium">
                          {event.name}
                        </p>

                        <p className="text-sm text-gray-400">
                          {event.sport} • ₹{event.entryFee}
                        </p>
                      </div>

                      <i className="ti ti-arrow-right text-gray-400" />
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">
                    No similar events found
                  </p>
                )}
              </div>
            </div>

            {/* tip */}
            <div className="mt-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6">
              <div className="flex gap-4">
                <i className="ti ti-bulb text-2xl text-amber-400" />

                <div>
                  <h4 className="font-semibold">
                    Pro Tip
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    Register early to secure your spot and
                    unlock exclusive rewards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}