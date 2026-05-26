import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
        // Better error messages based on error type
        if (err.response?.status === 401) {
          setError("Invalid email or password. Access denied.");
        } else if (err.response?.status === 409) {
          setError(err.response?.data?.message || "User not found or access denied.");
        } else if (err.message === "Access denied. Admin account required.") {
          setError("This account does not have admin privileges.");
        } else if (!err.response) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError(err.message || "Login failed. Please try again.");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">SkillLabz</h2>
        <p className="text-center text-gray-500 mb-8">Admin Portal Access</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;