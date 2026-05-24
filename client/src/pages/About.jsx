// client/src/pages/About.jsx

import { Link } from 'react-router-dom'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'

const stats = [
  { value: '1,200+', label: 'Active players', icon: 'ti-users' },
  { value: '48', label: 'Events per year', icon: 'ti-trophy' },
  { value: '₹2.4L+', label: 'Prizes awarded', icon: 'ti-wallet' },
]

const steps = [
  {
    title: 'Browse Events',
    desc: 'Explore indoor and outdoor tournaments across Nashik, Pune, Mumbai, and Hyderabad.',
    icon: 'ti-calendar-event',
  },
  {
    title: 'Register & Pay',
    desc: 'Secure checkout via Razorpay, Stripe, or NXL credits. Instant confirmation email.',
    icon: 'ti-credit-card',
  },
  {
    title: 'Get QR Pass',
    desc: 'Digital entry pass sent to your inbox. Show at venue check-in.',
    icon: 'ti-qrcode',
  },
  {
    title: 'Play & Earn NXL',
    desc: 'Compete, win prizes, and earn NXL credits on registrations and store orders.',
    icon: 'ti-coin',
  },
]

const team = [
  { name: 'Arjun Mehta', role: 'Founder & CEO', city: 'Nashik' },
  { name: 'Priya Nair', role: 'Operations Head', city: 'Pune' },
  { name: 'Rohan Desai', role: 'Tech Lead', city: 'Mumbai' },
  { name: 'Sneha Kulkarni', role: 'Marketing', city: 'Hyderabad' },
]

