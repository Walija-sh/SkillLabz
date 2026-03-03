import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login as authLogin } from '../../store/authSlice';
import authService from '../../services/auth.service';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
      // 1. Call the backend using Axios via authService
      const session = await authService.login(formData);

      if (session && session.user) {
        // 2. Update Redux global state with user data
        dispatch(authLogin(session.user));
        
        // 3. Navigate to the home or dashboard
        navigate('/'); 
      }
    } catch (err) {
      // Error handling normalized by authService
      setUiState({
        isLoading: false,
        error: err?.message || "Invalid email or password. Please try again.",
      });
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
          <p className="mt-3 text-sm text-gray-500">Sign in to access your dashboard and manage rentals.</p>
        </div>

        {uiState.error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100" role="alert">
            {uiState.error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={uiState.isLoading}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={uiState.isLoading}
                required
              />
              <div className="mt-1 flex justify-end">
                <Link to="/resend-verification" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={uiState.isLoading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          New to SkillLabz?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}