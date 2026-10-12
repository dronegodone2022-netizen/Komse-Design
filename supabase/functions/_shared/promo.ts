// Promo codes, shared by the storefront (display) and the stripe-checkout Edge Function (charging).
// Discounts apply to products only, never to shipping.

export const PROMO_CODES: Record<string, number> = {
  HERITAGE10: 10,
  KOMSE10: 10,
};

export const normalizePromoCode = (code?: string | null) => (code || '').trim().toUpperCase();

export const promoPercentFor = (code?: string | null) => PROMO_CODES[normalizePromoCode(code)] || 0;

// Discounted unit price in cents. Both sides use this so the shown and charged totals match exactly.
export const discountedUnitCents = (priceEur: number, percent: number) =>
  Math.round(Math.round(priceEur * 100) * (100 - percent) / 100);

export const discountEurFor = (items: { priceEur: number; quantity: number }[], percent: number) =>
  items.reduce((total, item) => total + (Math.round(item.priceEur * 100) - discountedUnitCents(item.priceEur, percent)) * item.quantity, 0) / 100;
