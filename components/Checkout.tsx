import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';

interface CheckoutProps {
  cart: CartItem[];
}

const STRIPE_PAYMENT_LINK =
  'https://buy.stripe.com/test_dRm5kx3secSceRx01x6Zy00';

const Checkout = ({ cart }: CheckoutProps) => {
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!cart.length) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">
          Your cart is empty
        </h2>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 font-bold"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black mb-6">
              Complete Your Order
            </h2>

            <button
              onClick={() =>
                (window.location.href =
                  STRIPE_PAYMENT_LINK)
              }
              className="w-full py-5 rounded-2xl font-black text-xl bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              Continue to Payment
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black mb-6">
            Order Summary
          </h3>

          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div
                key={item.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600">
                  {item.name}{' '}
                  <span className="text-gray-400 text-xs">
                    x{item.quantity}
                  </span>
                </span>
                <span className="font-bold text-gray-900">
                  $
                  {(
                    item.price * item.quantity
                  ).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>
                ${total.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span className="text-green-600">
                Free
              </span>
            </div>

            <div className="flex justify-between items-center pt-4">
              <span className="text-lg font-black text-gray-900">
                Total
              </span>
              <span className="text-xl font-black text-blue-600">
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
