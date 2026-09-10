import { CurrencyCode } from '../types';

/**
 * Detects the user's default currency based on browser location settings
 * (Intl timeZone, navigator.language, and navigator.languages).
 * Automatically sets the default currency to 'SLL', 'USD', or 'EUR'.
 */
export function detectDefaultCurrency(): CurrencyCode {
  try {
    // 1. Get browser timezone
    const timeZone = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();

    // 2. Get user browser language preferences (e.g. ['en-US', 'fr-FR'])
    const languages: string[] = Array.from(
      new Set(
        [
          navigator.language,
          ...(navigator.languages || [])
        ]
          .filter(Boolean)
          .map((lang) => lang.toLowerCase())
      )
    );

    // --- CHECK 1: Sierra Leone (SLL) ---
    // Check if timezone is Freetown / Sierra Leone
    const isFreetownTimeZone =
      timeZone.includes('freetown') ||
      timeZone.includes('sierra_leone') ||
      timeZone.includes('sierraleone');

    // Check if any browser language specifies SL region (e.g. 'en-sl', 'kri-sl')
    const isSierraLeoneLocale = languages.some(
      (lang) => lang.endsWith('-sl') || lang.includes('-sl-') || lang === 'sl' || lang === 'kri'
    );

    if (isFreetownTimeZone || isSierraLeoneLocale) {
      return 'SLL';
    }

    // --- CHECK 2: Eurozone / Europe (EUR) ---
    const euroZoneCountries = [
      'fr', 'de', 'es', 'it', 'nl', 'be', 'at', 'pt', 'ie', 'fi',
      'gr', 'sk', 'si', 'lt', 'lv', 'ee', 'lu', 'mt', 'cy', 'mc', 'ad', 'sm', 'va'
    ];

    const isEuroZoneLocale = languages.some((lang) => {
      const parts = lang.split(/[-_]/);
      return parts.length > 1 && euroZoneCountries.includes(parts[1]);
    });

    const isEuropeTimeZone = timeZone.startsWith('europe/');

    if (isEuropeTimeZone || isEuroZoneLocale) {
      return 'EUR';
    }

    // --- CHECK 3: United States / Americas (USD) ---
    const isUSTimeZone =
      timeZone.startsWith('america/') ||
      timeZone.startsWith('us/') ||
      timeZone === 'pacific/honolulu';

    const isUSLocale = languages.some(
      (lang) => lang === 'en-us' || lang === 'es-us'
    );

    if (isUSTimeZone || isUSLocale) {
      return 'USD';
    }

    // Fallback based on Americas or rest of world
    if (timeZone.startsWith('america/')) {
      return 'USD';
    }

    // Standard fallback to EUR
    return 'EUR';
  } catch (error) {
    console.warn('Unable to detect currency from browser settings, defaulting to EUR:', error);
    return 'EUR';
  }
}

export function detectDefaultCountry(): string {
  try {
    const languages = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
    const region = languages
      .map((language) => language.split(/[-_]/)[1]?.toUpperCase())
      .find((value) => value && value.length === 2);
    const countries: Record<string, string> = {
      FR: 'France',
      GB: 'United Kingdom',
      US: 'United States',
      SL: 'Sierra Leone',
      SN: 'Senegal',
      CI: "Cote d'Ivoire",
      GH: 'Ghana',
      NG: 'Nigeria',
    };
    if (region && countries[region]) return countries[region];

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/freetown|sierra_leone/i.test(timeZone)) return 'Sierra Leone';
    if (/paris|london/i.test(timeZone)) return timeZone.toLowerCase().includes('london') ? 'United Kingdom' : 'France';
    if (/new_york|detroit|chicago|denver|los_angeles|phoenix|honolulu/i.test(timeZone)) return 'United States';
  } catch (error) {
    console.warn('Unable to detect country from browser settings:', error);
  }
  return 'France';
}
