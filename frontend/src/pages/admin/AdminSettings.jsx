import React, { useState } from 'react';
import { KeyRound, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const result = await adminApi.changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: result.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Force re-login after short delay
      setTimeout(() => {
        sessionStorage.removeItem('adminAuth');
        sessionStorage.removeItem('adminToken');
        window.location.href = '/admin';
      }, 2000);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to change password.';
      setMessage({ type: 'error', text: detail });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-settings">
      <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Settings</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-[#1e73be]/10 rounded-lg">
            <KeyRound className="w-5 h-5 text-[#1e73be]" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Change Password</h3>
            <p className="text-sm text-gray-500">You will be logged out after changing your password.</p>
          </div>
        </div>

        {message && (
          <div
            data-testid="password-change-message"
            className={`flex items-center gap-2 p-3 rounded-lg text-sm mb-4 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be]"
                required
                data-testid="current-password-input"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be]"
                required
                minLength={6}
                data-testid="new-password-input"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be]"
              required
              minLength={6}
              data-testid="confirm-password-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[#1e73be] text-white rounded-lg hover:bg-[#1a5fa0] transition-colors disabled:opacity-50"
            data-testid="change-password-button"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
