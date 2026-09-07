import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Send, Check } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Custom Order Inquiry', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#FCFBF9] w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-300 relative p-6 md:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block">We'd love to hear from you</span>
          <h2 className="text-2xl font-black text-stone-900 uppercase">GET IN TOUCH</h2>
        </div>

        {sent ? (
          <div className="text-center py-8 space-y-3 bg-emerald-50 p-6 rounded-xl border border-emerald-200">
            <Check className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-stone-900">Message Sent Successfully!</h3>
            <p className="text-xs text-stone-600">Our customer support team in Paris will reply within 24 hours.</p>
            <button
              onClick={() => { setSent(false); onClose(); }}
              className="bg-stone-900 text-white text-xs font-bold uppercase px-6 py-2.5 rounded cursor-pointer mt-2"
            >
              Back to Store
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded bg-white font-semibold text-stone-800"
              >
                <option>Custom Order Inquiry</option>
                <option>Corporate Uniform Quote</option>
                <option>Shipping & Tracking Question</option>
                <option>Wholesale & Retail Collaboration</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Message</label>
              <textarea
                required
                rows={4}
                placeholder="Tell us about your order or request..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-stone-500 space-y-1">
                <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#C5A059]" /> Paris, France • Freetown, Sierra Leone</div>
                <div className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#C5A059]" /> support@komsedesign.com</div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold text-stone-700 text-[10px] uppercase">Socials:</span>
                  <a href="https://www.instagram.com/komse_design?igsh=b3Z5YnRmcnpnZWUw&utm_source=ig_contact_invite" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-[#C5A059] font-medium" title="Instagram">Instagram</a>
                  <span>•</span>
                  <a href="https://www.facebook.com/share/1SyzZFvdkb/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-[#C5A059] font-medium" title="Facebook">Facebook</a>
                  <span>•</span>
                  <a href="https://www.tiktok.com/@komse.kd.design?_r=1&_t=ZN-98jzmRhWTmV" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-[#C5A059] font-medium" title="TikTok">TikTok</a>
                  <span>•</span>
                  <a href="https://youtube.com/@komsedesign?si=UqkHFvYTAhvBM7Zs" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-[#C5A059] font-medium" title="YouTube">YouTube</a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/33612345678?text=Hello%20KOMSE%20Design%20Customer%20Care,%20I%20have%20an%20inquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-4 py-3 rounded shadow cursor-pointer flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z"/>
                  </svg>
                  <span>WhatsApp Chat</span>
                </a>

                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-black text-white font-bold uppercase px-6 py-3 rounded shadow cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
