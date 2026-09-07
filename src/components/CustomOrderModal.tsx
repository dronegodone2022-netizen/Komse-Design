import React, { useState } from 'react';
import { CustomDesignDetails } from '../types';
import { PATTERN_PRESETS } from '../data/products';
import { X, Upload, Sparkles, Check, Image as ImageIcon } from 'lucide-react';

interface CustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customDetails: CustomDesignDetails, price: number) => void;
}

export const CustomOrderModal: React.FC<CustomOrderModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const [garmentType, setGarmentType] = useState<'T-Shirt' | 'Hoodie' | 'Jacket' | 'Cap'>('T-Shirt');
  const [selectedColor, setSelectedColor] = useState({ name: 'Onyx Black', hex: '#121212' });
  const [size, setSize] = useState('L');
  const [customText, setCustomText] = useState('KOMSE HERITAGE');
  const [textColor, setTextColor] = useState('#D4AF37'); // Gold
  const [fontStyle, setFontStyle] = useState('Serif Gold');
  const [selectedPattern, setSelectedPattern] = useState(PATTERN_PRESETS[0]);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const garmentColors = [
    { name: 'Onyx Black', hex: '#121212' },
    { name: 'Cream Sand', hex: '#EBE3D5' },
    { name: 'Emerald Green', hex: '#0B4F37' },
    { name: 'Royal Navy', hex: '#0D1B2A' },
  ];

  const garmentPrices = {
    'T-Shirt': 55.0,
    Hoodie: 85.0,
    Jacket: 135.0,
    Cap: 42.0,
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customDetails: CustomDesignDetails = {
      garmentType,
      garmentColor: selectedColor.name,
      garmentColorHex: selectedColor.hex,
      size,
      customText,
      textColor,
      fontStyle,
      patternName: selectedPattern.name,
      notes,
      uploadedLogoUrl: uploadedLogo || undefined,
    };

    onAddToCart(customDetails, garmentPrices[garmentType]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FCFBF9] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-stone-300 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-[#FCFBF9] z-20">
          <div>
            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block">
              Custom Design Studio
            </span>
            <h2 className="text-2xl font-black text-stone-900">
              CREATE YOUR CUSTOM ORDER
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          {/* Left Preview Canvas */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-[#F2EFEC] rounded-xl p-6 border border-stone-300/80 relative min-h-[380px]">
            {/* Garment Mockup Container */}
            <div
              className="w-full max-w-sm h-80 rounded-xl relative flex items-center justify-center shadow-inner overflow-hidden transition-colors duration-300"
              style={{ backgroundColor: selectedColor.hex }}
            >
              {/* Garment Base Outline / Texture */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Front Design Preview Box */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[#C5A059]/50 rounded-lg bg-black/20 backdrop-blur-xs max-w-[220px]">
                {/* Uploaded Logo or Selected Cultural Pattern */}
                {uploadedLogo ? (
                  <img
                    src={uploadedLogo}
                    alt="Custom Upload"
                    className="max-h-24 max-w-[140px] object-contain mb-2"
                  />
                ) : (
                  <div className="w-16 h-16 mb-2 text-[#D4AF37] flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
                      <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="currentColor" strokeWidth="6" />
                      <path d="M50,20 L80,50 L50,80 L20,50 Z" fill="currentColor" opacity="0.8" />
                    </svg>
                  </div>
                )}

                {/* Custom Text Preview */}
                {customText && (
                  <span
                    className="text-lg font-bold tracking-widest uppercase drop-shadow-md"
                    style={{ color: textColor }}
                  >
                    {customText}
                  </span>
                )}

                <span className="text-[10px] text-stone-300 uppercase tracking-widest mt-2 block">
                  {selectedPattern.name}
                </span>
              </div>

              {/* Tag Badge */}
              <div className="absolute bottom-3 left-3 bg-stone-900/90 text-white text-[10px] px-2.5 py-1 rounded border border-stone-700">
                {garmentType} • {selectedColor.name} • Size {size}
              </div>
            </div>

            <span className="text-xs text-stone-500 mt-4 text-center">
              ✦ Live Mockup: Our team will refine exact proportions before printing
            </span>
          </div>

          {/* Right Controls */}
          <div className="lg:col-span-6 space-y-6">
            {/* Step Tabs */}
            <div className="flex border-b border-stone-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`py-2 px-4 text-xs font-bold uppercase border-b-2 cursor-pointer ${
                  step === 1
                    ? 'border-[#C5A059] text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                1. Garment & Color
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`py-2 px-4 text-xs font-bold uppercase border-b-2 cursor-pointer ${
                  step === 2
                    ? 'border-[#C5A059] text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                2. Design & Text
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className={`py-2 px-4 text-xs font-bold uppercase border-b-2 cursor-pointer ${
                  step === 3
                    ? 'border-[#C5A059] text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                3. Finalize & Order
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Select Garment */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase mb-2">
                      Choose Garment Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['T-Shirt', 'Hoodie', 'Jacket', 'Cap'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setGarmentType(type)}
                          className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex justify-between items-center ${
                            garmentType === type
                              ? 'border-[#C5A059] bg-[#F7F4EE] font-bold text-stone-900'
                              : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          <span className="text-sm">{type}</span>
                          <span className="text-xs font-semibold text-[#C5A059]">
                            €{garmentPrices[type].toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Color */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase mb-2">
                      Choose Color
                    </label>
                    <div className="flex gap-3">
                      {garmentColors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform ${
                            selectedColor.name === c.name
                              ? 'border-[#C5A059] scale-110 shadow-md'
                              : 'border-stone-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {selectedColor.name === c.name && (
                            <Check
                              className={`w-4 h-4 ${
                                c.name === 'Cream Sand' ? 'text-stone-900' : 'text-white'
                              }`}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Size */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase mb-2">
                      Select Size
                    </label>
                    <div className="flex gap-2">
                      {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSize(sz)}
                          className={`w-12 h-10 text-xs font-bold rounded border transition-all cursor-pointer ${
                            size === sz
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase py-3.5 rounded shadow-sm cursor-pointer"
                  >
                    Next: Design & Text →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Preset Motifs */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase mb-2">
                      Select Cultural Motif
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PATTERN_PRESETS.map((pat) => (
                        <button
                          key={pat.id}
                          type="button"
                          onClick={() => {
                            setSelectedPattern(pat);
                            setUploadedLogo(null);
                          }}
                          className={`p-2.5 rounded border text-left cursor-pointer transition-colors ${
                            selectedPattern.id === pat.id && !uploadedLogo
                              ? 'border-[#C5A059] bg-[#F7F4EE]'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <span className="text-xs font-bold block text-stone-900">{pat.name}</span>
                          <span className="text-[10px] text-stone-500">{pat.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Custom Logo option */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase mb-2">
                      Or Upload Your Logo/Artwork
                    </label>
                    <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-stone-300 hover:border-[#C5A059] rounded-lg bg-white cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-[#C5A059]" />
                      <span className="text-xs text-stone-600 font-medium">
                        {uploadedLogo ? '✓ File Uploaded (Click to change)' : 'Upload PNG / SVG Artwork'}
                      </span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Custom Text */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase mb-2">
                      Embroidered Text / Name
                    </label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="e.g. SIERRA LEONE"
                      maxLength={24}
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded bg-white uppercase tracking-widest"
                    />
                  </div>

                  {/* Thread Color */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase mb-2">
                      Thread / Print Color
                    </label>
                    <div className="flex gap-3">
                      {[
                        { label: 'Metallic Gold', hex: '#D4AF37' },
                        { label: 'Pure White', hex: '#FFFFFF' },
                        { label: 'Royal Silver', hex: '#E0E0E0' },
                        { label: 'Onyx Black', hex: '#121212' },
                      ].map((tc) => (
                        <button
                          key={tc.label}
                          type="button"
                          onClick={() => setTextColor(tc.hex)}
                          className={`w-8 h-8 rounded-full border border-stone-400 cursor-pointer ${
                            textColor === tc.hex ? 'ring-2 ring-offset-2 ring-[#C5A059]' : ''
                          }`}
                          style={{ backgroundColor: tc.hex }}
                          title={tc.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 bg-stone-200 text-stone-800 text-xs font-bold uppercase py-3.5 rounded cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-2/3 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase py-3.5 rounded shadow-sm cursor-pointer"
                    >
                      Next: Finalize →
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase mb-2">
                      Special Placement / Customization Notes
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Please embroider the crest on the left chest and text on the back collar..."
                      className="w-full p-3 text-xs border border-stone-300 rounded bg-white text-stone-800"
                    />
                  </div>

                  {/* Order Summary Box */}
                  <div className="p-4 bg-stone-100 rounded-lg border border-stone-200 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-stone-900">
                      <span>Custom {garmentType}</span>
                      <span>€{garmentPrices[garmentType].toFixed(2)}</span>
                    </div>
                    <div className="text-stone-600">
                      Color: {selectedColor.name} | Size: {size}
                    </div>
                    <div className="text-stone-600">
                      Design: {uploadedLogo ? 'Custom Uploaded Artwork' : selectedPattern.name}
                    </div>
                    <div className="text-stone-600">Custom Text: "{customText}"</div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-1/3 bg-stone-200 text-stone-800 text-xs font-bold uppercase py-3.5 rounded cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 bg-[#C5A059] hover:bg-[#A88238] text-white text-xs font-bold uppercase py-3.5 rounded shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Add Custom Item to Cart (€{garmentPrices[garmentType].toFixed(2)})
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
