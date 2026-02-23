import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  products: Product[];
  addToCart: (p: Product) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products, addToCart }) => {
  // Filter featured products and limit to 4-6 items
  const featuredItems = products.filter(p => p.isFeatured).slice(0, 6);

  // Don't render if no featured products
  if (featuredItems.length === 0) return null;

  return (
    <section className="py-20 space-y-12 animate-fadeIn">
      {/* Section Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto px-4">
        <span className="inline-block text-blue-500 font-black tracking-[0.3em] uppercase text-sm">
          Curated Selection
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Featured <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">Products</span>
        </h2>
        <p className="text-gray-500 text-lg md:text-xl">
          Handpicked premium electronics that define innovation and performance
        </p>
      </div>

      {/* Featured Products Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${
        featuredItems.length <= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'
      } gap-8 md:gap-10`}>
        {featuredItems.map((product) => (
          <div key={product.id} className="group relative">
            {/* Featured Badge */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-yellow-400/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <span className="text-lg">⭐</span>
              <span className="font-black text-xs tracking-widest uppercase text-gray-900">Featured</span>
            </div>
            {/* Product Card */}
            <ProductCard product={product} addToCart={addToCart} />
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center pt-8">
        <p className="text-gray-600 text-sm mb-6">
          Explore {featuredItems.length} premium items selected just for you
        </p>
      </div>
    </section>
  );
};

export default FeaturedProducts;
