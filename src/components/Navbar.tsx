import React, { useState, useRef, useEffect } from 'react';
import { Compass, Sparkles, User as UserIcon, LogOut, Settings, DollarSign, MapPin, Heart, Tag, Bookmark, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { WisgoLogo } from './WisgoLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { smoothScrollTo } from '../utils/scrollUtils';

interface NavbarProps {
  onOpenPreferences: () => void;
  onOpenAuthModal: () => void;
  activeTab: 'explore' | 'planner' | 'assistant' | 'trips' | 'favorites' | 'pricing';
  setActiveTab: (tab: 'explore' | 'planner' | 'assistant' | 'trips' | 'favorites' | 'pricing') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPreferences,
  onOpenAuthModal,
  activeTab,
  setActiveTab
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const { t } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key for clean UX
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDropdown]);

  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 text-slate-800 sticky top-0 z-50 shadow-2xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo - WisGO Cambodia */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            type="button"
            onClick={() => {
              setActiveTab('explore');
              smoothScrollTo('main-content', 75);
            }}
            className="flex items-center gap-2 sm:gap-2.5 min-h-[40px] text-lg sm:text-xl font-black tracking-tight text-[#1E293B] hover:opacity-90 active:scale-98 transition-all cursor-pointer group rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B7A5C]"
            aria-label="WisGO Cambodia Home"
          >
            <div className="bg-[#F0FDF8] border-1.5 border-[#0B7A5C]/40 group-hover:border-[#0B7A5C] p-1.5 rounded-xl shadow-2xs flex items-center justify-center transition-all group-hover:scale-105">
              <WisgoLogo className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeColor="#0B7A5C" />
            </div>
            <span className="font-extrabold tracking-tight">Wis<span className="text-[#0B7A5C]">GO</span></span>
          </button>
          
          <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#DFF7ED] text-[#0B7A5C] border border-[#21C87A]/30 select-none">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0B7A5C] animate-pulse" />
            <span>🇰🇭</span>
            <span>{t('nav.tagline', 'Authentic Khmer Tourism')}</span>
          </span>
        </div>

        {/* Desktop & Tablet Navigation Tabs */}
        <nav 
          aria-label="Main navigation" 
          className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-inner"
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('explore');
              smoothScrollTo('explore-section', 75);
            }}
            className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B7A5C] ${
              activeTab === 'explore'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 active:scale-98'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t('nav.explore', 'Explore')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('planner');
              smoothScrollTo('map-section', 75);
            }}
            className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B7A5C] ${
              activeTab === 'planner'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 active:scale-98'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t('nav.map_planner', 'Map & Planner')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('assistant');
              smoothScrollTo('main-content', 75);
            }}
            className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B7A5C] ${
              activeTab === 'assistant'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 active:scale-98'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'assistant' ? 'text-emerald-300' : 'text-[#0B7A5C]'}`} />
            <span>{t('nav.ai_guide', 'AI Guide')}</span>
            <span className="hidden lg:inline-block text-[9px] font-black uppercase px-1 py-0.2 rounded bg-amber-400/30 text-amber-900 leading-tight">
              AI
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('trips');
              smoothScrollTo('main-content', 75);
            }}
            className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B7A5C] ${
              activeTab === 'trips'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 active:scale-98'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{t('nav.trips', 'My Trips')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('favorites');
              smoothScrollTo('main-content', 75);
            }}
            className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B7A5C] ${
              activeTab === 'favorites'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 active:scale-98'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{t('nav.saved', 'Saved')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('pricing');
              smoothScrollTo('main-content', 75);
            }}
            className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B7A5C] ${
              activeTab === 'pricing'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 active:scale-98'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{t('nav.pricing', 'Pricing')}</span>
          </button>
        </nav>

        {/* User / Settings / Language Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Dedicated Language Switcher Component */}
          <LanguageSwitcher compact={false} />

          {/* Travel Preferences Pill */}
          <button
            type="button"
            onClick={onOpenPreferences}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-all shadow-2xs cursor-pointer active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B7A5C]"
            title="Travel Preferences & Currency"
            aria-label="Travel Preferences"
          >
            <div className="flex items-center gap-1 text-[#0B7A5C]">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{userProfile?.preferences?.preferredCurrency?.split(' ')[0] || 'USD'}</span>
            </div>
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
          </button>

          {/* Auth Button or Profile Dropdown */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 p-1 sm:pr-2.5 min-h-[38px] rounded-full bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/90 hover:border-[#0B7A5C] transition-all cursor-pointer active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B7A5C]"
                title={currentUser.displayName || 'User Profile Menu'}
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User avatar'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center font-bold text-xs ring-1 ring-[#0B7A5C]/30">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'K'}
                  </div>
                )}
                <span className="hidden sm:inline-block text-xs font-bold text-slate-700 max-w-[100px] truncate">
                  {currentUser.displayName?.split(' ')[0] || 'Explorer'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showDropdown ? 'rotate-180 text-[#0B7A5C]' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {showDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                    <p className="text-sm font-bold text-[#1E293B] truncate">
                      {currentUser.displayName || 'Khmer Explorer'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
                      <span className="text-slate-500">Wallet Balance:</span>
                      <strong className="text-[#0B7A5C] font-black text-sm">${(userProfile?.walletBalance ?? 0).toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowDropdown(false);
                        setActiveTab('pricing');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs sm:text-sm rounded-xl hover:bg-[#F8FCFA] flex items-center gap-2.5 text-slate-700 transition-colors cursor-pointer font-medium"
                    >
                      <Tag className="w-4 h-4 text-[#0B7A5C]" />
                      <span>{t('nav.pricing', 'Pricing & Top Up')}</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowDropdown(false);
                        onOpenPreferences();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs sm:text-sm rounded-xl hover:bg-[#F8FCFA] flex items-center gap-2.5 text-slate-700 transition-colors cursor-pointer font-medium"
                    >
                      <Settings className="w-4 h-4 text-[#0B7A5C]" />
                      <span>{t('nav.preferences', 'Travel Preferences')}</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs sm:text-sm rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.sign_out', 'Sign Out')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[40px] rounded-xl bg-[#0B7A5C] hover:bg-[#086048] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('nav.sign_in', 'Sign In with Google')}</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

