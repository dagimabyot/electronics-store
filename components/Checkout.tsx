import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CartItem } from '../types';

interface CheckoutProps {
  cart: CartItem[];
  onCheckout?: (order: any) => void;
}

const STRIPE_PAYMENT_LINK =
  'https://buy.stripe.com/test_dRm5kx3secSceRx01x6Zy00';

const Checkout = ({ cart, onCheckout }: CheckoutProps) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'card'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleStripeCheckout = () => {
    setIsProcessing(true);
    console.log("[v0] Redirecting to Stripe payment gateway...");
    // Open Stripe payment link in new tab or redirect
    window.open(STRIPE_PAYMENT_LINK, '_blank') || (window.location.href = STRIPE_PAYMENT_LINK);
  };

  if (!cart.length) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-shopping-cart text-4xl text-blue-200"></i>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add items to get started with your purchase</p>
        <button
          onClick={() => navigate('/')}
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-4xl font-black text-gray-900 mb-12">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT - Payment Method */}
        <div className="lg:col-span-2 space-y-8">
          {/* Payment Method Selection */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black mb-8 text-gray-900">
              Payment Method
            </h2>

            <div className="space-y-4">
              {/* Stripe Option */}
              <div
                onClick={() => setPaymentMethod('stripe')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'stripe'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'stripe'
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'stripe' && (
                      <i className="fas fa-check text-white text-xs"></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Stripe Credit/Debit Card</h3>
                    <p className="text-sm text-gray-500">Secure payment with Stripe</p>
                  </div>
                  <i className="fas fa-credit-card text-2xl text-blue-600"></i>
                </div>
              </div>

              {/* PayPal Option */}
              <div
                onClick={() => setPaymentMethod('paypal')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all opacity-50 cursor-not-allowed ${
                  paymentMethod === 'paypal'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">PayPal</h3>
                    <p className="text-sm text-gray-500">Coming soon</p>
                  </div>
                  <i className="fab fa-paypal text-2xl text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black mb-6 text-gray-900">
              Order Items
            </h2>

            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">{item.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      <span className="font-bold text-gray-900">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleStripeCheckout}
            disabled={isProcessing || paymentMethod !== 'stripe'}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${
              paymentMethod === 'stripe' && !isProcessing
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-lock"></i>
                Proceed to Stripe Payment
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            <i className="fas fa-shield-alt text-green-600 mr-2"></i>
            Your payment is secure and encrypted with Stripe
          </p>
        </div>

        {/* RIGHT - Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-3xl border border-blue-100 shadow-sm">
            <h3 className="text-2xl font-black mb-8 text-gray-900">
              Order Summary
            </h3>

            <div className="space-y-4 mb-8 pb-8 border-b border-blue-200">
              {cart.map(item => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      x{item.quantity} @ ${item.price.toLocaleString()}
                    </p>
                  </div>
                  <span className="font-black text-gray-900">
                    ${(
                      item.price * item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-gray-900">
                  ${total.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Shipping</span>
                <span className="text-green-600 font-bold">
                  Free
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Tax</span>
                <span className="font-bold text-gray-900">
                  Calculated at checkout
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-blue-200">
                <span className="text-lg font-black text-gray-900">
                  Total
                </span>
                <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-white/80 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <i className="fas fa-check-circle text-green-600 text-lg mt-1 flex-shrink-0"></i>
                <div className="text-sm">
                  <p className="font-bold text-gray-900 mb-1">Secure Checkout</p>
                  <p className="text-gray-600">All transactions are encrypted and secure</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-blue-200">
              <div className="text-center">
                <i className="fas fa-lock text-blue-600 text-xl mb-1"></i>
                <p className="text-xs font-bold text-gray-600">SSL Secure</p>
              </div>
              <div className="text-center">
                <i className="fas fa-shield-alt text-blue-600 text-xl mb-1"></i>
                <p className="text-xs font-bold text-gray-600">Safe & Secure</p>
              </div>
              <div className="text-center">
                <i className="fab fa-stripe text-blue-600 text-xl mb-1"></i>
                <p className="text-xs font-bold text-gray-600">Stripe Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
