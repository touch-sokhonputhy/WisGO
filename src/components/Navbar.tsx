import React, { useState } from 'react';
import { Compass, Sparkles, User as UserIcon, LogOut, Settings, Globe, DollarSign, MapPin, Heart, Tag, Bookmark } from 'lucide-react';
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

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800 sticky top-0 z-50 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo - WisGO Cambodia */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            onClick={() => {
              setActiveTab('explore');
              smoothScrollTo('main-content', 75);
            }}
            className="flex items-center gap-2 sm:gap-2.5 min-h-[40px] text-lg sm:text-xl font-black tracking-tight text-[#1E293B] hover:opacity-90 transition-opacity cursor-pointer group"
          >
            <div className="bg-[#F0FDF8] border-1.5 border-[#0B7A5C]/40 group-hover:border-[#0B7A5C] p-1.5 rounded-xl shadow-2xs flex items-center justify-center transition-colors">
              <WisgoLogo className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeColor="#0B7A5C" />
            </div>
            <span className="font-extrabold tracking-tight">Wis<span className="text-[#0B7A5C]">GO</span></span>
          </button>
          
          <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#DFF7ED] text-[#0B7A5C] border border-[#21C87A]/30">
            <span>🇰🇭</span> {t('nav.tagline', 'Authentic Khmer Tourism')}
          </span>
        </div>

        {/* Desktop & Tablet Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => {
              setActiveTab('explore');
              smoothScrollTo('explore-section', 75);
            }}
            className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t('nav.explore', 'Explore')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('planner');
              smoothScrollTo('map-section', 75);
            }}
            className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t('nav.map_planner', 'Map & Planner')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('assistant');
              smoothScrollTo('main-content', 75);
            }}
            className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'assistant'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#21C87A]" />
            <span>{t('nav.ai_guide', 'AI Guide')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('trips');
              smoothScrollTo('main-content', 75);
            }}
            className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'trips'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{t('nav.trips', 'My Trips')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('favorites');
              smoothScrollTo('main-content', 75);
            }}
            className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{t('nav.saved', 'Saved')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pricing');
              smoothScrollTo('main-content', 75);
            }}
            className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{t('nav.pricing', 'Pricing')}</span>
          </button>
        </nav>

        {/* User / Settings / Language Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Dedicated Language Switcher Component */}
          <LanguageSwitcher compact={false} />

          {/* Preferred Currency Pill */}
          <button
            onClick={onOpenPreferences}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Travel Preferences"
          >
            <div className="flex items-center gap-1 text-[#0B7A5C]">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{userProfile?.preferences?.preferredCurrency?.split(' ')[0] || 'USD'}</span>
            </div>
          </button>

          {/* Auth Button or Profile Badge */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1 min-h-[38px] min-w-[38px] rounded-full bg-slate-100/80 border border-slate-200 hover:border-[#0B7A5C] transition-colors cursor-pointer"
                title={currentUser.displayName || 'User Profile'}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center font-bold text-xs">
                    {currentUser.displayName ? currentUser.displayName[0] : 'K'}
                  </div>
                )}
              </button>

              {/* Profile Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-50 text-slate-800">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-bold text-[#1E293B] truncate">
                      {currentUser.displayName || 'Khmer Explorer'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">Wallet:</span>
                      <strong className="text-[#0B7A5C] font-extrabold">${(userProfile?.walletBalance ?? 0).toFixed(2)}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setActiveTab('pricing');
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[#F8FCFA] flex items-center gap-2.5 text-slate-700 transition-colors"
                  >
                    <Tag className="w-4 h-4 text-[#0B7A5C]" />
                    <span>{t('nav.pricing', 'Pricing & Top Up')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onOpenPreferences();
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[#F8FCFA] flex items-center gap-2.5 text-slate-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#0B7A5C]" />
                    <span>{t('nav.preferences', 'Travel Preferences')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.sign_out', 'Sign Out')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[40px] rounded-xl bg-[#0B7A5C] hover:bg-[#086048] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
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

