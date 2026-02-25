'use client';

import { useState } from 'react';
import { supabase } from '@/services/supabase';
import { isAdminEmailAllowed } from '@/utils/auth';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email is in admin whitelist
    if (!isAdminEmailAllowed(email)) {
      setError('❌ This email is not authorized for admin access');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('❌ Invalid email or password');
        console.error('[v0] Admin login error:', signInError);
        setLoading(false);
        return;
      }

      if (data.user) {
        setEmail('');
        setPassword('');
        onLoginSuccess(data.user);
      }
    } catch (err) {
      console.error('[v0] Unexpected error during admin login:', err);
      setError('❌ An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🔐</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            Authorized administrators only. Access is restricted to approved email addresses.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                ✓ Authorized emails: admin@example.com, test.admin@electra.com, admin@electra.com
              </p>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm font-medium">Login Failed</p>
                <p className="text-red-700 text-xs mt-1">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Logging in...' : 'Admin Login'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              disabled={loading}
              className="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Forgot Password?
            </button>
          </form>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        isAdmin={true}
      />
    </>
  );
}
