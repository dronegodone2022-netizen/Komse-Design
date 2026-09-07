import React, { useState } from 'react';
import { CurrencyCode } from '../types';
import { CURRENCIES } from '../data/products';
import { ChevronDown, Truck, Globe } from 'lucide-react';

interface TopBarProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentCurrency, onCurrencyChange }) => {
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');

  return (
    <div className="bg-[#121212] text-xs text-stone-300 py-2 px-4 sm:px-8 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        {/* Left Announcement */}
        <div className="flex items-center gap-2 font-medium tracking-wide">
          <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Free Delivery in France for orders over <strong className="text-white">€100</strong></span>
        </div>

        {/* Right Selectors */}
        <div className="flex items-center gap-6 relative">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{currentLang}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 w-28 bg-[#1A1A1A] border border-neutral-800 rounded shadow-xl py-1 z-50">
                {['English', 'Français'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setCurrentLang(lang);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A2A] transition-colors ${
                      currentLang === lang ? 'text-[#D4AF37] font-semibold' : 'text-stone-300'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency Selector */}
          <div className="relative">
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer font-medium"
            >
              <span>{CURRENCIES[currentCurrency]?.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {currencyOpen && (
              <div className="absolute right-0 mt-1 w-28 bg-[#1A1A1A] border border-neutral-800 rounded shadow-xl py-1 z-50">
                {Object.values(CURRENCIES).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onCurrencyChange(c.code);
                      setCurrencyOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A2A] transition-colors ${
                      currentCurrency === c.code ? 'text-[#D4AF37] font-semibold' : 'text-stone-300'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
