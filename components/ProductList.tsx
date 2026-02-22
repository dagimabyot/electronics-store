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
    <div className="space-y-16 animate-fadeIn pb-20">
      {/* Modern Hero Section */}
      <section className="relative h-[500px] md:h-[700px] rounded-[40px] overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=2000" 
          alt="Tech Hero Banner" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
        />
        <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-20 max-w-5xl">
          <span className="inline-block text-blue-400 font-black tracking-[0.3em] uppercase mb-6 animate-slideDown text-sm">
            Next-Gen Tech
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
            The Future <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              is Now.
            </span>
          </h1>
          <p className="text-gray-300 text-lg md:text-2xl mb-12 max-w-2xl leading-relaxed font-medium">
            Experience the pinnacle of innovation with our curated selection of high-performance electronics.
          </p>
          <div className="flex flex-wrap gap-5">
            <button 
              onClick={scrollToCatalog}
              className="bg-blue-600 text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(37,99,235,0.3)]"
            >
              Explore Catalog
            </button>
            <button 
              onClick={scrollToCatalog}
              className="bg-white/10 backdrop-blur-xl text-white px-12 py-6 rounded-2xl font-black text-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Our Story
            </button>
          </div>
        </div>
      </section>

      {/* Catalog Header & Filters */}
      <div ref={catalogRef} className="pt-12 space-y-10">
        
        {/* THE FIX: This container handles the line-by-line alignment */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8 border-b border-gray-100">
          
          {/* Left Side: Title and Subtitle */}
          <div className="flex flex-col space-y-1">
            <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">
              Product <br /> Catalog
            </h2>
            <p className="text-gray-500 text-lg font-medium max-w-[200px] leading-snug">
              Premium electronics curated for excellence
            </p>
          </div>
          
          {/* Right Side: Category Buttons */}
          <div className="w-full md:w-auto">
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar shrink-0">
              <button
                onClick={() => onSelectCategory('All')}
                className={`px-7 py-3.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === 'All' 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                All Products
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-7 py-3.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-32 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <i className="fas fa-search text-4xl text-gray-200"></i>
            </div>
            <h3 className="text-3xl font-black text-gray-800 mb-2">No matching items</h3>
            <p className="text-gray-500 text-lg">Try a different category or search term</p>
            <button 
              onClick={() => { onSelectCategory('All'); }} 
              className="mt-8 px-8 py-3 bg-white text-blue-600 border border-blue-100 rounded-xl font-black hover:bg-blue-50 transition-all shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
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
