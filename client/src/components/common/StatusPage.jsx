import { Link } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export const StatusPage = ({
  eyebrow,
  title,
  description,
  icon = 'ti-alert-circle',
  primaryLabel = 'Go Home',
  primaryTo = '/',
  onPrimary,
  secondaryLabel,
  onSecondary,
}) => (
  <div className="min-h-screen bg-[#0B1020] text-white">
    <Navbar />
    <main className="mx-auto flex min-h-[calc(100vh-180px)] max-w-7xl items-center px-6 py-16 lg:px-12">
      <section className="grid w-full items-center gap-10 lg:grid-cols-[1fr_420px]">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-arena-gold">{eyebrow}</p>
          )}
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-400">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {onPrimary ? (
              <button
                type="button"
                onClick={onPrimary}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02]"
              >
                <i className="ti ti-refresh" />
                {primaryLabel}
              </button>
            ) : (
              <Link
                to={primaryTo}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02]"
              >
                <i className="ti ti-arrow-left" />
                {primaryLabel}
              </Link>
            )}
            {secondaryLabel && onSecondary && (
              <button
                type="button"
                onClick={onSecondary}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                <i className="ti ti-refresh" />
                {secondaryLabel}
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-sky-500/10">
            <i className={`ti ${icon} text-5xl text-sky-400`} />
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {['Events', 'Store', 'Dashboard'].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="h-2 w-10 rounded-full bg-white/20" />
                <p className="mt-3 text-xs text-gray-500">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="h-2 w-24 rounded-full bg-arena-gold/50" />
            <div className="mt-3 h-2 w-full rounded-full bg-white/10" />
            <div className="mt-2 h-2 w-2/3 rounded-full bg-white/10" />
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
)
