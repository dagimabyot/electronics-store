'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { resetPasswordWithToken } from '@/services/authService';
import { validatePasswordStrength } from '@/utils/auth';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!token || !email) {
      setMessage('❌ Invalid reset link. Please try again.');
      setMessageType('error');
    }
  }, [token, email]);

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    const validation = validatePasswordStrength(value);
    setPasswordErrors(validation.errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setMessage('❌ Please fill in all fields');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      setMessage('❌ Password does not meet security requirements');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('❌ Passwords do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      if (!token || !email) {
        setMessage('❌ Invalid reset link');
        setMessageType('error');
        setLoading(false);
        return;
      }

      const response = await resetPasswordWithToken(token, email, newPassword);

      if (response.success) {
        setMessage('✓ Password has been successfully reset! Redirecting to login...');
        setMessageType('success');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        setMessage(`❌ ${response.message}`);
        setMessageType('error');
      }
    } catch (err) {
      console.error('[v0] Error resetting password:', err);
      setMessage('❌ An error occurred while resetting your password');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Enter your new password below. Make sure it's strong and unique.
        </p>

        {message && (
          <div
            className={`rounded-lg p-4 mb-6 ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                messageType === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {message}
            </p>
          </div>
        )}

        {!token || !email ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm font-medium mb-4">Invalid Reset Link</p>
            <p className="text-yellow-700 text-xs mb-4">
              The password reset link is invalid or has expired. Please request a new one from the login page.
            </p>
            <Link
              href="/"
              className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition"
              />
              {passwordErrors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                  <p className="text-xs font-medium text-yellow-800 mb-1">Password must have:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {passwordErrors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || passwordErrors.length > 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
