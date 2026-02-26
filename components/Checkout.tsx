import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CartItem } from '../types';

interface CheckoutProps {
  cart: CartItem[];
  onCheckout?: (order: any) => void;
}

// ✅ Stripe TEST payment link (works)
const STRIPE_PAYMENT_LINK =
  'https://buy.stripe.com/test_dRm5kx3secSceRx01x6Zy00';

const Checkout = ({ cart }: CheckoutProps) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>(
    'stripe'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ✅ FIXED STRIPE REDIRECT (NO POPUP, NO BLOCKING)
  const handleStripeCheckout = () => {
    if (paymentMethod !== 'stripe') return;

    setIsProcessing(true);

    // Redirect safely
    setTimeout(() => {
      window.location.href = STRIPE_PAYMENT_LINK;
    }, 100);
  };

  // EMPTY CART
  if (!cart.length) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black text-gray-900 mb-4">
          Your cart is empty
        </h2>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h1 className="text-4xl font-black mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* PAYMENT METHOD */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h2 className="text-2xl font-black mb-6">Payment Method</h2>

            {/* STRIPE */}
            <div
              onClick={() => setPaymentMethod('stripe')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition ${
                paymentMethod === 'stripe'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'stripe'
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'stripe' && (
                    <i className="fas fa-check text-white text-xs"></i>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold">Stripe (Card)</p>
                  <p className="text-sm text-gray-500">
                    Secure payment via Stripe
                  </p>
                </div>
                <i className="fas fa-credit-card text-2xl text-blue-600"></i>
              </div>
            </div>

            {/* PAYPAL (DISABLED) */}
            <div className="mt-4 p-6 rounded-2xl border border-gray-200 opacity-50">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                <div className="flex-1">
                  <p className="font-bold">PayPal</p>
                  <p className="text-sm text-gray-500">Coming soon</p>
                </div>
                <i className="fab fa-paypal text-2xl text-gray-400"></i>
              </div>
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h2 className="text-2xl font-black mb-6">Order Items</h2>

            {cart.map(item => (
              <div
                key={item.id}
                className="flex gap-6 pb-6 mb-6 border-b last:border-0 last:mb-0"
              >
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.category}</p>
                  <div className="flex justify-between mt-2">
                    <span>Qty: {item.quantity}</span>
                    <span className="font-bold">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAY BUTTON */}
          <button
            onClick={handleStripeCheckout}
            disabled={isProcessing || paymentMethod !== 'stripe'}
            className={`w-full py-5 rounded-2xl font-black text-lg flex justify-center items-center gap-3 transition ${
              !isProcessing
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Redirecting...
              </>
            ) : (
              <>
                <i className="fas fa-lock"></i>
                Proceed to Stripe Payment
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-2">
            Secure checkout powered by Stripe
          </p>
        </div>

        {/* RIGHT - SUMMARY */}
        <div className="bg-blue-50 p-8 rounded-3xl border shadow-sm h-fit sticky top-8">
          <h3 className="text-2xl font-black mb-6">Order Summary</h3>

          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-bold">
                  ${(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold">${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600 font-bold">Free</span>
            </div>
            <div className="flex justify-between text-xl font-black">
              <span>Total</span>
              <span className="text-blue-600">
                ${total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;                </span>
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
