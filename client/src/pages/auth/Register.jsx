import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  
  const [uiState, setUiState] = useState({
    isLoading: false,
    error: null,
    success: null,
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
    setUiState({ isLoading: true, error: null, success: null });

    try {
      // 1. Trigger actual Axios call to Vercel via authService
      const result = await authService.signup(formData);
      
      if (result) {
        setUiState({
          isLoading: false,
          error: null,
          success: 'Account created! Redirecting to login...',
        });

        // 2. Redirect to login after a brief delay so user sees success message
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
      
    } catch (err) {
      setUiState({
        isLoading: false,
        error: err?.message || 'Registration failed. Please try again.',
        success: null,
      });
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
          <p className="mt-3 text-sm text-gray-500">Join SkillLabz and start sharing tools today.</p>
        </div>

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

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Username"
            name="username"
            placeholder="johndoe"
            value={formData.username}
            onChange={handleChange}
            disabled={uiState.isLoading}
            required
          />

          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={uiState.isLoading}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={uiState.isLoading}
            required
          />

          <Button type="submit" className="w-full" isLoading={uiState.isLoading}>
            Sign Up
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}