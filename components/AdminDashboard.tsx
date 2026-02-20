
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
  const [tab, setTab] = useState<'products' | 'orders' | 'liveStore' | 'analytics' | 'system'>('products'); // Default to products
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);



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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-400 font-medium">Manage products, orders, and store analytics</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-[20px] overflow-x-auto no-scrollbar gap-2">
          <button onClick={() => setTab('products')} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${tab === 'products' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><i className="fas fa-boxes mr-2"></i>Products</button>
          <button onClick={() => setTab('orders')} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${tab === 'orders' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><i className="fas fa-receipt mr-2"></i>Orders</button>
          <button onClick={() => setTab('liveStore')} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${tab === 'liveStore' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><i className="fas fa-eye mr-2"></i>Live Store</button>
          <button onClick={() => setTab('analytics')} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${tab === 'analytics' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><i className="fas fa-chart-bar mr-2"></i>Analytics</button>
        </div>
      </div>

      {tab === 'liveStore' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><i className="fas fa-eye text-blue-600"></i>Live Store View</h2>
            <p className="text-gray-500 mb-6">Products currently being viewed by customers</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition group cursor-pointer">
                  <div className="w-full h-40 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 mb-4 relative">
                    <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition" alt={p.name} />
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-black">
                      <i className="fas fa-eye mr-1"></i>View
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 text-sm">{p.name}</h4>
                  <p className="text-[11px] text-gray-500 mb-3">{p.brand}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-black">${p.price.toLocaleString()}</span>
                    <span className="text-[10px] font-black text-gray-400">Stock: {p.stock}</span>
                  </div>
                </div>
              ))}
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
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Total Revenue</p>
                <p className="text-3xl font-black text-blue-900">${orders.reduce((s, o) => s + o.total, 0).toFixed(0)}</p>
                <p className="text-[10px] text-blue-600 mt-2">{orders.length} orders</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Total Orders</p>
                <p className="text-3xl font-black text-green-900">{orders.length}</p>
                <p className="text-[10px] text-green-600 mt-2">This month</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Products Listed</p>
                <p className="text-3xl font-black text-purple-900">{products.length}</p>
                <p className="text-[10px] text-purple-600 mt-2">Active SKUs</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Avg Order Value</p>
                <p className="text-3xl font-black text-orange-900">${orders.length > 0 ? (orders.reduce((s, o) => s + o.total, 0) / orders.length).toFixed(0) : '0'}</p>
                <p className="text-[10px] text-orange-600 mt-2">per transaction</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="font-black text-gray-900 mb-4">Orders by Status</h3>
                <div className="space-y-3">
                  {['pending', 'shipped', 'delivered', 'cancelled'].map(status => {
                    const count = orders.filter(o => o.status === status).length;
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-gray-700 capitalize">{status}</span>
                          <span className="text-sm font-black text-blue-600">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              status === 'delivered' ? 'bg-green-500' :
                              status === 'shipped' ? 'bg-blue-500' :
                              status === 'pending' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="font-black text-gray-900 mb-4">Top Products</h3>
                <div className="space-y-3">
                  {products.slice(0, 5).map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xs">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-500">${p.price.toLocaleString()}</p>
                      </div>
                      <span className="text-blue-600 font-black text-sm">★</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-black text-gray-900 mb-4">Sales Trend</h3>
              <div className="flex items-end justify-between h-32 gap-2">
                {[12, 19, 15, 22, 18, 25, 30].map((value, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-400" style={{ height: `${(value / 30) * 100}%` }}></div>
                    <span className="text-[9px] font-bold text-gray-500">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-4 text-center">Last 7 days sales performance</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
