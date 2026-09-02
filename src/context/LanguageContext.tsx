import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type Language = 'en' | 'km';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
  tProvince: (province: string) => string;
  tCategory: (category: string) => string;
}

export const PROVINCE_TRANSLATIONS: Record<string, { en: string; km: string }> = {
  'All': { en: 'All Provinces', km: 'ខេត្តក្រុងទាំងអស់' },
  'Siem Reap': { en: 'Siem Reap', km: 'សៀមរាប' },
  'Phnom Penh': { en: 'Phnom Penh', km: 'ភ្នំពេញ' },
  'Kampot': { en: 'Kampot', km: 'កំពត' },
  'Kep': { en: 'Kep', km: 'កែប' },
  'Battambang': { en: 'Battambang', km: 'បាត់ដំបង' },
  'Koh Rong & Sihanoukville': { en: 'Koh Rong & Sihanoukville', km: 'កោះរុង & ព្រះសីហនុ' },
  'Mondulkiri': { en: 'Mondulkiri', km: 'មណ្ឌលគិរី' },
  'Preah Vihear': { en: 'Preah Vihear', km: 'ព្រះវិហារ' },
  'Kratie': { en: 'Kratie', km: 'ក្រចេះ' },
  'Koh Kong': { en: 'Koh Kong', km: 'កោះកុង' },
  'Ratanakiri': { en: 'Ratanakiri', km: 'រតនគិរី' },
  'Pursat': { en: 'Pursat', km: 'ពោធិ៍សាត់' },
  'Kandal': { en: 'Kandal', km: 'កណ្តាល' }
};