const values = [
  { title: 'Accessibility', desc: 'Making competitive sports available to players everywhere', icon: 'ti-world' },
  { title: 'Community', desc: 'Building a network of passionate athletes and sports enthusiasts', icon: 'ti-users' },
  { title: 'Excellence', desc: 'Delivering professional-grade tournament experiences', icon: 'ti-star' },
  { title: 'Innovation', desc: 'Leveraging technology to enhance the sports experience', icon: 'ti-rocket' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1020] to-[#16213E] px-6 py-20 lg:px-12">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -left-20 bottom-20 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>
        
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 backdrop-blur-sm mb-4">
            <i className="ti ti-info-circle text-sky-400 text-sm" />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">About PlayArena</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            India's home for{' '}
            <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
              competitive sports
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
            We organize indoor and outdoor sports tournaments and run a premium online store for
            sports gear, apparel, and accessories.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 backdrop-blur-sm mb-4">
                <i className="ti ti-target text-sky-400 text-sm" />
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Making competitive sports accessible to every player
              </h2>
              <div className="mt-6 space-y-4 text-gray-300 leading-relaxed">
                <p>
                  PlayArena started in Nashik with a simple idea: local athletes deserve the same
                  tournament infrastructure as metro cities. Today we host badminton opens, football
                  leagues, table tennis championships, and running qualifiers across Maharashtra and
                  Telangana.
                </p>
                <p>
                  Our online store stocks court shoes, jerseys, rackets, and recovery gear from brands
                  players actually use. Every purchase earns NXL credits — redeemable on gear or
                  tournament entry fees.
                </p>
                <p>
                  Whether you are preparing for your first 10K or defending a club badminton title,
                  PlayArena is where you register, gear up, and compete.
                </p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="relative flex flex-col gap-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:border-sky-500/50"
                  style={{ marginLeft: `${i * 20}px`, zIndex: 3 - i }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-500/20">
                      <i className={`${stat.icon} text-2xl text-sky-400`} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-y border-white/10 bg-white/[0.02] px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 backdrop-blur-sm mb-4">
              <i className="ti ti-heart text-sky-400 text-sm" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Our Values</span>
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">What drives us</h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              These core principles guide everything we do at PlayArena
            </p>
          </div>
          
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 text-center backdrop-blur-sm transition-all hover:scale-105 hover:border-sky-500/50">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/20">
                  <i className={`${value.icon} text-2xl text-sky-400`} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{value.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Categories */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 backdrop-blur-sm mb-4">
              <i className="ti ti-trophy text-sky-400 text-sm" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">What we host</span>
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Indoor &amp; Outdoor tournaments</h2>
            <p className="mt-4 text-gray-400">Professional-grade tournaments across multiple sports</p>
          </div>
          
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 p-8 transition-all hover:scale-[1.02]">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sky-500/20 blur-2xl" />
              <i className="ti ti-building text-4xl text-sky-400" />
              <h3 className="mt-4 text-2xl font-bold text-white">Indoor Sports</h3>
              <p className="mt-2 text-gray-300">Badminton, Table Tennis, Boxing, Chess, Carrom</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Climate controlled', 'All-weather', 'Professional courts'].map((feature) => (
                  <span key={feature} className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">{feature}</span>
                ))}
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 p-8 transition-all hover:scale-[1.02]">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-violet-500/20 blur-2xl" />
              <i className="ti ti-sun text-4xl text-violet-400" />
              <h3 className="mt-4 text-2xl font-bold text-white">Outdoor Sports</h3>
              <p className="mt-2 text-gray-300">Football, Cricket, Tennis, Running, Cycling</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Open grounds', 'Natural surface', 'Floodlit venues'].map((feature) => (
                  <span key={feature} className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">{feature}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-white/10 bg-white/[0.02] px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 backdrop-blur-sm mb-4">
              <i className="ti ti-settings text-sky-400 text-sm" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Simple Process</span>
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">How PlayArena works</h2>
            <p className="mt-4 text-gray-400">From sign-up to podium in four simple steps</p>
          </div>
          
          <div className="relative mt-12">
            <div className="absolute left-0 right-0 top-10 hidden h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent lg:block" />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.title} className="relative text-center">
                  <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 shadow-lg">
                    <i className={`${step.icon} text-3xl text-white`} />
                  </div>
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-amber-500 text-center text-sm font-bold text-white leading-7">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NXL Credits Section */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 backdrop-blur-sm mb-4">
                <i className="ti ti-coin text-amber-400 text-sm" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Rewards Program</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">What are NXL Credits?</h2>
              <div className="mt-6 space-y-4">
                {[
                  { text: 'Earn on purchases and tournament registrations', icon: 'ti-wallet' },
                  { text: '1 NXL Credit = ₹1 value at checkout', icon: 'ti-coin' },
                  { text: 'Use for partial or full payment on gear and events', icon: 'ti-shopping-cart' },
                  { text: 'Never expires — stack them across seasons', icon: 'ti-infinity' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 rounded-xl bg-amber-500/10 p-4">
                    <i className={`${item.icon} text-amber-400 text-xl`} />
                    <p className="text-gray-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid gap-4">
              {['Earn', 'Hold', 'Redeem'].map((label, i) => (
                <div key={label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 transition-all hover:scale-105 hover:border-amber-500/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/20">
                      <span className="text-2xl font-bold text-amber-400">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{label}</p>
                      <p className="text-sm text-gray-400">
                        {i === 0 && 'Shop or register to earn credits'}
                        {i === 1 && 'Credits stored safely in your wallet'}
                        {i === 2 && 'Use credits at checkout instantly'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="border-y border-white/10 bg-white/[0.02] px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 backdrop-blur-sm mb-4">
              <i className="ti ti-users text-sky-400 text-sm" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Team</span>
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Meet the team behind PlayArena</h2>
            <p className="mt-4 text-gray-400">Passionate sports enthusiasts building India's sports platform</p>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 text-center backdrop-blur-sm transition-all hover:scale-105 hover:border-sky-500/50">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-violet-500 text-xl font-bold text-white shadow-lg">
                  {member.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <p className="mt-4 font-bold text-white">{member.name}</p>
                <p className="text-sm text-sky-400">{member.role}</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-400">
                  <i className="ti ti-map-pin" />
                  {member.city}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-6 py-20 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-violet-600 opacity-90" />
              <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px',
          backgroundRepeat: 'repeat',
        }}
      />
        
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white sm:text-5xl">Ready to compete?</h2>
          <p className="mt-4 text-lg text-white/90">
            Join 1,200+ players on PlayArena today and start your sports journey.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/events"
              className="group relative overflow-hidden rounded-xl bg-white px-8 py-3 font-semibold text-sky-600 transition-all hover:scale-105 hover:shadow-xl"
            >
              <span className="relative z-10">Browse Tournaments</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-100 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </Link>
            <Link
              to="/store"
              className="rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20 hover:shadow-xl"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}