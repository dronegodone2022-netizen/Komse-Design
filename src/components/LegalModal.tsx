import React, { useState } from 'react';
import { X, Shield, FileText, CheckCircle2, Lock, Scale, Mail, Building, Globe } from 'lucide-react';
import { BUSINESS } from '../lib/business';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#FCFBF9] w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-300 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header Bar */}
        <div className="bg-[#121212] text-white p-6 relative flex-shrink-0 border-b border-stone-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C5A059] text-stone-950 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest block">
                KOMSE DESIGN • LEGAL CENTER
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {activeTab === 'privacy' ? 'PRIVACY POLICY & DATA PROTECTION' : 'TERMS & CONDITIONS OF SERVICE'}
              </h2>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-[#F4F3EF] px-6 text-xs font-bold text-stone-700 flex-shrink-0">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3.5 px-6 border-b-2 cursor-pointer flex items-center gap-2 transition-colors ${
              activeTab === 'privacy'
                ? 'border-[#C5A059] text-stone-950 font-extrabold bg-white shadow-2xs'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Shield className="w-4 h-4 text-[#C5A059]" /> Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3.5 px-6 border-b-2 cursor-pointer flex items-center gap-2 transition-colors ${
              activeTab === 'terms'
                ? 'border-[#C5A059] text-stone-950 font-extrabold bg-white shadow-2xs'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4 text-[#C5A059]" /> Terms & Conditions
          </button>
        </div>

        {/* Legal Text Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed">
          {activeTab === 'privacy' ? (
            <div className="space-y-6 max-w-3xl">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">GDPR & Global Privacy Standard Compliant</span>
                  Your personal data is encrypted and strictly protected under French Data Protection Act (Loi Informatique et Libertés) and European Regulation (EU 2016/679 - GDPR).
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  1. Information We Collect
                </h3>
                <p>
                  When you visit KOMSE DESIGN or place an order, we collect essential information required to fulfill your purchase and provide a tailored luxury experience:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-stone-600">
                  <li><strong>Identity & Contact Data:</strong> Name, shipping address, billing address, email address, and phone number.</li>
                  <li><strong>Transaction Data:</strong> Details of products purchased, order values, currency selection, and delivery tracking information.</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information, and session cookies strictly necessary for maintaining your shopping bag and account access.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  2. How We Use Your Data
                </h3>
                <p>We process your personal information exclusively for legitimate business purposes:</p>
                <ul className="list-disc pl-5 space-y-1 text-stone-600">
                  <li>Processing, packaging, and dispatching your orders via our courier and postal partners.</li>
                  <li>Sending order confirmations and shipping updates by email.</li>
                  <li>Processing secure payments through Stripe (PCI-DSS compliant). We never see or store your card details.</li>
                  <li>Sending newsletter updates (only when you explicitly opt in).</li>
                </ul>
                <p className="text-stone-600">
                  We use these service providers to run the store: Stripe (payments), Supabase (accounts and order database),
                  Resend (order emails), Hostinger (website hosting) and Google Fonts (typography).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  3. Data Protection & Security Standards
                </h3>
                <p>
                  We implement robust technical and organizational security measures, including 256-bit SSL encryption, restricted administrative access, and secure tokenization of payment data. We <strong>never sell, rent, or commercialize</strong> your personal data to third-party advertisers.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  4. Your Rights Under GDPR
                </h3>
                <p>You maintain full control over your personal data at all times. You have the right to:</p>
                <ul className="list-disc pl-5 space-y-1 text-stone-600">
                  <li>Request access to a full export of your stored personal data.</li>
                  <li>Request immediate correction or erasure ("Right to be Forgotten") of your records.</li>
                  <li>Withdraw consent for marketing communications at any time via one-click unsubscribe links.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  5. Contact Data Officer
                </h3>
                <p>
                  For any privacy inquiries or to exercise your statutory rights, contact our Data Protection Officer directly:
                </p>
                <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 space-y-1 text-xs">
                  <p className="font-bold text-stone-900">{BUSINESS.name} — Data protection</p>
                  <p className="text-stone-600">Email: {BUSINESS.email}</p>
                  <p className="text-stone-600">Address: {BUSINESS.addressLines.join(', ')}</p>
                  <p className="text-stone-600">
                    You may also lodge a complaint with the CNIL (www.cnil.fr), the French data protection authority.
                  </p>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl">
              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  Legal Notice (Mentions légales)
                </h3>
                <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 space-y-1 text-xs">
                  <p><strong>Publisher:</strong> {BUSINESS.name}</p>
                  <p><strong>Address:</strong> {BUSINESS.addressLines.join(', ')}</p>
                  <p><strong>Email:</strong> {BUSINESS.email} · <strong>Phone:</strong> {BUSINESS.phone}</p>
                  {BUSINESS.siret && <p><strong>SIRET:</strong> {BUSINESS.siret}</p>}
                  <p><strong>Website host:</strong> {BUSINESS.host}</p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  1. Scope & Acceptance
                </h3>
                <p>
                  These Terms and Conditions govern all sales and services provided by KOMSE DESIGN via our official website. By placing an order, you agree without reservation to these terms.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  2. Products & Cultural Craftsmanship
                </h3>
                <p>
                  Our garments feature authentic Sierra Leonean embroidery on premium fabrics. Due to the handcrafted nature of our embroidery crests, minor unique thread variations may occur, reflecting genuine artisan craftsmanship.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  3. Pricing, Taxes & Currencies
                </h3>
                <p>
                  All prices are set and charged in euros (EUR) and include French VAT where applicable. Prices shown in other currencies (USD, GBP, NLE) are indicative conversions only. Shipping costs depend on the delivery country and are shown before payment. Orders delivered outside the EU may be subject to local import duties paid by the recipient.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  4. Shipping & Risk of Loss
                </h3>
                <p>
                  Orders ship from our studio in Montigny-lès-Metz, France, with tracking, via our courier and postal partners. Risk of loss passes to the customer upon verified physical delivery to the designated shipping address.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  5. Intellectual Property
                </h3>
                <p>
                  All trademarks, logos, cultural crest designs, brand imagery, and text content are the exclusive intellectual property of KOMSE DESIGN. Unauthorized copying or redistribution is strictly prohibited.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  6. Governing Law & Jurisdiction
                </h3>
                <p>
                  These terms are governed by French law. Before any legal action, please contact us at {BUSINESS.email} so we can
                  resolve the issue amicably. As a consumer you may also use a consumer mediation service free of charge, and you
                  keep the protection of the mandatory laws and courts of your country of residence.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 uppercase border-b border-stone-200 pb-1">
                  7. Right of Withdrawal & Returns
                </h3>
                <p>
                  You have 14 days from the day you receive your order to withdraw from your purchase, without giving any reason.
                  To do so, email {BUSINESS.email} with your order number, then return the unworn items with their tags within 14
                  days of telling us. We refund the price of the items and the standard delivery cost within 14 days of receiving
                  them back, using your original payment method. Return shipping costs are paid by the customer unless the item is
                  faulty or not as described.
                </p>
                <p>
                  The withdrawal right does not apply to made-to-order or personalised items (for example custom embroidery),
                  unless they are faulty. All items are covered by the legal guarantee of conformity.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-[#F4F3EF] border-t border-stone-200 flex items-center justify-between text-xs flex-shrink-0">
          <span className="text-stone-500 text-[11px]">Last Updated: August 2026 • Version 2.4</span>
          <button
            onClick={onClose}
            className="bg-stone-900 hover:bg-black text-white font-bold uppercase px-6 py-2 rounded shadow cursor-pointer transition-colors"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
