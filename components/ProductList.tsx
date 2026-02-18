import React, { useRef, useState, useEffect } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 32 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'All' || p.cat === selectedCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const flashDealProducts = products.slice(0, 10);
  const categoryData = [
    { name: 'Smartphones', icon: '📱', count: products.filter(p => p.cat === 'Smartphones').length },
    { name: 'Laptops', icon: '💻', count: products.filter(p => p.cat === 'Laptops').length },
    { name: 'Headphones', icon: '🎧', count: products.filter(p => p.cat === 'Headphones').length },
    { name: 'Accessories', icon: '🎒', count: products.filter(p => p.cat === 'Accessories').length },
    { name: 'Cameras', icon: '📷', count: products.filter(p => p.cat === 'Cameras').length },
    { name: 'Smart TVs', icon: '📺', count: products.filter(p => p.cat === 'Smart TVs').length },
    { name: 'Gaming', icon: '🎮', count: products.filter(p => p.cat === 'Gaming').length },
    { name: 'Smart Home', icon: '🏠', count: products.filter(p => p.cat === 'Smart Home').length },
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button className="bg-red-500 text-white px-8 py-2 rounded-lg font-bold hover:bg-red-600">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Flash Deals Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <h2 className="text-3xl font-black">Flash Deals</h2>
              <p className="text-red-100">Limited time offers ending soon</p>
            </div>
          </div>
          <div className="flex gap-2 text-center">
            <div className="bg-white bg-opacity-20 rounded px-3 py-2">
              <div className="text-2xl font-black">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs uppercase">Hours</div>
            </div>
            <div className="text-2xl font-black">:</div>
            <div className="bg-white bg-opacity-20 rounded px-3 py-2">
              <div className="text-2xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs uppercase">Min</div>
            </div>
            <div className="text-2xl font-black">:</div>
            <div className="bg-white bg-opacity-20 rounded px-3 py-2">
              <div className="text-2xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs uppercase">Sec</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {flashDealProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => addToCart(product)}>
              <div className="relative">
                <img src={product.img} alt={product.name} className="w-full h-32 object-cover" />
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  -{Math.round(((product.price - product.originalPrice) / product.originalPrice) * 100)}%
                </div>
              </div>
              <div className="p-3">
                <p className="text-gray-900 font-bold text-sm line-clamp-2">{product.name}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-red-600 font-black text-lg">${product.price}</span>
                  <span className="text-gray-400 line-through text-xs">${product.originalPrice}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-yellow-500">★</span>
                  <span className="text-gray-700 text-xs">{product.rating} ({product.reviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Grid */}
      <section className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {categoryData.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => onSelectCategory(cat.name as Category)}
            className={`p-3 rounded-lg text-center hover:shadow-md transition-all ${
              selectedCategory === cat.name
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-2xl mb-1">{cat.icon}</div>
            <p className="text-xs font-bold line-clamp-1">{cat.name}</p>
            <p className="text-xs text-gray-500">{cat.count}</p>
          </button>
        ))}
      </section>

      {/* Main Catalog */}
      <div ref={catalogRef} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h2>
          <select className="border border-gray-300 rounded-lg px-4 py-2 font-bold">
            <option>Newest</option>
            <option>Best Selling</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Top Rated</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-lg">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <h3 className="text-2xl font-black text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button 
              onClick={() => { onSelectCategory('All'); setSearchTerm(''); }}
              className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
