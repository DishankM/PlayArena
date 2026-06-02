// client/src/components/common/ErrorBoundary.jsx
import { Component } from 'react'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1020] text-white">
          <Navbar />
          <main className="mx-auto flex min-h-[calc(100vh-180px)] max-w-7xl items-center justify-center px-6 py-16">
            <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/20">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10">
                <i className="ti ti-bug text-4xl text-red-400" aria-hidden="true"></i>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-white">Something went wrong</h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                An unexpected error occurred. Your cart and orders are safe.
              </p>
              <button onClick={this.handleReset} className="mt-6 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02]">
                Go back to home
              </button>
              {import.meta.env.DEV && (
                <pre className="mt-6 max-h-32 overflow-auto rounded-xl bg-red-500/10 p-3 text-left text-xs text-red-300">
                  {this.state.error?.toString()}
                </pre>
              )}
            </section>
          </main>
          <Footer />
        </div>
      )
    }

    return this.props.children
  }
}

export { ErrorBoundary }
