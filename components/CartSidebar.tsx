
import React from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, q: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, cart, onUpdateQuantity, onRemove, onCheckout }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-[60] shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900">Your Bag</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-shopping-bag text-4xl text-gray-200"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your bag is empty</h3>
              <p className="text-gray-500 mb-8">Start adding items to your cart to see them here.</p>
              <button onClick={onClose} className="text-blue-600 font-bold hover:underline">Explore Products</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                  {/* Fixed: Use images[0] instead of non-existent image property */}
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                    <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 transition">
                      <i className="fas fa-trash-alt text-sm"></i>
                    </button>
                  </div>
                  <span className="text-sm text-gray-400 block mb-3">{item.category}</span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 bg-gray-100 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-blue-600"
                      >
                        <i className="fas fa-minus text-xs"></i>
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-blue-600"
                      >
                        <i className="fas fa-plus text-xs"></i>
                      </button>
                    </div>
                    <span className="font-black text-gray-900">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-xl font-black text-gray-900">Total</span>
                <span className="text-2xl font-black text-blue-600">${total.toLocaleString()}</span>
              </div>
            </div>
            
            <Link 
              to="/checkout" 
              onClick={onCheckout}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100 transition active:scale-95"
            >
              Proceed to Checkout
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
