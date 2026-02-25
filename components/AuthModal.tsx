
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onUserLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authType, setAuthType] = useState<'customer' | 'admin'>('customer');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', adminKey: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setFormData({ name: '', email: '', password: '', adminKey: '' });
    onClose();
  };

  // Animated Geometric Background Component
  const GeometricBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <pattern id="dots" x="30" y="30" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="3" fill="#ffffff" opacity="0.2" />
          </pattern>
        </defs>
        
        {/* Base gradient */}
        <rect width="500" height="800" fill="url(#bgGradient)" />
        
        {/* Animated circles */}
        <circle cx="150" cy="200" r="180" fill="#0284c7" opacity="0.3" />
        <circle cx="350" cy="400" r="150" fill="#1e40af" opacity="0.25" />
        <circle cx="250" cy="600" r="200" fill="#0ea5e9" opacity="0.2" />
        
        {/* Grid pattern */}
        <rect width="500" height="800" fill="url(#dots)" />
        
        {/* Diagonal lines */}
        <line x1="0" y1="0" x2="500" y2="800" stroke="#ffffff" strokeWidth="1" opacity="0.1" />
        <line x1="500" y1="0" x2="0" y2="800" stroke="#ffffff" strokeWidth="1" opacity="0.1" />
      </svg>
    </div>
  );

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || 'Google authentication failed. Check your Google Cloud Console settings.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = formData.email.trim().toLowerCase();
    
    if (authType === 'admin' && !isLogin && formData.adminKey !== 'ELECTRA-2024') {
      setError("Invalid Admin Registration Key. Authorization denied.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: formData.password,
        });
        
        if (signInError) throw signInError;

        if (data.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          const role = profile?.role || 'customer';
          
          if (authType === 'admin' && role !== 'admin') {
            throw new Error("Access Denied: This account lacks administrative privileges.");
          }

          onUserLogin({
            id: data.user.id,
            email: data.user.email!,
            name: profile?.name || data.user.user_metadata?.name || 'User',
            role: role as 'admin' | 'customer'
          });
          onClose();
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password: formData.password,
          options: { 
            data: { 
              name: formData.name, 
            },
            emailRedirectTo: window.location.origin 
          }
        });
        
        if (signUpError) throw signUpError;

        // Create profile for new user
        if (data.user) {
          const profileRole = authType === 'admin' ? 'admin' : 'customer';
          
          console.log("[v0] Attempting to create profile for user:", data.user.id);
          
          // Try upsert instead of insert - this may have better RLS handling
          const { error: profileError, data: profileData } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: email,
              name: formData.name,
              role: profileRole,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

          if (profileError) {
            console.error("[v0] Profile creation error:", profileError);
            console.log("[v0] Error details:", {
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint
            });
          } else {
            console.log("[v0] Profile created successfully:", profileData);
          }

          // For admin registration, show success message
          const message = authType === 'admin' 
            ? "Admin account created! Verification email sent. Check your inbox to activate."
            : "Account created! Verification email sent. Please check your inbox to activate your account.";
          
          setSuccess(message);
          setTimeout(() => {
            handleClose();
          }, 2000);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex h-screen overflow-hidden bg-white">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 left-6 z-50 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          aria-label="Close dialog"
        >
          <i className="fas fa-arrow-left text-lg"></i>
        </button>

        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-12">
          <div className="max-w-sm mx-auto w-full">
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-zap text-white"></i>
                </div>
                <span className="text-lg font-black text-gray-900">Electra</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tighter">
                {isLogin ? 'Get started' : 'Join us'}
              </h1>
              <p className="text-gray-500 text-sm">
                {isLogin ? 'absolutely free' : 'for free'}
              </p>
            </div>

            {/* Type Selector */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => { setAuthType('customer'); setError(null); setSuccess(null); }}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                  authType === 'customer'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-user mr-2"></i>Customer
              </button>
              <button
                onClick={() => { setAuthType('admin'); setError(null); setSuccess(null); }}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                  authType === 'admin'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-shield mr-2"></i>Admin
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-red-700 font-semibold text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <p className="text-green-700 font-semibold text-sm">{success}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {!isLogin && authType === 'admin' && (
                <div>
                  <label className="block text-sm font-bold text-red-600 mb-2">Master Key</label>
                  <input
                    required
                    type="text"
                    placeholder="Key Required"
                    value={formData.adminKey}
                    onChange={(e) => setFormData({ ...formData, adminKey: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 font-mono text-red-600"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing...
                  </>
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>
            </form>

            {/* Toggle */}
            <div className="text-center mt-8">
              <p className="text-gray-600 text-sm">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Decorative (Hidden on mobile) */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-900 items-center justify-center">
        <GeometricBackground />
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-12 max-w-sm">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
              <i className="fas fa-check text-4xl text-blue-600"></i>
            </div>
          </div>
          
          <h2 className="text-3xl font-black mb-4">Secure & Fast</h2>
          <p className="text-blue-100 mb-8 text-lg leading-relaxed">
            "Experience lightning-fast checkout and secure transactions with Electra. Your trust is our priority."
          </p>
          
          <div className="flex items-center justify-center gap-2 text-blue-100">
            <i className="fas fa-shield text-2xl"></i>
            <span className="font-bold">Enterprise Grade Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
