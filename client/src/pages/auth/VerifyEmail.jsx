import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import authService from '../../services/auth.service';
import Button from '../../components/common/Button';

export default function VerifyEmail() {
  // Grab the logged-in user's data from Redux
  const user = useSelector((state) => state.auth.userData);

  const [uiState, setUiState] = useState({
    isLoading: false,
    error: null,
    success: null,
  });
  
  // Rate limiting state: Countdown timer (seconds) to prevent spamming
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (countdown > 0) return;

    setUiState({ isLoading: true, error: null, success: null });

    try {
      await authService.sendVerificationEmail();

      setUiState({
        isLoading: false,
        error: null,
        success: "Verification email sent successfully! Please check your inbox.",
      });
      
      setCountdown(60); 
    } catch (err) {
      setUiState({
        isLoading: false,
        error: err?.message || "Something went wrong. Please try again later.",
        success: null,
      });
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
        
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Verify Your Email</h2>
          <p className="mt-3 text-sm text-gray-500">We will send a secure activation link to your registered email address.</p>
        </div>

        {uiState.error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100" role="alert">{uiState.error}</div>
        )}
        {uiState.success && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-100" role="alert">{uiState.success}</div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
            <span className="text-sm text-gray-500 block mb-1">Sending to:</span>
            <span className="font-semibold text-gray-900">{user?.email || "your email address"}</span>
          </div>

          <Button type="submit" className="w-full h-11" isLoading={uiState.isLoading} disabled={countdown > 0}>
            {countdown > 0 ? `Retry in ${countdown}s` : 'Send Verification Email'}
          </Button>
        </form>

        <div className="text-center">
          <Link to="/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}