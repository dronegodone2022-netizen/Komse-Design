import React from 'react';
import { HERO_IMAGE } from '../data/products';
import { ShieldCheck, CreditCard, Globe, Crown } from 'lucide-react';

interface HeroSectionProps {
  onGetInTouch: () => void;
  onBrowseShop: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetInTouch,
  onBrowseShop,
}) => {
  return (
    <section className="relative bg-[#F7F6F4] text-stone-900 overflow-hidden">
      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Copy & Actions */}
        <div className="lg:col-span-6 space-y-6 z-10">
            <div className="inline-flex items-center gap-2 bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#9A7B3E] text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              <span>EST. 2012</span>
              <span>•</span>
              <span>FROM SIERRA LEONE TO THE WORLD</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 leading-[1.08] uppercase">
              WHERE <br />
              SIERRA LEONEAN <br />
              <span className="text-[#C5A059]">HERITAGE</span> MEETS <br />
              CONTEMPORARY <br />
              DESIGN.
            </h1>

            <p className="text-stone-700 text-base sm:text-lg max-w-md leading-relaxed font-normal">
              An international clothing and lifestyle brand created to bring Sierra Leonean culture to the world through authentic, comfortable streetwear.
            </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onGetInTouch}
              className="bg-stone-950 hover:bg-black text-white text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-xs shadow-md hover:shadow-xl transition-all cursor-pointer transform active:scale-98"
            >
              GET IN TOUCH
            </button>
            <button
              onClick={onBrowseShop}
              className="bg-stone-200/80 hover:bg-stone-300/80 text-stone-900 text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-xs border border-stone-300 transition-all cursor-pointer"
            >
              BROWSE SHOP
            </button>
          </div>
        </div>

        {/* Right Editorial Model Photo */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg lg:max-w-none rounded-xl overflow-hidden shadow-2xl border border-stone-300/50 bg-stone-200">
            <img
              src={HERO_IMAGE}
              alt="KOMSE DESIGN Sierra Leonean Heritage Contemporary Fashion"
              className="w-full h-[420px] sm:h-[520px] object-cover object-top hover:scale-102 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Subtle Overlay Badge */}
            <div className="absolute bottom-4 left-4 bg-stone-900/90 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-md flex items-center gap-2 border border-[#C5A059]/40 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
              <span className="font-bold tracking-wider text-[11px] uppercase">Wear Your Identity. Represent Your Culture.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Value Proposition Row */}
      <div className="bg-[#1C1C1C] text-white py-6 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left divider-x divide-stone-800">
          {/* Pillar 1 */}
          <div className="flex items-center gap-3.5 justify-center md:justify-start px-2">
            <div className="p-2.5 rounded-lg bg-stone-800/80 text-[#C5A059] shrink-0 border border-stone-700/50">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wide text-stone-100">Premium Quality</h4>
              <p className="text-xs text-stone-400">Finest materials</p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-center gap-3.5 justify-center md:justify-start px-2">
            <div className="p-2.5 rounded-lg bg-stone-800/80 text-[#C5A059] shrink-0 border border-stone-700/50">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wide text-stone-100">Secure Payments</h4>
              <p className="text-xs text-stone-400">100% safe & secure</p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-center gap-3.5 justify-center md:justify-start px-2">
            <div className="p-2.5 rounded-lg bg-stone-800/80 text-[#C5A059] shrink-0 border border-stone-700/50">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wide text-stone-100">Worldwide Shipping</h4>
              <p className="text-xs text-stone-400">Fast & reliable delivery</p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="flex items-center gap-3.5 justify-center md:justify-start px-2">
            <div className="p-2.5 rounded-lg bg-stone-800/80 text-[#C5A059] shrink-0 border border-stone-700/50">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wide text-stone-100">Made with Pride</h4>
              <p className="text-xs text-stone-400">Sierra Leonean owned</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
