// Shipping rates, shared by the storefront (display) and the stripe-checkout Edge Function (charging).
// Rates are in EUR and grow with distance from the Paris studio. Free shipping applies to France only.

export type ShippingZone = 'France' | 'Europe' | 'Africa' | 'International';

export const SHIPPING_RATES_EUR: Record<ShippingZone, number> = {
  France: 7.5,
  Europe: 15,
  Africa: 25,
  International: 30,
};

export const FRANCE_FREE_SHIPPING_THRESHOLD_EUR = 100;

const EUROPE = new Set([
  'AD', 'AL', 'AT', 'BA', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'GB', 'GR', 'HR', 'HU', 'IE', 'IS',
  'IT', 'LI', 'LT', 'LU', 'LV', 'MC', 'MD', 'ME', 'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'SE', 'SI', 'SK', 'SM', 'UA', 'VA',
]);

const AFRICA = new Set([
  'AO', 'BF', 'BI', 'BJ', 'BW', 'CD', 'CF', 'CG', 'CI', 'CM', 'CV', 'DJ', 'DZ', 'EG', 'ER', 'ET', 'GA', 'GH', 'GM', 'GN',
  'GQ', 'GW', 'KE', 'KM', 'LR', 'LS', 'LY', 'MA', 'MG', 'ML', 'MR', 'MU', 'MW', 'MZ', 'NA', 'NE', 'NG', 'RW', 'SC', 'SD',
  'SL', 'SN', 'SO', 'SS', 'ST', 'SZ', 'TD', 'TG', 'TN', 'TZ', 'UG', 'ZA', 'ZM', 'ZW',
]);

// Country names offered at checkout, mapped to ISO codes.
const COUNTRY_CODES: Record<string, string> = {
  france: 'FR',
  'united kingdom': 'GB',
  uk: 'GB',
  'united states': 'US',
  usa: 'US',
  'sierra leone': 'SL',
  senegal: 'SN',
  "cote d'ivoire": 'CI',
  'cote d ivoire': 'CI',
  "côte d'ivoire": 'CI',
  ghana: 'GH',
  nigeria: 'NG',
};

export const countryCodeFor = (country?: string | null) => {
  const value = (country || '').trim();
  if (/^[A-Za-z]{2}$/.test(value)) return value.toUpperCase();
  return COUNTRY_CODES[value.toLowerCase()] || '';
};

export const shippingZoneFor = (countryCode: string): ShippingZone => {
  if (countryCode === 'FR') return 'France';
  if (EUROPE.has(countryCode)) return 'Europe';
  if (AFRICA.has(countryCode)) return 'Africa';
  return 'International';
};

export const shippingCostEur = (subtotalEur: number, country?: string | null) => {
  const zone = shippingZoneFor(countryCodeFor(country) || 'FR');
  if (zone === 'France' && subtotalEur >= FRANCE_FREE_SHIPPING_THRESHOLD_EUR) return 0;
  return SHIPPING_RATES_EUR[zone];
};
