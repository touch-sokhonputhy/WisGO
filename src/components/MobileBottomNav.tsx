import React from 'react';
import { Compass, MapPin, Sparkles, Heart, Tag, Bookmark } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { scrollToTop } from '../utils/scrollUtils';

interface MobileBottomNavProps {
  activeTab: 'explore' | 'planner' | 'assistant' | 'trips' | 'favorites' | 'pricing';
  setActiveTab: (tab: 'explore' | 'planner' | 'assistant' | 'trips' | 'favorites' | 'pricing') => void;
  savedCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
}) => {
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'explore' as const,
      label: t('nav.discover', 'Discover'),
      icon: Compass,
    },
    {
      id: 'planner' as const,
      label: t('nav.map_planner', 'Map'),
      icon: MapPin,
    },
    {
      id: 'assistant' as const,
      label: t('nav.ai_guide', 'AI Guide'),
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'trips' as const,
      label: t('nav.trips', 'Trips'),
      icon: Bookmark,
    },
    {
      id: 'favorites' as const,
      label: t('nav.saved', 'Saved'),
      icon: Heart,
      badge: savedCount,
    },
    {
      id: 'pricing' as const,
      label: t('nav.pricing', 'Pricing'),
      icon: Tag,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1.5 pt-1 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-6 gap-0.5 max-w-md mx-auto items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (typeof window !== 'undefined' && window.scrollY > 120) {
                  scrollToTop('smooth');
                }
              }}
              className={`flex flex-col items-center justify-center min-h-[46px] py-1 px-0.5 rounded-xl transition-all relative cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-[#0B7A5C] font-bold bg-[#DFF7ED]/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-4.5 h-4.5 transition-transform duration-200 ${
                    isActive
                      ? 'scale-110 text-[#0B7A5C]'
                      : item.highlight
                      ? 'text-[#0B7A5C]'
                      : 'text-slate-500'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 bg-rose-500 text-white text-[9px] font-extrabold px-1 py-0.2 rounded-full min-w-[14px] text-center leading-tight shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold truncate max-w-full leading-none tracking-tight">
                {item.label}
              </span>

              {isActive && (
                <span className="absolute top-0 w-6 h-0.5 bg-[#0B7A5C] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
