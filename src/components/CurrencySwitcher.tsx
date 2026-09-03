import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, SlidersHorizontal, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
  khmerName: string;
  flag: string;
  fullLabel: string;
}

export const SUPPORTED_CURRENCIES: CurrencyItem[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', khmerName: 'ដុល្លារអាមេរិក', flag: '🇺🇸', fullLabel: 'USD ($)' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel', khmerName: 'ប្រាក់រៀលខ្មែរ', flag: '🇰🇭', fullLabel: 'KHR (៛)' },
];

interface CurrencySwitcherProps {
  onOpenPreferences?: () => void;
  compact?: boolean;
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  onOpenPreferences,
  compact = false
}) => {
  const { userProfile, updateUserPreferences } = useAuth();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rawPref = userProfile?.preferences?.preferredCurrency || 'USD ($)';
  
  // Find current currency config
  const currentCurrency = SUPPORTED_CURRENCIES.find(
    c => rawPref.toUpperCase().includes(c.code) || c.fullLabel === rawPref
  ) || SUPPORTED_CURRENCIES[1]; // fallback USD

  const isKhmer = currentCurrency.code === 'KHR';

  // Handle clicking outside & Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectCurrency = async (curr: CurrencyItem) => {
    await updateUserPreferences({
      preferredCurrency: curr.fullLabel
    });
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button - Main Currency Pill */}
      <button
        type="button"
        id="currency-switcher-btn"
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B7A5C] ${
          isKhmer
            ? 'bg-[#EBFBF4] hover:bg-[#DDF6EC] border-[#0B7A5C]/40 text-[#0B7A5C]'
            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
        }`}
        title={`Switch Currency (USD / KHR Riel) • Current: ${currentCurrency.name} / ប្តូររូបិយប័ណ្ណ`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="text-sm shrink-0 select-none">{currentCurrency.flag}</span>
        
        <span className={`font-black flex items-center gap-1 ${isKhmer ? 'text-[#0B7A5C]' : 'text-slate-800'}`}>
          <span className="text-xs">{currentCurrency.symbol}</span>
          <span>{currentCurrency.code}</span>
        </span>

        {isKhmer && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0B7A5C] animate-pulse" />
        )}

        <ChevronDown 
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            isKhmer ? 'text-[#0B7A5C]' : 'text-slate-400'
          } ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          role="menu"
        >
          {/* Header */}
          <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-[#0B7A5C]" />
              <span>{language === 'km' ? 'រូបិយប័ណ្ណ' : 'Display Currency'}</span>
            </span>
            <span className="text-[9px] font-bold text-[#0B7A5C] bg-[#E8F8F2] px-1.5 py-0.5 rounded-md">
              1 $ ≈ 4,050 ៛
            </span>
          </div>

          {/* Currencies List (USD & Riel Only) */}
          <div className="py-1">
            {SUPPORTED_CURRENCIES.map((item) => {
              const isSelected = currentCurrency.code === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectCurrency(item)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EBFBF4] text-[#0B7A5C]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{item.flag}</span>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900">{item.code}</span>
                        <span className="text-xs font-bold text-slate-500">({item.symbol})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium truncate">
                        {language === 'km' ? item.khmerName : item.name}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <Check className="w-4 h-4 text-[#0B7A5C] shrink-0 ml-2 stroke-[2.5]" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Bottom Settings Link */}
          {onOpenPreferences && (
            <div className="border-t border-slate-100 pt-1 mt-1 px-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenPreferences();
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#0B7A5C] hover:bg-[#F8FCFA] flex items-center justify-between transition-colors cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'km' ? 'ចំណូលចិត្តធ្វើដំណើរ...' : 'More Preferences...'}</span>
                </div>
                <span className="text-[10px] text-slate-400">&rarr;</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
