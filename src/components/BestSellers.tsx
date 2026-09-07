import React from 'react';
import { Product, CurrencyCode } from '../types';
import { CURRENCIES } from '../data/products';
import { Heart, Plus, Star, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface BestSellersProps {
  products: Product[];
  currentCurrency: CurrencyCode;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickAdd: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onViewAllProducts: () => void;
}

export const BestSellers: React.FC<BestSellersProps> = ({
  products,
  currentCurrency,
  wishlistIds,
  onToggleWishlist,
  onQuickAdd,
  onProductClick,
  onViewAllProducts,
}) => {
  const currency = CURRENCIES[currentCurrency] || CURRENCIES.EUR;

  const formatPrice = (priceInEur: number) => {
    const converted = priceInEur * currency.rate;
    if (currency.code === 'NLE') {
      return `${currency.symbol}${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-16 bg-[#FAF9F6] text-stone-900 border-b border-stone-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            BEST <span className="text-[#C5A059]">SELLERS</span>
          </h2>

          <button
            onClick={onViewAllProducts}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-widest uppercase text-stone-800 hover:text-[#C5A059] border border-stone-300 hover:border-[#C5A059] px-4 py-2 rounded-xs transition-colors cursor-pointer"
          >
            <span>VIEW ALL PRODUCTS</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Cards Grid (4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => {
            const isWishlisted = wishlistIds.includes(product.id);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
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

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm transition-transform hover:scale-110 cursor-pointer ${
                      isWishlisted ? 'text-red-500' : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Add to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    {product.isNew && (
                      <span className="bg-emerald-700 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-sm shadow-xs">
                        New
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="bg-[#121212] text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-sm shadow-xs">
                        Best Seller
                      </span>
                    )}
                    {!product.inStock && (
                      <span className="bg-amber-900/90 text-amber-200 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-sm shadow-xs backdrop-blur-xs">
                        On Demand Only
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Info Footer */}
                <div className="p-4 bg-[#FCFBF9] flex-1 flex flex-col justify-between border-t border-stone-200/60">
                  <div>
                    <h3
                      onClick={() => onProductClick(product)}
                      className="text-sm font-bold text-stone-900 hover:text-[#C5A059] cursor-pointer transition-colors line-clamp-1"
                    >
                      {product.name}
                    </h3>
                    <div className="text-sm font-semibold text-stone-800 mt-1">
                      {product.inStock ? formatPrice(product.price) : 'Currently unavailable'}
                      {product.inStock && product.originalPrice && (
                        <span className="text-xs text-stone-400 line-through ml-2 font-normal">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating Stars & Quick Add Button Row */}
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

                    {/* Quick Add "+" Button */}
                    <button
                      onClick={() => onQuickAdd(product)}
                      className="w-8 h-8 rounded-full bg-stone-900 hover:bg-[#C5A059] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                      title="Quick Add to Cart"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};
