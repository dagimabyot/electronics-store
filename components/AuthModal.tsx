
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

  // Check if email is in admin whitelist (database validation)
  const checkAdminWhitelist = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_whitelist')
        .select('id')
        .ilike('email', email)
        .single();
      
      return !error && !!data;
    } catch (err) {
      console.log('[v0] Email not in admin whitelist');
      return false;
    }
  };

  // Get user role from database
  const getUserRole = async (userId: string): Promise<'admin' | 'customer'> => {
    try {
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('id', userId)
        .single();
      
      return adminData ? 'admin' : 'customer';
    } catch (err) {
      return 'customer';
    }
  };

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
      // The browser will redirect. Session handling and user record creation happens in App.tsx via onAuthStateChange
    } catch (err: any) {
      console.error('[v0] Google auth error:', err);
      setError(err.message || 'Google authentication failed.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = formData.email.trim().toLowerCase();

    try {
      if (isLogin) {
        // LOGIN FLOW
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: formData.password,
        });
        
        if (signInError) throw signInError;

        if (data.user) {
          // Get user role from database
          const role = await getUserRole(data.user.id);
          
          // If admin tab selected, verify user is actually an admin
          if (authType === 'admin' && role !== 'admin') {
            throw new Error("Access Denied: This account is not registered as an administrator.");
          }

          onUserLogin({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'User',
            role: role
          });
          onClose();
        }
      } else {
        // SIGNUP FLOW
        // For admin signup, verify email is in whitelist first
        if (authType === 'admin') {
          const isWhitelisted = await checkAdminWhitelist(email);
          if (!isWhitelisted) {
            throw new Error("Invalid Admin Registration Email. Authorization denied.");
          }
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password: formData.password,
          options: { 
            data: { 
              full_name: formData.name,
              provider: 'email'
            },
            emailRedirectTo: `${window.location.origin}${window.location.pathname}`
          }
        });
        
        if (signUpError) throw signUpError;

        if (data.user) {
          console.log('[v0] User signed up:', email);
          // User record will be automatically created by database trigger on auth.users insert
          
          if (authType === 'admin') {
            alert("Admin account created! Verification email sent. Check your inbox to activate.");
          } else {
            alert("Account created! Verification email sent. Please check your inbox to activate your account.");
          }
        }
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
      
      <div className={`relative bg-white rounded-[32px] w-full max-w-sm shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] animate-scaleIn border border-white/10 overflow-hidden`}>
        {/* Header Tabs */}
        <div className="flex bg-gray-100 p-1 m-5 rounded-[20px]">
          <button 
            onClick={() => { setAuthType('customer'); setError(null); }}
            className={`flex-1 py-3 rounded-[16px] text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${authType === 'customer' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-user-circle mr-1.5 text-xs"></i> Customer
          </button>
          <button 
            onClick={() => { setAuthType('admin'); setError(null); }}
            className={`flex-1 py-3 rounded-[16px] text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${authType === 'admin' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-shield-halved mr-1.5 text-xs"></i> Admin
          </button>
        </div>

        <div className="px-7 pb-8 pt-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">
              {isLogin ? (authType === 'admin' ? 'System Access' : 'Welcome Back') : (authType === 'admin' ? 'Admin Setup' : 'Create Account')}
            </h2>
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">
              {authType === 'admin' ? 'Management Portal' : 'Electra Electronics'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black border border-red-100 flex items-center gap-2 animate-shake">
              <i className="fas fa-exclamation-triangle flex-shrink-0"></i>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-3">Name</label>
                  <input required className="w-full bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder="Jane Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-3">Email</label>
                <input required type="email" className="w-full bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder="name@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-3">Password</label>
                <input required type="password" className="w-full bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              {!isLogin && authType === 'admin' && (
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-red-500 uppercase tracking-widest ml-3">Master Key</label>
                  <input required type="text" className="w-full bg-red-50 border-2 border-red-100 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-mono text-red-600 font-bold" placeholder="Key Required" value={formData.adminKey} onChange={e => setFormData({...formData, adminKey: e.target.value})} />
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 active:scale-95 ${authType === 'admin' ? 'bg-gray-900 text-white hover:bg-black' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : isLogin ? 'Authenticate' : 'Complete Setup'}
              </button>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`w-full py-3 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center gap-2 hover:border-blue-200 hover:bg-blue-50/30 transition-all group active:scale-95 disabled:opacity-50 mt-2`}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 group-hover:rotate-12 transition-transform" alt="Google" />
                <span className="text-[9px] font-black text-gray-700 tracking-tight">
                  {loading ? 'Opening Google...' : 'Google Sign-in'}
                </span>
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-[9px] font-black text-gray-400 hover:text-blue-600 transition uppercase tracking-widest">
              {isLogin ? "Need account? Register" : "Have account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
