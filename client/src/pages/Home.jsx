
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'
import { HeroBanner } from '../components/home/HeroBanner'
import { FeaturesSection } from '../components/home/FeaturesSection'
import { SportsCategoryGrid } from '../components/home/SportsCategoryGrid'
import { FeaturedProducts } from '../components/home/FeaturedProducts'
import { FeaturedTournaments } from '../components/home/FeaturedTournaments'
import { NxlBenefits } from '../components/home/NxlBenefits'
import { HowItWorks } from '../components/home/HowItWorks'

export default function Home() {
  return (
    <div className="min-h-screen bg-arena-surface">
      <Navbar />
      <HeroBanner />
      <FeaturesSection />
      <SportsCategoryGrid />
      <FeaturedProducts />
      <FeaturedTournaments />
      <NxlBenefits />
      <HowItWorks />
      <Footer />
    </div>
  )
}
