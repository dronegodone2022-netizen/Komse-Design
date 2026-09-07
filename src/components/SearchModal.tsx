import React, { useState } from 'react';
import { Product, CurrencyCode } from '../types';
import { CURRENCIES } from '../data/products';
import { X, Search, Star } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currentCurrency: CurrencyCode;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  currentCurrency,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const currency = CURRENCIES[currentCurrency] || CURRENCIES.EUR;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FCFBF9] w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-stone-200 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#C5A059]" />
          <input
            type="text"
            autoFocus
            placeholder="Search products (e.g. Hoodie, Cap, Jacket, T-Shirt)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-stone-900 bg-transparent focus:outline-none font-medium placeholder-stone-400"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs">
              No products found matching "{query}". Try searching for "Cap" or "T-Shirt".
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="flex items-center gap-4 p-2.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer border border-transparent hover:border-stone-200"
              >
                <div className="w-12 h-14 rounded overflow-hidden bg-stone-200 shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-[#C5A059] uppercase block">
                    {product.category}
                  </span>
                  <h4 className="text-xs font-bold text-stone-900">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                    <span className="font-bold text-stone-900">
                      {product.inStock ? `${currency.symbol}${(product.price * currency.rate).toFixed(2)}` : 'Unavailable'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-[#C5A059]" /> {product.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
