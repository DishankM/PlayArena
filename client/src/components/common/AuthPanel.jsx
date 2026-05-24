
/**
 * @param {{ variant: 'login' | 'register', children: import('react').ReactNode }} props
 */
export const AuthPanel = ({ variant, children }) => {
  const isLogin = variant === 'login'

  return (
    <div className="flex min-h-screen bg-arena-surface">
      <div className="relative hidden w-[44%] overflow-hidden bg-arena-navy lg:flex lg:flex-col lg:justify-between">
        <img
          src={
            isLogin
              ? 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80&auto=format&fit=crop'
              : 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50e?w=1200&q=80&auto=format&fit=crop'
          }
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-arena-navy via-arena-navy/95 to-arena-navy-deep/90" />

        <div className="relative z-10 p-12">
          <p className="text-2xl font-bold tracking-tight">
            <span className="text-arena-gold">PLAY</span>
            <span className="text-white">ARENA</span>
          </p>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12">
          {isLogin ? (
            <>
              <blockquote className="text-2xl font-semibold leading-snug text-white">
                &ldquo;Every champion was once a contender that refused to give up.&rdquo;
              </blockquote>
              <p className="mt-5 max-w-sm text-body leading-relaxed text-gray-400">
                Sign in to track orders, manage NXL credits, and register for tournaments
                across Maharashtra.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white">Join the arena</h2>
              <p className="mt-4 max-w-sm text-body leading-relaxed text-gray-400">
                Create your account to shop gear, earn NXL credits, and register for events
                in Nashik, Pune, Mumbai, and Hyderabad.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <i className="ti ti-check text-arena-gold" aria-hidden="true" />
                  Free to join — no card required
                </li>
                <li className="flex items-center gap-2">
                  <i className="ti ti-check text-arena-gold" aria-hidden="true" />
                  Earn NXL on every purchase
                </li>
                <li className="flex items-center gap-2">
                  <i className="ti ti-check text-arena-gold" aria-hidden="true" />
                  Instant QR passes for events
                </li>
              </ul>
            </>
          )}
        </div>

        <p className="relative z-10 p-12 text-small text-gray-500">
          {isLogin
            ? '1,200+ players · 48 tournaments · ₹2.4L+ prizes'
            : 'Trusted by club players & weekend warriors'}
        </p>
      </div>

      <div className="flex w-full flex-col justify-center bg-white px-5 py-10 sm:px-8 lg:w-[56%] lg:px-16 lg:py-14">
        <div className="mx-auto w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  )
}
