// client/src/pages/admin/AdminQRScanner.jsx

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { adminAPI, walletAPI } from '../../services/api'

const glassCard = 'rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10'

const extractToken = (decoded) => {
  const raw = String(decoded || '').trim()
  if (!raw) return ''
  try {
    const parsed = JSON.parse(raw)
    return parsed?.token ? String(parsed.token).trim() : raw
  } catch {
    return raw
  }
}

export default function AdminQRScanner() {
  const [scanning, setScanning] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [lastScan, setLastScan] = useState(null)
  const [recentScans, setRecentScans] = useState([])
  const [manualToken, setManualToken] = useState('')
  const [tournaments, setTournaments] = useState([])
  const [selectedTournament, setSelectedTournament] = useState('')
  const html5Ref = useRef(null)
  const processingRef = useRef(false)

  useEffect(() => {
    adminAPI
      .get('/tournaments')
      .then((res) => setTournaments(res.data.data.tournaments.filter((t) => ['open', 'ongoing'].includes(t.status))))
      .catch(() => {})

    return () => {
      if (html5Ref.current?.isScanning) {
        html5Ref.current.stop().catch(() => {})
      }
    }
  }, [])

  const addRecentScan = (scan) => {
    setRecentScans((prev) => [{ time: new Date(), ...scan }, ...prev.slice(0, 9)])
  }

  const processToken = async (decoded) => {
    const qrToken = extractToken(decoded)
    if (!qrToken || processingRef.current) return

    processingRef.current = true
    setProcessing(true)

    try {
      const res = await walletAPI.post('/validate-qr', {
        qrToken,
        ...(selectedTournament && { tournamentId: selectedTournament }),
      })
      const { valid, status, registration } = res.data.data

      if (valid && registration) {
        setResult('success')
        setLastScan(registration)
        addRecentScan({
          player: registration.user?.name || 'Unknown player',
          tournament: registration.tournament?.name || 'Unknown tournament',
          status: 'valid',
        })
      } else if (status === 'already_used') {
        setResult('duplicate')
        setLastScan(registration || null)
        addRecentScan({
          player: registration?.user?.name || 'Unknown player',
          tournament: registration?.tournament?.name || 'Unknown tournament',
          status: 'duplicate',
        })
      } else {
        setResult('invalid')
        setLastScan(null)
        addRecentScan({ player: '-', tournament: '-', status: status || 'invalid' })
      }
    } catch {
      setResult('invalid')
      setLastScan(null)
      addRecentScan({ player: '-', tournament: '-', status: 'invalid' })
    } finally {
      setTimeout(() => {
        setResult(null)
        setLastScan(null)
        processingRef.current = false
        setProcessing(false)
      }, 5000)
    }
  }

  const startScanner = async () => {
    try {
      html5Ref.current = new Html5Qrcode('qr-reader')
      await html5Ref.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => processToken(decoded),
        () => {}
      )
      setScanning(true)
    } catch (err) {
      console.error(err)
    }
  }

  const stopScanner = async () => {
    if (html5Ref.current?.isScanning) {
      await html5Ref.current.stop()
    }
    setScanning(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
          <i className="ti ti-qrcode text-sky-400 text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">QR Scanner</h2>
          <p className="text-sm text-gray-400">Scan player QR codes for check-in</p>
        </div>
      </div>

      <select
        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none"
        value={selectedTournament}
        onChange={(e) => setSelectedTournament(e.target.value)}
      >
        <option value="">All tournaments</option>
        {tournaments.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>

      <div className={`${glassCard} relative mx-auto aspect-square w-full max-w-md overflow-hidden p-4`}>
        <div id="qr-reader" className="h-full w-full" />
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <i className="ti ti-qrcode text-6xl" />
            <p className="mt-2 text-sm">Camera inactive</p>
            <button
              type="button"
              className="mt-4 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
              onClick={startScanner}
            >
              Start Scanner
            </button>
          </div>
        )}
        {scanning && (
          <>
            <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-dashed border-sky-400">
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 to-violet-500 animate-qr-scan" />
            </div>
            <button
              type="button"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl border border-white/20 bg-black/50 px-5 py-2 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20"
              onClick={stopScanner}
            >
              Stop Scanner
            </button>
          </>
        )}
      </div>

      {result === 'success' && lastScan && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
          <i className="ti ti-circle-check mb-2 text-5xl text-emerald-400" />
          <h2 className="text-xl font-bold text-emerald-400">Entry Confirmed!</h2>
          <p className="mt-2 font-medium text-white">{lastScan.user?.name}</p>
          <p className="text-sm text-gray-300">{lastScan.tournament?.name}</p>
          <p className="mt-2 text-xs text-gray-400">
            Attended at: {new Date(lastScan.attendedAt || Date.now()).toLocaleTimeString('en-IN')}
          </p>
          {lastScan.nxlCredited > 0 && (
            <p className="mt-2 text-sm font-medium text-amber-400">
              +{lastScan.nxlCredited} NXL credits added
            </p>
          )}
        </div>
      )}

      {result === 'duplicate' && (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6 text-center">
          <i className="ti ti-alert-triangle mb-2 text-5xl text-orange-400" />
          <h2 className="text-xl font-bold text-orange-400">Already Checked In</h2>
          <p className="text-sm text-gray-300">
            {lastScan?.user?.name ? `${lastScan.user.name} was already scanned` : 'This QR was already scanned'}
          </p>
        </div>
      )}

      {result === 'invalid' && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <i className="ti ti-circle-x mb-2 text-5xl text-red-400" />
          <h2 className="text-xl font-bold text-red-400">Invalid QR Code</h2>
          <p className="text-sm text-gray-300">Not valid for check-in</p>
        </div>
      )}

      <div className={`${glassCard} p-5`}>
        <p className="text-sm font-medium text-gray-300">Or enter QR token manually</p>
        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 font-mono text-white placeholder-gray-400 focus:border-sky-500 focus:outline-none"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="PA-..."
          />
          <button
            type="button"
            className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
            onClick={() => processToken(manualToken)}
            disabled={processing}
          >
            Validate
          </button>
        </div>
      </div>

      {recentScans.length > 0 && (
        <div className={`${glassCard} overflow-hidden`}>
          <h3 className="border-b border-white/10 px-5 py-3 text-sm font-semibold text-white">Recent scans (session)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-xs text-gray-400">
                <tr>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Player</th>
                  <th className="px-4 py-2 text-left">Tournament</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan, index) => (
                  <tr key={`${scan.time.toISOString()}-${index}`} className="border-t border-white/10">
                    <td className="px-4 py-2 text-gray-400">{scan.time.toLocaleTimeString('en-IN')}</td>
                    <td className="px-4 py-2 text-white">{scan.player}</td>
                    <td className="px-4 py-2 text-gray-300">{scan.tournament}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          scan.status === 'valid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : scan.status === 'duplicate'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {scan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @keyframes qr-scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(100% - 2px)); }
        }
        .animate-qr-scan {
          animation: qr-scan 2s linear infinite;
        }
      `}</style>
    </div>
  )
}
