import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { login as authLogin } from '../../store/authSlice';
import authService from '../../services/auth.service';

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [uiState, setUiState] = useState({
    isLoading: false,
    error: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState({ isLoading: true, error: null });

    try {
      const result = await authService.login(formData);
      if (result && result.data) {
        dispatch(authLogin(result.data));
        console.log(result.data);
        navigate('/');
      }
    } catch (err) {
      setUiState({
        isLoading: false,
        error: err?.message || "Invalid email or password. Please try again.",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Brand Column */}
      <motion.div 
        className="hidden lg:flex w-1/2 bg-gray-100 flex-col items-center justify-center p-12 relative"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="max-w-md w-full text-center space-y-8">
          <img src="/logo.png" alt="SkillLabz Logo" className="w-32 mx-auto mb-8" />
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Log in to your account</h1>
            <p className="text-gray-500 text-lg">Welcome back! Use your email and password.</p>
          </div>
        </div>
      </motion.div>

      {/* Right Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-100">
        <motion.div 
          className="w-full max-w-md space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden text-center space-y-4 mb-8">
            <img src="/logo.png" alt="SkillLabz Logo" className="w-24 mx-auto" />
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
          </div>

          <AnimatePresence mode="wait">
            {uiState.error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100" 
                role="alert"
              >
                {uiState.error}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} className="space-y-5">
              
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 ml-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={uiState.isLoading}
                  required
                  className="w-full rounded-2xl border border-gray-300 px-5 py-3 text-gray-900 outline-none transition focus:border-blue-700 focus:ring-1 focus:ring-blue-700 disabled:bg-gray-50"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={uiState.isLoading}
                    required
                    className="w-full rounded-2xl border border-gray-300 px-5 py-3 pr-12 text-gray-900 outline-none transition focus:border-blue-700 focus:ring-1 focus:ring-blue-700 disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-4 flex items-center justify-center text-gray-400 transition hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.5 12s3.8-6.5 9.5-6.5S21.5 12 21.5 12s-3.8 6.5-9.5 6.5S2.5 12 2.5 12Z" />
                        <path d="M9.5 12a2.5 2.5 0 1 0 5 0a2.5 2.5 0 0 0-5 0Z" />
                        <path d="m4 4 16 16" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.5 12s3.8-6.5 9.5-6.5S21.5 12 21.5 12s-3.8 6.5-9.5 6.5S2.5 12 2.5 12Z" />
                        <path d="M9.5 12a2.5 2.5 0 1 0 5 0a2.5 2.5 0 0 0-5 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <button 
                type="submit" 
                disabled={uiState.isLoading}
                className="w-full rounded-2xl bg-blue-700 py-4 text-base font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {uiState.isLoading ? 'Logging in...' : 'Log In'}
              </button>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="text-center text-sm text-gray-600 pt-4">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-700 transition-colors hover:text-blue-800">
              Sign up
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}