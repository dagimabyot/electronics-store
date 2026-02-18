
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
          // Explicitly defining the redirect helps Supabase route back to your app correctly
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
      // Note: The browser will redirect. The session handling is done in App.tsx.
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
      
      <div className={`relative bg-white rounded-[40px] w-full max-w-lg shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] animate-scaleIn border border-white/10 overflow-hidden`}>
        {/* Header Tabs */}
        <div className="flex bg-gray-100 p-1.5 m-8 rounded-[24px]">
          <button 
            onClick={() => { setAuthType('customer'); setError(null); }}
            className={`flex-1 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${authType === 'customer' ? 'bg-white shadow-xl text-blue-600 scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-user-circle mr-2 text-sm"></i> Customer
          </button>
          <button 
            onClick={() => { setAuthType('admin'); setError(null); }}
            className={`flex-1 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${authType === 'admin' ? 'bg-gray-900 text-white shadow-xl scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-shield-halved mr-2 text-sm"></i> Admin Terminal
          </button>
        </div>

        <div className="px-10 pb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">
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
              className={`w-full py-4 bg-white border-2 border-gray-100 rounded-[20px] flex items-center justify-center gap-3 hover:border-blue-200 hover:bg-blue-50/30 transition-all group active:scale-95 disabled:opacity-50`}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 group-hover:rotate-12 transition-transform" alt="Google" />
              <span className="text-xs font-black text-gray-700 tracking-tight">
                {loading ? 'Opening Google...' : 'Continue with Google (Gmail)'}
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
