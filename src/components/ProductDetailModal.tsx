import React, { useState } from 'react';
import { Product, CurrencyCode, ReproductionRequest } from '../types';
import { CURRENCIES } from '../data/products';
import { X, Star, Heart, ShoppingBag, Truck, RotateCcw, Check, Sparkles, CheckCircle2, RefreshCcw } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: CurrencyCode;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
  onSubmitReproductionRequest?: (data: Omit<ReproductionRequest, 'id' | 'requestedAt' | 'status'>) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  currentCurrency,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onSubmitReproductionRequest,
}) => {
  if (!isOpen || !product) return null;

  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Black');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'features' | 'reviews'>('desc');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [demandContact, setDemandContact] = useState('');
  const [demandNotes, setDemandNotes] = useState('');
  const [reproductionSubmitted, setReproductionSubmitted] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState('');
  const [demandSubmitted, setDemandSubmitted] = useState(false);

  const currency = CURRENCIES[currentCurrency] || CURRENCIES.EUR;
  const formattedPrice = (product.price * currency.rate).toFixed(2);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FCFBF9] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-stone-300 relative flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-stone-500 hover:text-stone-900 bg-white/80 rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="h-80 sm:h-96 w-full rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shadow-inner relative">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
              {product.isBestSeller && (
                <span className="absolute top-3 left-3 bg-stone-900 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded">
                  Best Seller
                </span>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImage === imgUrl ? 'border-[#C5A059] scale-105 shadow-sm' : 'border-stone-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Details */}
          <div className="md:col-span-6 space-y-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[#C5A059]">
                {product.category}
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-1">
                {product.name}
              </h2>

              {/* Price & Rating */}
              <div className="flex items-center justify-between mt-3">
                <div className="text-2xl font-black text-stone-900">
                  {product.inStock ? `${currency.symbol}${formattedPrice}` : 'Currently unavailable'}
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex text-[#C5A059]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? 'fill-current text-[#C5A059]' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    ({product.reviewCount} Reviews)
                  </span>
                </div>
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-5">
                  <label className="block text-xs font-bold text-stone-800 uppercase mb-2">
                    Color: <span className="text-[#C5A059]">{selectedColor}</span>
                  </label>
                  <div className="flex gap-3">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform cursor-pointer ${
                          selectedColor === c.name ? 'border-[#C5A059] scale-110 shadow' : 'border-stone-300'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {selectedColor === c.name && (
                          <Check className={`w-3.5 h-3.5 ${c.hex === '#F3EFE6' ? 'text-stone-900' : 'text-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector & Size Guide */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-stone-800 uppercase">
                    Select Size
                  </label>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-xs text-[#C5A059] underline hover:text-stone-900 cursor-pointer"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 text-xs font-bold rounded border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white text-stone-800 border-stone-300 hover:border-stone-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mt-5 flex items-center gap-4">
                <label className="text-xs font-bold text-stone-800 uppercase">Quantity:</label>
                <div className="flex items-center border border-stone-300 rounded bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-stone-600 hover:text-stone-900 cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-stone-900 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-stone-600 hover:text-stone-900 cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Out of Stock - Reproduction Request Section */}
              {!product.inStock ? (
                <div className="space-y-3">
                  <div className="mt-4 p-4 bg-stone-900 text-white rounded-xl shadow-lg border border-[#C5A059]/40 space-y-3 text-left">
                    <div className="flex items-center gap-2 text-[#C5A059] font-black uppercase text-xs tracking-wider">
                      <RefreshCcw className="w-4 h-4 shrink-0" />
                      <span>OUT OF STOCK • REQUEST REPRODUCTION</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      This piece is currently sold out in ready stock. Submit a <strong>Reproduction Request</strong> directly to our studio admin. Our tailoring team will reproduce this exact piece for you on demand.
                    </p>

                    {reproductionSubmitted ? (
                      <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-emerald-200">Reproduction Request Submitted to Admin!</p>
                          <p className="text-[11px] mt-1 text-emerald-300/90 leading-relaxed">
                            Request ID: <span className="font-mono font-bold text-white bg-stone-800 px-1.5 py-0.5 rounded">{submittedRequestId}</span><br />
                            Our studio admin has received your reproduction request for <strong>{product.name} ({selectedSize}, {selectedColor})</strong> and will contact you directly at <span className="underline font-semibold text-white">{demandContact}</span>.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!demandContact.trim()) return;
                          const reqId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
                          setSubmittedRequestId(reqId);
                          if (onSubmitReproductionRequest) {
                            onSubmitReproductionRequest({
                              productId: product.id,
                              productName: product.name,
                              productImage: product.image,
                              productPriceEur: product.price,
                              selectedSize,
                              selectedColor,
                              customerContact: demandContact.trim(),
                              notes: demandNotes.trim() || undefined,
                            });
                          }
                          setReproductionSubmitted(true);
                        }}
                        className="space-y-3 pt-1"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Requested Size</label>
                            <select
                              value={selectedSize}
                              onChange={(e) => setSelectedSize(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded text-stone-100 font-medium focus:outline-none focus:border-[#C5A059]"
                            >
                              {product.sizes.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Requested Color</label>
                            <select
                              value={selectedColor}
                              onChange={(e) => setSelectedColor(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded text-stone-100 font-medium focus:outline-none focus:border-[#C5A059]"
                            >
                              {product.colors.map((c) => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Contact Email / Phone / WhatsApp *</label>
                          <input
                            type="text"
                            required
                            value={demandContact}
                            onChange={(e) => setDemandContact(e.target.value)}
                            placeholder="e.g., customer@example.com or +232 76 123 456"
                            className="w-full px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Reproduction Notes (Optional)</label>
                          <input
                            type="text"
                            value={demandNotes}
                            onChange={(e) => setDemandNotes(e.target.value)}
                            placeholder="e.g., Need 2 pieces, specific delivery timeline..."
                            className="w-full px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            className="flex-1 bg-[#C5A059] hover:bg-[#a38243] text-stone-950 font-black text-xs uppercase py-3 rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <RefreshCcw className="w-4 h-4" />
                            Submit Reproduction Request to Admin
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleWishlist(product.id)}
                            className={`p-3 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                              isWishlisted ? 'border-red-500 text-red-500 bg-red-950/40' : 'border-stone-700 text-stone-300 hover:border-stone-500'
                            }`}
                            title="Save to Wishlist"
                          >
                            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                /* Action Buttons for In-Stock Items */
                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase py-4 rounded shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart ({currency.symbol}{(product.price * quantity * currency.rate).toFixed(2)})
                  </button>

                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className={`p-4 rounded border transition-colors cursor-pointer shrink-0 ${
                      isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-stone-300 text-stone-700 hover:border-stone-400'
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              )}

            {/* Information Tabs */}
            <div className="border-t border-stone-200 pt-4">
              <div className="flex border-b border-stone-200 gap-4">
                <button
                  onClick={() => setActiveTab('desc')}
                  className={`pb-2 text-xs font-bold uppercase ${
                    activeTab === 'desc' ? 'border-b-2 border-[#C5A059] text-stone-900' : 'text-stone-400'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`pb-2 text-xs font-bold uppercase ${
                    activeTab === 'features' ? 'border-b-2 border-[#C5A059] text-stone-900' : 'text-stone-400'
                  }`}
                >
                  Materials & Care
                </button>
              </div>

              <div className="pt-3 text-xs text-stone-600 leading-relaxed">
                {activeTab === 'desc' && <p>{product.description}</p>}
                {activeTab === 'features' && (
                  <ul className="list-disc pl-4 space-y-1">
                    {product.features?.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500 pt-2">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Free delivery over €200</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>7-Day Hassle Free Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Size Guide Modal Overlay */}
        {showSizeGuide && (
          <div className="p-6 bg-stone-100 border-t border-stone-300 animate-in fade-in">
            <h4 className="text-sm font-bold uppercase text-stone-900 mb-2">Size Measurement Guide (Chest / Length in CM)</h4>
            <div className="grid grid-cols-6 text-center text-xs border border-stone-300 bg-white rounded overflow-hidden">
              <div className="p-2 font-bold bg-stone-200 border-b">Size</div>
              <div className="p-2 font-bold bg-stone-200 border-b">S</div>
              <div className="p-2 font-bold bg-stone-200 border-b">M</div>
              <div className="p-2 font-bold bg-stone-200 border-b">L</div>
              <div className="p-2 font-bold bg-stone-200 border-b">XL</div>
              <div className="p-2 font-bold bg-stone-200 border-b">XXL</div>

              <div className="p-2 border-r font-semibold">Chest (cm)</div>
              <div className="p-2">96-102</div>
              <div className="p-2">102-108</div>
              <div className="p-2">108-114</div>
              <div className="p-2">114-120</div>
              <div className="p-2">120-126</div>

              <div className="p-2 border-r font-semibold">Length (cm)</div>
              <div className="p-2">66</div>
              <div className="p-2">68</div>
              <div className="p-2">70</div>
              <div className="p-2">72</div>
              <div className="p-2">74</div>

              <div className="p-2 border-r font-semibold">Chest (in)</div>
              <div className="p-2">37.8-40.2</div>
              <div className="p-2">40.2-42.5</div>
              <div className="p-2">42.5-44.9</div>
              <div className="p-2">44.9-47.2</div>
              <div className="p-2">47.2-49.6</div>

              <div className="p-2 border-r font-semibold">Length (in)</div>
              <div className="p-2">25.9</div>
              <div className="p-2">26.8</div>
              <div className="p-2">27.6</div>
              <div className="p-2">28.3</div>
              <div className="p-2">29.1</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
