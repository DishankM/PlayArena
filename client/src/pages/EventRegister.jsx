// client/src/pages/EventRegister.jsx

import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { paymentAPI, tournamentAPI } from '../services/api';
import { formatPrice } from '../utils/helpers';
import { TournamentStripeForm } from '../components/payment/TournamentStripeForm';
import { TournamentRazorpayButton } from '../components/payment/TournamentRazorpayButton';
import { QRPassCard } from '../components/events/QRPassCard';
import useToast from '../hooks/useToast';

export default function EventRegister() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [tournament, setTournament] = useState(null);
  const [loadingTournament, setLoadingTournament] = useState(true);
  const [loadingRegistration, setLoadingRegistration] = useState(true);

  const [playerData, setPlayerData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: '',
    city: 'Nashik',
    emergencyName: '',
    emergencyPhone: '',
  });
  const [teamData, setTeamData] = useState({
    teamName: '',
    members: [{ name: '', phone: '' }],
  });
  const [agreed, setAgreed] = useState({ rules: false, accuracy: false });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [step, setStep] = useState('form');
  const [processing, setProcessing] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [infoMessage, setInfoMessage] = useState('');
  const toast = useToast();
  const [useNXL, setUseNXL] = useState(false);
  const [pendingRegistrationId, setPendingRegistrationId] = useState('');
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [stripeAmount, setStripeAmount] = useState(0);
  const [registration, setRegistration] = useState(null);

  const applyRegistrationState = (registrationData) => {
    const existing = registrationData?.registration;
    if (!existing) return;

    setRegistration(existing);
    setPendingRegistrationId(existing._id);
    setQrToken(registrationData.qrToken || existing.qrToken || '');
    setQrDataUrl(registrationData.qrDataUrl || '');
    setStripeAmount(registrationData.amountDue || tournament?.entryFee || 0);

    if (['razorpay', 'stripe'].includes(existing.paymentMethod)) {
      setPaymentMethod(existing.paymentMethod);
    }

    if (existing.paymentStatus === 'paid') {
      setInfoMessage('You are already registered for this event. Your QR pass is ready.');
      setStep('success');
    } else {
      setInfoMessage('You already started this registration. Complete payment to confirm your spot.');
      setStep('form');
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  useEffect(() => {
    let active = true;

    if (!user) {
      navigate('/login', { state: { from: `/events/${id}/register` } });
      return () => {
        active = false;
      };
    }

    const loadRegistrationPage = async () => {
      setLoadingTournament(true);
      setLoadingRegistration(true);

      try {
        const tournamentRes = await tournamentAPI.get(`/${id}`);
        if (!active) return;
        setTournament(tournamentRes.data.data.tournament);

        try {
          const registrationRes = await tournamentAPI.get(`/${id}/my-registration`);
          if (!active) return;
          applyRegistrationState(registrationRes.data.data);
        } catch {
          if (!active) return;
          setInfoMessage('');
        }
      } catch {
        if (active) setTournament(null);
      } finally {
        if (active) {
          setLoadingTournament(false);
          setLoadingRegistration(false);
        }
      }
    };

    loadRegistrationPage();

    return () => {
      active = false;
    };
  }, [user, navigate, id]);

  if (loadingTournament || loadingRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-arena-navy to-arena-navy-deep">
        <Navbar />
        <main className="mx-auto max-w-lg px-6 py-24">
          <div className="h-80 animate-pulse rounded-2xl bg-white/10" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-arena-navy to-arena-navy-deep">
        <Navbar />
        <main className="mx-auto max-w-lg px-6 py-24 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <i className="ti ti-calendar-off text-5xl text-gray-700" />
            <h1 className="mt-4 text-2xl font-bold text-gray-700">Event not found</h1>
            <Link to="/events" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-arena-primary to-arena-primary-dark px-6 py-2.5 font-semibold text-white transition-all hover:shadow-lg">
              <i className="ti ti-arrow-left" />
              Back to events
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSolo = tournament.format === 'solo';
  const isTeam = tournament.format === 'team' || tournament.format === 'doubles';
  const maxMembers = tournament.format === 'doubles' ? 1 : 7;
  const userNXLBallance = user?.nxlCredits || 0;
  const canUseNXL = userNXLBallance >= tournament.entryFee && tournament.entryFee > 0;
  const finalPrice = useNXL && canUseNXL ? 0 : tournament.entryFee;
  const showRazorpayPayment = paymentMethod === 'razorpay' && pendingRegistrationId && registration?.paymentStatus === 'pending' && finalPrice > 0;
  const showStripePayment = Boolean(stripeClientSecret && paymentMethod === 'stripe' && pendingRegistrationId && finalPrice > 0);
  const showPaymentSetupButton = !showRazorpayPayment && !showStripePayment;

  const handlePlayerChange = (e) => {
    setPlayerData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleAddMember = () => {
    if (teamData.members.length < maxMembers) {
      setTeamData((prev) => ({
        ...prev,
        members: [...prev.members, { name: '', phone: '' }],
      }));
    }
  };

  const handleRemoveMember = (index) => {
    setTeamData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const handleMemberChange = (index, field, value) => {
    setTeamData((prev) => ({
      ...prev,
      members: prev.members.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const validate = () => {
    const next = {};
    if (isSolo) {
      if (!playerData.phone) next.phone = 'Phone number is required';
      if (!playerData.age) next.age = 'Age is required';
      if (playerData.age && (playerData.age < 12 || playerData.age > 100)) {
        next.age = 'Age must be between 12 and 100';
      }
    }
    if (isTeam && !teamData.teamName.trim()) next.teamName = 'Team name is required';
    if (!agreed.rules) next.rules = 'You must agree to the tournament rules';
    if (!agreed.accuracy) next.accuracy = 'Please confirm your information is accurate';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirmPay = async () => {
    if (registration?.paymentStatus === 'paid') {
      setStep('success');
      return;
    }

    const hasPendingRegistration = registration?.paymentStatus === 'pending';
    if (!hasPendingRegistration && !validate()) return;
    setInfoMessage('');
    setErrors({});
    setProcessing(true);
    setStep('form');

    try {
      const res = await tournamentAPI.post(`/${tournament._id}/register`, {
        type: tournament.format === 'solo' ? 'solo' : 'team',
        teamData,
        playerData,
        paymentMethod: useNXL && canUseNXL ? 'nxl' : paymentMethod,
      });
      const registration = res.data.data.registration;
      setRegistration(registration);
      setPendingRegistrationId(registration._id);
      setStripeAmount(res.data.data.amountDue || tournament.entryFee || 0);
      if (res.data.message) {
        setInfoMessage(res.data.message);
      }
      if (!res.data.data.requiresPayment) {
        setQrToken(res.data.data.qrToken);
        setQrDataUrl(res.data.data.qrDataUrl || '');
        toast.success('Registration completed successfully. Your QR pass is ready.');
        setStep('success');
        return;
      }

      if (paymentMethod === 'razorpay') {
        setInfoMessage('Registration saved. Use the Razorpay card below to complete payment.');
        setStep('form');
        return;
      }

      if (paymentMethod === 'stripe') {
        const { data: stripeRes } = await paymentAPI.post('/tournament/stripe/create-intent', {
          registrationId: registration._id,
        });
        setStripeClientSecret(stripeRes.data.clientSecret);
        setStripeAmount(stripeRes.data.amount);
        setStep('form');
        return;
      }

      setStep('form');
      setErrors({ submit: 'Please choose a valid payment method.' });
    } catch (error) {
      if (error.response?.status === 409) {
        try {
          const registrationRes = await tournamentAPI.get(`/${tournament._id}/my-registration`);
          applyRegistrationState(registrationRes.data.data);
          toast.success('You are already registered for this event.');
          return;
        } catch {
          // Fall through to the visible error below.
        }
      }

      const message = error.message || 'Registration failed. Please try again.'
      setErrors({ submit: message });
      toast.error(message)
      setStep('form');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `qr-${tournament.name.toLowerCase().replace(/\s+/g, '-')}.png`;

    if (qrDataUrl) {
      link.href = qrDataUrl;
      link.click();
      return;
    }

    // Create a canvas element to generate QR code image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 400;
    
    // Draw QR style square (simulated)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(20, 20, 360, 360);
    ctx.fillStyle = '#E8420A';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('PLAYARENA', 100, 200);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#F7C948';
    ctx.fillText(qrToken, 80, 250);
    
    link.href = canvas.toDataURL();
    link.click();
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-arena-navy to-arena-navy-deep">
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                <i className="ti ti-check text-4xl text-green-400" />
              </div>
              <h1 className="mt-6 text-3xl font-bold text-white">Registration Confirmed</h1>
              <p className="mt-3 text-gray-300">
                Your ticket is ready. Show this QR pass at the venue entrance.
              </p>
              <p className="mt-4 text-gray-400">
                Registered for <strong>{tournament.name}</strong> as <strong>{registration?.playerName || playerData.name}</strong>.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-arena-primary to-arena-primary-dark px-6 py-2.5 font-semibold text-white transition-all hover:shadow-lg"
                >
                  <i className="ti ti-download" />
                  Download QR Pass
                </button>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-2.5 font-semibold text-white transition-all hover:border-arena-primary hover:bg-arena-primary/20"
                >
                  <i className="ti ti-layout-dashboard" />
                  View My Registrations
                </Link>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
              <QRPassCard
                registration={registration}
                tournament={tournament}
                qrDataUrl={qrDataUrl}
                qrToken={qrToken}
              />
            </section>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-arena-navy to-arena-navy-deep">
      <Navbar />
      
      {/* Progress Steps */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 md:px-16">
          <div className="flex items-center justify-center gap-4">
            {['Details', 'Payment', 'Confirm'].map((label, idx) => (
              <div key={label} className="flex items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step === 'processing' ? 'bg-arena-primary text-white' :
                  idx === 0 ? 'bg-green-500 text-white' : 'bg-white/20 text-gray-400'
                }`}>
                  {idx === 0 && step !== 'processing' ? <i className="ti ti-check" /> : idx + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  idx === 0 ? 'text-white' : 'text-gray-400'
                }`}>{label}</span>
                {idx < 2 && <i className="ti ti-chevron-right mx-3 text-gray-600" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-12 md:px-16">
        <div className="mb-6 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
            tournament.type === 'indoor' 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-green-500/20 text-green-400'
          }`}>
            <i className={`ti ${tournament.type === 'indoor' ? 'ti-building' : 'ti-sun'} mr-1 text-xs`} />
            {tournament.type}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
            tournament.format === 'team' || tournament.format === 'doubles'
              ? 'bg-arena-gold/20 text-arena-gold'
              : 'bg-arena-primary/20 text-arena-primary'
          }`}>
            <i className={`ti ${tournament.format === 'team' || tournament.format === 'doubles' ? 'ti-users' : 'ti-user'} mr-1 text-xs`} />
            {tournament.format}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-white">Register for {tournament.name}</h1>

        {registration?.paymentStatus === 'pending' && (
          <div className="mt-6 rounded-xl border border-arena-gold/30 bg-arena-gold/10 p-4 text-sm text-arena-gold">
            <div className="flex items-start gap-3">
              <i className="ti ti-alert-circle mt-0.5 text-lg" />
              <div>
                <p className="font-semibold">Registration already started</p>
                <p className="mt-1 text-gray-300">
                  Complete the payment below to confirm your spot. We will use your existing registration instead of creating a duplicate.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'processing' ? (
          <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 py-20 text-center backdrop-blur-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-arena-primary border-t-transparent" />
            <p className="mt-4 text-gray-300">Processing your registration...</p>
            <p className="text-sm text-gray-400">Please don't close this window</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Player Details */}
              {isSolo && (
                <>
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white">Player Details</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-300">Full name</label>
                        <input
                          name="name"
                          value={playerData.name}
                          onChange={handlePlayerChange}
                          className="w-full rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-300">Email</label>
                        <input
                          name="email"
                          value={playerData.email}
                          readOnly
                          className="w-full rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-white cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Phone *</label>
                        <input
                          name="phone"
                          value={playerData.phone}
                          onChange={handlePlayerChange}
                          className={`w-full rounded-lg border ${
                            errors.phone ? 'border-red-500' : 'border-white/30'
                          } bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none`}
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Age *</label>
                        <input
                          name="age"
                          type="number"
                          value={playerData.age}
                          onChange={handlePlayerChange}
                          className={`w-full rounded-lg border ${
                            errors.age ? 'border-red-500' : 'border-white/30'
                          } bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none`}
                        />
                        {errors.age && <p className="mt-1 text-sm text-red-400">{errors.age}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">City</label>
                        <select
                          name="city"
                          value={playerData.city}
                          onChange={handlePlayerChange}
                          className="w-full rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-white focus:border-arena-primary focus:outline-none"
                        >
                          <option value="Nashik">Nashik</option>
                          <option value="Pune">Pune</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Hyderabad">Hyderabad</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white">Emergency Contact</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Contact name</label>
                        <input
                          name="emergencyName"
                          value={playerData.emergencyName}
                          onChange={handlePlayerChange}
                          className="w-full rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Contact phone</label>
                        <input
                          name="emergencyPhone"
                          value={playerData.emergencyPhone}
                          onChange={handlePlayerChange}
                          className="w-full rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Team Details */}
              {isTeam && (
                <>
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white">Team Details</h2>
                    <div className="mt-4">
                      <label className="mb-1 block text-sm font-medium text-gray-300">Team name *</label>
                      <input
                        value={teamData.teamName}
                        onChange={(e) =>
                          setTeamData((prev) => ({ ...prev, teamName: e.target.value }))
                        }
                        className={`w-full rounded-lg border ${
                          errors.teamName ? 'border-red-500' : 'border-white/30'
                        } bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none`}
                        placeholder="Enter your team name"
                      />
                      {errors.teamName && <p className="mt-1 text-sm text-red-400">{errors.teamName}</p>}
                    </div>
                    <div className="mt-4 rounded-lg bg-white/5 p-3">
                      <p className="text-sm text-gray-300">
                        <strong className="text-arena-gold">Captain:</strong> {playerData.name} ({playerData.email})
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white">Team Members</h2>
                    <p className="mt-1 text-sm text-gray-400">Maximum {maxMembers} members allowed</p>
                    {teamData.members.map((member, index) => (
                      <div key={index} className="mt-4 flex flex-wrap gap-3 border-t border-white/10 pt-4 first:border-0 first:pt-0">
                        <input
                          placeholder="Member name"
                          value={member.name}
                          onChange={(e) =>
                            handleMemberChange(index, 'name', e.target.value)
                          }
                          className="flex-1 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none"
                        />
                        <input
                          placeholder="Phone number"
                          value={member.phone}
                          onChange={(e) =>
                            handleMemberChange(index, 'phone', e.target.value)
                          }
                          className="flex-1 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(index)}
                            className="text-red-400 hover:text-red-300"
                            aria-label="Remove member"
                          >
                            <i className="ti ti-trash text-xl" />
                          </button>
                        )}
                      </div>
                    ))}
                    {teamData.members.length < maxMembers && (
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="mt-4 inline-flex items-center gap-2 text-sm text-arena-primary hover:text-arena-primary-light"
                      >
                        <i className="ti ti-plus" />
                        Add Member
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Rules & Agreement */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white">Rules &amp; Agreement</h2>
                <ul className="mt-4 space-y-2 text-sm text-gray-300">
                  {tournament.rules?.map((rule, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-arena-gold">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
                
                <label className="mt-4 flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={agreed.rules}
                    onChange={(e) =>
                      setAgreed((prev) => ({ ...prev, rules: e.target.checked }))
                    }
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-arena-primary focus:ring-arena-primary"
                  />
                  <span className="text-gray-300">I have read and agree to all tournament rules</span>
                </label>
                {errors.rules && <p className="mt-1 text-sm text-red-400">{errors.rules}</p>}
                
                <label className="mt-3 flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={agreed.accuracy}
                    onChange={(e) =>
                      setAgreed((prev) => ({ ...prev, accuracy: e.target.checked }))
                    }
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-arena-primary focus:ring-arena-primary"
                  />
                  <span className="text-gray-300">I confirm all provided information is accurate</span>
                </label>
                {errors.accuracy && <p className="mt-1 text-sm text-red-400">{errors.accuracy}</p>}
              </div>
            </div>

            {/* Right Column - Summary Card */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white">Registration Summary</h2>
                
                <div className="mt-4 rounded-lg bg-white/5 p-4">
                  <p className="font-semibold text-white">{tournament.name}</p>
                  <p className="mt-1 text-sm text-gray-400 capitalize">
                    <i className="ti ti-calendar mr-1" />
                    {tournament.format} • {tournament.type}
                  </p>
                </div>

                <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {tournament.entryFee > 0 && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="text-xs font-semibold text-gray-300">Payment Method</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('razorpay')}
                          className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition ${
                            paymentMethod === 'razorpay'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          <i className="ti ti-wallet" />
                          Razorpay
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('stripe')}
                          className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition ${
                            paymentMethod === 'stripe'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          <i className="ti ti-credit-card" />
                          Stripe
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Entry Fee</span>
                    <span className="text-white">₹{tournament.entryFee.toLocaleString()}</span>
                  </div>
                  {/* FIXED: Changed nxlReward to tournament.nxlReward */}
                  {tournament.nxlReward > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">NXL Credits Earned</span>
                      <span className="text-arena-gold">+{tournament.nxlReward}</span>
                    </div>
                  )}
                </div>

                {/* NXL Payment Option */}
                {tournament.entryFee > 0 && canUseNXL && (
                  <div className="mt-4 rounded-lg bg-arena-gold/10 p-3">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={useNXL}
                        onChange={(e) => setUseNXL(e.target.checked)}
                        className="h-4 w-4 rounded border-arena-gold/30 text-arena-gold focus:ring-arena-gold"
                      />
                      <div>
                        <p className="text-sm font-medium text-arena-gold">
                          Pay with NXL Credits
                        </p>
                        <p className="text-xs text-gray-400">
                          You have {userNXLBallance} credits available
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-arena-primary">
                      {finalPrice === 0 ? 'FREE' : `₹${finalPrice.toLocaleString()}`}
                    </span>
                  </div>
                  {useNXL && canUseNXL && tournament.entryFee > 0 && (
                    <p className="mt-2 text-xs text-green-400">
                      <i className="ti ti-check" />
                      {userNXLBallance} NXL credits will be deducted
                    </p>
                  )}
                </div>

                {infoMessage && (
                  <div className="mt-4 rounded-lg border border-arena-border bg-arena-surface p-3 text-sm text-arena-navy">
                    <strong className="font-semibold">Info:</strong> {infoMessage}
                  </div>
                )}

                {errors.submit && (
                  <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {errors.submit}
                  </div>
                )}

                {showPaymentSetupButton && (
                  <button
                    type="button"
                    onClick={handleConfirmPay}
                    disabled={processing}
                    className="mt-6 w-full rounded-lg bg-gradient-to-r from-arena-primary to-arena-primary-dark py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-arena-primary/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processing ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <i className="ti ti-loader-2 animate-spin" />
                        Preparing payment...
                      </span>
                    ) : registration?.paymentStatus === 'pending' ? (
                      finalPrice === 0
                        ? 'Complete Registration'
                        : `Continue Payment ₹${finalPrice.toLocaleString()}`
                    ) : finalPrice === 0 ? (
                      'Confirm Registration'
                    ) : (
                      `Continue to Pay ₹${finalPrice.toLocaleString()}`
                    )}
                  </button>
                )}

                <p className="mt-4 text-center text-xs text-gray-500">
                  <i className="ti ti-shield-check mr-1" />
                  Secure payment • Instant confirmation
                </p>

                {showStripePayment && (
                  <div className="mt-4">
                    <TournamentStripeForm
                      registrationId={pendingRegistrationId}
                      clientSecret={stripeClientSecret}
                      amount={stripeAmount}
                      onSuccess={(token, dataUrl, paidRegistration) => {
                        setQrToken(token);
                        setQrDataUrl(dataUrl || '');
                        setRegistration(paidRegistration || ((prev) => (prev ? { ...prev, paymentStatus: 'paid' } : prev)));
                        setStripeClientSecret('');
                        setPendingRegistrationId('');
                        setStep('success');
                      }}
                      onError={(message) => {
                        setErrors({ submit: message || 'Stripe payment failed' });
                      }}
                    />
                  </div>
                )}

                {showRazorpayPayment && (
                  <div className="mt-4">
                    <TournamentRazorpayButton
                      registrationId={pendingRegistrationId}
                      amount={stripeAmount}
                      userDetails={{
                        name: playerData.name,
                        email: playerData.email,
                        phone: playerData.phone,
                      }}
                      onSuccess={(token, dataUrl, paidRegistration) => {
                        setQrToken(token);
                        setQrDataUrl(dataUrl || '');
                        setRegistration(paidRegistration || ((prev) => (prev ? { ...prev, paymentStatus: 'paid' } : prev)));
                        setPendingRegistrationId('');
                        setStep('success');
                      }}
                      onError={(message) => {
                        setErrors({ submit: message || 'Razorpay payment failed' });
                        setStep('form');
                        setProcessing(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
