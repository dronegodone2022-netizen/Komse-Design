import React from 'react';
import { Shirt, Upload, Edit3, CheckCircle } from 'lucide-react';

interface CustomOrderBannerProps {
  onStartCustomOrder: () => void;
}

export const CustomOrderBanner: React.FC<CustomOrderBannerProps> = ({ onStartCustomOrder }) => {
  return (
    <section className="py-16 bg-[#FAF9F6] text-stone-900 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#EFEAE1] rounded-2xl overflow-hidden border border-stone-300/80 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
          {/* Left Copy & CTA */}
          <div className="lg:col-span-5 space-y-5">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-stone-900 leading-none">
              YOUR IDEA. <br />
              YOUR DESIGN. <br />
              <span className="text-[#C5A059]">YOUR KOMSE.</span>
            </h2>

            <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
              Wear your identity and represent your culture. Create comfortable, authentic custom streetwear and accessories for all genders and personal styles, crafted with attention to detail.
            </p>

            <button
              onClick={onStartCustomOrder}
              className="bg-stone-950 hover:bg-black text-white text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-xs shadow-md transition-all cursor-pointer transform active:scale-98"
            >
              START A CUSTOM ORDER
            </button>
          </div>

          {/* Center Process Flow Steps */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 py-4 lg:py-0">
            {/* Step 1 */}
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-stone-200">
              <div className="w-10 h-10 rounded-full bg-[#FCFBF9] text-stone-900 border border-stone-300 flex items-center justify-center shrink-0 shadow-xs">
                <Shirt className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Step 1</span>
                <span className="text-xs font-bold text-stone-900">Choose Product</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-stone-200">
              <div className="w-10 h-10 rounded-full bg-[#FCFBF9] text-stone-900 border border-stone-300 flex items-center justify-center shrink-0 shadow-xs">
                <Upload className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Step 2</span>
                <span className="text-xs font-bold text-stone-900">Upload Design</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-stone-200">
              <div className="w-10 h-10 rounded-full bg-[#FCFBF9] text-stone-900 border border-stone-300 flex items-center justify-center shrink-0 shadow-xs">
                <Edit3 className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Step 3</span>
                <span className="text-xs font-bold text-stone-900">Describe It</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-stone-200">
              <div className="w-10 h-10 rounded-full bg-[#FCFBF9] text-stone-900 border border-stone-300 flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Step 4</span>
                <span className="text-xs font-bold text-stone-900">We Create</span>
              </div>
            </div>
          </div>

          {/* Right Model Mockup Image */}
          <div className="lg:col-span-3 relative flex justify-center">
            <div className="relative w-full max-w-xs rounded-xl overflow-hidden shadow-lg border border-stone-300 bg-stone-900">
              <img
                src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"
                alt="KOMSE Custom Clothing Design Studio Preview"
                className="w-full h-64 object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-xs font-bold tracking-widest text-[#C5A059] uppercase">Custom Embroidery</span>
                <p className="text-[11px] text-stone-300">Gold thread crest on heavy cotton jacket</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
