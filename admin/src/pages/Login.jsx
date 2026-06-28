import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import authService from '../services/auth.service';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password. Access denied.');
      } else if (err.response?.status === 409) {
        setError(err.response?.data?.message || 'User not found or access denied.');
      } else if (err.message === 'Access denied. Admin account required.') {
        setError('This account does not have admin privileges.');
      } else if (!err.response) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: '#ECEFF1', fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-16">
        <motion.div
          className="flex flex-col items-center text-center"
          initial="hidden"
          animate="visible"
        >
          {/* Logo icon (Desktop) */}
          <motion.div
            variants={fadeUp}
            custom={0}
            // CHANGED: Removed background, rounded corners, padding, and shadows.
            className="flex items-center justify-center mb-8"
          >
            <img
              src="/logo.png"
              alt="SkillLabz"
              // CHANGED: Increased the size slightly since the wrapper box is gone.
              className="w-20 h-20 object-contain"
            />
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl font-black text-[#191970] leading-tight mb-3"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="text-gray-900">Admin</span> Login
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-sm text-slate-400 font-medium"
          >
            Welcome back! Use your email and password.
          </motion.p>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 sm:px-12 lg:px-20">

        {/* Mobile-only logo */}
        <motion.div
          className="lg:hidden flex flex-col items-center mb-10"
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            // CHANGED: Removed background, rounded corners, padding, and shadows.
            className="flex items-center justify-center mb-4"
          >
            <img
              src="/logo.png"
              alt="SkillLabz"
              // CHANGED: Increased the size slightly since the wrapper box is gone.
              className="w-16 h-16 object-contain"
            />
          </motion.div>
          <h1 className="text-2xl font-black text-[#191970]" style={{ letterSpacing: '-0.02em' }}>
            Log in to your account
          </h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back! Use your email and password.</p>
        </motion.div>

        {/* Form card */}
        <motion.div
          className="w-full max-w-sm"
          initial="hidden"
          animate="visible"
        >
          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-3 mb-5 px-4 py-3 rounded-2xl border border-red-100 bg-red-50"
              >
                <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <motion.div variants={fadeUp} custom={1}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#191970';
                  e.target.style.boxShadow = '0 0 0 3px rgba(25,25,112,0.08)';
                  e.target.style.backgroundColor = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#f8fafc';
                }}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '0.875rem',
                  outline: 'none',
                  fontSize: '0.925rem',
                  fontFamily: 'DM Sans, sans-serif',
                  color: '#0f172a',
                  backgroundColor: '#f8fafc',
                  transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
                  boxSizing: 'border-box',
                }}
              />
            </motion.div>

            {/* Password */}
            <motion.div variants={fadeUp} custom={2}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#191970';
                    e.target.style.boxShadow = '0 0 0 3px rgba(25,25,112,0.08)';
                    e.target.style.backgroundColor = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 3rem 0.75rem 1rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '0.875rem',
                    outline: 'none',
                    fontSize: '0.925rem',
                    fontFamily: 'DM Sans, sans-serif',
                    color: '#0f172a',
                    backgroundColor: '#f8fafc',
                    transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPw
                    ? <EyeSlashIcon className="w-5 h-5" />
                    : <EyeIcon className="w-5 h-5" />
                  }
                </button>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div variants={fadeUp} custom={3}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all duration-200 disabled:opacity-50"
                style={{ backgroundColor: '#191970', color: '#fff' }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#0f0f4d'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#191970'; }}
              >
                {loading ? 'Authenticating...' : 'Log In'}
              </motion.button>
            </motion.div>
          </form>

          <motion.p
            variants={fadeUp}
            custom={4}
            className="text-center text-xs text-slate-400 mt-6"
          >
            Restricted access — authorized personnel only.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;