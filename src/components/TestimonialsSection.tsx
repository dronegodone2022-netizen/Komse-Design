import React from 'react';
import { Star, CheckCircle, Quote, MapPin, Sparkles, Award } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  purchasedProduct: string;
  date: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Aminata K.',
    location: 'Paris, France',
    rating: 5,
    comment: 'The quality of the French Terry cotton on the Sierra Leopard Print Hoodie is insane! Heavyweight, super warm, and the embroidery on the back is a true work of art. I get stopped in the streets of Paris every time I wear it.',
    purchasedProduct: 'Sierra Leopard Print Hoodie',
    date: 'July 2026',
    initials: 'AK',
  },
  {
    id: 't2',
    name: 'David L.',
    location: 'London, UK',
    rating: 5,
    comment: 'DHL Express delivered my order to London in just 2 days. The fit of the KOMSE Heritage Tee is spot on — tailored shoulders with a comfortable relaxed drape. You can feel the luxury craftsmanship.',
    purchasedProduct: 'KOMSE Heritage Tee',
    date: 'June 2026',
    initials: 'DL',
  },
  {
    id: 't3',
    name: 'Mariama S.',
    location: 'Freetown, Sierra Leone',
    rating: 5,
    comment: 'Seeing Sierra Leonean culture represented with such premium streetwear standards fills my heart with pride. The embroidery thread work doesn’t fade or fray after washing. 10/10 recommendation!',
    purchasedProduct: 'Heritage Bomber Jacket',
    date: 'August 2026',
    initials: 'MS',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#121212] text-white relative overflow-hidden">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#C5A059]/20 text-[#C5A059] px-3.5 py-1 rounded-full text-[11px] font-bold border border-[#C5A059]/30 tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMMUNITY TESTIMONIALS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            VOICES OF KOMSE
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Discover authentic reviews from fashion enthusiasts and cultural connoisseurs across Paris, London, Freetown, New York, and beyond.
          </p>
        </div>

        {/* Global Rating Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-stone-900/90 border border-stone-800 rounded-2xl p-6 text-center divide-y md:divide-y-0 md:divide-x divide-stone-800 shadow-2xl">
          <div className="p-2 space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-[#C5A059]">4.9 / 5.0</div>
            <div className="flex justify-center gap-1 text-[#C5A059]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#C5A059]" />
              ))}
            </div>
            <p className="text-[11px] text-stone-400 font-medium">Customer Rating</p>
          </div>

          <div className="p-2 space-y-1 pt-4 md:pt-2">
            <div className="text-2xl sm:text-3xl font-black text-white">10,000+</div>
            <p className="text-xs font-bold text-stone-200">Garments Dispatched</p>
            <p className="text-[11px] text-stone-400 font-medium">Worldwide Shipping</p>
          </div>

          <div className="p-2 space-y-1 pt-4 md:pt-2">
            <div className="text-2xl sm:text-3xl font-black text-white">99.4%</div>
            <p className="text-xs font-bold text-stone-200">On-Time Delivery</p>
            <p className="text-[11px] text-stone-400 font-medium">DHL Express Service</p>
          </div>

          <div className="p-2 space-y-1 pt-4 md:pt-2">
            <div className="text-2xl sm:text-3xl font-black text-[#C5A059]">100%</div>
            <p className="text-xs font-bold text-stone-200">Ethical Craftsmanship</p>
            <p className="text-[11px] text-stone-400 font-medium">Organic French Cotton</p>
          </div>
        </div>

        {/* Testimonials 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-stone-900/80 border border-stone-800 hover:border-[#C5A059]/50 rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
            >
              <div className="space-y-3">
                {/* Top Card Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#C5A059]">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C5A059]" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-stone-700 group-hover:text-[#C5A059]/40 transition-colors" />
                </div>

                {/* Comment */}
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C5A059] text-stone-950 font-black flex items-center justify-center text-xs shadow-md">
                    {t.initials}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs">{t.name}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-label="Verified Buyer" />
                    </div>
                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C5A059]" /> {t.location}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] text-stone-400 font-semibold">{t.purchasedProduct}</span>
                  <span className="text-[9px] text-stone-500">{t.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
