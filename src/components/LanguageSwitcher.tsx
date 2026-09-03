import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; name: string; localName: string; flag: string }[] = [
    { code: 'en', name: 'English', localName: 'English', flag: '🇬🇧' },
    { code: 'km', name: 'Khmer', localName: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-xl bg-[#F8FCFA] hover:bg-[#DFF7ED] border border-slate-200 hover:border-[#0B7A5C] text-xs font-bold text-slate-700 hover:text-[#0B7A5C] transition-all cursor-pointer shadow-2xs shrink-0"
        title="Switch Language / ជ្រើសរើសភាសា"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="font-semibold">{compact ? currentLang.code.toUpperCase() : currentLang.localName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Globe className="w-3 h-3 text-[#0B7A5C]" />
            <span>Select Language / ភាសា</span>
          </div>

          {languages.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                onClick={() => {
                  setLanguage(item.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#DFF7ED] text-[#0B7A5C]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.flag}</span>
                  <div>
                    <p className="leading-none">{item.localName}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{item.name}</p>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-[#0B7A5C]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
