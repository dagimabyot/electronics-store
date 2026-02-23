import React from 'react';
import { Product, Category } from '../types';
import { CATEGORIES } from '../constants';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  addToCart: (p: Product) => void;
  selectedCategory: Category | 'All';
  onSelectCategory: (c: Category | 'All') => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  addToCart,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="animate-fadeIn pt-28 pb-20 space-y-12">

      {/* ===== PRODUCT CATALOG HEADER ===== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-gray-100 pb-8">

        {/* Title */}
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            Product Catalog
          </h2>
          <p className="text-gray-500 text-lg font-medium mt-2">
            Premium electronics curated for excellence
          </p>
        </div>

        {/* Category Buttons */}
        <div className="w-full md:w-auto overflow-hidden">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => onSelectCategory('All')}
              className={`px-7 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap
                ${
                  selectedCategory === 'All'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              All Products
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-7 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap
                  ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== PRODUCT GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
          />
        ))}
      </div>

    </section>
  );
};

export default ProductList;
