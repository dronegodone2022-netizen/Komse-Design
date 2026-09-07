import React, { useState } from 'react';
import { ActiveTab, UserProfile } from '../types';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import komseLogoImg from '../assets/images/komse_official_logo.png';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  cartCount: number;
  wishlistCount: number;
  currentUser?: UserProfile | null;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  cartCount,
  wishlistCount,
  currentUser,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenAccount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; tab: ActiveTab }[] = [
    { label: 'Home', tab: 'home' },
    { label: 'Shop', tab: 'shop' },
    { label: 'About Us', tab: 'about' },
    { label: 'Contact', tab: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FCFBF9] border-b border-stone-200/80 shadow-xs backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-stone-800 hover:text-[#D4AF37] transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 cursor-pointer group text-left"
        >
          <img
            src={komseLogoImg}
            alt="KOMSE Logo"
            className="h-15 w-auto group-hover:opacity-80 transition-opacity duration-300"
          />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = activeTab === link.tab;
            return (
              <button
                key={link.tab}
                onClick={() => onTabChange(link.tab)}
                className={`text-sm font-medium transition-all relative py-1 cursor-pointer ${
                  isActive
                    ? 'text-stone-900 font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C5A059] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-stone-700 hover:text-[#C5A059] transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Account */}
          <button
            onClick={onOpenAccount}
            className="p-1.5 text-stone-700 hover:text-[#C5A059] transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 rounded-full hover:bg-stone-100"
            title={currentUser ? `Account: ${currentUser.name}` : 'Sign In / Account'}
          >
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-[#121212] text-white pl-2 pr-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                {currentUser.profilePicture ? (
                  <img src={currentUser.profilePicture} alt="Profile" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-[#C5A059] text-stone-950 flex items-center justify-center text-[10px] font-black">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden md:inline max-w-[80px] truncate text-[11px]">
                  {currentUser.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <div className="p-1">
                <User className="w-5 h-5" />
              </div>
            )}
          </button>

          {/* Wishlist */}
          <button
            onClick={onOpenWishlist}
            className="p-2 text-stone-700 hover:text-[#C5A059] transition-colors cursor-pointer relative"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#C5A059] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Cart */}
          <button
            onClick={onOpenCart}
            className="p-2 text-stone-700 hover:text-[#C5A059] transition-colors cursor-pointer relative flex items-center justify-center"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#C5A059] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FCFBF9] border-b border-stone-200 px-6 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <button
              key={link.tab}
              onClick={() => {
                onTabChange(link.tab);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 text-base font-medium border-b border-stone-100 ${
                activeTab === link.tab ? 'text-[#C5A059] font-bold' : 'text-stone-700'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 flex flex-col gap-2 text-stone-700">
            <button
              onClick={() => {
                onOpenAccount();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm py-2 hover:text-[#C5A059]"
            >
              <User className="w-4 h-4" /> Account & Orders
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
