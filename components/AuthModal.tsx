
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

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Use Supabase's callback URL for proper OAuth handling
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      // Note: The browser will redirect. The session handling is done in App.tsx.
    } catch (err: any) {
      console.error("Auth error:", err);
      setError('Google sign-in unavailable. Please ensure the callback URL is added to your Google OAuth app settings: ' + `${window.location.origin}/auth/callback`);
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
        alert("Verification email sent! Please check your inbox to activate your account.");
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-2xl" onClick={onClose} />
      
      <div className={`relative bg-white rounded-[32px] w-full max-w-sm shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] animate-scaleIn border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto`}>
        {/* Header Tabs */}
        <div className="flex bg-gray-100 p-1 m-4 rounded-[20px]">
          <button 
            onClick={() => { setAuthType('customer'); setError(null); }}
            className={`flex-1 py-2.5 rounded-[16px] text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${authType === 'customer' ? 'bg-white shadow-lg text-blue-600 scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-user-circle mr-1 text-xs"></i> Customer
          </button>
          <button 
            onClick={() => { setAuthType('admin'); setError(null); }}
            className={`flex-1 py-2.5 rounded-[16px] text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${authType === 'admin' ? 'bg-gray-900 text-white shadow-lg scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-shield-halved mr-1 text-xs"></i> Admin
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="text-center mb-5">
            <h2 className="text-xl font-black text-gray-900 tracking-tighter mb-1">
              {isLogin ? (authType === 'admin' ? 'System Access' : 'Welcome Back') : (authType === 'admin' ? 'Admin Registration' : 'Create Account')}
            </h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              {authType === 'admin' ? 'Secure Encrypted Management Portal' : 'Premium Electronics at your fingertips'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-black border border-red-100 flex items-center gap-3 animate-shake">
              <i className="fas fa-exclamation-triangle"></i>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full py-3 bg-white border-2 border-gray-100 rounded-[16px] flex items-center justify-center gap-2 hover:border-blue-200 hover:bg-blue-50/30 transition-all group active:scale-95 disabled:opacity-50`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-xs font-bold text-gray-700 tracking-tight">
                {loading ? 'Connecting...' : 'Google Sign In'}
              </span>
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[9px] uppercase font-black text-gray-300 bg-white px-4 tracking-[0.3em]">or security credentials</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Legal Name</label>
                  <input required className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder="Jane Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Workspace</label>
                <input required type="email" className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder="name@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Password</label>
                <input required type="password" className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              {!isLogin && authType === 'admin' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-4">System Master Key</label>
                  <input required type="text" className="w-full bg-red-50 border-2 border-red-100 p-4 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-mono text-red-600 font-bold" placeholder="Key Required" value={formData.adminKey} onChange={e => setFormData({...formData, adminKey: e.target.value})} />
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95 ${authType === 'admin' ? 'bg-gray-900 text-white hover:bg-black shadow-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}`}
              >
                {loading ? <i className="fas fa-circle-notch fa-spin text-lg"></i> : isLogin ? 'Authenticate' : 'Complete Setup'}
              </button>
            </form>
          </div>

          <div className="text-center mt-10">
            <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-[10px] font-black text-gray-400 hover:text-blue-600 transition uppercase tracking-widest">
              {isLogin ? "Need a new identity? Register" : "Already registered? Authenticate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
