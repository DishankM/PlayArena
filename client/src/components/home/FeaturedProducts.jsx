// client/src/components/home/FeaturedProducts.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../products/ProductCard';
import { mockProducts } from '../../data/mockData';

const featured = mockProducts.filter((p) => p.isFeatured).slice(0, 4);

// Additional featured products for carousel view
const moreProducts = mockProducts.filter((p) => !p.isFeatured).slice(0, 4);

export const FeaturedProducts = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'carousel'

  // Auto-rotate carousel
  useEffect(() => {
    if (viewMode === 'carousel' && !isHovered) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % moreProducts.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [viewMode, isHovered, moreProducts.length]);

  const handlePrevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + moreProducts.length) % moreProducts.length);
  };

  const handleNextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % moreProducts.length);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-arena-navy to-arena-navy-deep py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-20 top-1/2 h-96 w-96 rounded-full bg-arena-primary/10 blur-3xl animate-float" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-arena-gold/5 blur-3xl animate-float animation-delay-400" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-16">
        {/* Header Section */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-arena-primary/30 bg-arena-primary/10 px-4 py-1.5 backdrop-blur-sm mb-4">
              <i className="ti ti-shopping-bag text-arena-primary text-sm" />
              <span className="text-xs font-bold uppercase tracking-wider text-arena-primary">
                Gear Up
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Featured{' '}
              <span className="bg-gradient-to-r from-arena-primary to-arena-gold bg-clip-text text-transparent">
                products
              </span>
            </h2>
            <p className="mt-3 max-w-md text-base text-gray-300">
              Hand-picked equipment for court, field, and gym — earn{' '}
              <span className="font-semibold text-arena-gold">NXL credits</span> on every purchase.
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* View Toggle Buttons */}
            <div className="hidden rounded-lg border border-white/10 bg-white/5 p-1 sm:flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-md px-3 py-1.5 text-sm transition-all ${
                  viewMode === 'grid'
                    ? 'bg-arena-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="ti ti-layout-grid" />
              </button>
              <button
                onClick={() => setViewMode('carousel')}
                className={`rounded-md px-3 py-1.5 text-sm transition-all ${
                  viewMode === 'carousel'
                    ? 'bg-arena-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="ti ti-player-track-next" />
              </button>
            </div>
            
            <Link
              to="/store"
              className="group flex items-center gap-2 rounded-lg border border-arena-primary/30 px-5 py-2.5 text-sm font-semibold text-arena-primary transition-all hover:bg-arena-primary/10 hover:border-arena-primary"
            >
              <span>Shop all products</span>
              <i className="ti ti-arrow-right transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, index) => (
              <div
                key={product._id}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Carousel View */}
        {viewMode === 'carousel' && moreProducts.length > 0 && (
          <div 
            className="mt-12"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative overflow-hidden rounded-2xl">
              {/* Carousel Container */}
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {moreProducts.map((product) => (
                  <div key={product._id} className="w-full flex-shrink-0 px-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {[product].map((p) => (
                        <div key={p._id} className="col-span-1">
                          <ProductCard product={p} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={handlePrevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur transition-all hover:bg-arena-primary hover:scale-110"
                aria-label="Previous product"
              >
                <i className="ti ti-chevron-left text-xl" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur transition-all hover:bg-arena-primary hover:scale-110"
                aria-label="Next product"
              >
                <i className="ti ti-chevron-right text-xl" />
              </button>

              {/* Dots Indicator */}
              <div className="mt-6 flex justify-center gap-2">
                {moreProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === activeIndex
                        ? 'w-8 bg-arena-primary'
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NXL Credits Banner */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-arena-gold/30 bg-gradient-to-r from-arena-gold/10 via-transparent to-arena-gold/5 p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-arena-gold/20">
                <i className="ti ti-coin text-arena-gold text-3xl" />
              </div>
              <div>
                <p className="text-sm font-semibold text-arena-gold">Earn While You Shop</p>
                <p className="text-lg font-bold text-white">
                  Get <span className="text-arena-gold">5% NXL credits</span> back on every purchase
                </p>
                <p className="text-xs text-gray-400">1 NXL Credit = ₹1 value at checkout</p>
              </div>
            </div>
            <Link
              to="/rewards"
              className="flex items-center gap-2 rounded-lg bg-arena-gold px-6 py-2.5 font-semibold text-arena-navy transition-all hover:bg-arena-gold-dark hover:shadow-lg"
            >
              Learn More
              <i className="ti ti-info-circle" />
            </Link>
          </div>
        </div>

        {/* Limited Time Offer */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-arena-primary/20 px-3 py-1">
            <i className="ti ti-clock text-arena-primary text-xs" />
            <span className="text-xs font-medium text-arena-primary">Limited Time</span>
          </div>
          <p className="text-xs text-gray-400">
            Free shipping on orders above ₹999 • Easy returns • 24/7 support
          </p>
        </div>
      </div>
    </section>
  );
};