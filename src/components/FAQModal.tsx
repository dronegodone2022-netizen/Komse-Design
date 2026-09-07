import React, { useState } from 'react';
import { X, Search, ChevronDown, Truck, Ruler, Sparkles, RotateCcw, HelpCircle, Mail, MessageSquare } from 'lucide-react';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
  onStartCustomOrder?: () => void;
  initialCategory?: string;
}

interface FAQItem {
  id: string;
  category: 'shipping' | 'sizing' | 'custom' | 'returns';
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'ship-1',
    category: 'shipping',
    question: 'Where do you ship from and what are the delivery timelines?',
    answer: 'All orders are dispatched from our central Paris studio in France. Delivery within France and West Europe takes 2-4 business days. Express shipping across Sierra Leone and West Africa takes 4-7 business days, while worldwide shipping takes 5-8 business days.',
  },
  {
    id: 'size-1',
    category: 'sizing',
    question: 'How do KOMSE garments fit? Are they unisex?',
    answer: 'All KOMSE apparel—including our heavyweight tees, signature hoodies, and tailored jackets—are crafted with a modern, relaxed European unisex fit. If you prefer a tailored fit, select your true size. For a broader, streetwear oversized silhouette, we recommend sizing up.',
  },
  {
    id: 'custom-1',
    category: 'custom',
    question: 'How does custom ordering work?',
    answer: 'Our Custom Design feature allows you to personalize T-shirts, Hoodies, Jackets, or Caps. You select the base color, enter custom embroidered text or upload high-resolution artwork, and select placement (Chest, Sleeve, Back, or Collar).',
  },
  {
    id: 'ret-1',
    category: 'returns',
    question: 'What is your return and exchange policy?',
    answer: 'We offer a 7-day hassle-free return and exchange guarantee on all standard, unworn items with original tags intact. Return shipping is free within France.',
  },
  {
    id: 'ship-4',
    category: 'shipping',
    question: 'Are customs duties or taxes included for international deliveries?',
    answer: 'Duties and taxes are pre-calculated and included for European Union orders. For deliveries to Sierra Leone, the US, and other international destinations, local import customs duties may apply depending on your nation’s import regulations.',
  },
];

export const FAQModal: React.FC<FAQModalProps> = ({
  isOpen,
  onClose,
  onOpenContact,
  onStartCustomOrder,
  initialCategory = 'all',
}) => {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openAccordionId, setOpenAccordionId] = useState<string | null>('ship-1');

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { id: 'sizing', label: 'Sizing & Fits', icon: Ruler },
    { id: 'custom', label: 'Custom Orders', icon: Sparkles },
    { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
  ];

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const toggleAccordion = (id: string) => {
    setOpenAccordionId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#FCFBF9] w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-300 relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 md:p-8 bg-[#121212] text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1 pr-8">
            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block">
              Help Center & Guidance
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-xs text-stone-400">
              Everything you need to know about KOMSE DESIGN shipping, tailoring, sizing, and policies.
            </p>
          </div>

          {/* Search Box */}
          <div className="mt-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Search questions (e.g. shipping, custom embroidery, sizing...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 focus:border-[#C5A059] text-white text-xs rounded-lg pl-10 pr-4 py-2.5 focus:outline-none transition-colors placeholder:text-stone-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-white text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="px-6 py-3 bg-[#F4F3EF] border-b border-stone-200 flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C5A059]' : 'text-stone-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Accordion Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <HelpCircle className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-sm font-bold text-stone-800">No matching questions found</p>
              <p className="text-xs text-stone-500">
                Try searching for another keyword or reach out directly to our support team in Paris.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openAccordionId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-all"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 bg-white hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-stone-900 pr-2">
                      {faq.question}
                    </span>
                    <div
                      className={`p-1 rounded-full bg-stone-100 text-stone-600 transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'rotate-180 bg-stone-900 text-white' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-stone-600 border-t border-stone-100 leading-relaxed bg-[#FAF9F6]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Call to Action */}
        <div className="p-4 sm:px-6 bg-[#F4F3EF] border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="text-stone-600 text-center sm:text-left">
            Still have questions? Our support team in Paris is ready to assist.
          </div>

          <div className="flex items-center gap-2">
            {onOpenContact && (
              <button
                onClick={() => {
                  onClose();
                  onOpenContact();
                }}
                className="bg-stone-900 hover:bg-black text-white font-bold uppercase px-4 py-2 rounded text-[11px] cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> Contact Support
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
