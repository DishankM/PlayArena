import { useState } from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: 'ti-calendar-event',
    title: 'Tournament Registration',
    desc: 'Sign up for solo, doubles, and team events in under 2 minutes with instant confirmation.',
    highlight: 'Instant Confirmation',
    gradient: 'from-arena-primary to-arena-primary-dark',
    link: '/events',
  },
  {
    icon: 'ti-shopping-bag',
    title: 'Premium Sports Store',
    desc: 'Shoes, jerseys, rackets, and gym gear from trusted brands — delivered across India.',
    highlight: 'Free Shipping',
    gradient: 'from-arena-gold to-arena-gold-dark',
    link: '/store',
  },
  {
    icon: 'ti-coin',
    title: 'NXL Rewards Program',
    desc: 'Earn credits on every purchase and registration. Redeem 1:1 against orders and entry fees.',
    highlight: '1 Credit = ₹1',
    gradient: 'from-green-500 to-emerald-600',
    link: '/dashboard',
  },
  {
    icon: 'ti-qrcode',
    title: 'Digital QR Passes',
    desc: 'Get a scannable pass on your phone. Check in at venue gates without paper slips.',
    highlight: 'Contactless Check-in',
    gradient: 'from-blue-500 to-blue-600',
    link: '/events',
  },
  {
    icon: 'ti-shield-check',
    title: 'Secure Payments',
    desc: 'Razorpay, Stripe, wallet, and NXL — PCI-compliant checkout with instant receipts.',
    highlight: 'PCI Compliant',
    gradient: 'from-purple-500 to-purple-600',
    link: '/dashboard',
  },
  {
    icon: 'ti-map-pin',
    title: 'Events Nationwide',
    desc: 'Indoor and outdoor tournaments in Nashik, Pune, Mumbai, Hyderabad, and growing.',
    highlight: '4+ Cities',
    gradient: 'from-pink-500 to-rose-600',
    link: '/events',
  },
];

const stats = [
  { value: '50,000+', label: 'Active Players', icon: 'ti-users' },
  { value: '₹5Cr+', label: 'Total Winnings', icon: 'ti-trophy' },
  { value: '98%', label: 'Satisfaction Rate', icon: 'ti-star-filled' },
  { value: '<24hr', label: 'Support Response', icon: 'ti-headset' },
];

export const FeaturesSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-arena-navy to-arena-navy-deep py-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-arena-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-arena-gold/5 blur-3xl animate-float animation-delay-200" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-16">
        {/* Header Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-arena-primary/30 bg-arena-primary/10 px-4 py-1.5 backdrop-blur-sm mb-4">
            <i className="ti ti-star-filled text-arena-primary text-sm" />
            <span className="text-xs font-bold uppercase tracking-wider text-arena-primary">
              Why Choose PlayArena
            </span>
          </div>
          
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-5xl">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-arena-primary to-arena-gold bg-clip-text text-transparent">
              compete & win
            </span>
          </h2>
          
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            One platform for registration, gear, rewards, and payments — built for serious
            amateur and club players.
          </p>
        </div>

        {/* Stats Bar */}
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

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-arena-primary/50 hover:shadow-2xl hover:shadow-arena-primary/10"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Gradient Overlay */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
              />
              
              {/* Icon Container */}
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-arena-primary/20 to-arena-primary/5 group-hover:scale-110 transition-transform duration-300">
                  <i
                    className={`ti ${feature.icon} text-3xl text-arena-primary transition-all duration-300 group-hover:text-arena-gold`}
                    aria-hidden="true"
                  />
                </div>
                
                {/* Highlight Badge */}
                <div className="absolute -right-2 -top-2 rounded-full bg-gradient-to-r from-arena-gold to-arena-gold-dark px-2 py-0.5">
                  <span className="text-[10px] font-bold uppercase text-arena-navy">
                    {feature.highlight}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="relative mt-5">
                <h3 className="text-xl font-bold text-white group-hover:text-arena-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                  {feature.desc}
                </p>
              </div>

              {/* Arrow Indicator */}
              <div className="relative mt-4 flex items-center gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-2">
                <span className="text-xs font-semibold text-arena-primary">Learn More</span>
                <i className="ti ti-arrow-right text-arena-primary text-sm" />
              </div>

              {/* Index Number */}
              <div className="absolute bottom-4 right-4 text-5xl font-black text-white/5 transition-all duration-300 group-hover:text-white/10">
                {(index + 1).toString().padStart(2, '0')}
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
            <span className="px-4 py-2 text-sm text-gray-300">
              Ready to start your journey?
            </span>
            <Link
              to="/events"
              className="rounded-full bg-gradient-to-r from-arena-primary to-arena-primary-dark px-6 py-2 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-arena-primary/30"
            >
              Explore Tournaments →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};