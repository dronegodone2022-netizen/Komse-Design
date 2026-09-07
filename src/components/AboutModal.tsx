import React from 'react';
import { X, Globe, Heart, Shield, Sparkles, Award } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#FCFBF9] w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border border-stone-300 relative p-6 sm:p-10 space-y-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-500 hover:text-stone-950 rounded-full hover:bg-stone-200/80 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Title */}
        <div className="text-center space-y-3">
          <span className="text-xs font-black text-[#C5A059] uppercase tracking-[0.25em] block">
            EST. 2012 • INTERNATIONAL BRAND
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 uppercase tracking-tight">
            ABOUT KOMSE DESIGN
          </h2>
          <div className="w-20 h-1 bg-[#C5A059] mx-auto rounded-full" />
        </div>

        {/* Vision Hero Banner */}
        <div className="bg-[#121212] text-white p-6 sm:p-8 rounded-2xl border border-stone-800 space-y-3 text-center relative overflow-hidden shadow-lg">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[11px] font-bold text-[#C5A059] uppercase tracking-widest block">
            OUR ONE VISION
          </span>
          <p className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-stone-100">
            FROM SIERRA LEONE TO THE WORLD
          </p>
          <p className="text-stone-300 text-xs sm:text-sm font-medium italic max-w-2xl mx-auto pt-1">
            "We are not just creating clothes. We are creating culture. We are creating identity. We are creating a movement."
          </p>
        </div>

        {/* Story Body Content */}
        <div className="space-y-6 text-stone-800 text-sm leading-relaxed">
          <div className="p-5 bg-stone-100/80 rounded-xl border border-stone-200/80 space-y-3">
            <p className="text-base font-bold text-stone-950">
              <strong>KOMSE DESIGN</strong> is an international Sierra Leonean clothing and lifestyle brand founded in 2012, built on creativity, culture, individuality, and a passion for fashion.
            </p>
            <p className="text-stone-700">
              Our mission is simple: <strong>to bring Sierra Leonean culture to the world through fashion.</strong>
            </p>
          </div>

          <p className="text-stone-700">
            We design and create comfortable, flexible, authentic, and affordable streetwear and accessories for all genders, body types, and personal styles. Every piece is thoughtfully developed with attention to detail, combining contemporary streetwear aesthetics with elements inspired by Sierra Leonean identity, heritage, and culture.
          </p>

          <p className="text-stone-700">
            At Komse Design, we believe fashion is more than what you wear—it is a statement of identity, confidence, culture, and self-expression. Our goal is to create pieces that allow people to feel comfortable, look confident, and proudly express who they are wherever they are in the world.
          </p>

          <p className="text-stone-700">
            Since 2012, Komse Design has continued to grow through original ideas, creative designs, quality, and a strong connection with our customers. We are committed to building a brand that represents Sierra Leone with pride while creating fashion that speaks to an international audience.
          </p>

          <div className="p-5 bg-[#FAF6EE] rounded-xl border border-[#E7D6B5] space-y-2">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-[#9A7B3E] flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#C5A059]" /> Customer-First Experience
            </h4>
            <p className="text-xs sm:text-sm text-stone-800">
              Our customers are at the heart of everything we do. We strive to provide a professional, reliable, welcoming, and customer-focused experience, from the first interaction to the moment our products reach you.
            </p>
          </div>

          {/* Core Values Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-white rounded-xl border border-stone-200 text-center space-y-1.5 shadow-2xs">
              <Sparkles className="w-6 h-6 text-[#C5A059] mx-auto" />
              <h4 className="font-black text-stone-900 text-xs uppercase">Original Creativity</h4>
              <p className="text-[11px] text-stone-500">Founded in 2012 with innovative designs and custom details.</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-stone-200 text-center space-y-1.5 shadow-2xs">
              <Globe className="w-6 h-6 text-[#C5A059] mx-auto" />
              <h4 className="font-black text-stone-900 text-xs uppercase">Global Heritage</h4>
              <p className="text-[11px] text-stone-500">Bringing authentic Sierra Leonean identity to global street culture.</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-stone-200 text-center space-y-1.5 shadow-2xs">
              <Shield className="w-6 h-6 text-[#C5A059] mx-auto" />
              <h4 className="font-black text-stone-900 text-xs uppercase">Comfort & Quality</h4>
              <p className="text-[11px] text-stone-500">Flexible, comfortable, and affordable apparel for all styles.</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-stone-200 text-center space-y-1.5 shadow-2xs">
              <Award className="w-6 h-6 text-[#C5A059] mx-auto" />
              <h4 className="font-black text-stone-900 text-xs uppercase">Cultural Pride</h4>
              <p className="text-[11px] text-stone-500">Wear your identity. Represent your culture wherever you are.</p>
            </div>
          </div>
        </div>

        {/* Footer Statement & Slogan */}
        <div className="pt-6 border-t border-stone-300 text-center space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-stone-500 tracking-widest block">KOMSE DESIGN</span>
            <p className="text-base sm:text-lg font-black text-stone-950 uppercase tracking-wide">
              WEAR YOUR IDENTITY. REPRESENT YOUR CULTURE.
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-stone-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded shadow cursor-pointer transition-colors"
          >
            EXPLORE COLLECTIONS
          </button>
        </div>
      </div>
    </div>
  );
};

