import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/authSlice';
import userService from '../../services/user.service';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Animation Variants ──────────────────────────────────────────────────────
const cardVariant = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, y: -15, transition: { duration: 0.3 } }
};

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  // 🛡️ GUARD: Tracks if we have already made the API call
  const hasAttempted = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await userService.verifyEmailToken(token);
        
        setStatus('success');
        dispatch(updateUser({ isEmailVerified: true }));

        setTimeout(() => {
          navigate('/profile');
        }, 3000);

      } catch (error) {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    if (token) {
      // 🛡️ GUARD: Only run the API call if we haven't tried yet
      if (!hasAttempted.current) {
        hasAttempted.current = true;
        verifyToken();
      }
    } else {
      setStatus('error');
      setErrorMessage('No verification token found in the URL.');
    }
  }, [token, navigate, dispatch]);

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 bg-[#ECEFF1]">
      <AnimatePresence mode="wait">
        
        {/* LOADING STATE */}
        {status === 'loading' && (
          <motion.div 
            key="loading"
            variants={cardVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            className="w-full max-w-md bg-white rounded-[32px] p-10 sm:p-12 shadow-sm border border-gray-100 text-center"
          >
            <div className="mx-auto w-16 h-16 border-4 border-gray-100 border-t-[#191970] rounded-full animate-spin mb-6 shadow-sm"></div>
            <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tight mb-3">Verifying Email</h2>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">
              Please wait while we confirm your email address.
            </p>
          </motion.div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <motion.div 
            key="success"
            variants={cardVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            className="w-full max-w-md bg-white rounded-[32px] p-10 sm:p-12 shadow-sm border border-gray-100 text-center"
          >
            <div className="mx-auto w-20 h-20 bg-[#00875A]/10 text-[#00875A] rounded-full flex items-center justify-center mb-6 border border-[#00875A]/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tight mb-3">Email Verified!</h2>
            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">
              Your account is now secure. Redirecting you to your profile...
            </p>
          </motion.div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <motion.div 
            key="error"
            variants={cardVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            className="w-full max-w-md bg-white rounded-[32px] p-10 sm:p-12 shadow-sm border border-gray-100 text-center"
          >
            <div className="mx-auto w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tight mb-3">Verification Failed</h2>
            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">{errorMessage}</p>
            <Link 
              to="/profile" 
              className="inline-block w-full py-4 bg-[#191970] text-white text-xs font-black uppercase tracking-widest rounded-[16px] shadow-xl shadow-[#191970]/20 hover:bg-[#0f0f50] transition-colors"
            >
              Return to Profile
            </Link>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}