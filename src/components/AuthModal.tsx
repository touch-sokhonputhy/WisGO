import React, { useState } from 'react';
import { X, Sparkles, MapPin, ShieldCheck, User, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { WisgoLogo } from './WisgoLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const { language, t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      // Automatically show the instant custom form if Google OAuth fails due to domain policy
      setShowCustomForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const defaultGuestName = language === 'km' ? 'អ្នករុករកកម្ពុជា' : 'Local Khmer Explorer';
      await signInAsGuest(defaultGuestName, 'explorer@wisgo.kh');
      onClose();
    } catch (err: any) {
      setError('Failed to start guest session');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះរបស់អ្នក' : 'Please enter your name');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await signInAsGuest(customName.trim(), customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, '')}@wisgo.kh`);
      onClose();
    } catch (err) {
      setError('Failed to create custom explorer profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 text-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Soft mint accent blur */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#DFF7ED] rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#0B7A5C] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md border border-[#21C87A]/30">
            <WisgoLogo className="w-9 h-9" strokeColor="#ffffff" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E293B] tracking-tight">{t('auth.title', 'Welcome to WisGO')}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('auth.subtitle', 'Cambodian youth-led local travel platform for authentic Khmer tourism.')}
          </p>
        </div>

        {/* Value Props */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#F8FCFA] border border-slate-200">
            <Sparkles className="w-4 h-4 text-[#21C87A] shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-[#1E293B]">{t('auth.feature_1_title', 'Authentic Local Youth Insights')}</p>
              <p className="text-slate-600">{t('auth.feature_1_desc', 'Gemini-powered Khmer itineraries, local transport tips & food guide.')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#F8FCFA] border border-slate-200">
            <MapPin className="w-4 h-4 text-[#0B7A5C] shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-[#1E293B]">{t('auth.feature_2_title', 'Interactive Trip Planner & Maps')}</p>
              <p className="text-slate-600">{t('auth.feature_2_desc', 'Drag-and-drop itinerary creator with Google Maps integration.')}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-1.5">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {showCustomForm ? (
          <form onSubmit={handleCustomAccountSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'km' ? 'ឈ្មោះរបស់អ្នក' : 'Your Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder={language === 'km' ? 'ឧ. សុភា តារា' : 'e.g. Sopheak Dara'}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B7A5C] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'km' ? 'អ៊ីមែល (ជាជម្រើស)' : 'Email Address (Optional)'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="e.g. sopheak@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B7A5C] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#0B7A5C] hover:bg-[#08634a] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? (language === 'km' ? 'កំពុងបង្កើតគណនី...' : 'Creating Account...') : (language === 'km' ? 'ចូលគណនីអ្នករុករក' : 'Sign In as Explorer Account')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1 font-medium cursor-pointer"
            >
              {language === 'km' ? '← ត្រឡប់ទៅជម្រើសទាំងអស់' : '← Back to all options'}
            </button>
          </form>
        ) : (
          <div className="space-y-2.5">
            {/* Guest / Fast Explorer Sign In Button */}
            <button
              onClick={handleGuestSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0B7A5C] hover:bg-[#08634a] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <User className="w-4 h-4 text-[#21C87A]" />
              <span>{t('auth.guest_btn', 'Continue as Guest Explorer')}</span>
            </button>

            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0B7A5C] font-semibold text-xs border border-emerald-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>{t('auth.custom_btn', 'Create Instant Local Profile')}</span>
            </button>

            <div className="relative flex items-center my-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {language === 'km' ? 'ឬ គណនី Google' : 'or Google Account'}
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? (language === 'km' ? 'កំពុងភ្ជាប់...' : 'Connecting...') : t('auth.google_btn', 'Continue with Google')}</span>
            </button>
          </div>
        )}

        <p className="text-[11px] text-center text-slate-500 mt-4 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0B7A5C]" />
          <span>{language === 'km' ? 'ការពារសុវត្ថិភាពជាមួយ Firebase Authentication' : 'Secured with Firebase Authentication & Local Storage'}</span>
        </p>

      </div>
    </div>
  );
};
