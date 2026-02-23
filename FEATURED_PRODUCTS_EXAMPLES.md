# Featured Products - Code Examples & Usage

## Example 1: Using FeaturedProducts Component

### Basic Import and Usage (Already Configured)
```typescript
// In ProductList.tsx - THIS IS ALREADY DONE

import React from 'react';
import { Product, Category } from '../types';
import FeaturedProducts from './FeaturedProducts';  // ← Added
import ProductCard from './ProductCard';

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  addToCart, 
  selectedCategory, 
  onSelectCategory 
}) => {
  return (
    <div className="space-y-16">
      {/* Category Filters - Now above hero */}
      <div className="pt-8 space-y-6">
        {/* ... filter buttons ... */}
      </div>

      {/* Hero Slider */}
      <section>{/* ... hero content ... */}</section>

      {/* Featured Products - New Section */}
      <FeaturedProducts products={products} addToCart={addToCart} />

      {/* Catalog */}
      <div>{/* ... product grid ... */}</div>
    </div>
  );
};

export default ProductList;
```

---

## Example 2: Creating Featured Products in constants.tsx

### Before (Regular Product)
```typescript
const dataset = [
  // Smartphones
  { 
    cat: Category.SMARTPHONES, 
    brand: "Apple", 
    name: "iPhone 15 Pro Max Titanium", 
    price: 1199, 
    images: ["..."] 
  },
  // Laptops
  { 
    cat: Category.LAPTOPS, 
    brand: "Dell", 
    name: "XPS 15 9530 i9 32GB 1TB", 
    price: 2199, 
    images: ["..."] 
  }
];
```

### After (With Featured Flag)
```typescript
const dataset = [
  // Smartphones
  { 
    cat: Category.SMARTPHONES, 
    brand: "Apple", 
    name: "iPhone 15 Pro Max Titanium", 
    price: 1199, 
    images: ["..."],
    isFeatured: true  // ← Now featured!
  },
  // Laptops
  { 
    cat: Category.LAPTOPS, 
    brand: "Dell", 
    name: "XPS 15 9530 i9 32GB 1TB", 
    price: 2199, 
    images: ["..."],
    isFeatured: true  // ← This one too!
  }
];
```

---

## Example 3: FeaturedProducts Component Details

