// client/src/components/home/HowItWorks.jsx

import { Link } from 'react-router-dom';
import { useState } from 'react';

const steps = [
  {
    num: '01',
    title: 'Create your profile',
    desc: 'Sign up free, add your city and sports preferences, and link your phone for QR passes.',
    icon: 'ti-user-plus',
    color: 'from-blue-500 to-blue-600',
    bgGlow: 'rgba(59, 130, 246, 0.15)',
  },
  {
    num: '02',
    title: 'Browse & register',
    desc: 'Filter tournaments by sport and city. Pay via UPI, card, or NXL credits.',
    icon: 'ti-calendar-event',
    color: 'from-arena-primary to-arena-primary-dark',
    bgGlow: 'rgba(232, 66, 10, 0.15)',
  },
  {
    num: '03',
    title: 'Get your QR pass',
    desc: 'Instant email with digital entry pass. Show at check-in — no printouts needed.',
    icon: 'ti-qrcode',
    color: 'from-purple-500 to-purple-600',
    bgGlow: 'rgba(168, 85, 247, 0.15)',
  },
  {
    num: '04',
    title: 'Compete & earn NXL',
    desc: 'Play your matches, shop gear from the store, and stack credits for the next season.',
    icon: 'ti-coin',
    color: 'from-arena-gold to-arena-gold-dark',
    bgGlow: 'rgba(247, 201, 72, 0.15)',
  },
];

const stats = [
  { value: '2min', label: 'Average Registration Time', icon: 'ti-clock' },
  { value: '100%', label: 'Digital Check-in', icon: 'ti-qrcode' },
  { value: '24/7', label: 'Support Available', icon: 'ti-headset' },
  { value: '1:1', label: 'NXL Credit Value', icon: 'ti-coin' },
];

export const HowItWorks = () => {
  const [hoveredStep, setHoveredStep] = useState(null);

  return (
    <section id="how-it-works" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-arena-navy to-arena-navy-deep py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-20 bottom-1/4 h-96 w-96 rounded-full bg-arena-primary/5 blur-3xl animate-float" />
        <div className="absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-arena-gold/5 blur-3xl animate-float animation-delay-400" />
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
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-arena-primary/30 bg-arena-primary/10 px-4 py-1.5 backdrop-blur-sm mb-4">
            <i className="ti ti-star-filled text-arena-primary text-sm" />
            <span className="text-xs font-bold uppercase tracking-wider text-arena-primary">
              Simple Process
            </span>
          </div>
          
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            How{' '}
            <span className="bg-gradient-to-r from-arena-primary to-arena-gold bg-clip-text text-transparent">
              PlayArena
            </span>
            {' '}works
          </h2>
          
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-300">
            From sign-up to podium — four simple steps to your next tournament victory.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-2">
                <i className={`${stat.icon} text-arena-primary text-xl`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <p className="mt-1 text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Steps Section */}
        <div className="relative mt-16">
          {/* Connecting Line */}
          <div className="absolute left-0 right-0 top-20 hidden h-0.5 bg-gradient-to-r from-transparent via-arena-primary/30 to-transparent lg:block" />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => (
              <div
                key={step.num}
                className="group relative"
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Step Card */}
                <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-arena-primary/50 hover:shadow-2xl hover:shadow-arena-primary/20">
                  {/* Icon Container */}
                  <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-arena-navy to-arena-navy-deep border border-white/10 transition-all duration-300 group-hover:border-arena-primary/50">
                    {/* Glow Effect on Hover */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${step.color} opacity-0 transition-opacity duration-300 blur-xl group-hover:opacity-20`}
                    />
                    
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-arena-primary to-arena-primary-dark text-xs font-bold text-white shadow-lg">
                      {step.num}
                    </div>
                    
                    {/* Icon */}
                    <i
                      className={`ti ${step.icon} text-4xl transition-all duration-300 group-hover:scale-110`}
                      style={{ 
                        color: hoveredStep === index 
                          ? step.color.includes('arena-gold') ? '#F7C948' 
                          : step.color.includes('arena-primary') ? '#E8420A'
                          : step.color.includes('blue') ? '#3B82F6'
                          : '#A855F7'
                          : '#9CA3AF'
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="mt-6 text-center">
                    <h3 className="text-lg font-bold text-white transition-colors group-hover:text-arena-primary">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-300">
                      {step.desc}
                    </p>
                  </div>

                  {/* Arrow Indicator on Hover */}
                  <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-1 rounded-full bg-arena-primary px-2 py-0.5 opacity-0 transition-all duration-300 group-hover:bottom-4 group-hover:opacity-100">
                    <span className="text-[10px] font-semibold text-white">Step</span>
                    <i className="ti ti-arrow-right text-white text-xs" />
                  </div>
                </div>

                {/* Connector Arrow (Desktop) */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-3 top-20 hidden lg:block">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-arena-primary/20">
                      <i className="ti ti-chevron-right text-arena-primary text-sm" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Video/Image Section */}
        <div className="mt-20 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-arena-primary/5 to-transparent p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-arena-primary/20">
                <i className="ti ti-video text-arena-primary text-3xl" />
              </div>
              <div>
                <p className="text-sm font-semibold text-arena-gold">Watch Demo</p>
                <p className="text-lg font-bold text-white">See how PlayArena works in 2 minutes</p>
                <p className="text-sm text-gray-400">Learn about registration, payments, and check-in</p>
              </div>
            </div>
            
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-arena-primary to-arena-primary-dark px-8 py-3 font-semibold text-white shadow-lg shadow-arena-primary/30 transition-all hover:shadow-xl hover:shadow-arena-primary/50 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              <i className="ti ti-user-plus text-lg" />
              Get started free
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </Link>
          
          <Link
            to="/events"
            className="flex items-center gap-2 rounded-lg border-2 border-white/20 bg-white/5 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:border-arena-primary hover:bg-arena-primary/20 hover:shadow-lg active:scale-95"
          >
            <i className="ti ti-calendar-event" />
            Explore events
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <i className="ti ti-shield-check text-arena-gold text-sm" />
            <span className="text-xs text-gray-400">100% Secure</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <i className="ti ti-credit-card text-arena-gold text-sm" />
            <span className="text-xs text-gray-400">Multiple Payments</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <i className="ti ti-headset text-arena-gold text-sm" />
            <span className="text-xs text-gray-400">24/7 Support</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <i className="ti ti-refresh text-arena-gold text-sm" />
            <span className="text-xs text-gray-400">Easy Refunds</span>
          </div>
        </div>
      </div>
    </section>
  );
};
