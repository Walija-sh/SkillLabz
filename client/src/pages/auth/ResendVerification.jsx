import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ResendVerification() {
  const [email, setEmail] = useState('');
  const [uiState, setUiState] = useState({
    isLoading: false,
    error: null,
    success: null,
  });
  
  // Rate limiting state: Countdown timer (seconds) to prevent spamming
  const [countdown, setCountdown] = useState(0);

  // Logic to handle the countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Safety check for countdown
    if (countdown > 0) return;

    setUiState({ isLoading: true, error: null, success: null });

    // Mock API call for now since the backend is not ready
    try {
      console.log("Mocking resend verification for:", email);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setUiState({
        isLoading: false,
        error: null,
        success: "Verification email resent successfully. Please check your inbox.",
      });
      
      // Start 60-second cooldown for UX best practices
      setCountdown(60); 

    } catch (err) {
      setUiState({
        isLoading: false,
        error: "Something went wrong. Please try again later.",
        success: null,
      });
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
        
        {/* Header section with icon */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Resend Verification
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Enter your email and we'll send you a new link to activate your account.
          </p>
        </div>

        {/* User Feedback Alerts */}
        {uiState.error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100" role="alert">
            {uiState.error}
          </div>
        )}
        
        {uiState.success && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-100" role="alert">
            {uiState.success}
          </div>
        )}

        {/* Clean, Validated Form */}
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          aria-label="Resend verification email form"
        >
          <Input
            label="Registered Email Address"
            name="email"
            type="email"
            placeholder="johndoe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={uiState.isLoading || countdown > 0}
            required
            aria-required="true"
          />

          <Button 
            type="submit" 
            className="w-full h-11" 
            isLoading={uiState.isLoading}
            disabled={countdown > 0}
          >
            {countdown > 0 ? `Retry in ${countdown}s` : 'Resend Email'}
          </Button>
        </form>

        {/* Navigation back to login */}
        <div className="text-center">
          <Link 
            to="/login" 
            className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
          >
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}