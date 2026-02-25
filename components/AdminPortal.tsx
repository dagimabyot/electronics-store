'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import AdminDashboard from './AdminDashboard';
import { AdminLoginModal } from './AdminLoginModal';
import { AdminSignupModal } from './AdminSignupModal';
import { AdminSettings } from './AdminSettings';
import { Product, Order } from '@/types';

export function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setAdminUser(session.user);
        setIsAuthenticated(true);
        setShowLoginModal(false);
        await loadData();
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const loadData = async () => {
    try {
      // Load products
      const { data: productsData } = await supabase.from('products').select('*');
      if (productsData) setProducts(productsData);

      // Load orders
      const { data: ordersData } = await supabase.from('orders').select('*');
      if (ordersData) setOrders(ordersData);
    } catch (err) {
      console.error('[v0] Error loading data:', err);
    }
  };

  const handleLoginSuccess = (user: any) => {
    setAdminUser(user);
    setIsAuthenticated(true);
    setShowLoginModal(false);
    loadData();
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setAdminUser(null);
    setIsAuthenticated(false);
    setShowLoginModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-40" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Electra Admin</h1>
              <p className="text-xs text-gray-500">Secure Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{adminUser?.email}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
              title="Settings"
            >
              ⚙️
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AdminDashboard
          products={products}
          setProducts={setProducts}
          orders={orders}
          setOrders={setOrders}
          onRefreshProducts={loadData}
        />
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <AdminSettings
          adminEmail={adminUser?.email}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Signup Modal */}
      <AdminSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignupSuccess={() => {
          setShowSignupModal(false);
          loadData();
        }}
      />
    </div>
  );
}
