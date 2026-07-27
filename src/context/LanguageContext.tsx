import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type Language = 'en' | 'km';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.discover': 'Discover',
    'nav.map_planner': 'Map & Planner',
    'nav.ai_guide': 'AI Guide',
    'nav.saved': 'Saved',
    'nav.tagline': 'Authentic Khmer Tourism',
    'nav.sign_in': 'Sign In with Google',
    'nav.sign_out': 'Sign Out',
    'nav.preferences': 'Travel Preferences',

    // Explore
    'explore.search_placeholder': 'Search Angkor Wat, Kampot pepper, Kep crab...',
    'explore.saved_destinations': 'Saved Destinations',
    'explore.ask_ai': 'Ask AI Guide',
    'explore.entry_fee': 'Entry Fee',
    'explore.all_provinces': 'All Provinces',
    
    // AI Assistant
    'assistant.title': 'WisGO AI Local Travel Assistant',
    'assistant.subtitle': 'Powered by Gemini 3.6 Flash',
    'assistant.input_placeholder': 'Ask anything about Siem Reap, Kampot pepper, Kep crab, or PassApp tuk-tuks...',
    'assistant.copy_rate': 'Copy Rate',
    'assistant.copied': 'Copied!',
    'assistant.ask_ai_price': 'Ask AI Price',

    // Preferences
    'pref.title': 'Traveler Preferences',
    'pref.language': 'Preferred Language',
    'pref.currency': 'Preferred Currency',
    'pref.interests': 'Travel Interests',
    'pref.save': 'Save Preferences'
  },
  km: {
    // Navbar
    'nav.discover': 'ស្វែងរក',
    'nav.map_planner': 'ផែនទី & គម្រោង',
    'nav.ai_guide': 'មគ្គុទ្ទេសក៍ AI',
    'nav.saved': 'បានរក្សាទុក',
    'nav.tagline': 'ទេសចរណ៍ខ្មែរពិតៗ',
    'nav.sign_in': 'ចូលគណនី Google',
    'nav.sign_out': 'ចាកចេញ',
    'nav.preferences': 'ការកំណត់ចំណង់ចំណូលចិត្ត',

    // Explore
    'explore.search_placeholder': 'ស្វែងរកប្រាសាទអង្គរវត្ត, ម្រេចកំពត, ក្តាមកែប...',
    'explore.saved_destinations': 'កន្លែងដែលបានរក្សាទុក',
    'explore.ask_ai': 'សួរមគ្គុទ្ទេសក៍ AI',
    'explore.entry_fee': 'តម្លៃសំបុត្រចូល',
    'explore.all_provinces': 'ខេត្តក្រុងទាំងអស់',

    // AI Assistant
    'assistant.title': 'WisGO AI ជំនួយការទេសចរណ៍កម្ពុជា',
    'assistant.subtitle': 'ដំណើរការដោយ Gemini 3.6 Flash',
    'assistant.input_placeholder': 'សួរអំពីសៀមរាប, ម្រេចកំពត, ក្តាមកែប, ឬតម្លៃ PassApp...',
    'assistant.copy_rate': 'ចម្លងអត្រាប្តូរប្រាក់',
    'assistant.copied': 'បានចម្លង!',
    'assistant.ask_ai_price': 'សួរ AI អំពីតម្លៃ',

    // Preferences
    'pref.title': 'ចំណង់ចំណូលចិត្តអ្នកធ្វើដំណើរ',
    'pref.language': 'ភាសាដែលចូលចិត្ត',
    'pref.currency': 'រូបិយប័ណ្ណដែលចូលចិត្ត',
    'pref.interests': 'ចំណាប់អារម្មណ៍ធ្វើដំណើរ',
    'pref.save': 'រក្សាទុកការកំណត់'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateUserPreferences } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');

  // Sync language with user profile if available
  useEffect(() => {
    const prefLang = userProfile?.preferences?.preferredLanguage;
    if (prefLang === 'Khmer' || prefLang === 'km') {
      setLanguageState('km');
    } else if (prefLang === 'English' || prefLang === 'en') {
      setLanguageState('en');
    }
  }, [userProfile?.preferences?.preferredLanguage]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (userProfile) {
      updateUserPreferences({
        preferredLanguage: lang === 'km' ? 'Khmer' : 'English'
      });
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'km' : 'en';
    setLanguage(newLang);
  };

  const t = (key: string, defaultText?: string): string => {
    return translations[language]?.[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
