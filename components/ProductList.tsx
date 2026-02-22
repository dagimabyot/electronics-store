import React, { useRef } from 'react';
import { Product, Category } from '../types';
import { CATEGORIES } from '../constants';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  addToCart: (p: Product) => void;
  selectedCategory: Category | 'All';
  onSelectCategory: (c: Category | 'All') => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, addToCart, selectedCategory, onSelectCategory }) => {
  const catalogRef = useRef<HTMLDivElement>(null);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Modern Hero Section */}
      <section className="relative h-[500px] md:h-[600px] rounded-[40px] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=2000" 
          alt="Tech Hero Banner" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-20 max-w-4xl">
          <span className="text-blue-500 font-black tracking-widest uppercase mb-4 animate-slideDown">Premium Experience</span>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            Future of Technology <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">In Your Hands.</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
            Discover the most advanced smartphones, laptops, and premium audio gear curated from global industry leaders.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={scrollToCatalog}
              className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/20"
            >
              Shop Now
            </button>
            <button 
              onClick={scrollToCatalog}
              className="bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-black text-lg border border-white/20 hover:bg-white/20 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Catalog Header & Filters */}
      <div ref={catalogRef} className="pt-8 space-y-8">
        {/* FIX: Changed items-center to items-end for better visual baseline alignment */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Product Catalog</h2>
            <p className="text-gray-500 mt-2">Premium electronics curated for excellence</p>
          </div>
          
          {/* FIX: Added md:pb-1 to align button text with the header description baseline */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-1 w-full md:w-auto no-scrollbar shrink-0">
            <button
              onClick={() => onSelectCategory('All')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'All' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              All Products
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-search text-3xl text-gray-300"></i>
            </div>
            <h3 className="text-2xl font-black text-gray-700">No items found</h3>
            <p className="text-gray-400">Try adjusting your filters or search terms</p>
            <button 
              onClick={() => { onSelectCategory('All'); }} 
              className="mt-6 text-blue-600 font-black hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
            {products.map(product => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
