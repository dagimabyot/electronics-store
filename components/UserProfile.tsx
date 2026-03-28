
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface UserProfileProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: formData.name })
        .eq('id', user.id);
      
      if (error) throw error;

      onUpdateUser({ ...user, name: formData.name });
      setMsg('Profile successfully updated.');
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">Identity & Security</h1>
      
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden group">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-40 relative">
          <div className="absolute -bottom-14 left-10">
            <div className="w-28 h-28 rounded-[32px] bg-white p-1.5 shadow-2xl transition-transform group-hover:scale-105 duration-500">
               <div className="w-full h-full bg-blue-50 text-blue-600 flex items-center justify-center text-5xl font-black rounded-[24px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-20 p-10">
          {msg && (
            <div className={`mb-8 p-5 rounded-2xl text-sm font-bold animate-slideDown flex items-center gap-3 ${msg.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              <i className={`fas ${msg.includes('Error') ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i> 
              {msg}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block ml-4 tracking-widest">Public Name</label>
                <input 
                  className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block ml-4 tracking-widest">Email (Identity)</label>
                <input 
                  disabled
                  className="w-full bg-gray-100 border border-gray-100 p-5 rounded-2xl cursor-not-allowed opacity-60 font-medium" 
                  value={formData.email}
                />
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4 tracking-tight">Privilege Level</h3>
              <div className="flex items-center space-x-4 p-5 bg-gray-900 rounded-3xl border border-gray-800 shadow-xl shadow-gray-200">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${user.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  <i className={`fas ${user.role === 'admin' ? 'fa-shield-halved' : 'fa-user'}`}></i>
                </div>
                <div>
                  <span className="block font-black text-white capitalize text-sm">{user.role} Status</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                    {user.role === 'admin' ? 'Full Authority' : 'Verified Customer'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading && <i className="fas fa-circle-notch fa-spin"></i>}
              Commit Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
