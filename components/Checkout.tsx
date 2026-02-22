import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';

interface CheckoutProps {
  cart: CartItem[];
}

const STRIPE_PAYMENT_LINK =
  'https://buy.stripe.com/test_dRm5kx3secSceRx01x6Zy00';

const Checkout: React.FC<CheckoutProps> = ({ cart }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
  });

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, address, city, zip } = formData;
    if (!name || !email || !address || !city || !zip) {
      alert('Please fill in all shipping details');
      return;
    }

    setStep(2);
  };

  const handleStripeRedirect = () => {
    // Store order before redirect
    localStorage.setItem(
      'pendingOrder',
      JSON.stringify({
        cart,
        shipping: formData,
        total,
        createdAt: new Date().toISOString(),
      })
    );

    // Redirect to Stripe
    window.location.href = STRIPE_PAYMENT_LINK;
  };

  if (cart.length === 0) {
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
    <div className="max-w-5xl mx-auto animate-fadeIn">
      {/* Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center w-full max-w-xs">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            1
          </div>
          <div
            className={`flex-grow h-1 mx-4 rounded ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          ></div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 2
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            2
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT */}
        <div className="lg:col-span-2">
          <form onSubmit={handleContinue} className="space-y-8">
            {step === 1 ? (
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-2xl font-black text-gray-900">
                  Shipping Details
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 p-4 rounded-xl"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 p-4 rounded-xl"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      Address
                    </label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 p-4 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      City
                    </label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 p-4 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      ZIP
                    </label>
                    <input
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 p-4 rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-6">
                  Secure Payment
                </h2>

                <div className="p-6 bg-green-50 border-2 border-green-600 rounded-2xl">
                  <p className="text-sm text-green-800 mb-6 font-medium">
                    You’ll be redirected to Stripe’s secure checkout
                    page to complete your payment.
                  </p>

                  <button
                    type="button"
                    onClick={handleStripeRedirect}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition"
                  >
                    Pay ${total.toLocaleString()}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-4 text-sm text-gray-500"
                >
                  ← Edit Shipping
                </button>
              </div>
            )}

            {step === 1 && (
              <button
                type="submit"
                className="w-full py-5 rounded-2xl font-black text-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Continue to Payment
              </button>
            )}
          </form>
        </div>

        {/* RIGHT */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black mb-6">
            Order Summary
          </h3>

          {cart.map(item => (
            <div
              key={item.id}
              className="flex justify-between text-sm mb-2"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-bold">
                ${(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}

          <div className="border-t pt-4 mt-4 flex justify-between font-black">
            <span>Total</span>
            <span className="text-blue-600">
              ${total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
