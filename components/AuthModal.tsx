
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
    <div className="fixed inset-0 z-[100] flex h-screen overflow-hidden bg-f3f4f6">
      {/* LEFT Side - Background Image Panel */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          backgroundImage: `url('${getBackgroundImage()}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-12 max-w-md">
          <div className="mb-8 flex justify-center">
            <div className={`w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl ${
              authType === 'admin' 
                ? 'bg-emerald-400' 
                : 'bg-cyan-400'
            }`}>
              <i className={`text-5xl ${
                authType === 'admin' 
                  ? 'fas fa-lock text-slate-900' 
                  : 'fas fa-bolt text-blue-600'
              }`}></i>
            </div>
          </div>
          
          <h2 className="text-4xl font-black mb-4 tracking-tight">
            {backgroundLabel.title}
          </h2>
          <p className="text-slate-100 mb-8 text-lg leading-relaxed font-medium">
            {authType === 'admin' 
              ? '"Bank-level encryption, advanced monitoring, and complete control over your platform."'
              : '"Lightning-fast checkout, zero fraud, enterprise-grade security at every step."'
            }
          </p>
          
          <div className="flex flex-col gap-4 pt-6 border-t border-white/20">
            <div className="flex items-center justify-center gap-3">
              <i className={`text-2xl ${authType === 'admin' ? 'fas fa-shield-alt text-emerald-400' : 'fas fa-zap text-cyan-400'}`}></i>
              <span className="font-bold">{authType === 'admin' ? 'Secure Systems' : 'Ultra-Fast'}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <i className={`text-2xl ${authType === 'admin' ? 'fas fa-chart-line text-emerald-400' : 'fas fa-check-circle text-cyan-400'}`}></i>
              <span className="font-bold">{authType === 'admin' ? 'Real-Time Analytics' : 'Instant Processing'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT Side - Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto bg-white">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          aria-label="Close dialog"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="flex-1 flex flex-col justify-center px-8 lg:px-12 py-12">
          <div className="max-w-sm mx-auto w-full">
            {/* Branding */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fas fa-bolt text-white text-lg"></i>
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Electra</span>
              </div>
              
              <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter text-balance">
                {isLogin ? 'Welcome back' : 'Get started'}
              </h1>
              <p className="text-slate-500 text-base font-medium">
                {isLogin 
                  ? 'Sign in to access your account' 
                  : 'Join thousands of trusted users'
                }
              </p>
            </div>

            {/* Type Selector - Distinct Styling */}
            <div className="grid grid-cols-2 gap-3 mb-10 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => { setAuthType('customer'); setError(null); setSuccess(null); }}
                className={`py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${
                  authType === 'customer'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fas fa-user mr-2"></i>
                <span>Customer</span>
              </button>
              <button
                onClick={() => { setAuthType('admin'); setError(null); setSuccess(null); }}
                className={`py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${
                  authType === 'admin'
                    ? 'bg-slate-900 text-white shadow-lg shadow-emerald-500/30 scale-105 border-2 border-emerald-500/50'
                    : 'bg-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fas fa-shield mr-2"></i>
                <span>Admin</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl animate-shake">
                <p className="text-red-700 font-semibold text-sm flex items-center gap-2">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl animate-pulse">
                <p className="text-emerald-700 font-semibold text-sm flex items-center gap-2">
                  <i className="fas fa-check-circle"></i>
                  {success}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-slate-300 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-slate-300 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-slate-300 transition-colors"
                />
              </div>

              {!isLogin && authType === 'admin' && (
                <div>
                  <label className="block text-sm font-bold text-emerald-600 mb-2.5">Master Key</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter admin key"
                    value={formData.adminKey}
                    onChange={(e) => setFormData({ ...formData, adminKey: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-emerald-700 shadow-sm bg-emerald-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Required for admin registration</p>
                </div>
              )}

              {/* Primary Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-60 mt-8 ${
                  authType === 'admin'
                    ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 active:scale-95'
                }`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing...
                  </>
                ) : isLogin ? (
                  <>
                    <span>Sign In</span>
                    <i className="fas fa-arrow-right"></i>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all hover:border-blue-300 flex items-center justify-center gap-2 shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>
            </form>

            {/* Toggle */}
            <div className="text-center mt-8 pt-6 border-t border-slate-200">
              <p className="text-slate-600 text-sm">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
