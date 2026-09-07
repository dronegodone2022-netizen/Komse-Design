import React, { useState } from 'react';
import { CartItem, CurrencyCode } from '../types';
import { CURRENCIES } from '../data/products';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, Tag, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentCurrency: CurrencyCode;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentCurrency,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
}) => {
  if (!isOpen) return null;

  const currency = CURRENCIES[currentCurrency] || CURRENCIES.EUR;
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  // Subtotal calculation in EUR
  const subtotalEur = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const freeShippingThresholdEur = 100.0;
  const freeShippingProgress = Math.min(100, (subtotalEur / freeShippingThresholdEur) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdEur - subtotalEur);

  const discountEur = (subtotalEur * discountPercent) / 100;
  const shippingEur = subtotalEur >= freeShippingThresholdEur || cartItems.length === 0 ? 0 : 7.5;
  const totalEur = subtotalEur - discountEur + shippingEur;

  const formatPrice = (amountEur: number) => {
    return `${currency.symbol}${(amountEur * currency.rate).toFixed(2)}`;
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'HERITAGE10' || promoCode.trim().toUpperCase() === 'KOMSE10') {
      setDiscountPercent(10);
      setPromoApplied(true);
    } else {
      alert('Invalid Promo Code. Try "HERITAGE10" for 10% off!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FCFBF9] border-l border-stone-300 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
              <h2 className="text-lg font-bold text-stone-900 uppercase">
                YOUR SHOPPING BAG ({cartItems.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#F3EFE6] px-5 py-3 border-b border-stone-200/80">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#C5A059]" />
                {remainingForFreeShipping > 0
                  ? `Add ${formatPrice(remainingForFreeShipping)} more for FREE France delivery!`
                  : '🎉 You unlocked FREE Delivery!'}
              </span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#C5A059] h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-stone-800">Your bag is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore our Sierra Leonean heritage collections and add items to your cart.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 text-xs font-bold uppercase tracking-wider text-white bg-stone-900 hover:bg-black px-6 py-2.5 rounded shadow cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white rounded-xl border border-stone-200 shadow-2xs relative"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-stone-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Custom Order Indicator */}
                      {item.customDesignDetails ? (
                        <div className="mt-1 bg-[#F7F4EE] p-1.5 rounded text-[10px] text-stone-700 space-y-0.5 border border-[#C5A059]/30">
                          <span className="font-bold text-[#C5A059] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Custom Order
                          </span>
                          <div>Text: "{item.customDesignDetails.customText}"</div>
                          <div>
                            {item.customDesignDetails.garmentColor} | Size {item.selectedSize}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Size: {item.selectedSize} | Color: {item.selectedColor}
                        </p>
                      )}
                    </div>

                    {/* Price and Quantity Modifier */}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-bold text-stone-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>

                      <div className="flex items-center border border-stone-200 rounded bg-stone-50">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-stone-600 hover:text-stone-900 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-[11px] font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-stone-600 hover:text-stone-900 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-white space-y-3">
              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Promo Code (HERITAGE10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-stone-300 rounded bg-stone-50 text-stone-900 uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-stone-800 hover:bg-stone-950 text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {promoApplied && (
                <div className="text-[11px] text-emerald-700 font-semibold flex justify-between">
                  <span>Discount (10% HERITAGE10):</span>
                  <span>-{formatPrice(discountEur)}</span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-stone-900">{formatPrice(subtotalEur)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping (France):</span>
                  <span>{shippingEur === 0 ? 'FREE' : formatPrice(shippingEur)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-stone-900 border-t border-stone-200 pt-2">
                  <span>Total Amount:</span>
                  <span className="text-[#C5A059]">{formatPrice(totalEur)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="w-full bg-stone-900 hover:bg-black text-white text-xs font-bold tracking-widest uppercase py-4 rounded shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
