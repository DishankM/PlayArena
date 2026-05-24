import { Navbar } from './Navbar'
import { Footer } from './Footer'

/**
 * @param {{ title: string, children: import('react').ReactNode }} props
 */
export const PageShell = ({ title, children }) => (
  <div className="min-h-screen bg-arena-surface">
    <Navbar />
    <main className="mx-auto max-w-7xl px-6 py-16 md:px-16">
      <h1 className="text-h1 text-gray-900">{title}</h1>
      <div className="mt-6">{children}</div>
    </main>
    <Footer />
  </div>
)