export const CATEGORY_TRANSLATIONS: Record<string, { en: string; km: string }> = {
  'Temple & Heritage': { en: 'Temple & Heritage', km: 'ប្រាសាទ & បេតិកភណ្ឌ' },
  'Street Food & Dining': { en: 'Street Food & Dining', km: 'ម្ហូបតាមផ្លូវ & អាហារដ្ឋាន' },
  'Nature & Adventure': { en: 'Nature & Adventure', km: 'ធម្មជាតិ & ការផ្សងព្រេង' },
  'Nature & Culture': { en: 'Nature & Culture', km: 'ធម្មជាតិ & វប្បធម៌' },
  'Local Market & Craft': { en: 'Local Market & Craft', km: 'ផ្សារក្នុងស្រុក & សិប្បកម្ម' },
  'Beach & Island': { en: 'Beach & Island', km: 'ឆ្នេរខ្សាច់ & កោះ' },
  'Hotel & Eco-Lodge': { en: 'Hotel & Eco-Lodge', km: 'សណ្ឋាគារ & អេកូឡូដ' },
  'Youth Experience': { en: 'Youth Experience', km: 'បទពិសោធន៍យុវជន' }
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar & Common
    'nav.discover': 'Discover',
    'nav.map_planner': 'Map & Planner',
    'nav.ai_guide': 'AI Guide',
    'nav.saved': 'Saved',
    'nav.pricing': 'Pricing',
    'nav.tagline': 'Authentic Khmer Tourism',
    'nav.sign_in': 'Sign In with Google',
    'nav.guest_mode': 'Explorer Mode',
    'nav.sign_out': 'Sign Out',
    'nav.preferences': 'Travel Preferences',
    'nav.profile': 'My Profile',

    // Hero Section
    'hero.badge': 'Youth-Led Local Tourism in Cambodia',
    'hero.title_prefix': 'Discover Authentic',
    'hero.title_highlight': 'Khmer Experiences',
    'hero.desc': 'Explore hidden gems in Siem Reap, Kampot pepper farms, Kep seafood markets, Battambang bamboo train, and Phnom Penh royal history with your local AI guide.',
    'hero.ask_ai_btn': 'Ask WisGO AI Guide',
    'hero.view_map_btn': 'View Map & Planner',

    // Explore & Filters
    'explore.search_placeholder': 'Search Angkor Wat, Kampot pepper, Kep crab, street food...',
    'explore.saved_destinations': 'Saved Destinations',
    'explore.ask_ai': 'Ask AI Guide',
    'explore.entry_fee': 'Entry Fee',
    'explore.all_provinces': 'All Provinces',
    'explore.no_results': 'No destinations found matching your search.',
    'explore.clear_search': 'Clear Search',
    'explore.remove': 'Remove',
    'explore.no_saved': "You haven't saved any destinations yet.",
    'explore.explore_destinations': 'Explore Destinations',
    'explore.free_entry': 'Free Entry',

    // Weather Widget
    'weather.title_suffix': 'Weather',
    'weather.subtitle': 'Live Khmer forecast & travel advisories',
    'weather.live': 'Live',
    'weather.wind_speed': 'Wind Speed',
    'weather.timezone': 'Timezone',
    'weather.advisory_title': 'Khmer Travel Advisory:',
    'weather.3day_outlook': '3-Day Outlook',
    'weather.refresh': 'Refresh weather',
    'weather.fetching': 'Fetching real-time weather...',
    'weather.retry': 'Retry',

    // Map & Planner
    'planner.title': 'Cambodia Trip Itinerary Planner',
    'planner.subtitle': 'Drag and reorder your activities, calculate routes & view on Google Maps',
    'planner.day': 'Day',
    'planner.add_day': '+ Add Day',
    'planner.add_activity': 'Add Activity',
    'planner.ai_generate': 'AI Itinerary Generator',
    'planner.save_itinerary': 'Save Itinerary',
    'planner.saved_places': 'Saved Destinations',
    'planner.all_places': 'All Destinations',
    'planner.drag_hint': 'Drag and drop spots into your daily schedule',
    'planner.no_activities': 'No activities added for this day yet. Drag destinations from the left or click "Add Activity".',
    'planner.time': 'Time',
    'planner.duration': 'Duration',
    'planner.location': 'Location',
    'planner.activity_title': 'Activity Title',
    'planner.description': 'Description & Notes',
    'planner.transport_tip': 'Transport Tip (PassApp/Tuk-Tuk)',
    'planner.cancel': 'Cancel',
    'planner.confirm_add': 'Add to Day',
    'planner.save_success': 'Itinerary saved successfully!',
    'planner.sign_in_to_save': 'Sign in to save your itinerary to Firebase',
    'planner.estimated_route': 'Estimated Route',
    'planner.open_maps': 'Open in Google Maps',
    'planner.delete_activity': 'Remove activity',

    // AI Assistant
    'assistant.title': 'WisGO AI Local Travel Assistant',
    'assistant.subtitle': 'Powered by Gemini 3.6 Flash',
    'assistant.input_placeholder': 'Ask anything about Siem Reap, Kampot pepper, Kep crab, or PassApp tuk-tuks...',
    'assistant.send': 'Send',
    'assistant.loading': 'WisGO AI is preparing local Cambodian insights...',
    'assistant.starter_1': '3-Day Siem Reap & Angkor Itinerary',
    'assistant.starter_1_q': 'Generate a 3-day authentic Siem Reap itinerary including Angkor Wat sunrise, Bayon, and Pub Street Khmer street food.',
    'assistant.starter_2': 'Kampot & Kep Weekend Trip',
    'assistant.starter_2_q': 'What is the best 2-day plan to experience Kampot pepper farms, kayaking down the river, and fresh Kep crab market?',
    'assistant.starter_3': 'Essential Khmer Phrases',
    'assistant.starter_3_q': 'Provide 5 essential Khmer phrases for ordering food and greeting locals, written with English phonetics and Khmer script.',
    'assistant.starter_4': 'PassApp Tuk-Tuk & Currency Guide',
    'assistant.starter_4_q': 'Explain USD ($) and Cambodian Riel (KHR) dual currency usage, PassApp tuk-tuk pricing, and tipping in Cambodia.',

    // Currency Converter
    'currency.title': 'Multi-Region Currency Converter',
    'currency.live_rate': 'Live Rate:',
    'currency.select_home': 'Select Your Home Currency:',
    'currency.home_curr_label': 'Your Home Currency',
    'currency.usd_label': 'US Dollar ($ USD)',
    'currency.usd_sub': 'Primary Foreign Currency in KH',
    'currency.khr_label': 'Cambodian Riel (KHR ៛)',
    'currency.khr_sub': 'Local Khmer Currency',
    'currency.quick_presets': 'Quick Khmer Travel Presets:',
    'currency.copy_rate': 'Copy Rate',
    'currency.copied': 'Copied!',
    'currency.ask_fair_price': 'Ask AI Fair Price',
    'currency.dual_tip': 'Cambodia uses a dual-currency system (USD & KHR ៛). Change under $1 USD is given back in Cambodian Riel.',

    // Preferences Modal
    'pref.title': 'Traveler Preferences',
    'pref.subtitle': 'Personalize how WisGO AI customizes itineraries and local Cambodia recommendations for you.',
    'pref.language': 'Preferred Language',
    'pref.currency': 'Preferred Currency',
    'pref.interests': 'Travel Interests',
    'pref.dietary': 'Dietary Restrictions',
    'pref.save': 'Save Preferences',
    'pref.saving': 'Saving...',

    // Auth Modal
    'auth.title': 'Welcome to WisGO',
    'auth.subtitle': 'Cambodian youth-led local travel platform for authentic Khmer tourism.',
    'auth.google_btn': 'Continue with Google',
    'auth.guest_btn': 'Continue as Guest Explorer',
    'auth.custom_btn': 'Create Instant Local Profile',
    'auth.feature_1_title': 'Authentic Local Youth Insights',
    'auth.feature_1_desc': 'Gemini-powered Khmer itineraries, local transport tips & food guide.',
    'auth.feature_2_title': 'Interactive Trip Planner & Maps',
    'auth.feature_2_desc': 'Drag-and-drop itinerary creator with Google Maps integration.',
    'auth.feature_3_title': 'Cloud Sync & Saved Places',
    'auth.feature_3_desc': 'Sync your favorite temples, spots, and itineraries with Firebase.',

    // Footer
    'footer.copyright': 'WisGO — Authentic Cambodian Youth Local Travel Platform.',
    'footer.built_with': 'Built with Google Maps API • Gemini AI Assistant • Firebase'
  },

  km: {
    // Navbar & Common
    'nav.discover': 'ស្វែងរក',
    'nav.map_planner': 'ផែនទី & គម្រោង',
    'nav.ai_guide': 'មគ្គុទ្ទេសក៍ AI',
    'nav.saved': 'បានរក្សាទុក',
    'nav.pricing': 'តម្លៃ & គម្រោង',
    'nav.tagline': 'ទេសចរណ៍ខ្មែរពិតៗ',
    'nav.sign_in': 'ចូលគណនី Google',
    'nav.guest_mode': 'របៀបអ្នករុករក',
    'nav.sign_out': 'ចាកចេញ',
    'nav.preferences': 'ការកំណត់ចំណង់ចំណូលចិត្ត',
    'nav.profile': 'ព័ត៌មានគណនីខ្ញុំ',

    // Hero Section
    'hero.badge': 'ទេសចរណ៍យុវជនក្នុងស្រុកនៅកម្ពុជា',
    'hero.title_prefix': 'ស្វែងយល់ពី',
    'hero.title_highlight': 'បទពិសោធន៍ខ្មែរពិតៗ',
    'hero.desc': 'រុករកតំបន់ទេសចរណ៍លាក់មុខនៅសៀមរាប ចំការម្រេចកំពត ផ្សារគ្រឿងសមុទ្រកែប រថភ្លើងឫស្សីបាត់ដំបង និងប្រវត្តិសាស្ត្ររាជធានីភ្នំពេញ ជាមួយមគ្គុទ្ទេសក៍ AI របស់អ្នក។',
    'hero.ask_ai_btn': 'សួរមគ្គុទ្ទេសក៍ WisGO AI',
    'hero.view_map_btn': 'មើលផែនទី & គម្រោងធ្វើដំណើរ',

    // Explore & Filters
    'explore.search_placeholder': 'ស្វែងរកប្រាសាទអង្គរវត្ត, ម្រេចកំពត, ក្តាមកែប, ម្ហូបតាមផ្លូវ...',
    'explore.saved_destinations': 'កន្លែងដែលបានរក្សាទុក',
    'explore.ask_ai': 'សួរមគ្គុទ្ទេសក៍ AI',
    'explore.entry_fee': 'តម្លៃសំបុត្រចូល',
    'explore.all_provinces': 'ខេត្តក្រុងទាំងអស់',
    'explore.no_results': 'រកមិនឃើញទីតាំងដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ។',
    'explore.clear_search': 'សម្អាតការស្វែងរក',
    'explore.remove': 'លុបចេញ',
    'explore.no_saved': 'អ្នកមិនទាន់បានរក្សាទុកទីតាំងណាមួយនៅឡើយទេ។',
    'explore.explore_destinations': 'រុករកទីតាំងកម្សាន្ត',
    'explore.free_entry': 'ចូលទស្សនាឥតគិតថ្លៃ',

    // Weather Widget
    'weather.title_suffix': 'អាកាសធាតុ',
    'weather.subtitle': 'ការព្យាករណ៍អាកាសធាតុផ្ទាល់ & ដំបូន្មានធ្វើដំណើរ',
    'weather.live': 'ផ្សាយផ្ទាល់',
    'weather.wind_speed': 'ល្បឿនខ្យល់',
    'weather.timezone': 'តំបន់ម៉ោង',
    'weather.advisory_title': 'ដំបូន្មានធ្វើដំណើរនៅកម្ពុជា៖',
    'weather.3day_outlook': 'ការព្យាករណ៍ ៣ ថ្ងៃខាងមុខ',
    'weather.refresh': 'ផ្ទុកអាកាសធាតុឡើងវិញ',
    'weather.fetching': 'កំពុងទាញយកទិន្នន័យអាកាសធាតុផ្ទាល់...',
    'weather.retry': 'ព្យាយាមម្តងទៀត',

    // Map & Planner
    'planner.title': 'កម្មវិធីរៀបចំគម្រោងធ្វើដំណើរកម្ពុជា',
    'planner.subtitle': 'ទាញរៀបចំសកម្មភាព គណនាផ្លូវ និងមើលលើ Google Maps',
    'planner.day': 'ថ្ងៃទី',
    'planner.add_day': '+ បន្ថែមថ្ងៃថ្មី',
    'planner.add_activity': 'បន្ថែមសកម្មភាព',
    'planner.ai_generate': 'បង្កើតគម្រោងដោយ AI',
    'planner.save_itinerary': 'រក្សាទុកគម្រោង',
    'planner.saved_places': 'កន្លែងដែលបានរក្សាទុក',
    'planner.all_places': 'ទីតាំងទាំងអស់',
    'planner.drag_hint': 'ទាញទម្លាក់ទីតាំងចូលទៅក្នុងកាលវិភាគប្រចាំថ្ងៃរបស់អ្នក',
    'planner.no_activities': 'មិនទាន់មានសកម្មភាពសម្រាប់ថ្ងៃនេះនៅឡើយទេ។ ទាញទីតាំងពីខាងឆ្វេង ឬចុច "បន្ថែមសកម្មភាព"។',
    'planner.time': 'ពេលវេលា',
    'planner.duration': 'រយៈពេល',
    'planner.location': 'ទីតាំង',
    'planner.activity_title': 'ឈ្មោះសកម្មភាព',
    'planner.description': 'ការពិពណ៌នា & កំណត់ចំណាំ',
    'planner.transport_tip': 'ព័ត៌មានមធ្យោបាយធ្វើដំណើរ (PassApp/តុកតុក)',
    'planner.cancel': 'បោះបង់',
    'planner.confirm_add': 'បន្ថែមទៅក្នុងថ្ងៃ',
    'planner.save_success': 'បានរក្សាទុកគម្រោងធ្វើដំណើរដោយជោគជ័យ!',
    'planner.sign_in_to_save': 'សូមចូលគណនីដើម្បីរក្សាទុកគម្រោងរបស់អ្នកទៅ Firebase',
    'planner.estimated_route': 'ផ្លូវធ្វើដំណើរដែលបានប៉ាន់ស្មាន',
    'planner.open_maps': 'បើកមើលលើ Google Maps',
    'planner.delete_activity': 'លុបសកម្មភាព',

    // AI Assistant
    'assistant.title': 'WisGO AI ជំនួយការទេសចរណ៍កម្ពុជា',
    'assistant.subtitle': 'ដំណើរការដោយ Gemini 3.6 Flash',
    'assistant.input_placeholder': 'សួរអំពីសៀមរាប, ម្រេចកំពត, ក្តាមកែប, ឬតម្លៃជិះ PassApp...',
    'assistant.send': 'ផ្ញើ',
    'assistant.loading': 'WisGO AI កំពុងរៀបចំព័ត៌មានទេសចរណ៍ក្នុងស្រុក...',
    'assistant.starter_1': 'គម្រោងដើរលេងសៀមរាប ៣ ថ្ងៃ',
    'assistant.starter_1_q': 'សូមជួយរៀបចំគម្រោងដើរលេងសៀមរាប ៣ ថ្ងៃ រួមទាំងការមើលថ្ងៃរះនៅអង្គរវត្ត ប្រាសាទបាយ័ន និងម្ហូបតាមផ្លូវនៅ Pub Street។',
    'assistant.starter_2': 'ដំណើរកម្សាន្តចុងសប្តាហ៍កំពត & កែប',
    'assistant.starter_2_q': 'តើគម្រោង ២ ថ្ងៃទៅលេងចំការម្រេចកំពត ជិះទូកកាយ៉ាក់លើដងព្រែក និងញ៉ាំក្តាមស្រស់នៅផ្សារកែបយ៉ាងដូចម្តេច?',
    'assistant.starter_3': 'ឃ្លាភាសាខ្មែរសំខាន់ៗ',
    'assistant.starter_3_q': 'សូមផ្តល់ឃ្លាភាសាខ្មែរសំខាន់ៗចំនួន ៥ សម្រាប់កម្ម៉ង់ម្ហូប និងស្វាគមន៍អ្នកស្រុក ដោយសរសេរជាអក្សរខ្មែរ និងសូរសព្ទអង់គ្លេស។',
    'assistant.starter_4': 'មគ្គុទ្ទេសក៍ PassApp និងការប្រើលុយ',
    'assistant.starter_4_q': 'សូមពន្យល់ពីការប្រើប្រាស់លុយដុល្លារ ($) និងប្រាក់រៀល (KHR) នៅកម្ពុជា តម្លៃជិះ PassApp និងការឱ្យធីប (tip)។',

    // Currency Converter
    'currency.title': 'កម្មវិធីប្តូរប្រាក់ពហុតំបន់',
    'currency.live_rate': 'អត្រាប្តូរប្រាក់ផ្ទាល់៖',
    'currency.select_home': 'ជ្រើសរើសរូបិយប័ណ្ណប្រទេសរបស់អ្នក៖',
    'currency.home_curr_label': 'រូបិយប័ណ្ណប្រទេសរបស់អ្នក',
    'currency.usd_label': 'ដុល្លារអាមេរិក ($ USD)',
    'currency.usd_sub': 'រូបិយប័ណ្ណបរទេសចម្បងនៅកម្ពុជា',
    'currency.khr_label': 'ប្រាក់រៀលខ្មែរ (KHR ៛)',
    'currency.khr_sub': 'រូបិយប័ណ្ណជាតិកម្ពុជា',
    'currency.quick_presets': 'តម្លៃរហ័សសម្រាប់ការចាយវាយនៅកម្ពុជា៖',
    'currency.copy_rate': 'ចម្លងអត្រា',
    'currency.copied': 'បានចម្លង!',
    'currency.ask_fair_price': 'សួរ AI អំពីតម្លៃសមរម្យ',
    'currency.dual_tip': 'ប្រទេសកម្ពុជាប្រើប្រាស់រូបិយប័ណ្ណពីរ (USD និង KHR ៛)។ លុយអាប់ក្រោម $1 USD នឹងត្រូវអាប់ជាប្រាក់រៀល។',

    // Preferences Modal
    'pref.title': 'ចំណង់ចំណូលចិត្តអ្នកធ្វើដំណើរ',
    'pref.subtitle': 'កំណត់ការណែនាំរបស់ WisGO AI ឱ្យត្រូវនឹងចំណង់ចំណូលចិត្ត និងការធ្វើដំណើររបស់អ្នកនៅកម្ពុជា។',
    'pref.language': 'ភាសាដែលចូលចិត្ត',
    'pref.currency': 'រូបិយប័ណ្ណដែលចូលចិត្ត',
    'pref.interests': 'ចំណាប់អារម្មណ៍ធ្វើដំណើរ',
    'pref.dietary': 'របបអាហារពិសេស',
    'pref.save': 'រក្សាទុកការកំណត់',
    'pref.saving': 'កំពុងរក្សាទុក...',

    // Auth Modal
    'auth.title': 'សូមស្វាគមន៍មកកាន់ WisGO',
    'auth.subtitle': 'វេទិកាទេសចរណ៍យុវជនក្នុងស្រុកសម្រាប់បទពិសោធន៍ខ្មែរពិតៗ។',
    'auth.google_btn': 'បន្តជាមួយ Google',
    'auth.guest_btn': 'បន្តជាអ្នករុករកទូទៅ',
    'auth.custom_btn': 'បង្កើតគណនីអ្នករុករកផ្ទាល់ខ្លួន',
    'auth.feature_1_title': 'ការណែនាំពីយុវជនក្នុងស្រុក',
    'auth.feature_1_desc': 'គម្រោងធ្វើដំណើរដំណើរការដោយ Gemini មធ្យោបាយធ្វើដំណើរក្នុងស្រុក និងអាហារឆ្ងាញ់ៗ។',
    'auth.feature_2_title': 'កម្មវិធីរៀបចំគម្រោង & ផែនទី',
    'auth.feature_2_desc': 'រៀបចំកាលវិភាគធ្វើដំណើរដោយទាញទម្លាក់ ភ្ជាប់ជាមួយ Google Maps។',
    'auth.feature_3_title': 'រក្សាទុកទិន្នន័យលើ Cloud',
    'auth.feature_3_desc': 'រក្សាទុកប្រាសាទ ទីតាំង និងគម្រោងដែលអ្នកចូលចិត្តជាមួយ Firebase។',

    // Footer
    'footer.copyright': 'WisGO — វេទិកាទេសចរណ៍យុវជនក្នុងស្រុកនៅកម្ពុជា។',
    'footer.built_with': 'បង្កើតឡើងដោយ Google Maps API • Gemini AI Assistant • Firebase'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
  tProvince: (province: string) => province,
  tCategory: (category: string) => category,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateUserPreferences } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');

  // Sync language with user profile if available
  useEffect(() => {
    const prefLang = userProfile?.preferences?.preferredLanguage;
    if (prefLang === 'Khmer' || prefLang === 'km' || prefLang === 'Khmer (ភាសាខ្មែរ)') {
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

  const tProvince = (province: string): string => {
    if (language === 'km') {
      return PROVINCE_TRANSLATIONS[province]?.km || province;
    }
    return PROVINCE_TRANSLATIONS[province]?.en || province;
  };

  const tCategory = (category: string): string => {
    if (language === 'km') {
      return CATEGORY_TRANSLATIONS[category]?.km || category;
    }
    return CATEGORY_TRANSLATIONS[category]?.en || category;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, tProvince, tCategory }}>
      {children}
    </LanguageContext.Provider>
  );
};

