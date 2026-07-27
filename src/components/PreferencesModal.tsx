import React, { useState } from 'react';
import { X, Globe, DollarSign, Heart, Utensils, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = ['English', 'Khmer (ភាសាខ្មែរ)', 'French', 'Chinese', 'Japanese', 'Korean', 'Spanish', 'German'];
const CURRENCIES = ['USD ($)', 'KHR (៛)', 'EUR (€)', 'GBP (£)', 'AUD ($)', 'JPY (¥)'];
const INTEREST_OPTIONS = [
  'Temples & Heritage',
  'Local Street Food',
  'Nature & Rivers',
  'Markets & Handcrafts',
  'Beaches & Islands',
  'Highland & Eco-Tourism',
  'Youth Hangouts',
  'Photography & Sunsets'
];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'No Seafood', 'No Peanut'];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserPreferences } = useAuth();
  const currentPrefs = userProfile?.preferences;

  const [language, setLanguage] = useState(currentPrefs?.preferredLanguage || 'English');
  const [currency, setCurrency] = useState(currentPrefs?.preferredCurrency || 'USD ($)');
  const [interests, setInterests] = useState<string[]>(currentPrefs?.interests || ['Temples & Heritage', 'Local Street Food']);
  const [dietary, setDietary] = useState<string[]>(currentPrefs?.dietaryRestrictions || []);
  const [saving, setSaving] = useState(false);

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
    await updateUserPreferences({
      preferredLanguage: language,
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

        <h2 className="text-xl font-bold text-[#1E293B] mb-1">Travel Preferences</h2>
        <p className="text-xs text-slate-500 mb-6">
          Personalize how WisGO AI customizes itineraries and local Cambodia recommendations for you.
        </p>

        <div className="space-y-5">
          {/* Language Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Globe className="w-4 h-4 text-[#0B7A5C]" />
              <span>Preferred Language</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                    language === lang
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
              <span>Display Currency</span>
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
              <span>Travel Interests in Cambodia</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(item => {
                const isSelected = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#DFF7ED] text-[#0B7A5C] border-[#21C87A]'
                        : 'bg-[#F8FCFA] text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Utensils className="w-4 h-4 text-[#0B7A5C]" />
              <span>Dietary Preferences</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(item => {
                const isSelected = dietary.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDietary(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#DFF7ED] text-[#0B7A5C] border-[#21C87A]'
                        : 'bg-[#F8FCFA] text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{item}</span>
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
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

      </div>
    </div>
  );
};
