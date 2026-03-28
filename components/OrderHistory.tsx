
import React from 'react';
import { Order } from '../types';

interface OrderHistoryProps {
  orders: Order[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <h1 className="text-3xl font-black text-gray-900">Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-receipt text-3xl text-gray-200"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-400">Your purchase history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100">
                <div className="flex gap-8">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Order Placed</span>
                    <span className="text-sm font-semibold text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Total Amount</span>
                    <span className="text-sm font-black text-blue-600">${order.total.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Order ID</span>
                    <span className="text-sm font-semibold text-gray-700">#{order.id.split('-')[1]}</span>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  order.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {/* Fixed: Use images[0] instead of non-existent image property */}
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-gray-900 text-sm">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                   <div className="text-xs text-gray-400 flex items-center">
                    <i className="fas fa-truck mr-2"></i>
                    Shipping to: <span className="text-gray-700 ml-1 font-medium">{order.shippingAddress}</span>
                  </div>
                  <button className="text-blue-600 text-xs font-bold hover:underline">View Invoice</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