### Component Structure
```typescript
import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  products: Product[];        // All products from parent
  addToCart: (p: Product) => void;  // Add to cart handler
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  products, 
  addToCart 
}) => {
  // 1. Filter products marked as featured, limit to 6 max
  const featuredItems = products.filter(p => p.isFeatured).slice(0, 6);

  // 2. If no featured products, render nothing
  if (featuredItems.length === 0) return null;

  // 3. Render featured section
  return (
    <section className="py-20 space-y-12 animate-fadeIn">
      {/* Header with gradient */}
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

      {/* Responsive Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${
        featuredItems.length <= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'
      } gap-8 md:gap-10`}>
        {featuredItems.map((product) => (
          <div key={product.id} className="group relative">
            {/* Star Badge */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-yellow-400/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <span className="text-lg">⭐</span>
              <span className="font-black text-xs tracking-widest uppercase text-gray-900">Featured</span>
            </div>
            {/* Reuse ProductCard */}
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
```

---

## Example 4: Filtering Logic Explained

### How Featured Products are Filtered

```typescript
// Step 1: Get all products from parent
const allProducts = [
  { id: "1", name: "iPhone", isFeatured: true },
  { id: "2", name: "Android", isFeatured: false },
  { id: "3", name: "MacBook", isFeatured: true },
  { id: "4", name: "Dell", isFeatured: false },
  { id: "5", name: "iPad", isFeatured: true },
]

// Step 2: Filter only featured
const featured = allProducts.filter(p => p.isFeatured)
// Result: [iPhone, MacBook, iPad]

// Step 3: Limit to 6 max
const limitedFeatured = featured.slice(0, 6)
// Result: [iPhone, MacBook, iPad]

// Step 4: Check if empty
if (limitedFeatured.length === 0) return null;
// If no featured products, don't render anything
```

---

## Example 5: Responsive Grid Behavior

### Grid Column Logic
```typescript
// If 3 or fewer featured products:
lg:grid-cols-3  // 3 columns on large screens

// If 4-6 featured products:
lg:grid-cols-3 xl:grid-cols-4  // 3 on large, 4 on XL

// All screen sizes:
grid-cols-1     // Mobile: 1 column
sm:grid-cols-2  // Tablet: 2 columns
```

### Responsive Breakpoints
```
Mobile (< 640px)     → 1 column  (full width)
Tablet (640-1024px)  → 2 columns (side by side)
Desktop (1024-1280px)→ 3 columns (standard grid)
Large (> 1280px)     → 4 columns (max width grid)
```

---

## Example 6: Customizing Featured Badge

### Option A: Keep Current Star Badge
```typescript
<div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-yellow-400/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
  <span className="text-lg">⭐</span>
  <span className="font-black text-xs tracking-widest uppercase text-gray-900">Featured</span>
</div>
```

### Option B: Use Icon Instead
```typescript
import { Star } from 'lucide-react';  // Or your icon library

<div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-yellow-400/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
  <Star size={16} className="fill-gray-900" />
  <span className="font-black text-xs tracking-widest uppercase text-gray-900">Featured</span>
</div>
```

### Option C: Minimal Badge
```typescript
<div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-black">
  FEATURED
</div>
```

---

## Example 7: Product Type Usage

### Type Definition (types.ts)
```typescript
export interface Product {
  id: string;
  brand: string;
  name: string;
  price: number;
  images: string[];
  category: Category;
  stock: number;
  description: string;
  specs: Record<string, string>;
  isFeatured?: boolean;  // ← NEW optional field
}
```

### Using in Components
```typescript
// Check if product is featured
if (product.isFeatured) {
  // Show special badge or styling
}

// Filter featured products
const featured = products.filter(p => p.isFeatured);

// Mark as featured (when creating/editing)
const newProduct: Product = {
  id: "123",
  name: "Premium Laptop",
  // ... other fields
  isFeatured: true  // Mark as featured
};
```

---

## Example 8: Complete ProductList Integration

### Full ProductList.tsx Structure
```typescript
import React, { useRef } from 'react';
import { Product, Category } from '../types';
import { CATEGORIES } from '../constants';
import ProductCard from './ProductCard';
import FeaturedProducts from './FeaturedProducts';  // ← Import added

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
  onSelectCategory 
}) => {
  const catalogRef = useRef<HTMLDivElement>(null);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 animate-fadeIn pb-20">
      
      {/* 1. CATEGORY FILTERS (Moved above) */}
      <div className="pt-8 space-y-6">
        <div className="space-y-3">
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider">
            Browse by Category
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            <button onClick={() => onSelectCategory('All')}>All Products</button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => onSelectCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative h-[500px] md:h-[700px] rounded-[40px] overflow-hidden">
        {/* Hero content */}
      </section>

      {/* 3. FEATURED PRODUCTS (New) */}
      <FeaturedProducts products={products} addToCart={addToCart} />

      {/* 4. CATALOG HEADER */}
      <div ref={catalogRef} className="pt-12 space-y-10">
        <div className="pb-8 border-b border-gray-100">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Product Catalog
          </h2>
          <p className="text-gray-500 text-lg font-medium">
            Premium electronics curated for excellence
          </p>
        </div>

        {/* 5. PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {products.map(product => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
```

---

## Example 9: Adding Featured Products Programmatically

### Function to Mark Products as Featured
```typescript
// Utility function to update featured status
function updateFeaturedStatus(
  products: Product[], 
  productIds: string[], 
  featured: boolean
): Product[] {
  return products.map(product => 
    productIds.includes(product.id) 
      ? { ...product, isFeatured: featured }
      : product
  );
}

// Usage:
const updatedProducts = updateFeaturedStatus(
  allProducts,
  ["id-123", "id-456", "id-789"],  // Product IDs to feature
  true  // Set as featured
);
```

---

## Example 10: Testing the Component

### Manual Testing Checklist
```typescript
// Test 1: Component renders with featured products
<FeaturedProducts products={productsWithFeatured} addToCart={mockAddToCart} />
// Expected: Section with 4-6 featured items + badges

// Test 2: Component hides when no featured products
<FeaturedProducts products={productsWithoutFeatured} addToCart={mockAddToCart} />
// Expected: null (nothing rendered)

// Test 3: Add to cart works
userEvent.click(addToCartButton);
// Expected: Product added to cart, cart opens

// Test 4: Responsive grid adapts
// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 3-4 columns

// Test 5: Badge displays correctly
// Expected: Star emoji + "FEATURED" text, visible on top-left
```

---

## Integration Summary

✅ **Component Created:** `FeaturedProducts.tsx`
✅ **Type Updated:** `Product` interface with `isFeatured` field
✅ **Products Marked:** 5 premium products across categories
✅ **Layout Fixed:** Categories moved above hero slider
✅ **Section Added:** Featured products between hero and catalog
✅ **Cart Works:** Full integration with existing cart
✅ **Responsive:** Works on all screen sizes
✅ **Styling:** Matches existing design system

**Status:** Ready to deploy! 🚀

