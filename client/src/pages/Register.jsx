
import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { setWallet } from '../store/slices/walletSlice';
import { authAPI } from '../services/api';
import logo from '../assets/logo.png';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength checker
  const checkPasswordStrength = useCallback((password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  }, []);

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password, checkPasswordStrength]);

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    if (passwordStrength === 4) return 'bg-green-500';
    return 'bg-gray-600';
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev, [name]: '' };
      if (name === 'password' && prev.confirmPassword) {
        next.confirmPassword = '';
      }
      return next;
    });
  }, []);

  const getFieldError = useCallback(
    (name, value) => {
      switch (name) {
        case 'name':
          if (!value.trim()) return 'Full name is required';
          if (value.trim().length < 2) return 'Name must be at least 2 characters';
          if (value.trim().length > 50) return 'Name must be less than 50 characters';
          return '';
        case 'email':
          if (!value.trim()) return 'Email is required';
          if (!emailRegex.test(value)) return 'Enter a valid email address';
          return '';
        case 'phone':
          if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
            return 'Enter a valid Indian phone number (10 digits)';
          }
          return '';
        case 'password':
          if (!value) return 'Password is required';
          if (value.length < 8) return 'Password must be at least 8 characters';
          if (value.length > 100) return 'Password must be less than 100 characters';
          if (!/[a-z]/.test(value)) return 'Password must contain lowercase letters';
          if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letters';
          if (!/[0-9]/.test(value)) return 'Password must contain a number';
          return '';
        case 'confirmPassword':
          if (!value) return 'Please confirm your password';
          if (value !== formData.password) return 'Passwords do not match';
          return '';
        default:
          return '';
      }
    },
    [formData.password]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const message = getFieldError(name, value);
      setErrors((prev) => ({ ...prev, [name]: message }));
    },
    [getFieldError]
  );

  const validateAll = () => {
    const fields = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    const next = {};
    fields.forEach((field) => {
      const msg = getFieldError(field, formData[field]);
      if (msg) next[field] = msg;
    });
    if (!agreed) next.terms = 'You must agree to the terms to continue';
    setErrors(next);
    setTouched(
      fields.reduce((acc, f) => ({ ...acc, [f]: true }), { terms: true })
    );
    return Object.keys(next).length === 0;
  };

  const showError = (field) => (touched[field] ? errors[field] : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true);
    setFormError('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      };
      const res = await authAPI.post('/register', payload);
      const { user, accessToken } = res.data.data;
      dispatch(setCredentials({ user, token: accessToken }));
      localStorage.setItem('accessToken', accessToken);
      dispatch(setWallet({ balance: user.walletBalance || 0, nxlCredits: user.nxlCredits || 0 }));
      navigate('/dashboard');
    } catch (error) {
      setFormError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-arena-navy to-arena-navy-deep">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-0.5 text-2xl font-bold tracking-tight">
              <img src={logo} alt="PlayArena Logo" className='h-24 w-72'  />
            </Link>
              <p className="mt-2 text-sm text-gray-400">Sign in to your account</p>
          </div>
          

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-arena-primary/20 to-arena-primary/10">
                <i className="ti ti-user-plus text-3xl text-arena-primary" />
              </div>
              <h1 className="text-2xl font-bold text-white">Create account</h1>
              <p className="mt-2 text-sm text-gray-300">
                Start competing and earning NXL credits today
              </p>
            </div>

            {/* Signup Options */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-arena-primary hover:bg-arena-primary/10">
                <i className="ti ti-brand-google" />
                Google
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-arena-primary hover:bg-arena-primary/10">
                <i className="ti ti-brand-apple" />
                Apple
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gradient-to-br from-white/10 to-white/5 px-2 text-gray-400">or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {formError}
                </div>
              )}
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Full name <span className="text-arena-primary">*</span>
                </label>
                <div className="relative">
                  <i className="ti ti-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-lg border ${
                      showError('name') ? 'border-red-500' : 'border-white/30'
                    } bg-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none focus:ring-1 focus:ring-arena-primary`}
                    placeholder="Rahul Sharma"
                    autoComplete="name"
                  />
                </div>
                {showError('name') && (
                  <p className="mt-1 text-xs text-red-400">{showError('name')}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Email address <span className="text-arena-primary">*</span>
                </label>
                <div className="relative">
                  <i className="ti ti-mail absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-lg border ${
                      showError('email') ? 'border-red-500' : 'border-white/30'
                    } bg-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none focus:ring-1 focus:ring-arena-primary`}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                {showError('email') && (
                  <p className="mt-1 text-xs text-red-400">{showError('email')}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Phone number <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <i className="ti ti-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-lg border ${
                      showError('phone') ? 'border-red-500' : 'border-white/30'
                    } bg-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none focus:ring-1 focus:ring-arena-primary`}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                  />
                </div>
                {showError('phone') && (
                  <p className="mt-1 text-xs text-red-400">{showError('phone')}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Password <span className="text-arena-primary">*</span>
                </label>
                <div className="relative">
                  <i className="ti ti-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-lg border ${
                      showError('password') ? 'border-red-500' : 'border-white/30'
                    } bg-white/10 py-2.5 pl-10 pr-12 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none focus:ring-1 focus:ring-arena-primary`}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} />
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= passwordStrength ? getStrengthColor() : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength > 0 && (
                      <p className={`mt-1 text-xs ${getStrengthColor().replace('bg-', 'text-')}`}>
                        Password strength: {getStrengthLabel()}
                      </p>
                    )}
                  </div>
                )}
                {showError('password') && (
                  <p className="mt-1 text-xs text-red-400">{showError('password')}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Confirm password <span className="text-arena-primary">*</span>
                </label>
                <div className="relative">
                  <i className="ti ti-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-lg border ${
                      showError('confirmPassword') ? 'border-red-500' : 'border-white/30'
                    } bg-white/10 py-2.5 pl-10 pr-12 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none focus:ring-1 focus:ring-arena-primary`}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <i className={`ti ${showConfirmPassword ? 'ti-eye-off' : 'ti-eye'}`} />
                  </button>
                </div>
                {showError('confirmPassword') && (
                  <p className="mt-1 text-xs text-red-400">{showError('confirmPassword')}</p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      setErrors((prev) => ({ ...prev, terms: '' }));
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-arena-primary focus:ring-arena-primary"
                  />
                  <span className="text-gray-300">
                    I agree to the{' '}
                    <a href="#" className="font-medium text-arena-gold hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-medium text-arena-gold hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {touched.terms && errors.terms && (
                  <p className="mt-2 text-xs text-red-400" role="alert">
                    {errors.terms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-arena-primary to-arena-primary-dark py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-arena-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>

              {/* Bonus Info */}
              <div className="mt-4 rounded-lg bg-arena-gold/10 p-3 text-center">
                <p className="text-xs text-arena-gold">
                  🎉 Sign up bonus: <strong>500 NXL credits</strong> added to your wallet!
                </p>
              </div>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-arena-primary hover:text-arena-primary-light transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
