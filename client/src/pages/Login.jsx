
import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { setWallet } from '../store/slices/walletSlice';
import { authAPI } from '../services/api';
import logo from '../assets/logo.png';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const validateField = useCallback((name, value) => {
    let message = '';
    if (name === 'email') {
      if (!value.trim()) message = 'Email is required';
      else if (!emailRegex.test(value)) message = 'Enter a valid email address';
    }
    if (name === 'password') {
      if (!value) message = 'Password is required';
      else if (value.length < 6) message = 'Password must be at least 6 characters';
    }
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
    return !message;
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [fieldErrors]);

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name, value);
    },
    [validateField]
  );

  const validateForm = () => {
    const next = {};
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) next.email = 'Enter a valid email address';
    if (!formData.password) next.password = 'Password is required';
    else if (formData.password.length < 6) next.password = 'Password must be at least 6 characters';
    setFieldErrors(next);
    setTouched({ email: true, password: true });
    return Object.keys(next).length === 0;
  };

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setFormError('');
    
    // Handle remember me
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    try {
      const res = await authAPI.post('/login', formData);
      const { user, accessToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      let nextUser = user;

      try {
        const meRes = await authAPI.get('/me');
        nextUser = meRes.data.data.user;
      } catch {
        nextUser = user;
      }

      dispatch(setCredentials({ user: nextUser, token: accessToken }));
      dispatch(setWallet({ balance: user.walletBalance || 0, nxlCredits: user.nxlCredits || 0 }));
      
      // Redirect based on user role
      const defaultRedirect = user.role === 'admin' ? '/admin' : '/dashboard';
      const from = location.state?.from?.pathname || defaultRedirect;
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(error.message || 'Invalid email or password. Please try again.');
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

          {/* Login Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-sm">
            {/* Welcome Message */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-arena-primary/20 to-arena-primary/10">
                <i className="ti ti-user-circle text-3xl text-arena-primary" />
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="mt-2 text-sm text-gray-300">
                Sign in to continue your sports journey
              </p>
            </div>

            {/* Social Login Options */}
            <div className="mt-6 justify-center gap-4 sm:flex">
              <button className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-arena-primary hover:bg-arena-primary/10">
                <i className="ti ti-brand-google" />
                Google
              </button>
              
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gradient-to-br from-white/10 to-white/5 px-2 text-gray-400">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Form Error Alert */}
              {formError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400" role="alert">
                  <i className="ti ti-alert-circle mt-0.5 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Email address
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
                      touched.email && fieldErrors.email ? 'border-red-500' : 'border-white/30'
                    } bg-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none focus:ring-1 focus:ring-arena-primary`}
                    placeholder="rahul.sharma@example.com"
                    autoComplete="email"
                  />
                </div>
                {touched.email && fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Password
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
                      touched.password && fieldErrors.password ? 'border-red-500' : 'border-white/30'
                    } bg-white/10 py-2.5 pl-10 pr-12 text-white placeholder-gray-300 focus:border-arena-primary focus:outline-none focus:ring-1 focus:ring-arena-primary`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={handleTogglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
                  >
                    <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} />
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-arena-primary focus:ring-arena-primary"
                  />
                  <span className="text-gray-300">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-arena-primary transition-colors hover:text-arena-primary-light"
                >
                  Forgot password?
                </Link>
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
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>

              
            </form>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-arena-primary transition-colors hover:text-arena-primary-light">
                Create account
              </Link>
            </p>
          </div>

          {/* Features List */}
          <div className="mt-6 text-center">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <i className="ti ti-shield-check text-arena-gold text-sm" />
                Secure Login
              </span>
              <span className="flex items-center gap-1">
                <i className="ti ti-coin text-arena-gold text-sm" />
                NXL Rewards
              </span>
              <span className="flex items-center gap-1">
                <i className="ti ti-headset text-arena-gold text-sm" />
                24/7 Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
