// client/src/components/common/Navbar.jsx

import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { getWishlistIds } from '../../utils/wishlist';
import logo from '../../assets/logo.png';

const navLinks = [
  { to: '/', label: 'Home', end: true, icon: 'ti-home' },
  { to: '/events', label: 'Events', icon: 'ti-trophy' },
  { to: '/store', label: 'Store', icon: 'ti-shopping-bag' },
  { to: '/about', label: 'About', icon: 'ti-info-circle' },
];

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-all duration-200 relative ${
    isActive 
      ? 'text-arena-gold' 
      : 'text-gray-400 hover:text-white'
  }`;

// Active link indicator styles
const activeLinkStyle = ({ isActive }) => {
  if (isActive) {
    return {
      className: navLinkClass({ isActive }),
      children: (
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-arena-primary to-arena-gold" />
      ),
    };
  }
  return { className: navLinkClass({ isActive }) };
};

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { itemCount } = useSelector((state) => state.cart);
  const wishlistCount = getWishlistIds(user?.wishlist).length;
  const nxlBalance = user?.nxlBalance || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  const handleToggleMobile = () => setMobileOpen((prev) => !prev);
  const handleToggleUserMenu = () => setUserMenuOpen((prev) => !prev);
  const handleToggleSearch = () => setSearchOpen((prev) => !prev);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/10 bg-arena-navy/95 shadow-lg backdrop-blur-lg transition-all duration-300 ${
        scrolled 
          ? 'shadow-xl' 
          : 'shadow-md'
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link 
          to="/" 
          className="flex min-w-0 items-center gap-0.5 text-xl font-bold tracking-tight transition-all hover:scale-105"
        >
          <img src={logo} alt="Arena Logo" className="h-10 w-32 object-contain sm:h-12 sm:w-40" />
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.to} className="relative">
              <NavLink to={link.to} end={link.end} className={navLinkClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-1">
                    <i className={`${link.icon} text-base hidden lg:inline`} />
                    {link.label}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-arena-primary to-arena-gold" />
                    )}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop Right Section */}
        <div className="hidden items-center gap-4 md:flex">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button
              type="button"
              onClick={handleToggleSearch}
              className="text-gray-400 transition-all hover:text-white hover:scale-110"
              aria-label="Search"
            >
              <i className="ti ti-search text-xl" aria-hidden="true" />
            </button>
            
            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-arena-navy to-arena-navy-deep p-2 shadow-2xl backdrop-blur-lg">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products, events..."
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-400 outline-none focus:border-arena-primary focus:ring-1 focus:ring-arena-primary"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-arena-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-arena-primary-dark"
                  >
                    Go
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* NXL Balance (if authenticated) */}
          {isAuthenticated && nxlBalance > 0 && (
            <Link
              to="/dashboard?tab=wallet"
              className="flex items-center gap-1.5 rounded-full bg-arena-gold/10 px-3 py-1.5 transition-all hover:bg-arena-gold/20"
            >
              <i className="ti ti-coin text-arena-gold text-sm" />
              <span className="text-sm font-semibold text-arena-gold">{nxlBalance}</span>
            </Link>
          )}

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative text-gray-400 transition-all hover:text-white hover:scale-110"
            aria-label="Wishlist"
          >
            <i className="ti ti-heart text-xl" aria-hidden="true" />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-arena-primary to-arena-primary-dark text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative text-gray-400 transition-all hover:text-white hover:scale-110"
            aria-label={`Cart, ${itemCount} items`}
          >
            <i className="ti ti-shopping-cart text-xl" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-arena-primary to-arena-primary-dark px-1 text-[10px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={handleToggleUserMenu}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-r from-arena-primary/20 to-arena-primary/10 text-gray-400 shadow-sm transition-all hover:scale-110 hover:border-arena-primary/50 hover:text-white hover:shadow-lg"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
            >
              {isAuthenticated && user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <i className="ti ti-user text-xl" aria-hidden="true" />
              )}
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-arena-navy to-arena-navy-deep p-2 shadow-2xl backdrop-blur-lg">
                {isAuthenticated ? (
                  <>
                    <div className="mb-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                      <div className="mt-2 flex items-center gap-2 rounded-lg bg-arena-gold/10 px-2 py-1">
                        <i className="ti ti-coin text-arena-gold text-xs" />
                        <span className="text-xs font-medium text-arena-gold">
                          {nxlBalance} NXL Credits
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-all hover:bg-white/5 hover:text-white"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="ti ti-layout-dashboard text-base" />
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/dashboard?tab=wallet"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-all hover:bg-white/5 hover:text-white"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="ti ti-wallet text-base" />
                      Wallet
                    </Link>
                    
                    <Link
                      to="/dashboard?tab=orders"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-all hover:bg-white/5 hover:text-white"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="ti ti-package text-base" />
                      My Orders
                    </Link>
                    
                    <Link
                      to="/dashboard?tab=profile"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-all hover:bg-white/5 hover:text-white"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="ti ti-settings text-base" />
                      Settings
                    </Link>
                    
                    <div className="mt-1 border-t border-white/10 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition-all hover:bg-white/5 hover:text-red-300"
                      >
                        <i className="ti ti-logout text-base" />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-all hover:bg-white/5 hover:text-white"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="ti ti-login text-base" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-all hover:bg-white/5 hover:text-white"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="ti ti-user-plus text-base" />
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="relative h-10 w-10 rounded-lg text-white transition-all hover:bg-white/10 md:hidden"
          onClick={handleToggleMobile}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <i
              className={`ti transform transition-all duration-300 ${
                mobileOpen ? 'ti-x rotate-90 text-2xl' : 'ti-menu-2 text-2xl'
              }`}
              aria-hidden="true"
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={handleToggleMobile}
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed right-0 top-0 z-[70] h-dvh w-[min(20rem,calc(100vw-1rem))] overflow-y-auto border-l border-white/10 bg-arena-navy shadow-2xl md:hidden animate-slide-in-right">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <Link to="/" className="flex items-center gap-0.5 text-xl font-bold" onClick={handleToggleMobile}>
                <span className="text-arena-gold">PLAY</span>
                <span className="text-white">ARENA</span>
              </Link>
              <button
                onClick={handleToggleMobile}
                className="h-8 w-8 rounded-lg text-white hover:bg-white/10"
              >
                <i className="ti ti-x text-xl" />
              </button>
            </div>

            {/* User Info (if authenticated) */}
            {isAuthenticated && user && (
              <div className="border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-arena-primary/20 to-arena-primary/10">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <i className="ti ti-user text-xl text-arena-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <i className="ti ti-coin text-arena-gold text-xs" />
                      <span className="text-xs text-arena-gold">{nxlBalance} NXL Credits</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <ul className="flex flex-col p-4">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-all ${
                        isActive
                          ? 'bg-arena-primary/10 text-arena-gold'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    <i className={`${link.icon} text-lg`} />
                    {link.label}
                  </NavLink>
                </li>
              ))}
              
              <div className="my-2 h-px bg-white/10" />
              
              {/* Mobile Menu Extra Links */}
              <Link
                to="/wishlist"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-base text-gray-300 transition-all hover:bg-white/5 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                <i className="ti ti-heart text-lg" />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="ml-auto rounded-full bg-arena-primary px-2 py-0.5 text-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
              <Link
                to="/cart"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-base text-gray-300 transition-all hover:bg-white/5 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                <i className="ti ti-shopping-cart text-lg" />
                Cart
                {itemCount > 0 && (
                  <span className="ml-auto rounded-full bg-arena-primary px-2 py-0.5 text-xs">
                    {itemCount}
                  </span>
                )}
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base text-gray-300 transition-all hover:bg-white/5 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    <i className="ti ti-layout-dashboard text-lg" />
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard?tab=wallet"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base text-gray-300 transition-all hover:bg-white/5 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    <i className="ti ti-wallet text-lg" />
                    Wallet
                  </Link>
                </>
              )}
            </ul>

            {/* Mobile Auth Buttons */}
            {!isAuthenticated && (
              <div className="border-t border-white/10 p-4">
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-arena-primary to-arena-primary-dark py-3 font-semibold text-white transition-all hover:shadow-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  <i className="ti ti-login" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 py-3 font-semibold text-white transition-all hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  <i className="ti ti-user-plus" />
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Logout Button */}
            {isAuthenticated && (
              <div className="border-t border-white/10 p-4">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 py-3 font-semibold text-red-400 transition-all hover:bg-red-500/20"
                >
                  <i className="ti ti-logout" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};
