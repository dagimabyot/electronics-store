
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  addToCart: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'; // Fallback tech image
          }}
        />
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm border border-blue-50">
            {product.category}
          </span>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{product.brand}</span>
        <Link to={`/product/${product.id}`} className="block mb-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-2xl font-black text-gray-900">
            ${product.price.toLocaleString()}
          </span>
          <button 
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${
              product.stock === 0 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-900 text-white hover:bg-blue-600 hover:scale-110 active:scale-95'
            }`}
          >
            <i className={`fas ${product.stock === 0 ? 'fa-times' : 'fa-plus'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
