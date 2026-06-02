const mockMatches = [
  {
    id: 'm1',
    live: true,
    teamA: 'Smash Kings',
    teamB: 'Shuttle Squad',
    tournament: 'Nashik Open Badminton',
    venue: 'Smash Arena',
    time: 'Live now',
    date: '',
  },
  {
    id: 'm2',
    live: false,
    teamA: 'Spin Masters',
    teamB: 'Paddle Pros',
    tournament: 'Pune TT League',
    venue: 'Spin Club',
    time: '4:30 PM',
    date: '21 Jun',
  },
  {
    id: 'm3',
    live: false,
    teamA: 'Nashik Strikers',
    teamB: 'Road Warriors FC',
    tournament: 'Monsoon Football Cup',
    venue: 'City Sports Turf',
    time: '7:00 AM',
    date: '5 Jul',
  },
  {
    id: 'm4',
    live: false,
    teamA: 'Aarav K.',
    teamB: 'Riya M.',
    tournament: 'Singles Quarter-final',
    venue: 'Smash Arena',
    time: '11:00 AM',
    date: '14 Jun',
  },
  {
    id: 'm5',
    live: false,
    teamA: 'Pune Runners',
    teamB: 'Elite Pacers',
    tournament: 'Sunrise 10K Relay',
    venue: 'Boat Club Road',
    time: '6:00 AM',
    date: '12 Jul',
  },
]

export const UpcomingMatches = () => (
  <section className="bg-arena-navy px-6 py-16 md:px-16">
    <div className="mx-auto max-w-7xl">
      <p className="text-label uppercase tracking-widest text-arena-gold">Live &amp; upcoming</p>
      <h2 className="mt-2 text-h2 text-white">Match schedule</h2>
      <div className="scrollbar-hide mt-8 flex gap-4 overflow-x-auto pb-2">
        {mockMatches.map((match) => (
          <article
            key={match.id}
            className="min-w-64 flex-shrink-0 rounded-lg border border-arena-navy-accent bg-arena-navy-deep p-4"
          >
            {match.live ? (
              <span className="badge badge-live">Live</span>
            ) : (
              <span className="text-label text-gray-400">{match.date}</span>
            )}
            <div className="mt-4 text-center">
              <p className="font-bold text-white">{match.teamA}</p>
              <p className="my-2 text-sm font-bold text-arena-primary">VS</p>
              <p className="font-bold text-white">{match.teamB}</p>
            </div>
            <p className="mt-4 text-center text-small text-gray-400">{match.tournament}</p>
            <p className="mt-2 text-center text-small text-gray-500">
              {match.venue} · {match.time}
            </p>
          </article>
        ))}
      </div>
    </div>
  </section>
)
