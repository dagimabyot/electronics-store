'use client';

import { useState } from 'react';
import { supabase } from '@/services/supabase';
import { updateMasterKey, hashMasterKey } from '@/services/authService';
import { validatePasswordStrength } from '@/utils/auth';

interface AdminSettingsProps {
  adminEmail: string;
  onClose: () => void;
}

export function AdminSettings({ adminEmail, onClose }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState<'security' | 'master-key'>('security');
  const [currentPassword, setCurrentPassword] = useState('');
  const [currentMasterKey, setCurrentMasterKey] = useState('');
  const [newMasterKey, setNewMasterKey] = useState('');
  const [confirmMasterKey, setConfirmMasterKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<string[]>([]);
  const [reAuthRequired, setReAuthRequired] = useState(false);
  const [reAuthPassword, setReAuthPassword] = useState('');

  const handleReAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: reAuthPassword,
      });

      if (error) {
        setMessage('❌ Authentication failed. Invalid password.');
        setMessageType('error');
        setLoading(false);
        return;
      }

      setReAuthRequired(false);
      setReAuthPassword('');
      setMessage('✓ Re-authentication successful');
      setMessageType('success');
    } catch (err) {
      console.error('[v0] Re-auth error:', err);
      setMessage('❌ An error occurred during authentication');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleMasterKeyChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (!currentMasterKey || currentMasterKey.trim().length === 0) {
      setMessage('❌ Current master key is required');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (!newMasterKey || newMasterKey.trim().length === 0) {
      setMessage('❌ New master key is required');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (newMasterKey !== confirmMasterKey) {
      setMessage('❌ Master keys do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (currentMasterKey === newMasterKey) {
      setMessage('❌ New master key must be different from current one');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await updateMasterKey(
        currentMasterKey,
        newMasterKey,
        adminEmail
      );

      if (response.success) {
        setMessage(response.message);
        setMessageType('success');
        setTimeout(() => {
          setCurrentMasterKey('');
          setNewMasterKey('');
          setConfirmMasterKey('');
        }, 2000);
      } else {
        setMessage(`❌ ${response.message}`);
        setMessageType('error');
      }
    } catch (err) {
      console.error('[v0] Error updating master key:', err);
      setMessage('❌ An error occurred while updating the master key');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordStrengthCheck = (password: string) => {
    const validation = validatePasswordStrength(password);
    setPasswordValidationErrors(validation.errors);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-bold">⚙️</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:opacity-80 transition text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'security'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Security & Password
          </button>
          <button
            onClick={() => setActiveTab('master-key')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'master-key'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Master Key Management
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Re-authentication Modal */}
          {reAuthRequired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">🔐 Re-authentication Required</h3>
              <p className="text-yellow-800 text-sm mb-4">
                For security reasons, you must re-authenticate to change critical settings.
              </p>
              <form onSubmit={handleReAuthenticate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter your password to continue
                  </label>
                  <input
                    type="password"
                    value={reAuthPassword}
                    onChange={(e) => setReAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReAuthRequired(false);
                      setReAuthPassword('');
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security & Password Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>ℹ️ Security Info:</strong> Your admin account is protected with Supabase authentication. Passwords are hashed and encrypted.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {adminEmail}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                <p className="text-gray-600 text-sm mb-4">
                  To change your password, please use the password reset feature on the login page.
                </p>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  onClick={() => {
                    window.location.href = '/admin/login?reset=true';
                  }}
                >
                  Reset Password
                </button>
              </div>
            </div>
          )}

          {/* Master Key Management Tab */}
          {activeTab === 'master-key' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  <strong>⚠️ Warning:</strong> Master key is used for admin registration. Never share it. Changes are logged for audit purposes.
                </p>
              </div>

              <form onSubmit={handleMasterKeyChange} className="space-y-4">
                <div>
                  <label htmlFor="current-mk" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Master Key
                  </label>
                  <input
                    id="current-mk"
                    type="password"
                    value={currentMasterKey}
                    onChange={(e) => setCurrentMasterKey(e.target.value)}
                    placeholder="Enter current master key"
                    disabled={loading || !reAuthRequired === false}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="new-mk" className="block text-sm font-medium text-gray-700 mb-1">
                    New Master Key
                  </label>
                  <input
                    id="new-mk"
                    type="password"
                    value={newMasterKey}
                    onChange={(e) => setNewMasterKey(e.target.value)}
                    placeholder="Enter new master key"
                    disabled={loading || !reAuthRequired === false}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-mk" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Master Key
                  </label>
                  <input
                    id="confirm-mk"
                    type="password"
                    value={confirmMasterKey}
                    onChange={(e) => setConfirmMasterKey(e.target.value)}
                    placeholder="Confirm new master key"
                    disabled={loading || !reAuthRequired === false}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {message && (
                  <div
                    className={`rounded-lg p-3 ${
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

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => setReAuthRequired(true)}
                    disabled={loading || reAuthRequired}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {reAuthRequired ? 'Re-authenticate First' : 'Proceed with Change'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
