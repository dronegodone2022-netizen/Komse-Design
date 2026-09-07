import React from 'react';
import { COLLECTION_CATEGORIES } from '../data/products';
import { ProductCategory } from '../types';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface CollectionsGridProps {
  onSelectCategory: (category: ProductCategory) => void;
  onViewAll: () => void;
}

export const CollectionsGrid: React.FC<CollectionsGridProps> = ({
  onSelectCategory,
  onViewAll,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-16 bg-[#FAF9F6] text-stone-900 border-b border-stone-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            SHOP BY <span className="text-[#C5A059]">COLLECTIONS</span>
          </h2>

          <button
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-widest uppercase text-stone-800 hover:text-[#C5A059] border border-stone-300 hover:border-[#C5A059] px-4 py-2 rounded-xs transition-colors cursor-pointer"
          >
            <span>VIEW ALL COLLECTIONS</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Collections 6-column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {COLLECTION_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08, ease: 'easeOut' }}
              onClick={() => onSelectCategory(cat.id)}
              className="group cursor-pointer bg-[#F2F0EC] rounded-lg overflow-hidden border border-stone-200/80 hover:border-[#C5A059] transition-all hover:shadow-lg flex flex-col justify-between"
            >
              {/* Card Image */}
              <div className="h-44 sm:h-52 w-full overflow-hidden bg-stone-200 relative">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Card Text Footer */}
              <div className="p-3.5 text-center bg-[#FCFBF9] border-t border-stone-200/60">
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#C5A059] transition-colors">
                  {cat.title}
                </h3>
                <span className="text-[11px] text-stone-500 font-medium block mt-0.5">
                  Collection
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
