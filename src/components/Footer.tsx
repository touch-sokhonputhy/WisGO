import React from 'react';
import { Globe, ExternalLink, Mail, MapPin, Sparkles, Heart, Compass, ShieldCheck, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { WisgoLogo } from './WisgoLogo';
import { FacebookIcon, TikTokIcon, YoutubeIcon } from './SocialIcons';

interface FooterProps {
  onSelectProvince?: (province: string) => void;
  onNavigateTab?: (tab: 'explore' | 'planner' | 'assistant' | 'favorites' | 'pricing') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectProvince, onNavigateTab }) => {
  const { t, language } = useLanguage();

  const socialLinks = [
    {
      name: 'Facebook',
      handle: '@wisgokh',
      url: 'https://www.facebook.com/wisgokh',
      icon: FacebookIcon,
      color: 'hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/30',
      iconColor: 'text-[#1877F2]',
      badgeColor: 'bg-[#1877F2] text-white',
      desc: language === 'km' ? 'តាមដានព័ត៌មាន & ព្រឹត្តិការណ៍' : 'Official Page & Stories'
    },
    {
      name: 'TikTok',
      handle: '@wisgokh',
      url: 'https://www.tiktok.com/@wisgokh',
      icon: TikTokIcon,
      color: 'hover:bg-slate-900/10 hover:text-slate-900 hover:border-slate-400',
      iconColor: 'text-slate-900',
      badgeColor: 'bg-[#000000] text-white',
      desc: language === 'km' ? 'វីដេអូដំណើរកម្សាន្តខ្លីៗ' : 'Short Travel Videos'
    },
    {
      name: 'YouTube',
      handle: '@Wisgokh',
      url: 'https://www.youtube.com/@Wisgokh',
      icon: YoutubeIcon,
      color: 'hover:bg-[#FF0000]/10 hover:text-[#FF0000] hover:border-[#FF0000]/30',
      iconColor: 'text-[#FF0000]',
      badgeColor: 'bg-[#FF0000] text-white',
      desc: language === 'km' ? 'វីដេអូទេសចរណ៍ & វប្បធម៌ពេញលេញ' : 'Vlogs & Cultural Docs'
    },
    {
      name: 'WisGO Official',
      handle: 'wisgokh.com',
      url: 'https://wisgokh.com/',
      icon: Globe,
      color: 'hover:bg-[#0B7A5C]/10 hover:text-[#0B7A5C] hover:border-[#0B7A5C]/30',
      iconColor: 'text-[#0B7A5C]',
      badgeColor: 'bg-[#0B7A5C] text-white',
      desc: language === 'km' ? 'គេហទំព័រផ្លូវការ WisGO' : 'Official Web Portal'
    }
  ];

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700 mt-16 pt-12 pb-24 md:pb-12 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Brand + Social Connect Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-100">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-white border-2 border-[#0B7A5C] p-1.5 rounded-xl shadow-xs flex items-center justify-center">
                <WisgoLogo className="w-6 h-6" strokeColor="#0B7A5C" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#1E293B]">
                Wis<span className="text-[#0B7A5C]">GO</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DFF7ED] text-[#0B7A5C] border border-[#21C87A]/30">
                🇰🇭 wisgokh.com
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
              {language === 'km'
                ? 'វេទិកាទេសចរណ៍យុវជនខ្មែរពិតៗ ភ្ជាប់អ្នកដំណើរទៅកាន់គោលដៅទេសចរណ៍វប្បធម៌ ម្ហូបឆ្ងាញ់ក្នុងស្រុក និងរៀបចំគម្រោងធ្វើដំណើរជាមួយ AI។'
                : 'Authentic Cambodian youth-led travel platform connecting global explorers with local cultural treasures, street cuisine, and AI-driven itineraries.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#0B7A5C]" />
                {language === 'km' ? 'ទេសចរណ៍ក្នុងស្រុកផ្ទៀងផ្ទាត់' : 'Verified Local Insights'}
              </span>
              <span>•</span>
              <a 
                href="https://wisgokh.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#0B7A5C] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>wisgokh.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Social Links Cards */}
          <div className="lg:col-span-7">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#21C87A]" />
              <span>{language === 'km' ? 'ភ្ជាប់ទំនាក់ទំនងបណ្ដាញសង្គម WisGO' : 'Connect with WisGO on Social Media'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-[#F8FCFA] transition-all group shadow-xs ${social.color}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform ${social.iconColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#1E293B] group-hover:text-inherit transition-colors">
                            {social.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {social.handle}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {social.desc}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-inherit shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* Quick Destinations Navigation */}
        <div className="py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs border-b border-slate-100">
          <div>
            <h5 className="font-bold text-[#1E293B] uppercase tracking-wider text-[11px] mb-3">
              {language === 'km' ? 'គោលដៅកំពូល' : 'Top Destinations'}
            </h5>
            <ul className="space-y-2 text-slate-600">
              <li>
                <button 
                  onClick={() => onSelectProvince?.('Siem Reap')} 
                  className="hover:text-[#0B7A5C] transition-colors cursor-pointer"
                >
                  Siem Reap (Angkor Wat)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectProvince?.('Phnom Penh')} 
                  className="hover:text-[#0B7A5C] transition-colors cursor-pointer"
                >
                  Phnom Penh (Royal Palace)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectProvince?.('Kampot')} 
                  className="hover:text-[#0B7A5C] transition-colors cursor-pointer"
                >
                  Kampot (Pepper & River)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectProvince?.('Kep')} 
                  className="hover:text-[#0B7A5C] transition-colors cursor-pointer"
                >
                  Kep (Crab Market & Beach)
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#1E293B] uppercase tracking-wider text-[11px] mb-3">
              {language === 'km' ? 'ធម្មជាតិ & ការផ្សងព្រេង' : 'Nature & Adventure'}
            </h5>
            <ul className="space-y-2 text-slate-600">
              <li>
                <button 
                  onClick={() => onSelectProvince?.('Mondulkiri')} 
                  className="hover:text-[#0B7A5C] transition-colors cursor-pointer"
                >
                  Mondulkiri (Bousra & Elephants)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectProvince?.('Koh Kong')} 
                  className="hover:text-[#0B7A5C] transition-colors cursor-pointer"
                >
                  Koh Kong (Tatai Rainforest)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectProvince?.('Ratanakiri')} 
                  className="hover:text-[#0B7A5C] transition-colors cursor-pointer"
                >
                  Ratanakiri (Yeak Laom Lake)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectProvince?.('Kratie')} 
                  className="hover:text-[#0B7A5C] transition-colors cursor-pointer"
                >
                  Kratie (Mekong Dolphins)
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#1E293B] uppercase tracking-wider text-[11px] mb-3">
              {language === 'km' ? 'ឧបករណ៍ទេសចរណ៍' : 'Travel Features'}
            </h5>
            <ul className="space-y-2 text-slate-600">
              <li>
                <button 
                  onClick={() => onNavigateTab?.('planner')} 
                  className="hover:text-[#0B7A5C] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>{t('nav.map_planner', 'Interactive Map & Planner')}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateTab?.('assistant')} 
                  className="hover:text-[#0B7A5C] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#21C87A]" />
                  <span>{t('nav.ai_guide', 'Gemini AI Assistant')}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateTab?.('favorites')} 
                  className="hover:text-[#0B7A5C] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t('nav.saved', 'Saved Spots')}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateTab?.('pricing')} 
                  className="hover:text-[#0B7A5C] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>{t('nav.pricing', 'Pricing & Trip Pass')}</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#1E293B] uppercase tracking-wider text-[11px] mb-3">
              {language === 'km' ? 'បណ្តាញផ្លូវការ' : 'Official Channels'}
            </h5>
            <div className="space-y-2.5">
              <a 
                href="https://wisgokh.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-700 hover:text-[#0B7A5C] group transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center shrink-0">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">wisgokh.com</span>
              </a>
              <a 
                href="https://www.tiktok.com/@wisgokh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-700 hover:text-black group transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-800 group-hover:bg-slate-200 flex items-center justify-center shrink-0">
                  <TikTokIcon className="w-3.5 h-3.5" />
                </div>
                <span>TikTok <span className="text-slate-400 font-mono text-[10px]">@wisgokh</span></span>
              </a>
              <a 
                href="https://www.youtube.com/@Wisgokh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-700 hover:text-[#FF0000] group transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-red-50 text-[#FF0000] flex items-center justify-center shrink-0">
                  <YoutubeIcon className="w-3.5 h-3.5" />
                </div>
                <span>YouTube <span className="text-slate-400 font-mono text-[10px]">@Wisgokh</span></span>
              </a>
              <a 
                href="https://www.facebook.com/wisgokh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-700 hover:text-[#1877F2] group transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
                  <FacebookIcon className="w-3.5 h-3.5" />
                </div>
                <span>Facebook <span className="text-slate-400 font-mono text-[10px]">@wisgokh</span></span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} WisGO Cambodia (<a href="https://wisgokh.com/" target="_blank" rel="noopener noreferrer" className="text-[#0B7A5C] hover:underline font-medium">wisgokh.com</a>). {language === 'km' ? 'រក្សាសិទ្ធិគ្រប់យ៉ាង។' : 'All rights reserved.'}</p>
          <div className="flex items-center gap-3">
            <span>Google Maps API</span>
            <span>•</span>
            <span>Gemini AI</span>
            <span>•</span>
            <span>Firebase</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
