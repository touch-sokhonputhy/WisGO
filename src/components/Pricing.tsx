import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Heart, 
  MapPin, 
  Compass, 
  Clock, 
  HelpCircle, 
  CreditCard, 
  QrCode, 
  FileText, 
  ArrowRight, 
  DollarSign, 
  Star,
  CheckCircle2,
  XCircle,
  X,
  Wallet,
  LogIn,
  Receipt,
  Download,
  Building2,
  Lock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { WisgoLogo } from './WisgoLogo';
import { TransactionRecord } from '../types';

interface PricingProps {
  onNavigateTab: (tab: 'explore' | 'planner' | 'assistant' | 'trips' | 'favorites' | 'pricing') => void;
  onOpenAuthModal?: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onNavigateTab, onOpenAuthModal }) => {
  const { t, language } = useLanguage();
  const { currentUser, userProfile, topUpWallet, chargeSubscription, cancelSubscription } = useAuth();

  // Modals state
  const [selectedPlanModal, setSelectedPlanModal] = useState<'trip-pass' | 'wisgo-plus' | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currencyMode, setCurrencyMode] = useState<'both' | 'usd' | 'khr'>('both');

  // Checkout flow state
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'khqr' | 'card' | 'aba'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<TransactionRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Top Up custom amount state
  const [topUpAmount, setTopUpAmount] = useState<number>(10);
  const [customTopUpInput, setCustomTopUpInput] = useState<string>('');
  const [topUpMethod, setTopUpMethod] = useState<'khqr' | 'card' | 'aba'>('khqr');
  const [khqrTimer, setKhqrTimer] = useState<number>(180);

  // Card form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const KHR_RATE = 4100; // 1 USD ~ 4,100 KHR

  // Reset KHQR timer when modal opens
  useEffect(() => {
    let interval: any;
    if ((selectedPlanModal || isTopUpOpen) && (paymentMethod === 'khqr' || topUpMethod === 'khqr')) {
      setKhqrTimer(180);
      interval = setInterval(() => {
        setKhqrTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedPlanModal, isTopUpOpen, paymentMethod, topUpMethod]);

  // Synchronize currency display mode when preferred currency changes
  useEffect(() => {
    const pref = userProfile?.preferences?.preferredCurrency;
    if (pref) {
      if (pref.includes('KHR')) {
        setCurrencyMode('khr');
      } else if (pref.includes('USD')) {
        setCurrencyMode('usd');
      }
    }
  }, [userProfile?.preferences?.preferredCurrency]);

  const currentWalletBalance = userProfile?.walletBalance ?? 0;
  const currentPlan = userProfile?.subscription?.status === 'active' ? userProfile.subscription.plan : 'free';

  const formatPrice = (usd: number, periodSuffix: string = '') => {
    const khr = Math.round(usd * KHR_RATE);
    const khrFormatted = khr.toLocaleString();

    if (usd === 0) {
      return {
        primary: '$0',
        secondary: '0 ៛',
        period: language === 'km' ? 'ឥតគិតថ្លៃរហូត' : 'Free forever'
      };
    }

    if (currencyMode === 'usd') {
      return {
        primary: `$${usd.toFixed(2)}`,
        secondary: '',
        period: periodSuffix
      };
    }

    if (currencyMode === 'khr') {
      return {
        primary: `${khrFormatted} ៛`,
        secondary: `($${usd.toFixed(2)})`,
        period: periodSuffix
      };
    }

    return {
      primary: `$${usd.toFixed(2)}`,
      secondary: `≈ ${khrFormatted} ៛`,
      period: periodSuffix
    };
  };

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      onNavigateTab('explore');
      return;
    }

    // Require authentication to top up or charge subscription
    if (!currentUser) {
      if (onOpenAuthModal) {
        onOpenAuthModal();
      }
      return;
    }

    setSelectedPlanModal(planId as 'trip-pass' | 'wisgo-plus');
    setPaymentMethod(currentWalletBalance >= (planId === 'trip-pass' ? 2.99 : 4.99) ? 'wallet' : 'khqr');
    setCompletedTx(null);
    setErrorMessage(null);
    setIsProcessing(false);
  };

  const handleOpenTopUp = () => {
    if (!currentUser) {
      if (onOpenAuthModal) {
        onOpenAuthModal();
      }
      return;
    }
    setIsTopUpOpen(true);
    setCompletedTx(null);
    setErrorMessage(null);
    setIsProcessing(false);
  };

  const executeCharge = async (plan: 'trip-pass' | 'wisgo-plus', price: number) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Simulate real bank/gateway delay
      await new Promise(resolve => setTimeout(resolve, 1400));

      let methodKey: 'wallet_balance' | 'bakong_khqr' | 'credit_card' | 'aba_pay' = 'wallet_balance';
      if (paymentMethod === 'khqr') methodKey = 'bakong_khqr';
      if (paymentMethod === 'card') methodKey = 'credit_card';
      if (paymentMethod === 'aba') methodKey = 'aba_pay';

      const result = await chargeSubscription(plan, price, methodKey);
      setCompletedTx(result.transaction);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeTopUp = async () => {
    const amount = customTopUpInput ? parseFloat(customTopUpInput) : topUpAmount;
    if (!amount || isNaN(amount) || amount <= 0) {
      setErrorMessage(language === 'km' ? 'សូមបញ្ចូលចំនួនទឹកប្រាក់ត្រឹមត្រូវ' : 'Please enter a valid amount.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1400));
      let methodKey: 'bakong_khqr' | 'credit_card' | 'aba_pay' = 'bakong_khqr';
      if (topUpMethod === 'card') methodKey = 'credit_card';
      if (topUpMethod === 'aba') methodKey = 'aba_pay';

      const tx = await topUpWallet(amount, methodKey);
      setCompletedTx(tx);
    } catch (err: any) {
      setErrorMessage(err.message || 'Top-up failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: language === 'km' ? 'ឥតគិតថ្លៃ (Free)' : 'Free',
      badge: language === 'km' ? 'អ្នករុករកទូទៅ' : 'Casual Explorer',
      usdPrice: 0,
      period: language === 'km' ? 'ឥតគិតថ្លៃជារៀងរហូត' : 'Free forever',
      description: language === 'km' 
        ? 'ល្អឥតខ្ចោះសម្រាប់ការស្វែងរកគោលដៅទេសចរណ៍ និងមើលព័ត៌មានអាកាសធាតុទូទៅនៅកម្ពុជា។' 
        : 'Perfect for browsing Khmer destinations, viewing maps, and checking real-time weather.',
      isPopular: false,
      ctaText: language === 'km' ? 'ចាប់ផ្តើមឥតគិតថ្លៃ' : 'Start Exploring Free',
      ctaStyle: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs',
      features: [
        { text: language === 'km' ? 'ការរៀបចំគម្រោងជាមួយ AI កម្រិតមូលដ្ឋាន' : 'Basic AI trip planning', included: true },
        { text: language === 'km' ? 'កាលវិភាគធ្វើដំណើរកម្រិតមូលដ្ឋាន' : 'Basic itinerary', included: true },
        { text: language === 'km' ? 'ការណែនាំគោលដៅទេសចរណ៍' : 'Destination recommendations', included: true },
        { text: language === 'km' ? 'ព័ត៌មានអាកាសធាតុផ្ទាល់ ៣ ថ្ងៃ' : 'Weather information', included: true },
        { text: language === 'km' ? 'ការប៉ាន់ស្មានថវិកាកម្រិតមូលដ្ឋាន' : 'Basic budget estimation', included: true },
        { text: language === 'km' ? 'កែសម្រួលគម្រោងជាមួយ AI គ្មានដែនកំណត់' : 'Unlimited AI itinerary adjustments', included: false },
        { text: language === 'km' ? 'ទាញយក និងចែករំលែកកាលវិភាគ' : 'Share/download itinerary', included: false },
        { text: language === 'km' ? 'ការណែនាំម្ហូប និងកន្លែងពិសេសផ្ទាល់ខ្លួន' : 'Personalized local recommendations', included: false },
      ]
    },
    {
      id: 'trip-pass',
      name: language === 'km' ? 'Trip Pass (ដំណើរកម្សាន្ត)' : 'Trip Pass',
      badge: language === 'km' ? '★ ពេញនិយម & ណែនាំខ្លាំងបំផុត' : '★ Recommended for Visitors',
      subBadge: language === 'km' ? 'សមរម្យបំផុតសម្រាប់ដំណើរកម្សាន្ត ១ លើកនៅកម្ពុជា' : 'Affordable for a single Cambodia vacation',
      usdPrice: 2.99,
      period: language === 'km' ? '/ ១ ដំណើរកម្សាន្ត' : '/ trip',
      description: language === 'km' 
        ? 'ជម្រើសស័ក្តិសមបំផុតសម្រាប់ភ្ញៀវទេសចរដែលមកកម្ពុជា ១-២ សប្តាហ៍ ដោយទទួលបានការកែសម្រួលគម្រោងពេញលេញ។' 
        : 'The ideal affordable option for travelers visiting Cambodia for 1–2 weeks who want full AI flexibility.',
      isPopular: true,
      ctaText: language === 'km' ? 'ជ្រើសរើស Trip Pass — $2.99' : 'Get Trip Pass — $2.99',
      ctaStyle: 'bg-[#0B7A5C] hover:bg-[#086048] text-white shadow-md hover:shadow-lg border border-[#0B7A5C]',
      features: [
        { text: language === 'km' ? 'កែសម្រួលគម្រោងជាមួយ AI គ្មានដែនកំណត់' : 'Unlimited AI itinerary adjustments', included: true, highlight: true },
        { text: language === 'km' ? 'តារាងថវិកាលម្អិតសម្រាប់ការធ្វើដំណើរ' : 'Detailed travel budget', included: true, highlight: true },
        { text: language === 'km' ? 'រក្សាទុក និងភ្ជាប់ទិន្នន័យដំណើរកម្សាន្ត' : 'Save the trip to your account', included: true },
        { text: language === 'km' ? 'ការណែនាំតាមចំណង់ចំណូលចិត្តផ្ទាល់ខ្លួន' : 'Personalized recommendations', included: true },
        { text: language === 'km' ? 'ការណែនាំម្ហូបក្នុងស្រុក និងកន្លែងពិសេស' : 'Local food and attraction recommendations', included: true },
        { text: language === 'km' ? 'ទាញយក និងចែករំលែកកាលវិភាគ (PDF/Print)' : 'Share/download itinerary', included: true, highlight: true },
        { text: language === 'km' ? 'តម្លៃ PassApp និងការការពារពីការគិតថ្លៃខ្ពស់' : 'Fair PassApp price guides & tips', included: true },
        { text: language === 'km' ? 'ការរៀបចំដំណើរកម្សាន្តច្រើនមិនកំណត់' : 'Multiple simultaneous trips', included: false }
      ]
    },
    {
      id: 'wisgo-plus',
      name: language === 'km' ? 'WisGo Plus' : 'WisGo Plus',
      badge: language === 'km' ? 'សមាជិកប្រចាំខែ' : 'Digital Nomads & Expats',
      usdPrice: 4.99,
      period: language === 'km' ? '/ ខែ' : '/ month',
      description: language === 'km' 
        ? 'សម្រាប់អ្នករស់នៅកម្ពុជា អ្នកធ្វើការពីចម្ងាយ និងអ្នកដែលធ្វើដំណើរកម្សាន្តញឹកញាប់គ្រប់ ២៥ ខេត្តក្រុង។' 
        : 'Best for frequent explorers, expats, and digital nomads traversing all 25 provinces of Cambodia.',
      isPopular: false,
      ctaText: language === 'km' ? 'ជាវ WisGo Plus — $4.99/ខែ' : 'Subscribe to WisGo Plus',
      ctaStyle: 'bg-[#1E293B] hover:bg-slate-800 text-white shadow-sm border border-slate-700',
      features: [
        { text: language === 'km' ? 'រៀបចំដំណើរកម្សាន្តគ្មានដែនកំណត់' : 'Unlimited trips', included: true, highlight: true },
        { text: language === 'km' ? 'ការរៀបចំផែនការជាមួយ AI គ្មានដែនកំណត់' : 'Unlimited AI planning', included: true },
        { text: language === 'km' ? 'ការបង្កើនប្រសិទ្ធភាពថវិកាកម្រិតខ្ពស់' : 'Advanced budget optimization', included: true, highlight: true },
        { text: language === 'km' ? 'រក្សាទុកដំណើរកម្សាន្តគ្មានដែនកំណត់' : 'Unlimited saved trips', included: true },
        { text: language === 'km' ? 'កំណត់ចំណូលចិត្ត និងរបបអាហារផ្ទាល់ខ្លួន' : 'Personalized travel preferences', included: true },
        { text: language === 'km' ? 'ការណែនាំពិសេសពីយុវជនក្នុងស្រុក (VIP)' : 'Premium local recommendations', included: true },
        { text: language === 'km' ? 'សិទ្ធិប្រើប្រាស់មុខងារ AI ថ្មីៗមុនគេ' : 'Access to new AI features', included: true, highlight: true },
        { text: language === 'km' ? 'ការគាំទ្រពិសេសជាអាទិភាព ២៤/៧' : 'Priority customer assistance', included: true }
      ]
    }
  ];

  return (
    <div className="space-y-10 pb-12">
      
      {/* SECTION 1: Header & Currency Controls */}
      <section className="text-center max-w-4xl mx-auto pt-4 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DFF7ED] text-[#0B7A5C] text-xs font-bold border border-[#21C87A]/30 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#21C87A]" />
          <span>{language === 'km' ? 'តម្លៃសមរម្យសម្រាប់អ្នកទេសចរមកកាន់កម្ពុជា' : 'Affordable Travel AI for Cambodia'}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1E293B] tracking-tight leading-tight">
          {language === 'km' ? (
            <>
              គម្រោងតម្លៃសាមញ្ញ តម្លាភាពសម្រាប់ <br className="hidden sm:inline" />
              <span className="text-[#0B7A5C]">ដំណើរកម្សាន្តកម្ពុជារបស់អ្នក</span>
            </>
          ) : (
            <>
              Simple, Transparent Pricing for <br className="hidden sm:inline" />
              <span className="text-[#0B7A5C]">Your Cambodia Adventure</span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {language === 'km'
            ? 'រៀបចំដំណើរកម្សាន្តដោយភាពជឿជាក់ ជៀសវាងការចំណាយលើសកម្រិត និងទទួលបានការណែនាំពីយុវជនក្នុងស្រុកពិតៗ។'
            : 'Plan with confidence, avoid tourist price markups, and unlock authentic Khmer youth insights tailored to your travel style.'}
        </p>

        {/* Currency Display Selector */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">
            {language === 'km' ? 'បង្ហាញរូបិយប័ណ្ណ៖' : 'Currency Display:'}
          </span>
          <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl shadow-xs text-xs font-semibold">
            <button
              onClick={() => setCurrencyMode('both')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                currencyMode === 'both' ? 'bg-[#0B7A5C] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              USD + KHR (៛)
            </button>
            <button
              onClick={() => setCurrencyMode('usd')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                currencyMode === 'usd' ? 'bg-[#0B7A5C] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrencyMode('khr')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                currencyMode === 'khr' ? 'bg-[#0B7A5C] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              KHR (៛)
            </button>
          </div>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
            1 USD ≈ {KHR_RATE.toLocaleString()} KHR
          </span>
        </div>
      </section>

      {/* Account & Digital Wallet Management Banner */}
      <div className="max-w-7xl mx-auto">
        {currentUser ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center font-bold text-lg shadow-xs overflow-hidden">
                {userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <Wallet className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1E293B]">{userProfile?.name || 'Explorer'}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    currentPlan === 'wisgo-plus'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : currentPlan === 'trip-pass'
                      ? 'bg-[#DFF7ED] text-[#0B7A5C] border border-[#21C87A]/40'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {currentPlan === 'wisgo-plus' ? 'WisGo Plus Active' : currentPlan === 'trip-pass' ? 'Trip Pass Active' : 'Free Plan'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {language === 'km' ? 'សមតុល្យគណនីឌីជីថល (Wallet Balance):' : 'Digital Wallet Balance:'}{' '}
                  <strong className="text-[#0B7A5C] text-sm font-extrabold">${currentWalletBalance.toFixed(2)}</strong>
                  <span className="text-slate-400 ml-1">≈ {Math.round(currentWalletBalance * KHR_RATE).toLocaleString()} ៛</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={handleOpenTopUp}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{language === 'km' ? '+ បញ្ចូលសមតុល្យ (Top Up)' : '+ Top Up Balance'}</span>
              </button>
              
              {userProfile?.transactions && userProfile.transactions.length > 0 && (
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'km' ? 'វិក្កយបត្រ' : 'Receipts'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#DFF7ED]/60 border border-[#21C87A]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white text-[#0B7A5C] shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1E293B]">
                  {language === 'km' ? 'ចូលគណនីដើម្បីបញ្ចូលប្រាក់ និងជាវគម្រោង' : 'Sign in required to Top Up and Subscribe'}
                </h4>
                <p className="text-xs text-slate-600">
                  {language === 'km' 
                    ? 'ភ្ជាប់គណនី Google ឬ Explorer ដើម្បីរក្សាទុកសមតុល្យកាបូប និងកាលវិភាគធ្វើដំណើរគ្មានដែនកំណត់។' 
                    : 'Connect your Google or Explorer profile to maintain digital wallet credits and sync unlimited trips.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenAuthModal?.()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'km' ? 'ចូលគណនីឥឡូវនេះ (Sign In)' : 'Sign In to Continue'}</span>
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: 3 Pricing Cards Grid (Selected CSS Selector Target) */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-2">
        {plans.map((plan) => {
          const priceInfo = formatPrice(plan.usdPrice, plan.period);
          const isCurrentActive = currentPlan === plan.id;
          const isPaidPlan = plan.id !== 'free';

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
                isCurrentActive
                  ? 'bg-white border-2 border-[#0B7A5C] shadow-lg ring-4 ring-[#0B7A5C]/15'
                  : plan.isPopular
                  ? 'bg-white border-2 border-[#0B7A5C] shadow-xl ring-4 ring-[#0B7A5C]/10'
                  : 'bg-white border border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Recommended Badge for Trip Pass */}
              {plan.isPopular && !isCurrentActive && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0B7A5C] to-[#21C87A] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>{plan.badge}</span>
                </div>
              )}

              {/* Active Plan Tag */}
              {isCurrentActive && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0B7A5C] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'គម្រោងកំពុងប្រើប្រាស់' : 'Current Active Plan'}</span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-[#1E293B]">{plan.name}</h3>
                  {!plan.isPopular && !isCurrentActive && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {plan.badge}
                    </span>
                  )}
                </div>

                {plan.subBadge && (
                  <p className="text-xs font-semibold text-[#0B7A5C] mb-3">
                    {plan.subBadge}
                  </p>
                )}

                <p className="text-xs text-slate-600 mb-6 leading-relaxed min-h-[36px]">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-[#F8FCFA] border border-slate-200/80 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
                      {priceInfo.primary}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {priceInfo.period}
                    </span>
                  </div>

                  {priceInfo.secondary && (
                    <p className="text-xs font-semibold text-[#0B7A5C] mt-1">
                      {priceInfo.secondary} {plan.period}
                    </p>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {language === 'km' ? 'លក្ខណៈពិសេសរួមមាន៖' : "What's included:"}
                  </p>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      {feat.included ? (
                        <div className={`p-0.5 rounded-full mt-0.5 shrink-0 ${feat.highlight ? 'bg-[#DFF7ED] text-[#0B7A5C]' : 'bg-slate-100 text-slate-700'}`}>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="p-0.5 rounded-full mt-0.5 shrink-0 text-slate-300">
                          <X className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <span className={`${feat.included ? (feat.highlight ? 'font-semibold text-slate-900' : 'text-slate-700') : 'text-slate-400 line-through'}`}>
                        {feat.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action Button */}
              {isCurrentActive ? (
                <div className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-emerald-50 text-[#0B7A5C] border border-[#21C87A]/30 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'km' ? 'សកម្មក្នុងគណនីរបស់អ្នក' : 'Active On Your Account'}</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${plan.ctaStyle}`}
                >
                  {!currentUser && isPaidPlan ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{language === 'km' ? `ចូលគណនីដើម្បីជាវ — $${plan.usdPrice}` : `Sign In to Subscribe — $${plan.usdPrice}`}</span>
                    </>
                  ) : (
                    <>
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </section>

      {/* SECTION 3: Plan Feature Comparison Table */}
      <section className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-[#1E293B]">
            {language === 'km' ? 'ប្រៀបធៀបលក្ខណៈពិសេសគ្រប់គម្រោង' : 'Detailed Plan Comparison'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {language === 'km' 
              ? 'ពិនិត្យមើលភាពខុសគ្នារវាងគម្រោងឥតគិតថ្លៃ, Trip Pass និង WisGo Plus' 
              : 'See exactly what is included in Free, Trip Pass, and WisGo Plus to choose the best option.'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FCFA]">
                <th className="py-3.5 px-4 font-bold text-slate-700 rounded-l-xl">
                  {language === 'km' ? 'មុខងារ & លក្ខណៈពិសេស' : 'Feature & Capability'}
                </th>
                <th className="py-3.5 px-4 font-bold text-slate-700 text-center">
                  Free ($0)
                </th>
                <th className="py-3.5 px-4 font-bold text-[#0B7A5C] text-center bg-[#DFF7ED]/40">
                  Trip Pass ($2.99) ★
                </th>
                <th className="py-3.5 px-4 font-bold text-slate-700 text-center rounded-r-xl">
                  WisGo Plus ($4.99/mo)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-medium text-slate-800">
                  {language === 'km' ? 'ការរៀបចំគម្រោងជាមួយ AI' : 'AI Trip Planning'}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-600">
                  {language === 'km' ? 'មូលដ្ឋាន (៣ លើក/ថ្ងៃ)' : 'Basic (3 prompts/day)'}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-[#0B7A5C] bg-[#DFF7ED]/20">
                  {language === 'km' ? 'គ្មានដែនកំណត់ (ពេញ ១ ដំណើរកម្សាន្ត)' : 'Unlimited (Full Trip Duration)'}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                  {language === 'km' ? 'គ្មានដែនកំណត់ (អាទិភាពខ្ពស់)' : 'Unlimited (Priority High-Speed)'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-medium text-slate-800">
                  {language === 'km' ? 'ការកែសម្រួលកាលវិភាគ' : 'Itinerary Adjustments & Drag-Drop'}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-600">
                  {language === 'km' ? 'មានកំណត់' : 'Standard'}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-[#0B7A5C] bg-[#DFF7ED]/20">
                  <CheckCircle2 className="w-4 h-4 text-[#0B7A5C] mx-auto" />
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                  <Check className="w-4 h-4 text-[#0B7A5C] mx-auto" />
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-medium text-slate-800">
                  {language === 'km' ? 'ការវិភាគថវិកាធ្វើដំណើរ' : 'Travel Budget Breakdown'}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-600">
                  {language === 'km' ? 'ការប៉ាន់ស្មានសរុប' : 'Rough Total Estimate'}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-[#0B7A5C] bg-[#DFF7ED]/20">
                  {language === 'km' ? 'លម្អិតតាមមុខចំណាយ (USD/KHR)' : 'Itemized by Category (USD/KHR)'}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                  {language === 'km' ? 'ការបង្កើនប្រសិទ្ធភាពថវិកាកម្រិតខ្ពស់' : 'Advanced Budget Optimizer'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-medium text-slate-800">
                  {language === 'km' ? 'ការរក្សាទុកទិន្នន័យលើ Cloud' : 'Cloud Sync & Saved Trips'}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-600">
                  {language === 'km' ? 'រក្សាទុកក្នុងម៉ាស៊ីន (Local)' : 'Local Storage Only'}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-[#0B7A5C] bg-[#DFF7ED]/20">
                  {language === 'km' ? '១ ដំណើរកម្សាន្តពេញលេញ' : '1 Active Cloud-Synced Trip'}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                  {language === 'km' ? 'មិនកំណត់ចំនួនដំណើរកម្សាន្ត' : 'Unlimited Cloud Trips'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-medium text-slate-800">
                  {language === 'km' ? 'ទាញយក និងចែករំលែក (PDF/Print)' : 'Export & Share Itinerary'}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-300 font-bold">—</td>
                <td className="py-3.5 px-4 text-center font-semibold text-[#0B7A5C] bg-[#DFF7ED]/20">
                  <CheckCircle2 className="w-4 h-4 text-[#0B7A5C] mx-auto" />
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                  <Check className="w-4 h-4 text-[#0B7A5C] mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CHECKOUT / REAL CHARGE MODAL */}
      <AnimatePresence>
        {selectedPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8"
            >
              <button
                onClick={() => setSelectedPlanModal(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {completedTx ? (
                /* SUCCESS / INVOICE VIEW */
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 bg-[#DFF7ED] text-[#0B7A5C] rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-[#1E293B]">
                      {language === 'km' ? 'ការទូទាត់ជោគជ័យ!' : 'Subscription Activated!'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {language === 'km'
                        ? `គម្រោង ${selectedPlanModal === 'trip-pass' ? 'Trip Pass' : 'WisGo Plus'} ត្រូវបានបើកដំណើរការលើគណនីរបស់អ្នក។`
                        : `Your ${selectedPlanModal === 'trip-pass' ? 'Trip Pass' : 'WisGo Plus'} subscription is now active.`}
                    </p>
                  </div>

                  {/* Digital Receipt Card */}
                  <div className="bg-[#F8FCFA] border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="font-bold text-[#0B7A5C] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        WisGO Cambodia
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {completedTx.referenceId}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">{language === 'km' ? 'គម្រោង' : 'Plan'}:</span>
                      <span className="font-bold text-slate-800">{completedTx.planName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">{language === 'km' ? 'ចំនួនទឹកប្រាក់' : 'Amount Charged'}:</span>
                      <span className="font-extrabold text-[#0B7A5C]">
                        ${completedTx.amount.toFixed(2)} (≈ {Math.round(completedTx.amount * KHR_RATE).toLocaleString()} ៛)
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">{language === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}:</span>
                      <span className="text-slate-700">{new Date(completedTx.date).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">{language === 'km' ? 'វិធីទូទាត់' : 'Payment Method'}:</span>
                      <span className="font-semibold text-slate-700 uppercase">
                        {completedTx.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedPlanModal(null);
                        onNavigateTab('planner');
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{language === 'km' ? 'បើកកម្មវិធីរៀបចំគម្រោង (AI Planner)' : 'Open AI Trip Planner'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPlanModal(null);
                      }}
                      className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      {language === 'km' ? 'រួចរាល់' : 'Close'}
                    </button>
                  </div>
                </div>
              ) : (
                /* CHECKOUT CHARGE FORM */
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="p-2.5 rounded-xl bg-[#DFF7ED] text-[#0B7A5C]">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1E293B]">
                        {selectedPlanModal === 'trip-pass' ? 'WisGO Trip Pass' : 'WisGO Plus Subscription'}
                      </h3>
                      <p className="text-xs text-[#0B7A5C] font-semibold">
                        {selectedPlanModal === 'trip-pass' ? '$2.99 / trip (≈ 12,250 ៛)' : '$4.99 / month (≈ 20,500 ៛)'}
                      </p>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">
                      {language === 'km' ? 'ជ្រើសរើសវិធីសាស្ត្រទូទាត់ប្រាក់៖' : 'Select Payment Method:'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Wallet Balance */}
                      <button
                        onClick={() => setPaymentMethod('wallet')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === 'wallet'
                            ? 'border-[#0B7A5C] bg-[#DFF7ED]/30 text-[#0B7A5C] font-bold ring-2 ring-[#0B7A5C]/10'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          <span className="text-xs">{language === 'km' ? 'កាបូបឌីជីថល' : 'Wallet Balance'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          ${currentWalletBalance.toFixed(2)}
                        </p>
                      </button>

                      {/* Bakong KHQR */}
                      <button
                        onClick={() => setPaymentMethod('khqr')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === 'khqr'
                            ? 'border-[#0B7A5C] bg-[#DFF7ED]/30 text-[#0B7A5C] font-bold ring-2 ring-[#0B7A5C]/10'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-rose-600" />
                          <span className="text-xs">Bakong KHQR</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {language === 'km' ? 'គ្រប់ធនាគារកម្ពុជា' : 'All Khmer Banks'}
                        </p>
                      </button>

                      {/* Credit Card */}
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'border-[#0B7A5C] bg-[#DFF7ED]/30 text-[#0B7A5C] font-bold ring-2 ring-[#0B7A5C]/10'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <span className="text-xs">Card (Visa/MC)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {language === 'km' ? 'កាតអន្តរជាតិ' : 'International'}
                        </p>
                      </button>

                      {/* ABA PAY */}
                      <button
                        onClick={() => setPaymentMethod('aba')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === 'aba'
                            ? 'border-[#0B7A5C] bg-[#DFF7ED]/30 text-[#0B7A5C] font-bold ring-2 ring-[#0B7A5C]/10'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-cyan-600" />
                          <span className="text-xs">ABA PAY</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {language === 'km' ? 'រហ័សទាន់ចិត្ត' : 'Instant Checkout'}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Method View: KHQR */}
                  {paymentMethod === 'khqr' && (
                    <div className="bg-[#F8FCFA] border border-slate-200 rounded-2xl p-4 text-center space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
                        KHQR • NBC BAKONG
                      </div>

                      {/* Generated KHQR code container */}
                      <div className="w-48 h-48 bg-white border-2 border-slate-800 rounded-2xl mx-auto p-2.5 flex flex-col items-center justify-center relative shadow-sm">
                        <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                          {/* Stylized QR grid pattern */}
                          <div className="absolute inset-2 bg-white flex flex-col justify-between p-2">
                            <div className="flex justify-between">
                              <div className="w-8 h-8 border-4 border-slate-900 rounded-sm flex items-center justify-center">
                                <div className="w-3 h-3 bg-slate-900" />
                              </div>
                              <div className="w-8 h-8 border-4 border-slate-900 rounded-sm flex items-center justify-center">
                                <div className="w-3 h-3 bg-slate-900" />
                              </div>
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="px-2 py-0.5 bg-[#0B7A5C] text-white text-[8px] font-bold rounded">
                                WISGO
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <div className="w-8 h-8 border-4 border-slate-900 rounded-sm flex items-center justify-center">
                                <div className="w-3 h-3 bg-slate-900" />
                              </div>
                              <div className="w-4 h-4 bg-slate-900" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">
                          WISGO CAMBODIA CO., LTD.
                        </p>
                        <p className="text-xs font-extrabold text-[#0B7A5C]">
                          {selectedPlanModal === 'trip-pass' ? '$2.99 (12,250 ៛)' : '$4.99 (20,500 ៛)'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {language === 'km' ? 'ស្កេនជាមួយ ABA, ACLEDA, Wing ឬធនាគារក្នុងស្រុក' : 'Scan with ABA Mobile, ACLEDA, Wing, or Bakong App'}
                        </p>
                        <div className="text-[10px] font-mono text-slate-500 pt-1">
                          {language === 'km' ? 'សុពលភាព៖' : 'Expires in:'} {Math.floor(khqrTimer / 60)}:{(khqrTimer % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Method View: Card */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3 bg-[#F8FCFA] border border-slate-200 rounded-2xl p-4 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          {language === 'km' ? 'ឈ្មោះលើកាត (Name on Card)' : 'Cardholder Name'}
                        </label>
                        <input
                          type="text"
                          placeholder="TOUCH PUTHY"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#0B7A5C]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          {language === 'km' ? 'លេខកាត (Card Number)' : 'Card Number'}
                        </label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:border-[#0B7A5C]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            MM / YY
                          </label>
                          <input
                            type="text"
                            placeholder="08/28"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:border-[#0B7A5C]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            CVV / CVC
                          </label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:border-[#0B7A5C]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Method View: Wallet Balance */}
                  {paymentMethod === 'wallet' && (
                    <div className="bg-[#F8FCFA] border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between font-medium text-slate-600">
                        <span>{language === 'km' ? 'សមតុល្យកាបូបបច្ចុប្បន្ន៖' : 'Available Wallet Balance:'}</span>
                        <span className="font-bold text-slate-800">${currentWalletBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-slate-600">
                        <span>{language === 'km' ? 'តម្លៃគម្រោង៖' : 'Subscription Price:'}</span>
                        <span className="font-bold text-[#0B7A5C]">
                          ${selectedPlanModal === 'trip-pass' ? '2.99' : '4.99'}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                        <span>{language === 'km' ? 'សមតុល្យនៅសល់៖' : 'Remaining Balance:'}</span>
                        <span>
                          ${Math.max(0, currentWalletBalance - (selectedPlanModal === 'trip-pass' ? 2.99 : 4.99)).toFixed(2)}
                        </span>
                      </div>
                      {currentWalletBalance < (selectedPlanModal === 'trip-pass' ? 2.99 : 4.99) && (
                        <p className="text-[11px] text-amber-600 font-semibold pt-1">
                          {language === 'km' 
                            ? 'សមតុល្យមិនគ្រប់គ្រាន់។ សូមជ្រើសរើសវិធីទូទាត់ផ្សេង ឬបញ្ចូលប្រាក់ក្នុងកាបូប។' 
                            : 'Insufficient wallet balance. Please top up or select Bakong KHQR / Card.'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Method View: ABA */}
                  {paymentMethod === 'aba' && (
                    <div className="bg-[#F8FCFA] border border-slate-200 rounded-2xl p-4 text-center space-y-2 text-xs">
                      <div className="w-12 h-12 bg-cyan-600 text-white font-black rounded-xl flex items-center justify-center mx-auto text-sm">
                        ABA
                      </div>
                      <h4 className="font-bold text-slate-800">ABA PAY Instant Checkout</h4>
                      <p className="text-slate-500 text-[11px]">
                        {language === 'km' ? 'ចុចប៊ូតុងខាងក្រោមដើម្បីបញ្ជាក់ការទូទាត់រហ័ស' : 'Tap the button below to process instant charge via ABA Bank.'}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      disabled={isProcessing || (paymentMethod === 'wallet' && currentWalletBalance < (selectedPlanModal === 'trip-pass' ? 2.99 : 4.99))}
                      onClick={() => executeCharge(selectedPlanModal, selectedPlanModal === 'trip-pass' ? 2.99 : 4.99)}
                      className="w-full py-3.5 rounded-2xl bg-[#0B7A5C] hover:bg-[#086048] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{language === 'km' ? 'កំពុងទូទាត់ប្រាក់...' : 'Processing Charge...'}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>
                            {language === 'km' 
                              ? `ទូទាត់ប្រាក់ $${selectedPlanModal === 'trip-pass' ? '2.99' : '4.99'} & បើកដំណើរការ` 
                              : `Pay $${selectedPlanModal === 'trip-pass' ? '2.99' : '4.99'} & Activate`}
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400">
                      {language === 'km' ? 'ធានាសុវត្ថិភាពទូទាត់ ១០០% • ការពារដោយការសម្ងាត់កម្រិតខ្ពស់' : '100% Encrypted & Protected Payment • Immediate Access'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOP UP DIGITAL WALLET MODAL */}
      <AnimatePresence>
        {isTopUpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8"
            >
              <button
                onClick={() => setIsTopUpOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {completedTx ? (
                /* TOP UP SUCCESS */
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 bg-[#DFF7ED] text-[#0B7A5C] rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1E293B]">
                      {language === 'km' ? 'បញ្ចូលប្រាក់ជោគជ័យ!' : 'Top-Up Completed!'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {language === 'km' 
                        ? `ចំនួនទឹកប្រាក់ $${completedTx.amount.toFixed(2)} ត្រូវបានបញ្ចូលក្នុងកាបូបរបស់អ្នក។` 
                        : `Successfully added $${completedTx.amount.toFixed(2)} to your WisGO wallet.`}
                    </p>
                  </div>

                  <div className="bg-[#F8FCFA] border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{language === 'km' ? 'សមតុល្យថ្មី' : 'New Balance'}:</span>
                      <span className="font-extrabold text-[#0B7A5C] text-sm">${currentWalletBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{language === 'km' ? 'លេខយោង' : 'Reference ID'}:</span>
                      <span className="font-mono text-slate-700">{completedTx.referenceId}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsTopUpOpen(false)}
                    className="w-full py-3 px-4 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    {language === 'km' ? 'រួចរាល់' : 'Done'}
                  </button>
                </div>
              ) : (
                /* TOP UP FORM */
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="p-2.5 rounded-xl bg-[#DFF7ED] text-[#0B7A5C]">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1E293B]">
                        {language === 'km' ? 'បញ្ចូលសមតុល្យកាបូបឌីជីថល' : 'Top Up Digital Wallet'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {language === 'km' ? 'សមតុល្យបច្ចុប្បន្ន៖' : 'Current Balance:'} <strong className="text-[#0B7A5C]">${currentWalletBalance.toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Preset Amount Badges */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">
                      {language === 'km' ? 'ជ្រើសរើសចំនួនទឹកប្រាក់ ($ USD)៖' : 'Select Top-Up Amount ($ USD):'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 20, 50].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setTopUpAmount(amt);
                            setCustomTopUpInput('');
                          }}
                          className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            topUpAmount === amt && !customTopUpInput
                              ? 'bg-[#0B7A5C] text-white border-[#0B7A5C] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                    
                    {/* Custom Amount */}
                    <div className="pt-1">
                      <input
                        type="number"
                        placeholder={language === 'km' ? 'ឬបញ្ចូលចំនួនទឹកប្រាក់ផ្ទាល់ខ្លួន ($)' : 'Or enter custom amount ($)'}
                        value={customTopUpInput}
                        onChange={(e) => setCustomTopUpInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0B7A5C]"
                      />
                    </div>
                  </div>

                  {/* Top-up Method */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">
                      {language === 'km' ? 'វិធីទូទាត់ប្រាក់៖' : 'Payment Method:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setTopUpMethod('khqr')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          topUpMethod === 'khqr'
                            ? 'border-[#0B7A5C] bg-[#DFF7ED]/30 text-[#0B7A5C] font-bold'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <QrCode className="w-4 h-4 mx-auto mb-1 text-rose-600" />
                        <span className="text-[11px] block">Bakong KHQR</span>
                      </button>

                      <button
                        onClick={() => setTopUpMethod('card')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          topUpMethod === 'card'
                            ? 'border-[#0B7A5C] bg-[#DFF7ED]/30 text-[#0B7A5C] font-bold'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                        <span className="text-[11px] block">Card</span>
                      </button>

                      <button
                        onClick={() => setTopUpMethod('aba')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          topUpMethod === 'aba'
                            ? 'border-[#0B7A5C] bg-[#DFF7ED]/30 text-[#0B7A5C] font-bold'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <Zap className="w-4 h-4 mx-auto mb-1 text-cyan-600" />
                        <span className="text-[11px] block">ABA PAY</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-3 bg-[#F8FCFA] border border-slate-200 rounded-2xl flex justify-between items-center text-xs">
                    <span className="text-slate-600">{language === 'km' ? 'ចំនួនសរុបត្រូវបញ្ចូល៖' : 'Total Top-Up:'}</span>
                    <span className="font-extrabold text-[#0B7A5C] text-sm">
                      ${customTopUpInput ? customTopUpInput : topUpAmount.toFixed(2)}{' '}
                      <span className="text-slate-400 font-normal text-xs">
                        (≈ {Math.round((customTopUpInput ? parseFloat(customTopUpInput) || 0 : topUpAmount) * KHR_RATE).toLocaleString()} ៛)
                      </span>
                    </span>
                  </div>

                  <button
                    disabled={isProcessing}
                    onClick={executeTopUp}
                    className="w-full py-3.5 rounded-2xl bg-[#0B7A5C] hover:bg-[#086048] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{language === 'km' ? 'កំពុងដំណើរការ...' : 'Processing Top-Up...'}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>{language === 'km' ? 'បញ្ជាក់ការបញ្ចូលប្រាក់' : 'Confirm Top-Up'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRANSACTION RECEIPT HISTORY MODAL */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8"
            >
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
                <div className="p-2.5 rounded-xl bg-[#DFF7ED] text-[#0B7A5C]">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">
                    {language === 'km' ? 'ប្រវត្តិប្រតិបត្តិការ & វិក្កយបត្រ' : 'Billing & Transaction History'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'km' ? 'កំណត់ត្រាការទូទាត់ និងបញ្ចូលប្រាក់កន្លងមក' : 'Records of past charges and top-ups'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {userProfile?.transactions && userProfile.transactions.length > 0 ? (
                  userProfile.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 bg-[#F8FCFA] border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {tx.type === 'subscription_purchase' ? tx.planName : (language === 'km' ? 'បញ្ចូលប្រាក់កាបូប' : 'Wallet Top-Up')}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {tx.paymentMethod.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {tx.referenceId} • {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`font-extrabold text-sm ${tx.type === 'top_up' ? 'text-[#0B7A5C]' : 'text-slate-800'}`}>
                          {tx.type === 'top_up' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-semibold uppercase">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400">
                    {language === 'km' ? 'គ្មានប្រវត្តិប្រតិបត្តិការនៅឡើយទេ' : 'No transactions recorded yet.'}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  {language === 'km' ? 'បិទ' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECTION 4: Why WisGo? Highlight */}
      <section className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#0B7A5C] to-[#08533F] text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold mb-3 backdrop-blur-xs">
              <Compass className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ហេតុអ្វីជ្រើសរើស WisGO?' : 'Why Choose WisGO?'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'km'
                ? 'បង្កើតឡើងដោយយុវជនខ្មែរ សម្រាប់អ្នកដំណើរជុំវិញពិភពលោក'
                : 'Built by Cambodian Youth for Global Explorers'}
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed">
              {language === 'km'
                ? 'WisGO មិនមែនគ្រាន់តែជា AI ទូទៅនោះទេ ប៉ុន្តែជាមគ្គុទ្ទេសក៍ក្នុងស្រុកដែលស្គាល់ច្បាស់ពីតម្លៃជាក់ស្តែង វប្បធម៌ និងកន្លែងពិសេសនៅកម្ពុជា។'
                : 'WisGO combines cutting-edge Gemini AI with authentic on-the-ground Cambodian knowledge, ensuring you experience the best of Cambodia safely, fairly, and culturally.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-2.5 hover:bg-white/15 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white text-[#0B7A5C] flex items-center justify-center font-bold shadow-xs">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">
                {language === 'km' ? 'តម្លៃពិតជាក់ស្តែងនៅកម្ពុជា' : 'Real Cambodian Prices'}
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                {language === 'km' 
                  ? 'គ្មានការបំប៉ោងតម្លៃទេសចរ។ យើងផ្តល់តម្លៃជិះ PassApp tuk-tuk ពិត តម្លៃម្ហូបតាមផ្លូវ និងតម្លៃសំបុត្រចូលទស្សនាច្បាស់លាស់។'
                  : 'Avoid tourist markups with verified local PassApp rates, street food costs, and real entrance fees.'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-2.5 hover:bg-white/15 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white text-[#0B7A5C] flex items-center justify-center font-bold shadow-xs">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">
                {language === 'km' ? 'បទពិសោធន៍យុវជនក្នុងស្រុកពិតៗ' : 'Authentic Local Experiences'}
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                {language === 'km'
                  ? 'ស្វែងរកទឹកធ្លាក់លាក់ខ្លួននៅមណ្ឌលគិរី ចំការម្រេចកំពត និងផ្សារក្តាមស្រស់កែប។'
                  : 'Uncover hidden waterfalls in Mondulkiri, organic Kampot pepper farms, and Kep crab markets.'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-2.5 hover:bg-white/15 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white text-[#0B7A5C] flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">
                {language === 'km' ? 'សុវត្ថិភាព និងការណែនាំធ្វើដំណើរ' : 'Safety & Local Advisories'}
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                {language === 'km'
                  ? 'ទទួលបានព័ត៌មានអាកាសធាតុផ្ទាល់ រដូវវស្សា របៀបប្តូរលុយដុល្លារ-រៀល និងគន្លឹះធ្វើដំណើរប្រកបដោយសុវត្ថិភាព។'
                  : 'Live weather alerts, monsoon guidance, dual-currency spending tips, and safe travel practices.'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-2.5 hover:bg-white/15 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white text-[#0B7A5C] flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">
                {language === 'km' ? 'AI យល់ដឹងពីវប្បធម៌ខ្មែរ' : 'Culture-Aware Travel AI'}
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                {language === 'km'
                  ? 'ដំណើរការដោយ Gemini ជាមួយចំណេះដឹងវប្បធម៌ខ្មែរ សំលៀកបំពាក់ចូលប្រាសាទ និងឃ្លាភាសាខ្មែរសំខាន់ៗ។'
                  : 'Built on Gemini with deep understanding of Khmer etiquette, temple dress codes, and phrases.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FAQs */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold text-[#1E293B]">
            {language === 'km' ? 'សំណួរដែលសួរញឹកញាប់' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {language === 'km' ? 'អ្វីគ្រប់យ៉ាងដែលអ្នកត្រូវដឹងអំពីតម្លៃ និងគម្រោងរបស់ WisGO' : 'Everything you need to know about WisGO plans and payments'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
            <h4 className="font-bold text-sm text-[#1E293B] flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-[#0B7A5C] shrink-0 mt-0.5" />
              <span>{language === 'km' ? 'ហេតុអ្វីត្រូវ Sign In មុនពេលបញ្ចូលប្រាក់ និងជាវគម្រោង?' : 'Why do I need to Sign In before topping up or subscribing?'}</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              {language === 'km'
                ? 'ការចូលគណនីធានាថាសមតុល្យប្រាក់កាបូប និងកាលវិភាគធ្វើដំណើរទាំងអស់របស់អ្នកត្រូវបានការពារ និងរក្សាទុកនៅលើ Cloud យ៉ាងមានសុវត្ថិភាព។'
                : 'Signing in links your digital wallet balance, subscriptions, and AI itinerary history securely to your account across all devices.'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
            <h4 className="font-bold text-sm text-[#1E293B] flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-[#0B7A5C] shrink-0 mt-0.5" />
              <span>{language === 'km' ? 'តើ Trip Pass ($2.99) មានសុពលភាពប៉ុន្មានថ្ងៃ?' : 'How long does the $2.99 Trip Pass last?'}</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              {language === 'km'
                ? 'Trip Pass មានសុពលភាពសម្រាប់ដំណើរកម្សាន្តរបស់អ្នកទាំងមូលនៅកម្ពុជា (រហូតដល់ ៣០ ថ្ងៃ) ដោយអនុញ្ញាតឱ្យអ្នកកែសម្រួលគម្រោងជាមួយ AI បានពេញលេញ។'
                : 'The Trip Pass covers your entire single vacation in Cambodia (up to 30 days) with unlimited AI itinerary adjustments and budget exports.'}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
