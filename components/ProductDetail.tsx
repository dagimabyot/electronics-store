
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface ProductDetailProps {
  products: Product[];
  addToCart: (p: Product) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ products, addToCart }) => {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">Product not found</h2>
      <Link to="/" className="text-blue-600">Return Home</Link>
    </div>
  );

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    alert(`${quantity} item(s) added to cart!`);
    setQuantity(1);
  };

  return (
    <div className="animate-fadeIn space-y-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-500 hover:text-blue-600 transition font-semibold"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        Back to Results
      </button>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        {/* Media Gallery - AliExpress Style */}
        <div className="lg:col-span-1 space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 sticky top-8">
            <img 
              src={product.images[activeImageIndex]} 
              alt={`${product.name} angle ${activeImageIndex + 1}`} 
              className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-blue-400 ${
                  activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 opacity-70 hover:opacity-100'
                }`}
                title={`Image ${idx + 1}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info & Purchase - AliExpress Style */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-blue-600 font-bold tracking-widest text-[10px] uppercase px-3 py-1 bg-blue-50 rounded-full">
                {product.category}
              </span>
              <span className="text-gray-500 font-bold tracking-widest text-[10px] uppercase">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 ml-auto">
                <i className="fas fa-star text-yellow-400"></i>
                <span className="text-sm font-bold text-gray-700">4.8 (2.3k Reviews)</span>
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h1>
            <p className="text-gray-600 leading-relaxed text-base">
              {product.description}
            </p>
          </div>

          {/* Price & Stock */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-5xl font-black text-red-600">${product.price.toLocaleString()}</span>
              <span className="text-xl text-gray-500 line-through">${Math.round(product.price * 1.3).toLocaleString()}</span>
              <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">-23% OFF</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <i className={`fas fa-circle ${product.stock > 10 ? 'text-green-500' : product.stock > 0 ? 'text-orange-500' : 'text-red-500'}`}></i>
              <span className={product.stock > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
              {product.stock <= 5 && product.stock > 0 && (
                <span className="text-xs text-red-600 font-bold animate-pulse">Only {product.stock} left!</span>
              )}
            </div>
          </div>

          {/* Specs Grid */}
          <div className="mb-8">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Key Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block mb-2">{key}</span>
                  <span className="text-sm font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Section */}
          <div className="mt-auto pt-8 border-t border-gray-200 space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition font-bold"
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center font-bold border-0 outline-none"
                  min="1"
                  max={product.stock}
                />
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition font-bold"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                  product.stock === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl active:scale-95'
                }`}
              >
                <i className="fas fa-shopping-cart"></i>
                {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
              </button>
              
              <button 
                className="px-6 py-4 rounded-xl font-bold text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <i className="fas fa-heart"></i>
                Wishlist
              </button>
            </div>

            {/* Shipping Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <i className="fas fa-truck"></i>
                Free shipping on orders over $100
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <i className="fas fa-shield-alt"></i>
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Tabs */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-200">
          {/* Features */}
          <div className="p-8">
            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-3">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
              Key Features
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <i className="fas fa-check text-green-600 font-bold mt-1"></i>
                <span>Premium build quality and materials</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-check text-green-600 font-bold mt-1"></i>
                <span>Industry-leading performance specs</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-check text-green-600 font-bold mt-1"></i>
                <span>Comprehensive 2-year warranty</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-check text-green-600 font-bold mt-1"></i>
                <span>Brand new, factory sealed</span>
              </li>
            </ul>
          </div>

          {/* Shipping */}
          <div className="p-8">
            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-3">
              <i className="fas fa-box text-blue-600 text-xl"></i>
              Shipping Info
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-600 min-w-fit">Ships:</span>
                <span>Within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-600 min-w-fit">Delivery:</span>
                <span>3-7 business days</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-600 min-w-fit">Tracking:</span>
                <span>Real-time package tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-600 min-w-fit">Returns:</span>
                <span>30-day return window</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="p-8">
            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-3">
              <i className="fas fa-headset text-purple-600 text-xl"></i>
              Customer Support
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <i className="fas fa-check text-green-600 font-bold mt-1"></i>
                <span>24/7 customer support</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-check text-green-600 font-bold mt-1"></i>
                <span>Expert product guidance</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-check text-green-600 font-bold mt-1"></i>
                <span>Technical support included</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-check text-green-600 font-bold mt-1"></i>
                <span>Live chat assistance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
