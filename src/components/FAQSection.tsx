import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';

interface FAQSectionProps {
  onOpenContact: () => void;
}

interface FAQItem {
  id: string;
  category: 'shipping' | 'sizing' | 'quality' | 'returns';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    category: 'shipping',
    question: 'Where do you ship from and how long does delivery take?',
    answer: 'All orders ship from our studio in Montigny-lès-Metz, France. Delivery usually takes 2–4 business days within France, 3–7 within Europe and 5–12 to Africa and the rest of the world. Shipping costs €7.50 in France (free on orders of €100 or more), €15 to Europe, €25 to Africa and €30 elsewhere. You receive a tracking number as soon as your order ships.',
  },
  {
    id: '2',
    category: 'quality',
    question: 'How are KOMSE garments crafted?',
    answer: 'We craft our streetwear from premium heavyweight fabrics. Every embroidered piece features authentic Sierra Leonean cultural iconography, stitched with high-density threads built to last. Fabric details are listed on each product page.',
  },
  {
    id: '3',
    category: 'sizing',
    question: 'How do KOMSE clothes fit? Should I order my normal size?',
    answer: 'Our hoodies, jackets, and t-shirts are designed with a modern relaxed/oversized European street silhouette. If you prefer a tailored fit, we recommend selecting one size down. Check our full size guide on any product page for exact measurements in cm and inches.',
  },
  {
    id: '4',
    category: 'returns',
    question: 'What is your return and exchange policy?',
    answer: 'You can return any unworn item with its tags within 14 days of delivery for a full refund, as provided by EU consumer law. Contact support@komsedesign.com with your order number to start a return. Made-to-order and personalised items cannot be returned unless faulty.',
  },
  {
    id: '5',
    category: 'shipping',
    question: 'Will I have to pay import duties or customs taxes?',
    answer: 'All European Union orders include all taxes and VAT. For international orders (USA, UK, West Africa), duties are calculated at checkout where available, or handled directly with express customs clearance so there are no unexpected surprises upon delivery.',
  },
];

export const FAQSection: React.FC<FAQSectionProps> = ({ onOpenContact }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const filteredItems = activeCategory === 'all'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter((item) => item.category === activeCategory);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-16 sm:py-20 bg-[#FAF9F6] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 bg-[#EFEAE1] px-3.5 py-1 rounded-full text-[11px] font-bold text-stone-900 border border-stone-300">
            <HelpCircle className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>NEED HELP & INFORMATION?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 uppercase tracking-tight">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Everything you need to know about KOMSE DESIGN craftsmanship, shipping timelines, sizing, and care guides.
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'shipping', label: 'Shipping & Delivery' },
            { id: 'quality', label: 'Craft & Materials' },
            { id: 'sizing', label: 'Sizing & Fit' },
            { id: 'returns', label: 'Returns & Exchanges' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-stone-950 text-white shadow-md'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredItems.map((item) => {
            const isOpen = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden transition-all shadow-2xs hover:border-stone-300"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-inset"
                >
                  <span className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C5A059] shrink-0" />
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#121212] text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3 animate-in fade-in">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help Banner */}
        <div className="mt-12 bg-[#121212] text-white rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-1 text-center sm:text-left z-10">
            <h3 className="text-xl font-bold text-[#C5A059] uppercase">
              STILL HAVE QUESTIONS?
            </h3>
            <p className="text-xs text-stone-300">
              Our customer support team replies within 24 hours.
            </p>
          </div>

          <button
            onClick={onOpenContact}
            className="bg-[#C5A059] hover:bg-[#A88238] text-stone-950 font-bold uppercase text-xs px-6 py-3.5 rounded-xs flex items-center gap-2 cursor-pointer shadow-md transition-colors shrink-0 z-10"
          >
            <MessageSquare className="w-4 h-4" /> Get in Touch
          </button>
        </div>
      </div>
    </section>
  );
};
