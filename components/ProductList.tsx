
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
              className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/20 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Shop Now
            </button>
            <button 
              onClick={scrollToCatalog}
              className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Explore Deals
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Featured Products</h2>
            <p className="text-gray-500">Handpicked bestsellers you'll love</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
      </section>

      {/* Explore Deals Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Explore Deals</h2>
            <p className="text-gray-500">Limited time offers and discounts</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.slice(4, 8).map(product => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
      </section>

      {/* Catalog Header & Filters */}
      <div ref={catalogRef} className="pt-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Product Catalog</h2>
              <p className="text-gray-500">Premium electronics curated for excellence</p>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            <button
              onClick={() => onSelectCategory('All')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === 'All' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
              All Products
            </button>
            {CATEGORIES.map(cat => {
              const categoryIcons: Record<string, JSX.Element> = {
                'Smartphones': (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                'Laptops': (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17H7a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2v-2a2 2 0 00-2-2h-2m-4-4l2-4m0 0l2 4m-2-4v4" />
                  </svg>
                ),
                'Audio': (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                ),
                'Accessories': (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                )
              };

              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  {categoryIcons[cat]}
                  {cat}
                </button>
              );
            })}
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
