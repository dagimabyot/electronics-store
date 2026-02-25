'use client';

import { useState } from 'react';
import { supabase } from '@/services/supabase';
import { registerAdmin } from '@/services/authService';
import { isAdminEmailAllowed, validatePasswordStrength, validateEmail } from '@/utils/auth';

interface AdminSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess: () => void;
}

export function AdminSignupModal({
  isOpen,
  onClose,
  onSignupSuccess,
}: AdminSignupModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrengthErrors, setPasswordStrengthErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const validation = validatePasswordStrength(value);
    setPasswordStrengthErrors(validation.errors);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation checks
    if (!validateEmail(email)) {
      setError('❌ Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!isAdminEmailAllowed(email)) {
      setError('❌ This email is not authorized for admin registration');
      setLoading(false);
      return;
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      setError('❌ Password does not meet security requirements');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('❌ Passwords do not match');
      setLoading(false);
      return;
    }

    if (!masterKey || masterKey.trim().length === 0) {
      setError('❌ Master key is required');
      setLoading(false);
      return;
    }

    try {
      // First, verify the master key with the stored one
      const { data: masterKeyData, error: masterKeyError } = await supabase
        .from('master_key_storage')
        .select('hashed_key')
        .eq('is_active', true)
        .single();

      if (masterKeyError || !masterKeyData) {
        setError('❌ Master key verification failed. Please contact administrator.');
        console.error('[v0] Master key lookup error:', masterKeyError);
        setLoading(false);
        return;
      }

      // Use registerAdmin service which handles everything
      const response = await registerAdmin(
        email,
        password,
        masterKeyData.hashed_key,
        masterKey
      );

      if (response.success) {
        setSuccess(true);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setMasterKey('');
        setTimeout(() => {
          onSignupSuccess();
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        setError(`❌ ${response.message}`);
      }
    } catch (err) {
      console.error('[v0] Admin signup error:', err);
      setError('❌ An unexpected error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🔑</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Registration</h2>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Create an admin account. Registration requires a valid master key and approved email.
        </p>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium text-sm">✓ Admin account created successfully!</p>
            <p className="text-green-700 text-xs mt-2">Redirecting to admin panel...</p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be one of: admin@example.com, test.admin@electra.com, admin@electra.com
              </p>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition"
              />
              {passwordStrengthErrors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                  <p className="text-xs font-medium text-yellow-800 mb-1">Password Requirements:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {passwordStrengthErrors.map((err, idx) => (
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition"
              />
            </div>

            <div>
              <label htmlFor="master-key" className="block text-sm font-medium text-gray-700 mb-1">
                Master Key
              </label>
              <input
                id="master-key"
                type="password"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="Enter master key"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                🔒 Required for admin registration. Contact your administrator if you don't have it.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm font-medium">Registration Error</p>
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
                {loading ? 'Registering...' : 'Register Admin'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
