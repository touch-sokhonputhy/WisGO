import React, { useState } from 'react';
import { X, Globe, DollarSign, Heart, Utensils, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = ['English', 'Japanese', 'Spanish', 'French', 'German', 'Chinese', 'Korean', 'Thai'];
const CURRENCIES = [
  'USD ($)', 
  'EUR (€)', 
  'JPY (¥)', 
  'GBP (£)', 
  'AUD ($)', 
  'CAD ($)', 
  'SGD ($)', 
  'CNY (¥)'
];
const INTEREST_OPTIONS = [
  'Historical Sites',
  'Local Food & Dining',
  'Scenic Nature & Parks',
  'Cultural Landmarks',
  'Shopping & Markets',
  'Museums & Art',
  'Nightlife & Entertainment',
  'Hidden Gems'
];
const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-Free',
  'Nut Allergy',
  'Seafood Free'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserPreferences } = useAuth();

  const [language, setLanguage] = useState(userProfile?.preferences?.preferredLanguage || 'English');
  const [currency, setCurrency] = useState(userProfile?.preferences?.preferredCurrency || 'USD ($)');
  const [interests, setInterests] = useState<string[]>(userProfile?.preferences?.interests || ['Historical Sites', 'Local Food & Dining']);
  const [dietary, setDietary] = useState<string[]>(userProfile?.preferences?.dietaryRestrictions || []);
  const [saved, setSaved] = useState(false);

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
    await updateUserPreferences({
      preferredLanguage: language,
      preferredCurrency: currency,
      interests,
      dietaryRestrictions: dietary
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <span>Traveler Preferences</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Personalize your AI assistant and search filters for foreign tourism in WisGO.
        </p>

        <div className="space-y-6">
          
          {/* Preferred Language & Currency Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Preferred Language */}
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Preferred Language</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Preferred Currency */}
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Display Currency</span>
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {CURRENCIES.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Travel Interests */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Travel Interests & Style</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(item => {
                const active = interests.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                      active
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 inline-block mr-1 text-amber-400" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Dietary Preferences / Restrictions</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(item => {
                const active = dietary.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleDietary(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 inline-block mr-1 text-emerald-400" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Save CTA */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
