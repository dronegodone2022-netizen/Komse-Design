import { Currency } from '../types';

// Leones are shown as whole numbers; other currencies keep cents. Both use thousands separators.
export const formatPrice = (amountEur: number, currency: Currency) => {
  const converted = amountEur * currency.rate;
  const digits = currency.code === 'NLE' ? 0 : 2;
  return `${currency.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};
