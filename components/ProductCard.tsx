import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  addToCart: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img 
          src={product.img} 
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=400';
          }}
        />
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded font-bold text-sm">
            -{discountPercent}%
          </div>
        )}

        {/* Quick Add Button */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
                product.stock === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 transform hover:scale-105'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        )}

        {/* Stock Badge */}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute bottom-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
            Only {product.stock} left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Brand */}
        <p className="text-xs text-gray-500 font-semibold uppercase mb-1 truncate">
          {product.brand}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 min-h-10">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-xs ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-600">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-black text-red-600">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1 mt-auto">
          <div 
            className="bg-red-500 h-1 rounded-full transition-all"
            style={{ width: `${Math.max(10, (product.stock / 100) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
