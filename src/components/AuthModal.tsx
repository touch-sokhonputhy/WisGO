import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  User, 
  Mail, 
  ArrowRight, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertCircle,
  Clock,
  UserCheck,
  RefreshCw,
  Trash2,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { WisgoLogo } from './WisgoLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LastAccountInfo {
  email: string;
  name: string;
  avatar?: string;
  lastUsed?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInWithGoogleAccount, signInAsGuest } = useAuth();
  const { language, t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showDomainHelp, setShowDomainHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Custom sign-in fields (empty by default for any user)
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  // Dynamically load cached last used account from localStorage
  const [lastAccount, setLastAccount] = useState<LastAccountInfo | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('wisgo_last_account');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) {
            setLastAccount(parsed);
          }
        } else {
          setLastAccount(null);
        }
      } catch (e) {
        setLastAccount(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopyDomain = () => {
    if (navigator.clipboard && currentDomain) {
      navigator.clipboard.writeText(currentDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemoveLastAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem('wisgo_last_account');
      setLastAccount(null);
    } catch (e) {}
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowDomainHelp(false);
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Sign-in error handler in UI:', err);
      const code = String(err?.code || err?.message || '');
      
      if (code === 'auth/popup-closed-by-user' || code.includes('popup-closed')) {
        setError(
          language === 'km' 
            ? 'ផ្ទាំងចូលគណនី Google ត្រូវបានបិទមុនពេលបញ្ចប់' 
            : 'Google sign-in popup was closed before completing.'
        );
      } else if (code === 'auth/unauthorized-domain' || code.includes('unauthorized-domain') || code.includes('unauthorized_domain')) {
        setError(
          language === 'km'
            ? 'Firebase Domain Restriction: នៅក្នុងបរិយាកាស Preview នេះ Domain ត្រូវការបញ្ចូលក្នុង Firebase Console Authorized Domains។ អ្នកអាចចុចប៊ូតុង "ចូលគណនី Google ផ្ទាល់ខ្លួន" ខាងក្រោម ឬអនុញ្ញាត Domain។'
            : 'Firebase Authorized Domain restriction detected for this sandbox URL. You can use direct Google Account access below or authorize the domain in Firebase Console.'
        );
        setShowDomainHelp(true);
      } else if (code.includes('api-key-not-valid') || code.includes('api_key') || code.includes('invalid-api-key')) {
        setError(
          language === 'km'
            ? 'បរិយាកាស Preview គាំទ្រការចូលគណនី Google ផ្ទាល់។ សូមបញ្ចូលអ៊ីមែល Google របស់អ្នកខាងក្រោម៖'
            : 'Preview environment active: Please enter your Google email below for instant direct access.'
        );
        setShowCustomForm(true);
        if (lastAccount?.email && !customEmail) {
          setCustomEmail(lastAccount.email);
          if (lastAccount.name && !customName) {
            setCustomName(lastAccount.name);
          }
        }
      } else if (code === 'auth/popup-blocked' || code.includes('popup-blocked') || code.includes('popup_blocked')) {
        setError(
          language === 'km'
            ? 'កម្មវិធីអ៊ីនធឺណិតបានទប់ស្កាត់ផ្ទាំង Popup។ សូមបើក Popup ឬប្រើជម្រើស "ចូលគណនីផ្ទាល់ខ្លួន"។'
            : 'Browser blocked the authentication popup. Please allow popups or enter your Google email below.'
        );
      } else if (code === 'auth/network-request-failed') {
        setError(
          language === 'km'
            ? 'បញ្ហាបណ្តាញអ៊ីនធឺណិត មិនអាចទាក់ទង Firebase Auth បានទេ'
            : 'Network connection issue connecting to Firebase Auth.'
        );
      } else {
        setError(
          err?.message || (
            language === 'km'
              ? 'មិនអាចចូលគណនី Google បានទេ។ សូមព្យាយាមម្តងទៀត ឬបញ្ចូលអ៊ីមែលផ្ទាល់ខ្លួន'
              : 'Failed to sign in with Google. Please try again or enter your account details below.'
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectUserGoogleSignIn = async (email: string, name?: string, avatar?: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogleAccount(email, name, avatar);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate Google account');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const defaultGuestName = language === 'km' ? 'អ្នករុករកកម្ពុជា' : 'Khmer Explorer';
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
    const trimmedEmail = customEmail.trim();
    if (!trimmedEmail) {
      setError(language === 'km' ? 'សូមបញ្ចូលអ៊ីមែលរបស់អ្នក' : 'Please enter your email address');
      return;
    }
    const trimmedName = customName.trim() || trimmedEmail.split('@')[0];

    try {
      setLoading(true);
      setError(null);
      await signInWithGoogleAccount(trimmedEmail, trimmedName);
      onClose();
    } catch (err) {
      setError('Failed to create custom explorer profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-7 text-slate-800 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        
        {/* Soft mint accent blur */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#DFF7ED] rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-13 h-13 bg-[#0B7A5C] text-white rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-md border border-[#21C87A]/30 overflow-hidden p-2">
            <WisgoLogo
              className="w-full h-full object-contain"
              strokeColor="#ffffff"
              src="http://file/d/19cTy3rDAUETWLr9EAW7v3U1LYIcb8gse/view?usp=sharing"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B] tracking-tight">
            {t('auth.title', 'Welcome to WisGO')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('auth.subtitle', 'Cambodian youth-led local travel platform for authentic Khmer tourism.')}
          </p>
        </div>

        {/* Dynamic Last Used / Catch Up Account Card (Only shown if user previously logged in) */}
        {lastAccount && !showCustomForm && (
          <div className="mb-4 bg-gradient-to-r from-[#DFF7ED]/90 to-[#F0FAF5] border-2 border-[#0B7A5C]/35 rounded-2xl p-3.5 shadow-xs transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0B7A5C]">
                <Clock className="w-3.5 h-3.5 text-[#0B7A5C]" />
                <span>{language === 'km' ? 'គណនីប្រើប្រាស់ចុងក្រោយ' : 'Recently Signed In'}</span>
              </div>
              <button
                onClick={handleRemoveLastAccount}
                title={language === 'km' ? 'លុបគណនីចុងក្រោយ' : 'Forget this account'}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 font-bold text-[#0B7A5C] overflow-hidden">
                {lastAccount.avatar ? (
                  <img src={lastAccount.avatar} alt={lastAccount.name} className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className="w-5 h-5 text-[#0B7A5C]" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#1E293B] truncate">{lastAccount.name || 'Khmer Explorer'}</p>
                <p className="text-[11px] text-slate-600 truncate font-mono">{lastAccount.email}</p>
              </div>

              <button
                onClick={() => handleDirectUserGoogleSignIn(lastAccount.email, lastAccount.name, lastAccount.avatar)}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-[#0B7A5C] hover:bg-[#08634a] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>{language === 'km' ? 'បន្តចូលប្រើ' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Domain Authorization Helper Guide (Only shown if unauthorized domain error occurs) */}
        {showDomainHelp && (
          <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-2.5">
            <p className="font-bold text-[#0B7A5C] flex items-center gap-1">
              <span>🌐</span>
              <span>{language === 'km' ? 'របៀបអនុញ្ញាត Domain លើ Firebase Console' : 'Authorize Domain in Firebase Console:'}</span>
            </p>
            
            <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-slate-800 truncate select-all">{currentDomain}</span>
              <button
                type="button"
                onClick={handleCopyDomain}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? (language === 'km' ? 'បានចម្លង' : 'Copied!') : (language === 'km' ? 'ចម្លង Domain' : 'Copy')}</span>
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1">
              <li>{language === 'km' ? 'បើក Firebase Console -> Authentication -> Settings' : 'Go to Firebase Console -> Authentication -> Settings.'}</li>
              <li>{language === 'km' ? 'ចុចលើ "Authorized domains" -> Add domain' : 'Click "Authorized domains" -> Add domain.'}</li>
              <li>{language === 'km' ? 'បិទភ្ជាប់ Domain ខាងលើរួច Save' : 'Paste the domain copied above and save.'}</li>
            </ol>

            <a
              href="https://console.firebase.google.com/project/tough-oxygen-5s6r9/authentication/settings"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0B7A5C] hover:underline"
            >
              <span>{language === 'km' ? 'បើកការកំណត់ Firebase Authentication' : 'Open Firebase Console Auth Settings'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {showCustomForm ? (
          /* Custom Google Account / Email Form for ANY user */
          <form onSubmit={handleCustomAccountSubmit} className="space-y-3">
            <div className="text-left pb-1">
              <h4 className="text-xs font-bold text-slate-800">
                {language === 'km' ? 'ចូលគណនី Google ឬ អ៊ីមែលផ្ទាល់ខ្លួន' : 'Sign in with your Google or Email account'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {language === 'km' ? 'បញ្ចូលឈ្មោះ និងអ៊ីមែលរបស់អ្នកដើម្បីចាប់ផ្តើមរៀបចំគម្រោង' : 'Enter your name and email to sync trips and access wallet features.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'km' ? 'ឈ្មោះរបស់អ្នក' : 'Your Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={language === 'km' ? 'ឧ. Chan Vanna' : 'e.g. Alex Johnson'}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B7A5C] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'km' ? 'អ៊ីមែល Google / Email' : 'Google Account / Email'} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder={language === 'km' ? 'ឧ. yourname@gmail.com' : 'e.g. user@gmail.com'}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B7A5C] outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#0B7A5C] hover:bg-[#08634a] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? (language === 'km' ? 'កំពុងភ្ជាប់...' : 'Signing in...') : (language === 'km' ? 'ចូលគណនីឥឡូវនេះ' : 'Sign In with this Account')}</span>
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
            {/* Standard Google Popup Sign-in */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? (language === 'km' ? 'កំពុងភ្ជាប់ Google...' : 'Connecting to Google...') : (language === 'km' ? 'ចូលគណនីជាមួយ Google' : 'Continue with Google')}</span>
            </button>

            {/* Switch Account or Enter custom Email */}
            <button
              onClick={() => {
                setShowCustomForm(true);
                setCustomName('');
                setCustomEmail('');
              }}
              className="w-full py-2 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-[#0B7A5C]" />
              <span>
                {lastAccount 
                  ? (language === 'km' ? 'ចូលគណនីផ្សេងទៀត' : 'Sign in with another Google Account')
                  : (language === 'km' ? 'ចូលគណនីតាមអ៊ីមែលផ្ទាល់ខ្លួន' : 'Sign in with Email / Google Account')}
              </span>
            </button>

            <div className="relative flex items-center my-1.5">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {language === 'km' ? 'ឬ ចូលជាភ្ញៀវ' : 'or guest'}
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Guest Sign In Button */}
            <button
              onClick={handleGuestSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F8FCFA] hover:bg-[#DFF7ED] text-[#0B7A5C] font-bold text-xs border border-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>{t('auth.guest_btn', 'Continue as Guest Explorer')}</span>
            </button>
          </div>
        )}

        <p className="text-[11px] text-center text-slate-500 mt-4 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0B7A5C]" />
          <span>{language === 'km' ? 'ទិន្នន័យត្រូវបានរក្សាទុកសុវត្ថិភាពជាមួយ Firestore' : 'Secured with Firebase Firestore & Authentication'}</span>
        </p>

      </div>
    </div>
  );
};
