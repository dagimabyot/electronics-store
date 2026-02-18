
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

  if (!product) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">Product not found</h2>
      <Link to="/" className="text-blue-600">Return Home</Link>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-8 flex items-center text-gray-500 hover:text-blue-600 transition"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        Back to Results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        {/* Media Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img 
              src={product.images[activeImageIndex]} 
              alt={`${product.name} angle ${activeImageIndex + 1}`} 
              className="w-full h-full object-cover transition-all duration-700"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-blue-600 scale-95 shadow-lg shadow-blue-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600 font-bold tracking-widest text-[10px] uppercase px-2 py-0.5 bg-blue-50 rounded-md">
                {product.category}
              </span>
              <span className="text-gray-400 font-bold tracking-widest text-[10px] uppercase">
                {product.brand}
              </span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              {product.description}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Market Specs</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">{key}</span>
                  <span className="text-sm font-semibold text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-gray-400 block text-xs font-bold uppercase mb-1">MSRP</span>
              <span className="text-4xl font-black text-gray-900">${product.price.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className={`px-10 py-5 rounded-2xl font-bold text-lg shadow-xl transition-all ${
                product.stock === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 active:scale-95 shadow-blue-200'
              }`}
            >
              <i className="fas fa-shopping-bag mr-3"></i>
              {product.stock === 0 ? 'Not Available' : 'Purchase Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
