import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';

interface CheckoutProps {
  cart: CartItem[];
}

// ✅ Stripe TEST payment link (already confirmed working)
const STRIPE_PAYMENT_LINK =
  'https://buy.stripe.com/test_dRm5kx3secSceRx01x6Zy00';

const Checkout = ({ cart }: CheckoutProps) => {
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ✅ BULLETPROOF STRIPE REDIRECT
  const handleStripeCheckout = () => {
    document.location.assign(STRIPE_PAYMENT_LINK);
  };

  // ✅ EMPTY CART UI
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
      <h1 className="text-4xl font-black mb-12 text-gray-900">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-8">
          {/* PAYMENT METHOD */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h2 className="text-2xl font-black mb-6 text-gray-900">
              Payment Method
            </h2>

            <div className="p-6 rounded-2xl border-2 border-blue-600 bg-blue-50">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <i className="fas fa-check text-white text-xs"></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    Stripe (Credit / Debit Card)
                  </p>
                  <p className="text-sm text-gray-500">
                    Secure payment powered by Stripe
                  </p>
                </div>
                <i className="fas fa-credit-card text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h2 className="text-2xl font-black mb-6 text-gray-900">
              Order Items
            </h2>

            <div className="space-y-6">
              {cart.map(item => (
                <div
                  key={item.id}
                  className="flex gap-6 pb-6 border-b last:border-0"
                >
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.category}
                    </p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-bold">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STRIPE BUTTON */}
          <button
            onClick={handleStripeCheckout}
            className="w-full py-5 rounded-2xl font-black text-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 transition shadow-lg flex items-center justify-center gap-3"
          >
            <i className="fas fa-lock"></i>
            Proceed to Stripe Payment
          </button>

          <p className="text-center text-sm text-gray-500">
            Secure checkout • SSL encrypted • Stripe verified
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-blue-50 p-8 rounded-3xl border shadow-sm h-fit sticky top-8">
          <h3 className="text-2xl font-black mb-6 text-gray-900">
            Order Summary
          </h3>

          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div
                key={item.id}
                className="flex justify-between text-sm"
              >
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
              <span className="font-bold">
                ${total.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600 font-bold">
                Free
              </span>
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

export default Checkout;
