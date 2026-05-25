import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const rotatingWords = [
  { word: 'Compete.', color: 'text-arena-primary' },
  { word: 'Win.', color: 'text-arena-gold' },
  { word: 'Dominate.', color: 'text-white' },
];

const stats = [
  { value: '1,200+', label: 'Active Players', icon: 'ti-users' },
  { value: '48', label: 'Live Tournaments', icon: 'ti-trophy' },
  { value: '₹2.4L+', label: 'Prize Pool', icon: 'ti-wallet' },
  { value: '15K+', label: 'Products Sold', icon: 'ti-shopping-bag' },
];

export const HeroBanner = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const wordTimer = setInterval(() => {
      setWordIndex((i) => (i + 1) % rotatingWords.length);
    }, 2400);
    return () => clearInterval(wordTimer);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-arena-navy">
      {/* Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-arena-navy via-arena-navy-deep to-black" />
      
      {/* Animated Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23E8420A' fillOpacity='0.15'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Animated Glow Orbs */}
      <div
        className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-arena-primary/20 blur-3xl"
        style={{ animation: 'float 8s ease-in-out infinite' }}
      />
      <div
        className="absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-arena-gold/15 blur-3xl"
        style={{ animation: 'float 10s ease-in-out infinite reverse' }}
      />
      <div
        className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl"
        style={{ animation: 'float 12s ease-in-out infinite' }}
      />

      {/* Sport Icons Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <div className="grid grid-cols-4 gap-16 text-8xl">
          <i className="ti ti-trophy" />
          <i className="ti ti-ball-basketball" />
          <i className="ti ti-fencing" />
          <i className="ti ti-medal" />
        </div>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-20 md:px-16 lg:flex-row lg:items-center lg:gap-16">
        {/* Left Content */}
        <div className="w-full space-y-8 lg:max-w-[55%]">
          {/* Badge */}
          <div className="inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-arena-primary/40 bg-arena-primary/10 px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-arena-primary">
              🏆 INDIA'S PREMIER SPORTS PLATFORM
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-6xl font-black leading-tight tracking-tight text-white sm:text-7xl lg:text-7xl">
              <span className="animate-fade-in-up block">
                <span
                  key={wordIndex}
                  className={`inline-block animate-fade-in transition-all duration-500 ${
                    rotatingWords[wordIndex].color
                  }`}
                >
                  {rotatingWords[wordIndex].word}
                </span>
              </span>
              <span className="animate-fade-in-up animation-delay-200 mt-2 block text-3xl font-bold text-gray-300 sm:text-4xl">
                Rise Above The Rest
              </span>
            </h1>

            <p className="animate-fade-in-up animation-delay-300 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg">
              Join India's premier sports ecosystem where athletes compete, fans engage, and 
              champions rise. Register for tournaments across major cities, shop premium gear, 
              and earn <span className="font-bold text-arena-gold">NXL credits</span> — 
              turning every purchase into your next victory.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up animation-delay-400 flex flex-wrap gap-4">
            <Link
              to="/events"
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-arena-primary to-arena-primary-dark px-8 py-4 font-bold text-white shadow-lg shadow-arena-primary/30 transition-all hover:shadow-xl hover:shadow-arena-primary/50 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                <i className="ti ti-calendar-event text-xl" />
                Join a Tournament
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </Link>
            
            <Link
              to="/store"
              className="group rounded-lg border-2 border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:border-arena-primary hover:bg-arena-primary/20 hover:shadow-lg active:scale-95"
            >
              <span className="flex items-center gap-2">
                <i className="ti ti-shopping-bag text-xl" />
                Browse Store
              </span>
            </Link>

            <a
              href="#how-it-works"
              className="group rounded-lg px-6 py-4 font-medium text-gray-400 transition-all hover:text-white"
            >
              <span className="flex items-center gap-1">
                How it works
                <i className="ti ti-arrow-right transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </div>

          {/* Stats Row */}
          <div className="animate-fade-in-up animation-delay-500 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="group relative rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-arena-primary/50 hover:bg-white/10">
                <i className={`${stat.icon} mb-2 block text-2xl text-arena-primary/60`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="animate-fade-in-up animation-delay-600 flex flex-wrap items-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <i className="ti ti-shield-check text-arena-gold" />
              <span className="text-xs text-gray-400">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ti ti-clock text-arena-gold" />
              <span className="text-xs text-gray-400">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ti ti-star-filled text-arena-gold" />
              <span className="text-xs text-gray-400">4.9 ★ Rated</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ti ti-credit-card text-arena-gold" />
              <span className="text-xs text-gray-400">Instant Withdrawal</span>
            </div>
          </div>
        </div>

        {/* Right Side - Cards Panel */}
        <div className="animate-fade-in-up animation-delay-200 relative mt-16 w-full lg:mt-0 lg:w-[45%]">
          {/* NXL Credits Promo Card */}
          <div className="relative mb-4 overflow-hidden rounded-2xl border border-arena-gold/30 bg-gradient-to-r from-arena-gold/10 to-transparent p-5 backdrop-blur-sm">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-arena-gold/20 blur-xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-arena-gold/20 p-3">
                  <i className="ti ti-coin text-arena-gold text-2xl" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-arena-gold">
                    Welcome Bonus
                  </p>
                  <p className="text-xl font-bold text-white">Get 500 NXL Credits FREE</p>
                  <p className="text-xs text-gray-400">on first registration</p>
                </div>
              </div>
              <Link 
                to="/register" 
                className="rounded-lg bg-arena-gold px-4 py-2 text-sm font-bold text-arena-navy transition-all hover:bg-arena-gold-dark hover:shadow-lg"
              >
                Claim Now →
              </Link>
            </div>
          </div>

          {/* Featured Tournament Card */}
          {/* <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl shadow-2xl">
            <div className="absolute right-0 top-0">
              <div className="bg-gradient-to-l from-arena-primary to-arena-primary-dark px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-bl-xl">
                🔥 Featured
              </div>
            </div>
            
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-full bg-arena-primary/20 p-2">
                <i className="ti ti-trophy text-arena-primary text-xl" />
              </div>
              <span className="text-sm font-bold text-arena-gold">PREMIUM EVENT</span>
            </div>
            
            <h3 className="text-2xl font-bold text-white">Nashik Open 2026</h3>
            <p className="mt-1 text-gray-300">India's Premier Badminton Championship</p>
            
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-green-400">Live Now</span>
              </div>
              <span className="text-xs text-gray-400">• 3 Active Matches</span>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-xs text-gray-400">Prize Pool</p>
                <p className="text-lg font-bold text-arena-primary">₹2,50,000</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="font-medium text-white">Nashik, Maharashtra</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Slots Left</p>
                <p className="font-bold text-orange-400">32 / 128</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Registration Fee</p>
                <p className="font-medium text-white">₹999</p>
              </div>
            </div>
            
            <Link
              to="/events/t1"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-arena-primary to-arena-primary-dark py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-arena-primary/30"
            >
              Register Now
              <i className="ti ti-arrow-right" />
            </Link>
          </div> */}

          {/* Live Match Indicator */}
          {/* <div className="absolute -left-4 top-1/3 hidden rounded-xl border border-white/20 bg-black/60 p-3 backdrop-blur-md lg:flex lg:items-center lg:gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-arena-primary/20 flex items-center justify-center">
                <i className="ti ti-brand-badminton text-arena-primary" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Live Match</p>
              <p className="text-sm font-bold text-white">India vs Singapore</p>
              <p className="text-xs text-arena-gold">2nd Set • 15-12</p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-arena-navy to-transparent" />
    </section>
  );
};
