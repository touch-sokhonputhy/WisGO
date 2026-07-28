import React from 'react';
import { Compass, MapPin, Sparkles, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MobileBottomNavProps {
  activeTab: 'explore' | 'planner' | 'assistant' | 'favorites';
  setActiveTab: (tab: 'explore' | 'planner' | 'assistant' | 'favorites') => void;
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
      id: 'favorites' as const,
      label: t('nav.saved', 'Saved'),
      icon: Heart,
      badge: savedCount,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg">
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative cursor-pointer ${
                isActive
                  ? 'text-[#0B7A5C] font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'scale-110 text-[#0B7A5C]'
                      : item.highlight
                      ? 'text-[#0B7A5C]'
                      : 'text-slate-500'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold truncate max-w-full">
                {item.label}
              </span>

              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#0B7A5C] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
