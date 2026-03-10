import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/authSlice';
import userService from '../../services/user.service';

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
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
        
        {/* LOADING STATE */}
        {status === 'loading' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Verifying Email...</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your email address.</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Email Verified Successfully!</h2>
            <p className="text-gray-500 text-sm mb-6">Your account is now secure. Redirecting you to your profile...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-8">{errorMessage}</p>
            <Link to="/profile" className="inline-block w-full py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Return to Profile
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}