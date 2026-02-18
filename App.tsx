
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

const AdminRoute: React.FC<{ children: React.ReactNode; user: User | null }> = ({ children, user }) => {
  if (user === null) return null; 
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

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

  const handleUserSession = async (supabaseUser: any) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      const authenticatedUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email?.toLowerCase() || '',
        name: profile?.name || supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'Electra User',
        role: profile?.role || 'customer'
      };

      setUser(authenticatedUser);
    } catch (e) {
      console.error("Session profile fetch failed:", e);
      // Fallback to metadata if profile fails
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email?.toLowerCase() || '',
        name: supabaseUser.user_metadata?.name || 'Electra User',
        role: 'customer'
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const { data: dbProducts, error } = await supabase.from('products').select('*').order('name');
      if (!error && dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error_description')) {
      const params = new URLSearchParams(hash.substring(1));
      const errorMsg = params.get('error_description');
      if (errorMsg) {
        alert(`Authentication Error: ${errorMsg.replace(/\+/g, ' ')}`);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchProducts();
    if (user) {
      const query = user.role === 'admin' 
        ? supabase.from('orders').select('*') 
        : supabase.from('orders').select('*').eq('userId', user.id);
      
      query.order('createdAt', { ascending: false }).then(({ data: dbOrders }) => {
        if (dbOrders) setOrders(dbOrders);
      });
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('electra_cart', JSON.stringify(cart));
  }, [cart]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const match = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return match && (selectedCategory === 'All' || p.category === selectedCategory);
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isAdminPath ? 'bg-gray-50' : 'bg-white'}`}>
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
            <ProductList 
              products={filteredProducts} 
              addToCart={(p) => { 
                setCart(prev => { 
                  const ex = prev.find(i => i.id === p.id); 
                  return ex ? prev.map(i => i.id === p.id ? {...i, quantity: i.quantity + 1} : i) : [...prev, {...p, quantity: 1}];
                }); 
                setIsCartOpen(true); 
              }} 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />
          } />
          <Route path="/product/:id" element={<ProductDetail products={products} addToCart={(p) => {
             setCart(prev => { 
                  const ex = prev.find(i => i.id === p.id); 
                  return ex ? prev.map(i => i.id === p.id ? {...i, quantity: i.quantity + 1} : i) : [...prev, {...p, quantity: 1}];
                }); 
                setIsCartOpen(true); 
          }} />} />
          <Route path="/orders" element={user ? <OrderHistory orders={orders} /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <UserProfile user={user} onUpdateUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/checkout" element={user ? <Checkout cart={cart} onCheckout={async (o) => {
              const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
              const newOrder: Order = { ...o, id: `ORD-${Date.now()}`, userId: user.id, items: [...cart], total, createdAt: new Date().toISOString() };
              setOrders(prev => [newOrder, ...prev]);
              setCart([]);
              await supabase.from('orders').insert([newOrder]);
          }} /> : <Navigate to="/" />} />

          <Route path="/admin/*" element={
            <AdminRoute user={user}>
              <div className="flex h-screen overflow-hidden bg-white">
                <aside className="w-80 bg-gray-950 text-white flex flex-col shadow-2xl relative z-20">
                  <div className="p-10 flex items-center gap-4 border-b border-white/5">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <i className="fas fa-microchip text-xl"></i>
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase">Electra <span className="text-blue-500 block text-[9px] tracking-[0.3em]">OS v2.5</span></span>
                  </div>
                  <nav className="flex-grow p-8 space-y-3">
                    <Link to="/admin" className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-blue-400 border border-white/5">
                      <i className="fas fa-chart-line"></i> Dashboard
                    </Link>
                    <Link to="/" className="flex items-center gap-4 p-4 text-gray-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
                      <i className="fas fa-store"></i> Live Store
                    </Link>
                  </nav>
                  <div className="p-8 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 bg-red-500/10 text-red-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                      <i className="fas fa-power-off"></i> Terminate Session
                    </button>
                  </div>
                </aside>
                <div className="flex-1 overflow-y-auto bg-gray-50/50 p-12">
                  <AdminDashboard products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} onRefreshProducts={fetchProducts} />
                </div>
              </div>
            </AdminRoute>
          } />
        </Routes>
      </main>

      {!isAdminPath && <Footer />}

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        onUpdateQuantity={(id, q) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, q)} : i))} 
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

const App: React.FC = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
