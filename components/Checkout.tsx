
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem, Order, OrderStatus } from '../types';

interface CheckoutProps {
  cart: CartItem[];
  onCheckout: (o: Omit<Order, 'id' | 'createdAt' | 'userId' | 'items' | 'total'>) => void;
}

const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/test_dRm5kx3secSceRx01x6Zy00';

const Checkout: React.FC<CheckoutProps> = ({ cart, onCheckout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: ''
  });
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      // Validate shipping details before proceeding
      if (!formData.name || !formData.address || !formData.city || !formData.zip) {
        alert('Please fill in all shipping details');
        return;
      }
      setStep(2);
      return;
    }
    
    // Step 2 - Process payment
    setProcessing(true);
    console.log("[v0] Redirecting to Stripe...", STRIPE_CHECKOUT_URL);
    
    // Use setTimeout to ensure UI updates before redirect
    setTimeout(() => {
      window.open(STRIPE_CHECKOUT_URL, '_blank');
      setProcessing(false);
      // Close modal after 1 second
      setTimeout(() => {
        window.history.back();
      }, 1000);
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (cart.length === 0) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Your bag is empty</h2>
      <button onClick={() => navigate('/')} className="text-blue-600 font-bold">Start Shopping</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center w-full max-w-xs">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`flex-grow h-1 mx-4 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 ? (
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Shipping Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Full Name</label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Street Address</label>
                    <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="123 Tech Lane" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">City</label>
                    <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Silicon Valley" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">ZIP Code</label>
                    <input required name="zip" value={formData.zip} onChange={handleInputChange} className="w-full bg-gray-50 border-none p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="90210" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Review Order</h2>
                <div className="p-6 border-2 border-green-600 rounded-2xl bg-green-50 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <i className="fas fa-lock text-2xl text-green-600"></i>
                    <span className="font-bold text-green-900">Secure Payment via Stripe</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Click "Complete Payment" to securely process your order through Stripe. You'll be redirected to our payment gateway.
                  </p>
                </div>
                <div className="space-y-4 p-4 bg-gray-50 rounded-2xl">
                  <h3 className="font-bold text-gray-900">Shipping Address:</h3>
                  <p className="text-gray-700 text-sm">
                    {formData.name}<br />
                    {formData.address}<br />
                    {formData.city}, {formData.zip}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="text-gray-400 hover:text-gray-600 font-medium text-sm flex items-center"
                >
                  <i className="fas fa-arrow-left mr-2"></i> Edit Shipping Details
                </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={processing}
              className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all ${
                processing ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-circle-notch fa-spin mr-3"></i> Redirecting to Stripe...
                </span>
              ) : step === 1 ? 'Continue to Review' : `Complete Payment $${total.toLocaleString()}`}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{item.name} <span className="text-gray-400 text-xs">x{item.quantity}</span></span>
                  <span className="font-bold text-gray-900">${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-black text-gray-900">Total</span>
                <span className="text-xl font-black text-blue-600">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
            <i className="fas fa-shield-alt text-green-600 text-xl"></i>
            <span className="text-xs text-green-800 font-medium">Your payment information is encrypted and secure with 256-bit SSL.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
