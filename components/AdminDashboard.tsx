
import React, { useState, useEffect } from 'react';
import { Product, Order, OrderStatus, Category } from '../types';
import { CATEGORIES, INITIAL_PRODUCTS } from '../constants';
import { supabase } from '../services/supabase';

interface AdminDashboardProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onRefreshProducts: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, setProducts, orders, setOrders, onRefreshProducts }) => {
  const [tab, setTab] = useState<'products' | 'orders' | 'system' | 'users' | 'analytics'>('products'); // Default to products
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; count: number | null }>({ connected: false, count: null });
  const [permissionError, setPermissionError] = useState<boolean>(false);

  const checkConnection = async () => {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        setDbStatus({ connected: true, count: count });
        setPermissionError(false);
      } else {
        setDbStatus({ connected: false, count: null });
        // Fixed: PostgrestError type does not include 'status', using type casting for runtime check
        if (error.code === '42501' || (error as any).status === 403) setPermissionError(true);
      }
    } catch (e) {
      setDbStatus({ connected: false, count: null });
    }
  };

  useEffect(() => {
    checkConnection();
  }, [products]);

  const forceSyncAll = async () => {
    if (!window.confirm('This will attempt to inject all 100 products. If it fails, you MUST disable RLS in your Supabase Dashboard. Ready?')) return;
    
    setIsSyncing(true);
    setSyncProgress(0);
    setPermissionError(false);

    try {
      // Chunk size of 10 for maximum reliability
      const chunkSize = 10;
      const total = INITIAL_PRODUCTS.length;
      
      for (let i = 0; i < total; i += chunkSize) {
        const chunk = INITIAL_PRODUCTS.slice(i, i + chunkSize);
        // Use upsert to handle existing IDs
        const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
        
        if (error) {
          console.error("Chunk Error:", error);
          // Fixed: PostgrestError type does not include 'status', using type casting for runtime check
          if ((error as any).status === 403 || error.code === '42501') {
            setPermissionError(true);
            throw new Error("PERMISSION BLOCKED: You must go to your Supabase Dashboard and 'Disable RLS' on the products table.");
          }
          throw error;
        }
        
        setSyncProgress(Math.min(Math.round(((i + chunkSize) / total) * 100), 100));
      }
      
      alert('SUCCESS: 100 products are now live in the cloud!');
      await onRefreshProducts();
      await checkConnection();
    } catch (err: any) {
      alert(`SYNC STOPPED: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Delete this item?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert(error.message);
      else await onRefreshProducts();
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const productData = { ...editingProduct, id: editingProduct.id || `PROD-${Date.now()}` } as Product;
    const { error } = await supabase.from('products').upsert(productData);
    if (error) alert(error.message);
    else { await onRefreshProducts(); setEditingProduct(null); }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Status</h1>
          <p className="text-gray-400 font-medium">Supabase Project: <code className="text-blue-600">cncejkyoadvejmlehgsj</code></p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-[20px] overflow-x-auto no-scrollbar gap-2">
          <button onClick={() => setTab('products')} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${tab === 'products' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><i className="fas fa-boxes mr-2"></i>Products</button>
          <button onClick={() => setTab('orders')} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${tab === 'orders' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><i className="fas fa-receipt mr-2"></i>Orders</button>
          <button onClick={() => setTab('analytics')} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${tab === 'analytics' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><i className="fas fa-chart-bar mr-2"></i>Analytics</button>
          <button onClick={() => setTab('system')} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${tab === 'system' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><i className="fas fa-cog mr-2"></i>System</button>
        </div>
      </div>

      {tab === 'system' && (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-[32px] border-2 border-red-300 shadow-lg">
            <h2 className="text-xl font-black text-red-900 mb-4 flex items-center gap-3">
              <i className="fas fa-key text-red-600 text-2xl"></i>System Master Key
            </h2>
            <div className="bg-white p-6 rounded-2xl border-2 border-red-200 mb-4">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Your Admin Access Code</p>
              <div className="flex items-center gap-4">
                <code className="text-2xl font-black text-red-600 tracking-widest font-mono">Dagim123$</code>
                <button 
                  onClick={() => navigator.clipboard.writeText('Dagim123$')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition"
                >
                  Copy
                </button>
              </div>
            </div>
            <p className="text-[12px] text-red-800 font-medium">
              <i className="fas fa-shield-alt mr-2"></i>Keep this key secure. Required for new admin registrations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-xl font-black flex items-center gap-3"><i className="fas fa-microchip text-blue-500"></i>Connection Health</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-gray-50 rounded-3xl">
                <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">DB Status</span>
                <span className={`text-xs font-black uppercase ${dbStatus.connected ? 'text-green-600' : 'text-red-500'}`}>
                  {dbStatus.connected ? 'Online' : 'Restricted'}
                </span>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl">
                <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Live Count</span>
                <span className="text-xl font-black text-blue-600">{dbStatus.count ?? '0'}</span>
              </div>
            </div>

            <div className={`p-8 rounded-[32px] border-2 ${permissionError ? 'border-red-500 bg-red-50' : 'border-blue-100 bg-blue-50'}`}>
              <h4 className={`text-sm font-black uppercase mb-4 ${permissionError ? 'text-red-600' : 'text-blue-600'}`}>
                <i className="fas fa-shield-alt mr-2"></i> 
                {permissionError ? 'Security Blocked (Action Required)' : 'Troubleshooting Guide'}
              </h4>
              <ul className="space-y-3 text-xs font-medium text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 border">1</span>
                  <span>Go to <strong>Supabase.com</strong> and open your project.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 border">2</span>
                  <span>Click <strong>Table Editor</strong> &gt; Select <strong>'products'</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 border">3</span>
                  <span className={permissionError ? "text-red-600 font-bold" : ""}>
                    Click <strong>"RLS Enabled"</strong> (top right) and set to <strong>"Disable RLS"</strong>.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-blue-600 text-white rounded-[32px] flex items-center justify-center text-4xl mb-6 shadow-2xl shadow-blue-200">
              {isSyncing ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-cloud-upload-alt"></i>}
            </div>
            <h3 className="text-2xl font-black mb-2">Nuclear Reset</h3>
            <p className="text-gray-400 text-sm mb-8 max-w-xs">
              This forces the full 100-item catalog into your cloud database.
            </p>
            
            {isSyncing && (
              <div className="w-full max-w-xs bg-gray-100 h-3 rounded-full overflow-hidden mb-6">
                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${syncProgress}%` }}></div>
              </div>
            )}

            <button 
              onClick={forceSyncAll}
              disabled={isSyncing}
              className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-blue-600 transition shadow-xl disabled:opacity-50"
            >
              {isSyncing ? `Injecting (${syncProgress}%)` : 'Sync 100 Products Now'}
            </button>
          </div>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><i className="fas fa-cube text-blue-600"></i>Product Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition">
                  <div className="w-full h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 mb-4">
                    <img src={p.images[0]} className="w-full h-full object-cover" alt={p.name} />
                  </div>
                  <h4 className="font-bold text-gray-900 line-clamp-2 mb-2">{p.name}</h4>
                  <p className="text-[11px] text-gray-500 mb-3">{p.brand} • Stock: {p.stock}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-black text-lg">${p.price.toLocaleString()}</span>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-600 text-[9px] font-black uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-lg">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><i className="fas fa-shopping-bag text-blue-600"></i>Order Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-4 px-4 font-black text-gray-600">Order ID</th>
                    <th className="text-left py-4 px-4 font-black text-gray-600">Customer</th>
                    <th className="text-left py-4 px-4 font-black text-gray-600">Total</th>
                    <th className="text-left py-4 px-4 font-black text-gray-600">Status</th>
                    <th className="text-left py-4 px-4 font-black text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-4 px-4 font-mono text-blue-600 font-bold text-xs">{order.id}</td>
                      <td className="py-4 px-4 font-medium">{order.email}</td>
                      <td className="py-4 px-4 font-bold text-gray-900">${order.total.toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1.5 rounded-lg font-black text-[9px] ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <i className="fas fa-inbox text-4xl mb-4 block opacity-50"></i>
                  <p className="font-bold">No orders yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><i className="fas fa-chart-line text-blue-600"></i>Store Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Total Sales</p>
                <p className="text-3xl font-black text-blue-900">${orders.reduce((s, o) => s + o.total, 0).toFixed(0)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Orders</p>
                <p className="text-3xl font-black text-green-900">{orders.length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Products</p>
                <p className="text-3xl font-black text-purple-900">{products.length}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Avg Order Value</p>
                <p className="text-3xl font-black text-orange-900">${orders.length > 0 ? (orders.reduce((s, o) => s + o.total, 0) / orders.length).toFixed(0) : '0'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="font-black text-gray-900 mb-4">Best Selling Products</h3>
              <div className="space-y-3">
                {products.slice(0, 5).map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-900">{p.name}</span>
                    <span className="text-blue-600 font-bold">${p.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
