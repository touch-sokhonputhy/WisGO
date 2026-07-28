import React, { useState } from 'react';
import { Compass, Sparkles, User as UserIcon, LogOut, Settings, Globe, DollarSign, MapPin, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { WisgoLogo } from './WisgoLogo';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  onOpenPreferences: () => void;
  onOpenAuthModal: () => void;
  activeTab: 'explore' | 'planner' | 'assistant' | 'favorites';
  setActiveTab: (tab: 'explore' | 'planner' | 'assistant' | 'favorites') => void;
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
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 text-slate-800 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo - WisGO Cambodia */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#1E293B] hover:opacity-90 transition-opacity"
          >
            <div className="bg-white border-2 border-[#0B7A5C] p-1.5 rounded-xl shadow-xs flex items-center justify-center">
              <WisgoLogo className="w-6 h-6" strokeColor="#0B7A5C" />
            </div>
            <span>Wis<span className="text-[#0B7A5C]">GO</span></span>
          </button>
          
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#DFF7ED] text-[#0B7A5C] border border-[#21C87A]/30">
            <span>🇰🇭</span> {t('nav.tagline', 'Authentic Khmer Tourism')}
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#F8FCFA] p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'explore'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t('nav.discover', 'Discover')}</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'planner'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{t('nav.map_planner', 'Map & Planner')}</span>
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'assistant'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#21C87A]" />
            <span>{t('nav.ai_guide', 'AI Guide')}</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'favorites'
                ? 'bg-[#0B7A5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t('nav.saved', 'Saved')}</span>
          </button>
        </nav>

        {/* User / Settings / Language Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Dedicated Language Switcher Component */}
          <LanguageSwitcher />

          {/* Preferred Currency Pill */}
          <button
            onClick={onOpenPreferences}
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FCFA] hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors shadow-xs"
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
                className="flex items-center gap-2 p-1 rounded-full bg-[#F8FCFA] border border-slate-200 hover:border-[#0B7A5C] transition-colors"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center font-bold text-xs">
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
                  </div>

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
              className="px-3 sm:px-4 py-2 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.sign_in', 'Sign In with Google')}</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

