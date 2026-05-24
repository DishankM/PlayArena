
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/store', label: 'Store' },
  { to: '/about', label: 'About' },
  { to: '/cart', label: 'Cart' },
]

const sports = [
  { label: 'Badminton', query: 'badminton' },
  { label: 'Table Tennis', query: 'table-tennis' },
  { label: 'Tennis', query: 'tennis' },
  { label: 'Football', query: 'football' },
  { label: 'Running', query: 'running' },
  { label: 'Gym', query: 'gym' },
]

export const Footer = () => (
  <footer className="bg-arena-navy text-gray-400">
    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 md:px-16 lg:grid-cols-4">
      <div>
        <p className="text-lg font-bold">
          <img src={logo} alt="Arena Logo" className="h-14 w-44" />
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          India&apos;s sports platform — compete in tournaments, shop premium gear, and earn NXL
          credits on every order.
        </p>
        <div className="mt-5 flex gap-4">
          {[
            { icon: 'ti-brand-instagram', label: 'Instagram' },
            { icon: 'ti-brand-x', label: 'Twitter' },
            { icon: 'ti-brand-facebook', label: 'Facebook' },
            { icon: 'ti-brand-youtube', label: 'YouTube' },
          ].map((social) => (
            <a
              key={social.label}
              href="#"
              className="text-gray-400 transition-colors hover:text-white"
              aria-label={social.label}
            >
              <i className={`ti ${social.icon} text-xl`} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
          Quick links
        </h3>
        <ul className="space-y-2 text-sm">
          {quickLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
          Sports categories
        </h3>
        <ul className="space-y-2 text-sm">
          {sports.map((sport) => (
            <li key={sport.query}>
              <Link
                to={`/store?sport=${sport.query}`}
                className="transition-colors hover:text-white"
              >
                {sport.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <i className="ti ti-map-pin mt-0.5" aria-hidden="true" />
            <span>Gangapur Road, Nashik, Maharashtra 422013</span>
          </li>
          <li className="flex items-center gap-2">
            <i className="ti ti-phone" aria-hidden="true" />
            <a href="tel:+919876543210" className="transition-colors hover:text-white">
              +91 98765 43210
            </a>
          </li>
          <li className="flex items-center gap-2">
            <i className="ti ti-mail" aria-hidden="true" />
            <a
              href="mailto:hello@playarena.in"
              className="transition-colors hover:text-white"
            >
              hello@playarena.in
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-arena-navy-accent">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs md:flex-row md:px-16">
        <p>&copy; {new Date().getFullYear()} PlayArena. All rights reserved.</p>
        <p>Built with MERN Stack</p>
      </div>
    </div>
  </footer>
)
