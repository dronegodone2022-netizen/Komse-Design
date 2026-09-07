import React, { useEffect, useState } from 'react';
import { Product, CurrencyCode } from '../types';
import { CURRENCIES } from '../data/products';
import { Heart, Plus, Star, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface ShopViewProps {
  products: Product[];
  initialCategory?: string;
  currentCurrency: CurrencyCode;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickAdd: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onStartCustomOrder: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  initialCategory = 'All',
  currentCurrency,
  wishlistIds,
  onToggleWishlist,
  onQuickAdd,
  onProductClick,
  onStartCustomOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory === 'Overall' ? 'Overalls' : initialCategory,
  );
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const currency = CURRENCIES[currentCurrency] || CURRENCIES.EUR;

  useEffect(() => {
    setSelectedCategory(initialCategory === 'Overall' ? 'Overalls' : initialCategory);
  }, [initialCategory]);

  const categories = ['All', 'Jersey T-Shirts', 'Shirts', 'Sweaters', 'Jackets', 'Overalls', 'Caps', 'Accessories'];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured
  });

  const formatPrice = (priceInEur: number) => {
    const converted = priceInEur * currency.rate;
    if (currency.code === 'NLE') {
      return `${currency.symbol}${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <div className="py-12 bg-[#FAF9F6] text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Banner Header */}
        <div className="bg-[#121212] text-white p-8 sm:p-12 rounded-2xl border border-stone-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 z-10">
            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block">
              Official Store
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              {selectedCategory === 'All' ? 'ALL CULTURAL COLLECTIONS' : selectedCategory}
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-lg">
              Explore our custom Designs, heavyweight Jeans, Lightweight Jersey, and tailored jackets inspired by Sierra Leonean heritage.
            </p>
          </div>
        </div>

        {/* Filters and Category Pills Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end text-xs">
            <ArrowUpDown className="w-4 h-4 text-stone-500" />
            <span className="font-semibold text-stone-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-stone-300 rounded px-3 py-1.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#C5A059]"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedProducts.length === 0 ? (
            <div className="col-span-full flex min-h-64 items-center justify-center rounded-xl border border-stone-200 bg-[#F4F3EF] px-6 py-12 text-center">
              <p className="max-w-md text-sm font-semibold text-stone-600">
                Sorry, we are currently working on products for this category. Please check back soon.
              </p>
            </div>
          ) : sortedProducts.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);

            return (
              <div
                key={product.id}
                className="group bg-[#F4F3EF] rounded-xl overflow-hidden border border-stone-200/80 hover:border-stone-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between relative"
              >
                {/* Image Container */}
                <div
                  onClick={() => onProductClick(product)}
                  className="h-64 sm:h-72 w-full bg-[#EFECE6] relative overflow-hidden cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    {product.isNew && (
                      <span className="bg-emerald-700 text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded shadow-xs">
                        New
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="bg-stone-900/90 text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded shadow-xs backdrop-blur-xs">
                        Best Seller
                      </span>
                    )}
                    {!product.inStock && (
                      <span className="bg-amber-900/90 text-amber-200 text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded shadow-xs backdrop-blur-xs">
                        On Demand Only
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm transition-transform hover:scale-110 cursor-pointer ${
                      isWishlisted ? 'text-red-500' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-[#FCFBF9] flex-1 flex flex-col justify-between border-t border-stone-200/60">
                  <div>
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase block">
                      {product.category}
                    </span>
                    <h3
                      onClick={() => onProductClick(product)}
                      className="text-sm font-bold text-stone-900 hover:text-[#C5A059] cursor-pointer transition-colors line-clamp-1 mt-0.5"
                    >
                      {product.name}
                    </h3>
                    <div className="text-sm font-semibold text-stone-800 mt-1">
                      {product.inStock ? formatPrice(product.price) : 'Currently unavailable'}
                    </div>
                  </div>

                  {/* Rating Stars & Quick Add */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-[#C5A059]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(product.rating)
                                ? 'fill-current text-[#C5A059]'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-stone-500 font-medium">
                        ({product.reviewCount})
                      </span>
                    </div>

                    <button
                      onClick={() => onQuickAdd(product)}
                      className="w-8 h-8 rounded-full bg-stone-900 hover:bg-[#C5A059] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                      title="Quick Add to Cart"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
