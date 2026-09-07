import React from 'react';
import { ActiveTab, ProductCategory } from '../types';
import { Truck, RotateCcw, CreditCard, Headphones } from 'lucide-react';
import { VisaLogo, MastercardLogo, PaypalLogo, ApplePayLogo } from './PaymentLogos';
import komseLogoImg from '../assets/images/komse_official_logo.jpg';

interface FooterProps {
  onTabChange: (tab: ActiveTab) => void;
  onSelectCategory: (category: ProductCategory) => void;
  onOpenContact: () => void;
  onOpenAbout: () => void;
  onOpenFAQ: (category?: string) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onTabChange,
  onSelectCategory,
  onOpenContact,
  onOpenAbout,
  onOpenFAQ,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  return (
    <footer className="bg-[#FAF9F6] text-stone-800 border-t border-stone-200">
      {/* Top Guarantees Bar */}
      <div className="border-b border-stone-200 bg-[#F4F2EE] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-stone-700">
          <button
            onClick={() => onOpenFAQ('shipping')}
            className="flex items-center gap-3 text-left hover:opacity-80 cursor-pointer"
          >
            <div className="p-2 rounded-full bg-white text-[#C5A059] shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block text-stone-900">Free Shipping</span>
              <span>On orders over €100</span>
            </div>
          </button>

          <button
            onClick={() => onOpenFAQ('returns')}
            className="flex items-center gap-3 text-left hover:opacity-80 cursor-pointer"
          >
            <div className="p-2 rounded-full bg-white text-[#C5A059] shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block text-stone-900">Easy Returns</span>
              <span>7 days return</span>
            </div>
          </button>

          <button
            onClick={() => onOpenFAQ('all')}
            className="flex items-center gap-3 text-left hover:opacity-80 cursor-pointer"
          >
            <div className="p-2 rounded-full bg-white text-[#C5A059] shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block text-stone-900">Secure Payment</span>
              <span>Protected by Stripe</span>
            </div>
          </button>

          <button
            onClick={onOpenContact}
            className="flex items-center gap-3 text-left hover:opacity-80 cursor-pointer"
          >
            <div className="p-2 rounded-full bg-white text-[#C5A059] shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block text-stone-900">Customer Support</span>
              <span>We're here to help</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs text-stone-600">
        {/* Brand Column */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={komseLogoImg}
              alt="KOMSE Logo"
              className="h-16 w-auto"
            />
          </div>

          <p className="leading-relaxed text-stone-600 max-w-sm text-xs">
            KOMSE DESIGN is an international Sierra Leonean clothing and lifestyle brand founded in 2012. Our mission is to bring Sierra Leonean culture to the world through fashion.
          </p>
          <div className="pt-1">
            <span className="text-[10px] font-black tracking-widest text-[#C5A059] uppercase block">
              WEAR YOUR IDENTITY. REPRESENT YOUR CULTURE.
            </span>
          </div>
        </div>

        {/* Shop Column */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-bold text-stone-900 uppercase tracking-wider text-xs">SHOP</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onTabChange('shop')} className="hover:text-stone-900 cursor-pointer">
                All Products
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('Jersey T-Shirts')} className="hover:text-stone-900 cursor-pointer">
                T-Shirts
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('Shirts')} className="hover:text-stone-900 cursor-pointer">
                Shirts
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('Sweaters')} className="hover:text-stone-900 cursor-pointer">
                Hoodies
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('Jackets')} className="hover:text-stone-900 cursor-pointer">
                Jackets
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('Caps')} className="hover:text-stone-900 cursor-pointer">
                Caps
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('Accessories')} className="hover:text-stone-900 cursor-pointer">
                Accessories
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Care Column */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-bold text-stone-900 uppercase tracking-wider text-xs">CUSTOMER CARE</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onOpenFAQ('shipping')} className="hover:text-stone-900 text-left cursor-pointer">
                Shipping & Delivery
              </button>
            </li>
            <li>
              <button onClick={() => onOpenFAQ('returns')} className="hover:text-stone-900 text-left cursor-pointer">
                Returns & Refunds
              </button>
            </li>
            <li>
              <button onClick={() => onOpenFAQ('sizing')} className="hover:text-stone-900 text-left cursor-pointer">
                Size Guide
              </button>
            </li>
            <li>
              <button onClick={() => onOpenFAQ('custom')} className="hover:text-stone-900 text-left cursor-pointer">
                Custom Orders
              </button>
            </li>
            <li>
              <button onClick={() => onOpenFAQ('all')} className="hover:text-stone-900 text-left cursor-pointer font-semibold text-stone-900">
                FAQ & Help Center
              </button>
            </li>
            <li>
              <button onClick={onOpenContact} className="hover:text-stone-900 text-left cursor-pointer">
                Contact Us
              </button>
            </li>
          </ul>
        </div>

        {/* Company & Payment Methods Column */}
        <div className="md:col-span-3 space-y-4">
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-xs">COMPANY</h4>
            <ul className="space-y-2">
              <li><button onClick={onOpenAbout} className="hover:text-stone-900 text-left cursor-pointer">About Us</button></li>
              <li><button onClick={() => onOpenFAQ('all')} className="hover:text-stone-900 text-left cursor-pointer">FAQ</button></li>
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-stone-900 text-left cursor-pointer transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="hover:text-stone-900 text-left cursor-pointer transition-colors"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          
          <div className="pt-2">
            <span className="font-bold text-stone-900 uppercase tracking-wider block mb-2 text-[11px]">
              PAYMENT METHODS
            </span>
            <div className="flex flex-wrap gap-1.5 items-center">
              <div title="VISA" className="bg-white px-2 py-1.5 rounded border border-stone-200/90 shadow-2xs flex items-center justify-center h-7 hover:border-stone-400 transition-colors">
                <VisaLogo className="h-3 w-auto" />
              </div>
              <div title="Mastercard" className="bg-white px-2 py-1.5 rounded border border-stone-200/90 shadow-2xs flex items-center justify-center h-7 hover:border-stone-400 transition-colors">
                <MastercardLogo className="h-3.5 w-auto" />
              </div>
              <div title="PayPal" className="bg-white px-2 py-1.5 rounded border border-stone-200/90 shadow-2xs flex items-center justify-center h-7 hover:border-stone-400 transition-colors">
                <PaypalLogo className="h-3.5 w-auto" />
              </div>
              <div title="Apple Pay" className="bg-white px-2 py-1.5 rounded border border-stone-200/90 shadow-2xs flex items-center justify-center h-7 text-stone-900 hover:border-stone-400 transition-colors">
                <ApplePayLogo className="h-3.5 w-auto" />
              </div>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">Secure payments powered by Stripe</p>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#121212] text-stone-400 text-[11px] py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 KOMSE DESIGN. All rights reserved.</span>
          <span className="font-bold tracking-widest text-[#C5A059] uppercase text-[10px]">FROM SIERRA LEONE TO THE WORLD</span>
        </div>
      </div>
    </footer>
  );
};
