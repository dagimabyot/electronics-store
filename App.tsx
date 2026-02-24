import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Product, CartItem, User, Order, Category } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { supabase } from './services/supabase';

import Header from './components/Header';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import CartSidebar from './components/CartSidebar';
import Checkout from './components/Checkout';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import OrderHistory from './components/OrderHistory';
import UserProfile from './components/UserProfile';

/* ---------------- ADMIN ROUTE ---------------- */

const AdminRoute: React.FC<{ children: React.ReactNode; user: User | null }> = ({ children, user }) => {
  if (!user) return null;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

/* ---------------- APP CONTENT ---------------- */

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('electra_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  /* -------- HANDLE AUTH SESSION + PROFILE -------- */

  const handleUserSession = async (supabaseUser: any) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    // If profile does NOT exist (OAuth first login) → create it
    if (!profile) {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || 'User',
          role: 'customer',
        })
        .select()
        .single();

      if (!newProfile) return;
      
      setUser({
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        role: newProfile.role,
      });
      return;
    }

    // Normal case
    setUser({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    });
  };

  /* ---------------- PRODUCTS ---------------- */

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('name');
    if (data && data.length > 0) setProducts(data);
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      handleUserSession(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchProducts();

    if (user) {
      const query =
        user.role === 'admin'
          ? supabase.from('orders').select('*')
          : supabase.from('orders').select('*').eq('userId', user.id);

      query.order('createdAt', { ascending: false }).then(({ data }) => {
        if (data) setOrders(data);
      });
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('electra_cart', JSON.stringify(cart));
  }, [cart]);

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  /* ---------------- FILTER ---------------- */

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const match =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return match && (selectedCategory === 'All' || p.category === selectedCategory);
    });
  }, [products, searchQuery, selectedCategory]);

  /* ---------------- RENDER ---------------- */

  return (
    <div className={`min-h-screen flex flex-col ${isAdminPath ? 'bg-gray-50' : 'bg-white'}`}>
      {!isAdminPath && (
        <Header
          user={user}
          cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
          onCartClick={() => setIsCartOpen(true)}
          onAuthClick={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          onSearch={setSearchQuery}
        />
      )}

      <main className={`flex-grow ${isAdminPath ? '' : 'container mx-auto px-4 py-8'}`}>
        <Routes>
          <Route path="/" element={
            user?.role === 'admin'
              ? <Navigate to="/admin" />
              : <ProductList
                  products={filteredProducts}
                  addToCart={(p) => {
                    setCart(prev => {
                      const ex = prev.find(i => i.id === p.id);
                      return ex
                        ? prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
                        : [...prev, { ...p, quantity: 1 }];
                    });
                    setIsCartOpen(true);
                  }}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
          } />

          <Route path="/product/:id" element={
            user?.role === 'admin'
              ? <Navigate to="/" />
              : <ProductDetail products={products} addToCart={(p) => {
                  setCart(prev => {
                    const ex = prev.find(i => i.id === p.id);
                    return ex
                      ? prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
                      : [...prev, { ...p, quantity: 1 }];
                  });
                  setIsCartOpen(true);
                }} />
          } />

          <Route path="/orders" element={user ? <OrderHistory orders={orders} /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <UserProfile user={user} onUpdateUser={setUser} /> : <Navigate to="/" />} />

          <Route path="/admin/*" element={
            <AdminRoute user={user}>
              <AdminDashboard
                products={products}
                setProducts={setProducts}
                orders={orders}
                setOrders={setOrders}
                onRefreshProducts={fetchProducts}
              />
            </AdminRoute>
          } />
        </Routes>
      </main>

      {!isAdminPath && <Footer />}

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={(id, q) =>
          setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, q) } : i))
        }
        onRemove={(id) => setCart(prev => prev.filter(i => i.id !== id))}
        onCheckout={() => setIsCartOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onUserLogin={(u) => {
          setUser(u);
          if (u.role === 'admin') navigate('/admin');
        }}
      />
    </div>
  );
};

/* ---------------- APP WRAPPER ---------------- */

const App: React.FC = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
