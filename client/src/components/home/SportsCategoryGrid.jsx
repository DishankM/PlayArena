import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const categories = [
  {
    name: 'Badminton',
    sport: 'badminton',
    image:
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80&auto=format&fit=crop',
    events: 24,
    players: 840,
  },
  {
    name: 'Table Tennis',
    sport: 'table-tennis',
    image:
      'https://images.unsplash.com/photo-1534153866295-c7434be973b1?w=600&q=80&auto=format&fit=crop',
    events: 18,
    players: 520,
  },
  {
    name: 'Tennis',
    sport: 'tennis',
    image:
      'https://images.unsplash.com/photo-1595435934249-443f908eeeca?w=600&q=80&auto=format&fit=crop',
    events: 12,
    players: 310,
  },
  {
    name: 'Football',
    sport: 'football',
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80&auto=format&fit=crop',
    events: 15,
    players: 680,
  },
  {
    name: 'Running',
    sport: 'running',
    image:
      'https://images.unsplash.com/photo-1476480862128-209bfaa8edc8?w=600&q=80&auto=format&fit=crop',
    events: 9,
    players: 1200,
  },
  {
    name: 'Gym & Fitness',
    sport: 'gym',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80&auto=format&fit=crop',
    events: 6,
    players: 450,
  },
]

export const SportsCategoryGrid = () => {
  const navigate = useNavigate()

  const handleCategoryClick = (sport) => {
    navigate(`/store?sport=${sport}`)
  }

  return (
    <section className="relative overflow-hidden bg-[#0B0F19] px-6 py-24 md:px-16">
      
      {/* Background Glow */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
              Sports Categories
            </p>

            <h2 className="max-w-xl text-4xl font-extrabold leading-tight text-white md:text-5xl">
              Pick Your
              <span className="bg-gradient-to-r from-sky-400 to-violet-500 bg-clip-text text-transparent">
                {' '}
                Arena
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-400">
              Explore premium sports gear, tournaments, and athlete-focused
              collections tailored for every sport.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/events')}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-sky-400/40 hover:bg-sky-500/10"
          >
            View All Tournaments
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {categories.map((cat) => (
            <button
              key={cat.sport}
              type="button"
              onClick={() => handleCategoryClick(cat.sport)}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-sky-400/40 hover:shadow-[0_0_40px_rgba(0,191,255,0.15)]"
            >
              
              {/* Image */}
              <div className="relative h-[340px] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />

                {/* Floating Badge */}
                <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-semibold text-sky-300 backdrop-blur-md">
                  {cat.events} Events
                </div>

                {/* Arrow Icon */}
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
                  <ArrowRight size={18} />
                </div>
              </div>

              {/* Content */}
              <div className="relative p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">
                    {cat.name}
                  </h3>

                  <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
                </div>

                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Join tournaments, shop equipment, and compete with athletes
                  in the {cat.name.toLowerCase()} community.
                </p>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Active Players
                    </p>
                    <p className="text-lg font-bold text-sky-400">
                      {cat.players}+
                    </p>
                  </div>

                  <div className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-sky-500/20">
                    Explore
                  </div>
                </div>
              </div>

              {/* Hover Gradient Border */}
              <div className="absolute inset-0 rounded-3xl border border-transparent transition-all duration-500 group-hover:border-sky-400/30" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}