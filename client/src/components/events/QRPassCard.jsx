// client/src/components/events/QRPassCard.jsx
import { formatDate } from '../../utils/helpers'

const QRPassCard = ({ registration, tournament, qrDataUrl, qrToken }) => {
  const reward = tournament?.nxlReward || 0
  const entryFeeText = tournament?.entryFee > 0 ? `₹${tournament.entryFee}` : 'Complimentary'

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-arena-border bg-white shadow-2xl overflow-hidden">
      <div className="bg-arena-navy p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-arena-gold">PLAYARENA</p>
            <p className="text-xs text-gray-400">EVENT PASS</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{tournament?.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">{tournament?.sport}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">{tournament?.format}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <i className="ti ti-map-pin text-base text-gray-300" />
            <span>{tournament?.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="ti ti-calendar text-base text-gray-300" />
            <span>{formatDate(tournament?.startDate)}</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center bg-white px-4 py-3">
        <div className="absolute -left-4 h-8 w-8 rounded-full bg-arena-surface border border-arena-border" />
        <div className="flex-1 border-t-2 border-dashed border-arena-border mx-4" />
        <div className="absolute -right-4 h-8 w-8 rounded-full bg-arena-surface border border-arena-border" />
      </div>

      <div className="bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div>
            <p className="text-2xl font-bold text-slate-900">{registration?.playerName}</p>
            <p className="mt-2 text-xs uppercase text-gray-400">PARTICIPANT</p>
            <p className="mt-2 text-sm text-slate-700">{registration?.type === 'solo' ? 'Solo' : 'Team entry'}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{entryFeeText}</p>
            <p className="mt-2 text-xs uppercase text-gray-400">ENTRY FEE</p>
          </div>
        </div>
      </div>

      <div className="bg-white py-6 text-center">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Event QR pass" className="mx-auto w-48 h-48 rounded-3xl object-cover" />
        ) : (
          <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
            <i className="ti ti-qrcode text-5xl" />
          </div>
        )}
        <p className="mt-4 text-xs font-mono text-gray-400 tracking-widest break-all">{qrToken || 'QR token will appear once registration is complete.'}</p>
        <p className="mt-2 text-xs text-gray-500">Show this QR at the venue entrance</p>
      </div>

      <div className="bg-arena-surface p-4 text-sm text-gray-700">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-green-600">
            <i className="ti ti-shield-check" />
            <span>Verified registration</span>
          </div>
          <div className="flex items-center gap-2 text-arena-gold">
            <i className="ti ti-coin" />
            <span>Earn {reward} NXL on check-in</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export { QRPassCard }
