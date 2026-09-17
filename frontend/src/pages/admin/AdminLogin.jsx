import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminApi.login(password);
      onLogin();
    } catch (err) {
      // Handle specific error cases
      if (err.response?.status === 429) {
        setError('Too many login attempts. Please try again later.');
      } else if (err.response?.status === 401) {
        setError('Invalid password');
      } else {
        setError(err.response?.data?.detail || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1e73be]/10 rounded-full mb-4">
            <Lock className="w-8 h-8 text-[#1e73be]" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">Admin Access</h1>
          <p className="text-gray-600 mt-2">Enter the admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be]"
              placeholder="Enter admin password"
              required
              autoFocus
              data-testid="admin-password-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[#1e73be] text-white rounded-lg hover:bg-[#1a5fa0] transition-colors disabled:opacity-50"
            data-testid="admin-login-button"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          RhymeMosaic Admin Panel
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
