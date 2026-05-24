// client/src/components/home/NxlBenefits.jsx

const benefits = [
  {
    title: 'Shop & earn',
    desc: 'Get 5 NXL for every ₹100 spent on shoes, jerseys, rackets, and more.',
    icon: 'ti-shopping-cart',
  },
  {
    title: 'Register & earn',
    desc: 'Tournament sign-ups award 50–250 NXL depending on the event tier.',
    icon: 'ti-trophy',
  },
  {
    title: 'Redeem anywhere',
    desc: 'Use credits at checkout for gear or pay partial entry fees in one tap.',
    icon: 'ti-wallet',
  },
]

const counters = [
  { value: '12,400+', label: 'NXL earned by players' },
  { value: '₹8.2L', label: 'Redeemed value' },
  { value: '1:1', label: 'Credit to rupee ratio' },
]

export const NxlBenefits = () => (
  <section className="relative overflow-hidden bg-arena-navy px-6 py-20 md:px-16">
    <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-arena-gold/10 blur-3xl" />
    <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-arena-primary/20 blur-3xl" />

    <div className="relative mx-auto max-w-7xl">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-label uppercase tracking-widest text-arena-gold">NXL Rewards</p>
          <h2 className="mt-3 text-h1 text-white md:text-[2rem]">
            Play more. Earn credits. Pay less.
          </h2>
          <p className="mt-4 text-body leading-relaxed text-gray-400">
            NXL is PlayArena&apos;s loyalty currency — exclusive to purchases and tournament
            registrations. Credits never expire while your account is active.
          </p>

          <ul className="mt-8 space-y-5">
            {benefits.map((b) => (
              <li key={b.title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-arena-navy-deep ring-1 ring-arena-gold/30">
                  <i className={`ti ${b.icon} text-xl text-arena-gold`} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-white">{b.title}</p>
                  <p className="mt-1 text-sm text-gray-400">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-arena-navy-accent bg-arena-navy-deep/80 p-8 backdrop-blur">
          <div className="flex items-center justify-center gap-2">
            <i className="ti ti-coin text-4xl text-arena-gold" aria-hidden="true" />
            <span className="text-3xl font-extrabold text-arena-gold">NXL</span>
          </div>
          <p className="mt-2 text-center text-sm text-gray-400">Program impact</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {counters.map((c) => (
              <div
                key={c.label}
                className="rounded-lg bg-arena-navy p-4 text-center ring-1 ring-white/5"
              >
                <p className="text-2xl font-bold text-white md:text-3xl">{c.value}</p>
                <p className="mt-2 text-xs leading-snug text-gray-400">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg bg-arena-primary/10 p-4 ring-1 ring-arena-primary/30">
            <p className="text-center text-sm text-gray-300">
              Example: Spend <strong className="text-white">₹2,000</strong> → earn{' '}
              <strong className="text-arena-gold">100 NXL</strong> (= ₹100 off your next order)
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
)
