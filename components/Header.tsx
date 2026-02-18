
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  cartCount: number;
  onCartClick: () => void;
  onAuthClick: () => void;
  onLogout: () => void;
  onSearch: (q: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, cartCount, onCartClick, onAuthClick, onLogout, onSearch }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white transition-transform group-hover:rotate-12">
            <i className="fas fa-bolt text-xl"></i>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ELECTRA
          </span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search premium electronics..." 
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-full py-2 px-12 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline text-sm font-medium text-gray-700">{user.name}</span>
                <i className="fas fa-chevron-down text-xs text-gray-400"></i>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Profile</Link>
                <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">My Orders</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block px-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50">Admin Panel</Link>
                )}
                <hr className="my-2 border-gray-100" />
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition"
            >
              Sign In
            </button>
          )}

          <button 
            onClick={onCartClick}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
          >
            <i className="fas fa-shopping-cart text-gray-700 text-xl"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
