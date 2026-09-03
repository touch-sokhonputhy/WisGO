import React, { useState } from 'react';
import { X, Globe, DollarSign, Heart, Utensils, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = ['English', 'Khmer (ភាសាខ្មែរ)', 'French', 'Chinese', 'Japanese', 'Korean', 'Spanish', 'German'];
const CURRENCIES = ['USD ($)', 'KHR (៛)'];

const INTEREST_OPTIONS = [
  { en: 'Temples & Heritage', km: 'ប្រាសាទ & បេតិកភណ្ឌ' },
  { en: 'Local Street Food', km: 'ម្ហូបតាមផ្លូវក្នុងស្រុក' },
  { en: 'Nature & Rivers', km: 'ធម្មជាតិ & ដងព្រែក' },
  { en: 'Markets & Handcrafts', km: 'ផ្សារ & សិប្បកម្មខ្មែរ' },
  { en: 'Beaches & Islands', km: 'ឆ្នេរខ្សាច់ & កោះទេសចរណ៍' },
  { en: 'Highland & Eco-Tourism', km: 'តំបន់ខ្ពង់រាប & អេកូទេសចរណ៍' },
  { en: 'Youth Hangouts', km: 'កន្លែងជួបជុំយុវជន' },
  { en: 'Photography & Sunsets', km: 'ការថតរូប & ទិដ្ឋភាពថ្ងៃលិច' }
];

const DIETARY_OPTIONS = [
  { en: 'Vegetarian', km: 'បួស (Vegetarian)' },
  { en: 'Vegan', km: 'បួសសុទ្ធ (Vegan)' },
  { en: 'Halal', km: 'ហាឡាល់ (Halal)' },
  { en: 'Gluten-Free', km: 'គ្មានជាតិស្អិត (Gluten-Free)' },
  { en: 'No Seafood', km: 'មិនញ៉ាំគ្រឿងសមុទ្រ' },
  { en: 'No Peanut', km: 'មិនញ៉ាំសណ្តែកដី' }
];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserPreferences } = useAuth();
  const { language, setLanguage: setGlobalLanguage, t } = useLanguage();
  const currentPrefs = userProfile?.preferences;

  const [prefLanguage, setPrefLanguage] = useState(currentPrefs?.preferredLanguage || (language === 'km' ? 'Khmer (ភាសាខ្មែរ)' : 'English'));
  const [currency, setCurrency] = useState(currentPrefs?.preferredCurrency || 'USD ($)');
  const [interests, setInterests] = useState<string[]>(currentPrefs?.interests || ['Temples & Heritage', 'Local Street Food']);
  const [dietary, setDietary] = useState<string[]>(currentPrefs?.dietaryRestrictions || []);
  const [saving, setSaving] = useState(false);

  // Sync state whenever modal opens or preferences update
  React.useEffect(() => {
    if (isOpen && currentPrefs) {
      if (currentPrefs.preferredCurrency) setCurrency(currentPrefs.preferredCurrency);
      if (currentPrefs.preferredLanguage) setPrefLanguage(currentPrefs.preferredLanguage);
      if (currentPrefs.interests) setInterests(currentPrefs.interests);
      if (currentPrefs.dietaryRestrictions) setDietary(currentPrefs.dietaryRestrictions);
    }
  }, [isOpen, currentPrefs]);

  if (!isOpen) return null;

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter(i => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const toggleDietary = (item: string) => {
    if (dietary.includes(item)) {
      setDietary(dietary.filter(d => d !== item));
    } else {
      setDietary([...dietary, item]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Automatically synchronize global language context if changed
    if (prefLanguage.includes('Khmer') || prefLanguage === 'km') {
      setGlobalLanguage('km');
    } else {
      setGlobalLanguage('en');
    }

    await updateUserPreferences({
      preferredLanguage: prefLanguage,
      preferredCurrency: currency,
      interests,
      dietaryRestrictions: dietary
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 sm:p-8 text-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-[#1E293B] mb-1">{t('pref.title', 'Travel Preferences')}</h2>
        <p className="text-xs text-slate-500 mb-6">
          {t('pref.subtitle', 'Personalize how WisGO AI customizes itineraries and local Cambodia recommendations for you.')}
        </p>

        <div className="space-y-5">
          {/* Language Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Globe className="w-4 h-4 text-[#0B7A5C]" />
              <span>{t('pref.language', 'Preferred Language')}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setPrefLanguage(lang)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                    prefLanguage === lang
                      ? 'bg-[#0B7A5C] text-white border-[#0B7A5C]'
                      : 'bg-[#F8FCFA] text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <DollarSign className="w-4 h-4 text-[#0B7A5C]" />
              <span>{t('pref.currency', 'Display Currency')}</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CURRENCIES.map(curr => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                    currency === curr
                      ? 'bg-[#0B7A5C] text-white border-[#0B7A5C]'
                      : 'bg-[#F8FCFA] text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Heart className="w-4 h-4 text-[#0B7A5C]" />
              <span>{t('pref.interests', 'Travel Interests in Cambodia')}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(item => {
                const label = language === 'km' ? item.km : item.en;
                const isSelected = interests.includes(item.en) || interests.includes(item.km);
                return (
                  <button
                    key={item.en}
                    type="button"
                    onClick={() => toggleInterest(item.en)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#DFF7ED] text-[#0B7A5C] border-[#21C87A]'
                        : 'bg-[#F8FCFA] text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Utensils className="w-4 h-4 text-[#0B7A5C]" />
              <span>{t('pref.dietary', 'Dietary Preferences')}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(item => {
                const label = language === 'km' ? item.km : item.en;
                const isSelected = dietary.includes(item.en) || dietary.includes(item.km);
                return (
                  <button
                    key={item.en}
                    type="button"
                    onClick={() => toggleDietary(item.en)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#DFF7ED] text-[#0B7A5C] border-[#21C87A]'
                        : 'bg-[#F8FCFA] text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {language === 'km' ? 'បោះបង់' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            {saving ? t('pref.saving', 'Saving...') : t('pref.save', 'Save Preferences')}
          </button>
        </div>

      </div>
    </div>
  );
};
