import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { WisgoLogo } from './WisgoLogo';

interface PricingProps {
  onNavigateTab: (tab: 'explore' | 'planner' | 'assistant' | 'favorites' | 'pricing') => void;
  onOpenAuthModal?: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onNavigateTab, onOpenAuthModal }) => {
  const { t, language } = useLanguage();
  const { currentUser, userProfile } = useAuth();
  const [selectedPlanModal, setSelectedPlanModal] = useState<string | null>(null);
  const [currencyMode, setCurrencyMode] = useState<'both' | 'usd' | 'khr'>('both');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const KHR_RATE = 4100; // 1 USD ~ 4,100 KHR

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

    // Default 'both'
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
    setSelectedPlanModal(planId);
    setPaymentSuccess(false);
  };

  const handleSimulateActivate = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setSelectedPlanModal(null);
      setPaymentSuccess(false);
      onNavigateTab('planner');
    }, 2000);
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
      ctaStyle: 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300',
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

  const comparisonMatrix = [
    {
      feature: language === 'km' ? 'ការរៀបចំគម្រោងជាមួយ AI' : 'AI Trip Planning',
      free: language === 'km' ? 'មូលដ្ឋាន (៣ លើក/ថ្ងៃ)' : 'Basic (3 prompts/day)',
      pass: language === 'km' ? 'គ្មានដែនកំណត់ (ពេញ ១ ដំណើរកម្សាន្ត)' : 'Unlimited (Full Trip Duration)',
      plus: language === 'km' ? 'គ្មានដែនកំណត់ (អាទិភាពខ្ពស់)' : 'Unlimited (Priority High-Speed)'
    },
    {
      feature: language === 'km' ? 'ការកែសម្រួលកាលវិភាគ' : 'Itinerary Adjustments & Drag-Drop',
      free: language === 'km' ? 'មានកំណត់' : 'Standard',
      pass: language === 'km' ? 'កែសម្រួលពេញលេញ' : 'Full Drag & Reorder + AI sync',
      plus: language === 'km' ? 'កែសម្រួលពេញលេញ' : 'Full Drag & Reorder + AI sync'
    },
    {
      feature: language === 'km' ? 'ការវិភាគថវិកាធ្វើដំណើរ' : 'Travel Budget Breakdown',
      free: language === 'km' ? 'ការប៉ាន់ស្មានសរុប' : 'Rough Total Estimate',
      pass: language === 'km' ? 'លម្អិតតាមមុខចំណាយ (USD/KHR)' : 'Itemized by Category (USD/KHR)',
      plus: language === 'km' ? 'ការបង្កើនប្រសិទ្ធភាពថវិកាកម្រិតខ្ពស់' : 'Advanced Budget Optimizer'
    },
    {
      feature: language === 'km' ? 'ការរក្សាទុកទិន្នន័យលើ Cloud' : 'Cloud Sync & Saved Trips',
      free: language === 'km' ? 'រក្សាទុកក្នុងម៉ាស៊ីន (Local)' : 'Local Storage Only',
      pass: language === 'km' ? '១ ដំណើរកម្សាន្តពេញលេញ' : '1 Active Cloud-Synced Trip',
      plus: language === 'km' ? 'មិនកំណត់ចំនួនដំណើរកម្សាន្ត' : 'Unlimited Cloud Trips'
    },
    {
      feature: language === 'km' ? 'ការណែនាំម្ហូប & កន្លែងពិសេសក្នុងស្រុក' : 'Local Food & Hidden Gems',
      free: language === 'km' ? 'កន្លែងល្បីៗទូទៅ' : 'Top Tourist Spots',
      pass: language === 'km' ? 'កន្លែងសម្ងាត់ក្នុងស្រុក + ម្ហូបឆ្ងាញ់' : 'Authentic Hidden Gems + Local Eats',
      plus: language === 'km' ? 'កន្លែងសម្ងាត់ + ការបញ្ចុះតម្លៃពីដៃគូ' : 'VIP Local Discoveries & Perks'
    },
    {
      feature: language === 'km' ? 'ទាញយក និងចែករំលែក (PDF/Print)' : 'Export & Share Itinerary',
      free: false,
      pass: true,
      plus: true
    },
    {
      feature: language === 'km' ? 'ការណែនាំតម្លៃ PassApp / Tuk-Tuk' : 'PassApp & Fair Price Estimator',
      free: language === 'km' ? 'មូលដ្ឋាន' : 'Standard Tips',
      pass: language === 'km' ? 'លម្អិតគ្រប់គោលដៅ' : 'Per-Route Fair Price Matrix',
      plus: language === 'km' ? 'លម្អិតគ្រប់គោលដៅ' : 'Per-Route Fair Price Matrix'
    },
    {
      feature: language === 'km' ? 'សិទ្ធិប្រើប្រាស់មុខងារ AI ថ្មីៗមុនគេ' : 'Early Access to New AI Models',
      free: false,
      pass: false,
      plus: true
    }
  ];

  const whyWisgoItems = [
    {
      icon: DollarSign,
      title: language === 'km' ? 'តម្លៃពិតជាក់ស្តែងនៅកម្ពុជា' : 'Real Cambodian Prices',
      desc: language === 'km' 
        ? 'គ្មានការបំប៉ោងតម្លៃទេសចរ។ យើងផ្តល់តម្លៃជិះ PassApp tuk-tuk ពិត តម្លៃម្ហូបតាមផ្លូវ (ឡុកឡាក់ អាម៉ុក កាហ្វេទឹកដោះគោ) និងតម្លៃសំបុត្រចូលទស្សនាច្បាស់លាស់។'
        : 'Avoid tourist markups with verified local PassApp tuk-tuk rates, authentic street food costs (Lok Lak, Amok, iced coffee), and real entrance fees.'
    },
    {
      icon: Heart,
      title: language === 'km' ? 'បទពិសោធន៍យុវជនក្នុងស្រុកពិតៗ' : 'Authentic Local Experiences',
      desc: language === 'km'
        ? 'ស្វែងរកទឹកធ្លាក់លាក់ខ្លួននៅមណ្ឌលគិរី ចំការម្រេចកំពត ផ្សារក្តាមស្រស់កែប និងជិះរថភ្លើងឫស្សីបាត់ដំបង ដែលណែនាំដោយយុវជនខ្មែរផ្ទាល់។'
        : 'Uncover hidden waterfalls in Mondulkiri, organic Kampot pepper plantations, Kep crab markets, and local artisan heritage.'
    },
    {
      icon: ShieldCheck,
      title: language === 'km' ? 'សុវត្ថិភាព និងការណែនាំធ្វើដំណើរ' : 'Safety & Local Advisories',
      desc: language === 'km'
        ? 'ទទួលបានព័ត៌មានអាកាសធាតុផ្ទាល់ រដូវវស្សា របៀបប្តូរលុយដុល្លារ-រៀល និងគន្លឹះធ្វើដំណើរប្រកបដោយសុវត្ថិភាព ២៤/៧។'
        : 'Live weather alerts, seasonal monsoon guidance, dual-currency spending tips, and safe travel practices updated continuously.'
    },
    {
      icon: Sparkles,
      title: language === 'km' ? 'AI យល់ដឹងពីវប្បធម៌ខ្មែរ' : 'Culture-Aware Travel AI',
      desc: language === 'km'
        ? 'ដំណើរការដោយ Gemini ជាមួយចំណេះដឹងវប្បធម៌ខ្មែរ សំលៀកបំពាក់ចូលប្រាសាទ ឃ្លាភាសាខ្មែរសំខាន់ៗ និងរបបអាហារ (បួស/ហាឡាល)។'
        : 'Built on Gemini with deep understanding of Khmer etiquette, temple dress codes, essential phrases, and custom dietary preferences.'
    }
  ];

  const faqs = [
    {
      q: language === 'km' ? 'ហេតុអ្វីបានជា WisGo បង្ហាញតម្លៃទាំង USD ($) និងប្រាក់រៀល (KHR)?' : 'Why does WisGo show prices in both USD and Cambodian Riel (KHR)?',
      a: language === 'km' 
        ? 'ប្រទេសកម្ពុជាប្រើប្រាស់រូបិយប័ណ្ណពីរ (USD និង KHR)។ ការដឹងតម្លៃជារូបិយប័ណ្ណទាំងពីរជួយអ្នកទូទាត់ប្រាក់បានត្រឹមត្រូវ និងយល់ច្បាស់ពីលុយអាប់នៅតាមផ្សារ និងហាងក្នុងស្រុក។'
        : 'Cambodia operates on a dual-currency economy. USD is widely accepted for larger purchases, while Cambodian Riel (KHR) is used for street food, tuk-tuks, and small change. We display both so you always know what things cost.'
    },
    {
      q: language === 'km' ? 'តើ Trip Pass ($2.99) មានសុពលភាពប៉ុន្មានថ្ងៃ?' : 'How long does the $2.99 Trip Pass last?',
      a: language === 'km'
        ? 'Trip Pass មានសុពលភាពសម្រាប់ដំណើរកម្សាន្តរបស់អ្នកទាំងមូលនៅកម្ពុជា (រហូតដល់ ៣០ ថ្ងៃ) ដោយអនុញ្ញាតឱ្យអ្នកកែសម្រួលគម្រោងជាមួយ AI និងទាញយកកាលវិភាគបានគ្មានដែនកំណត់។'
        : 'The Trip Pass covers your entire single vacation in Cambodia (up to 30 days). You get full unlimited AI adjustments, budget exports, and personalized food guides throughout your trip.'
    },
    {
      q: language === 'km' ? 'តើខ្ញុំអាចប្រើ WisGo ដោយឥតគិតថ្លៃបានទេ?' : 'Can I use WisGo for free without purchasing a plan?',
      a: language === 'km'
        ? 'បាទ/ចាស! គម្រោង Free គឺឥតគិតថ្លៃ ១០០% ជារៀងរហូត។ អ្នកអាចស្វែងរកគោលដៅទេសចរណ៍ទាំងអស់ មើលផែនទី ពិនិត្យអាកាសធាតុ និងសួរ AI កម្រិតមូលដ្ឋានបានគ្រប់ពេល។'
        : 'Absolutely! WisGo Free is 100% free forever. You can browse all Cambodian destinations, explore interactive maps, check real-time weather, and use basic AI discovery.'
    },
    {
      q: language === 'km' ? 'តើខ្ញុំអាចទូទាត់ប្រាក់តាមមធ្យោបាយណាខ្លះ?' : 'What payment methods are supported?',
      a: language === 'km'
        ? 'យើងគាំទ្រការទូទាត់តាមកាតឥណទានអន្តរជាតិ (Visa, Mastercard), Google Pay, Apple Pay និង Bakong KHQR (សម្រាប់ធនាគារក្នុងស្រុក)។'
        : 'We support all major international cards (Visa, Mastercard, Amex), Google Pay, Apple Pay, and local Cambodian Bakong KHQR transfers.'
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      
      {/* Pricing Hero Header */}
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

      {/* 3 Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
        {plans.map((plan) => {
          const priceInfo = formatPrice(plan.usdPrice, plan.period);

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
                plan.isPopular
                  ? 'bg-white border-2 border-[#0B7A5C] shadow-xl ring-4 ring-[#0B7A5C]/10'
                  : 'bg-white border border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Recommended Badge for Trip Pass */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0B7A5C] to-[#21C87A] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>{plan.badge}</span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-[#1E293B]">{plan.name}</h3>
                  {!plan.isPopular && (
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
              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${plan.ctaStyle}`}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </section>

      {/* Plan Feature Comparison Table */}
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
              {comparisonMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {row.feature}
                  </td>
                  
                  {/* Free Col */}
                  <td className="py-3.5 px-4 text-center text-slate-600">
                    {typeof row.free === 'boolean' ? (
                      row.free ? (
                        <Check className="w-4 h-4 text-[#0B7A5C] mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )
                    ) : (
                      row.free
                    )}
                  </td>

                  {/* Trip Pass Col */}
                  <td className="py-3.5 px-4 text-center font-semibold text-[#0B7A5C] bg-[#DFF7ED]/20">
                    {typeof row.pass === 'boolean' ? (
                      row.pass ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0B7A5C] mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )
                    ) : (
                      row.pass
                    )}
                  </td>

                  {/* WisGo Plus Col */}
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                    {typeof row.plus === 'boolean' ? (
                      row.plus ? (
                        <Check className="w-4 h-4 text-[#0B7A5C] mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )
                    ) : (
                      row.plus
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Why WisGo? Section */}
      <section className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#0B7A5C] to-[#08533F] text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
          {/* Subtle Background Art */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
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
            {whyWisgoItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-2.5 hover:bg-white/15 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white text-[#0B7A5C] flex items-center justify-center font-bold shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white">{item.title}</h3>
                  <p className="text-xs text-emerald-100 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
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
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs"
            >
              <h4 className="font-bold text-sm text-[#1E293B] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#0B7A5C] shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xs">
        <div className="flex items-center justify-center gap-2.5">
          <div className="bg-white border-2 border-[#0B7A5C] p-1.5 rounded-xl shadow-xs flex items-center justify-center">
            <WisgoLogo className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-[#1E293B]">Wis<span className="text-[#0B7A5C]">GO</span> Cambodia</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-[#1E293B]">
          {language === 'km' 
            ? 'ត្រៀមខ្លួនសម្រាប់ដំណើរកម្សាន្តដ៏អស្ចារ្យនៅកម្ពុជាហើយឬនៅ?' 
            : 'Ready for an Unforgettable Journey Across Cambodia?'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {language === 'km'
            ? 'ចាប់ផ្តើមរៀបចំកាលវិភាគដើរលេងរបស់អ្នកជាមួយ Trip Pass ($2.99) ឬប្រើប្រាស់ឥតគិតថ្លៃថ្ងៃនេះ។'
            : 'Start creating your customized Cambodian itinerary with the Trip Pass ($2.99) or explore for free today.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => handleSelectPlan('trip-pass')}
            className="px-6 py-3 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#21C87A]" />
            <span>{language === 'km' ? 'ទទួលបាន Trip Pass — $2.99' : 'Get Trip Pass — $2.99 (~12,200 ៛)'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('explore')}
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <span>{language === 'km' ? 'រុករកគោលដៅឥតគិតថ្លៃ' : 'Explore Free Destinations'}</span>
          </button>
        </div>
      </section>

      {/* Plan Selection / Checkout Modal */}
      <AnimatePresence>
        {selectedPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative"
            >
              <button
                onClick={() => setSelectedPlanModal(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {paymentSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 bg-[#DFF7ED] text-[#0B7A5C] rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E293B]">
                    {language === 'km' ? 'ការទូទាត់ជោគជ័យ!' : 'Plan Activated Successfully!'}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {language === 'km'
                      ? 'Trip Pass របស់អ្នកត្រូវបានបើកដំណើរការ។ កំពុងនាំអ្នកទៅកាន់កម្មវិធីរៀបចំគម្រោង...'
                      : 'Your Trip Pass is now active. Redirecting you to your interactive itinerary planner...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#DFF7ED] text-[#0B7A5C]">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1E293B]">
                        {selectedPlanModal === 'trip-pass' ? 'WisGO Trip Pass' : 'WisGO Plus Subscription'}
                      </h3>
                      <p className="text-xs text-[#0B7A5C] font-semibold">
                        {selectedPlanModal === 'trip-pass' ? '$2.99 / trip (~12,250 ៛)' : '$4.99 / month (~20,500 ៛)'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'km'
                      ? 'ទទួលបានការកែសម្រួលគម្រោង AI គ្មានដែនកំណត់ ការទាញយកកាលវិភាគ និងការណែនាំតម្លៃពិតនៅកម្ពុជា។'
                      : 'Unlock unlimited AI adjustments, downloadable travel budget itineraries, and verified Cambodian prices.'}
                  </p>

                  <div className="bg-[#F8FCFA] p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{language === 'km' ? 'ចំនួនសរុប (USD)' : 'Total (USD)'}</span>
                      <span>{selectedPlanModal === 'trip-pass' ? '$2.99' : '$4.99'}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>{language === 'km' ? 'ប្រាក់រៀលខ្មែរ (KHR)' : 'Cambodian Riel (KHR)'}</span>
                      <span>{selectedPlanModal === 'trip-pass' ? '≈ 12,250 ៛' : '≈ 20,500 ៛'}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{language === 'km' ? 'វិធីទូទាត់៖' : 'Payment Method:'}</span>
                      <span className="font-semibold text-slate-700">Bakong KHQR / Card / Google Pay</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleSimulateActivate}
                      className="w-full py-3.5 rounded-2xl bg-[#0B7A5C] hover:bg-[#086048] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{language === 'km' ? 'បញ្ជាក់ការទូទាត់ & បើកដំណើរការ' : 'Confirm & Activate Plan'}</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-400">
                      {language === 'km' ? 'ធានាសុវត្ថិភាពទូទាត់ ១០០% • អាចលុបចោលបានគ្រប់ពេល' : '100% Secure Checkout • Instant Access'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
