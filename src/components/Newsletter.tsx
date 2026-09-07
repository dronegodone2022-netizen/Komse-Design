import React, { useState } from 'react';
import { Instagram, Facebook, Youtube, Check } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="bg-[#121212] text-white py-12 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Copy */}
        <div className="text-center lg:text-left space-y-1">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
            JOIN THE <span className="text-[#C5A059]">KOMSE FAMILY</span>
          </h3>
          <p className="text-xs text-stone-400">
            Get updates on new collections, cultural releases, and exclusive member offers.
          </p>
        </div>

        {/* Center Input Form */}
        <div className="w-full max-w-md">
          {subscribed ? (
            <div className="bg-[#212121] text-[#C5A059] p-3 rounded text-xs font-bold text-center border border-[#C5A059]/40 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Welcome to the family! Check your inbox for 10% off.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-[#1A1A1A] border border-stone-700 text-xs px-4 py-3 rounded text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
              />
              <button
                type="submit"
                className="bg-[#C5A059] hover:bg-[#A88238] text-stone-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded transition-colors cursor-pointer shrink-0"
              >
                SUBSCRIBE
              </button>
            </form>
          )}
        </div>

        {/* Right Social Media Links */}
        <div className="flex flex-col items-center gap-2 text-stone-400">
          <span className="text-[11px] font-bold uppercase tracking-widest text-stone-300">Follow Us</span>
          <div className="flex items-center gap-2">
            <a
              href="https://www.instagram.com/komse_design?igsh=b3Z5YnRmcnpnZWUw&utm_source=ig_contact_invite"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-stone-900 hover:bg-[#C5A059] hover:text-stone-950 rounded-full transition-all duration-200"
              title="Instagram - @komse_design"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/share/1SyzZFvdkb/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-stone-900 hover:bg-[#C5A059] hover:text-stone-950 rounded-full transition-all duration-200"
              title="Facebook Page - KOMSE Design"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/share/1JCD8n4DfS/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-stone-900 hover:bg-[#C5A059] hover:text-stone-950 rounded-full transition-all duration-200"
              title="Facebook Community - KOMSE Design"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://www.tiktok.com/@komse.kd.design?_r=1&_t=ZN-98jzmRhWTmV"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-stone-900 hover:bg-[#C5A059] hover:text-stone-950 rounded-full transition-all duration-200"
              title="TikTok - @komse.kd.design"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.508 6.391 6.391 0 0 0 1.077 8.351 6.338 6.338 0 0 0 8.046.06 6.388 6.388 0 0 0 1.711-4.283V8.293a8.203 8.203 0 0 0 4.795 1.888v-3.495a4.787 4.787 0 0 1-1.001-.001z" />
              </svg>
            </a>
            <a
              href="https://youtube.com/@komsedesign?si=UqkHFvYTAhvBM7Zs"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-stone-900 hover:bg-[#C5A059] hover:text-stone-950 rounded-full transition-all duration-200"
              title="YouTube - @komsedesign"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
