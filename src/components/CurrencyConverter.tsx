import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, RefreshCw, Coins, Sparkles, Copy, Check, Info, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CurrencyConverterProps {
  onSendToChat?: (text: string) => void;
}

interface ForeignCurrency {
  code: string;
  name: string;
  khmerName: string;
  symbol: string;
  flag: string;
  defaultRateToUsd: number; // units per 1 USD
}

const SUPPORTED_CURRENCIES: ForeignCurrency[] = [
  { code: 'USD', name: 'US Dollar', khmerName: 'ដុល្លារអាមេរិក', symbol: '$', flag: '🇺🇸', defaultRateToUsd: 1 },
  { code: 'EUR', name: 'Euro', khmerName: 'អឺរ៉ូ', symbol: '€', flag: '🇪🇺', defaultRateToUsd: 0.92 },
  { code: 'GBP', name: 'British Pound', khmerName: 'ផោនអង់គ្លេស', symbol: '£', flag: '🇬🇧', defaultRateToUsd: 0.79 },
  { code: 'AUD', name: 'Australian Dollar', khmerName: 'ដុល្លារអូស្ត្រាលី', symbol: 'A$', flag: '🇦🇺', defaultRateToUsd: 1.52 },
  { code: 'CAD', name: 'Canadian Dollar', khmerName: 'ដុល្លារកាណាដា', symbol: 'C$', flag: '🇨🇦', defaultRateToUsd: 1.36 },
  { code: 'JPY', name: 'Japanese Yen', khmerName: 'យ៉េនជប៉ុន', symbol: '¥', flag: '🇯🇵', defaultRateToUsd: 155.5 },
  { code: 'CNY', name: 'Chinese Yuan', khmerName: 'យ័នចិន', symbol: '¥', flag: '🇨🇳', defaultRateToUsd: 7.23 },
  { code: 'SGD', name: 'Singapore Dollar', khmerName: 'ដុល្លារសិង្ហបុរី', symbol: 'S$', flag: '🇸🇬', defaultRateToUsd: 1.35 },
  { code: 'KRW', name: 'South Korean Won', khmerName: 'វ៉ុនកូរ៉េ', symbol: '₩', flag: '🇰🇷', defaultRateToUsd: 1370.0 },
  { code: 'VND', name: 'Vietnamese Dong', khmerName: 'ដុងវៀតណាម', symbol: '₫', flag: '🇻🇳', defaultRateToUsd: 25400.0 },
  { code: 'INR', name: 'Indian Rupee', khmerName: 'រូពីឥណ្ឌា', symbol: '₹', flag: '🇮🇳', defaultRateToUsd: 83.5 },
  { code: 'MYR', name: 'Malaysian Ringgit', khmerName: 'រីងហ្គីតម៉ាឡេស៊ី', symbol: 'RM', flag: '🇲🇾', defaultRateToUsd: 4.71 },
  { code: 'NZD', name: 'New Zealand Dollar', khmerName: 'ដុល្លារនូវែលហ្សេឡង់', symbol: 'NZ$', flag: '🇳🇿', defaultRateToUsd: 1.64 },
  { code: 'CHF', name: 'Swiss Franc', khmerName: 'ហ្វ្រង់ស្វីស', symbol: 'CHF', flag: '🇨🇭', defaultRateToUsd: 0.91 },
  { code: 'HKD', name: 'Hong Kong Dollar', khmerName: 'ដុល្លារហុងកុង', symbol: 'HK$', flag: '🇭🇰', defaultRateToUsd: 7.82 },
  { code: 'TWD', name: 'New Taiwan Dollar', khmerName: 'ដុល្លារតៃវ៉ាន់', symbol: 'NT$', flag: '🇹🇼', defaultRateToUsd: 32.4 },
  { code: 'IDR', name: 'Indonesian Rupiah', khmerName: 'រូពៀឥណ្ឌូណេស៊ី', symbol: 'Rp', flag: '🇮🇩', defaultRateToUsd: 16200.0 },
  { code: 'PHP', name: 'Philippine Peso', khmerName: 'ប៉េសូហ្វីលីពីន', symbol: '₱', flag: '🇵🇭', defaultRateToUsd: 58.2 }
];

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onSendToChat }) => {
  const { language, t } = useLanguage();
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');
  const [rates, setRates] = useState<Record<string, number>>({
    KHR: 4050,
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    AUD: 1.52,
    CAD: 1.36,
    JPY: 155.5,
    CNY: 7.23,
    SGD: 1.35,
    KRW: 1370.0,
    VND: 25400.0,
    INR: 83.5,
    MYR: 4.71,
    NZD: 1.64,
    CHF: 0.91,
    HKD: 7.82,
    TWD: 32.4,
    IDR: 16200.0,
    PHP: 58.2
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Amount inputs
  const [homeAmount, setHomeAmount] = useState<string>('10');
  const [usdAmount, setUsdAmount] = useState<string>('10');
  const [khrAmount, setKhrAmount] = useState<string>('40500');

  const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrencyCode) || SUPPORTED_CURRENCIES[0];

  const fetchExchangeRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          setRates(data.rates);
          recalculateFromUsd(parseFloat(usdAmount) || 10, data.rates, selectedCurrencyCode);
        }
      }
    } catch (err) {
      console.warn('Currency API offline, using standard fallback rates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  // Recalculate all fields from USD
  const recalculateFromUsd = (usdVal: number, ratesObj = rates, currCode = selectedCurrencyCode) => {
    const khrRate = ratesObj.KHR || 4050;
    const currRate = ratesObj[currCode] || 1;

    setUsdAmount(usdVal.toString());
    setKhrAmount(Math.round(usdVal * khrRate).toLocaleString('en-US'));

    if (currCode === 'USD') {
      setHomeAmount(usdVal.toString());
    } else {
      const foreignVal = usdVal * currRate;
      setHomeAmount(foreignVal < 10 ? foreignVal.toFixed(2) : Math.round(foreignVal).toString());
    }
  };

  // Recalculate when user changes foreign home currency tab/select
  const handleCurrencySelect = (newCode: string) => {
    setSelectedCurrencyCode(newCode);
    const currRate = rates[newCode] || 1;
    const usdVal = parseFloat(usdAmount) || 10;
    if (newCode === 'USD') {
      setHomeAmount(usdVal.toString());
    } else {
      const foreignVal = usdVal * currRate;
      setHomeAmount(foreignVal < 10 ? foreignVal.toFixed(2) : Math.round(foreignVal).toString());
    }
  };

  // Handle Home Currency Input Change
  const handleHomeAmountChange = (val: string) => {
    setHomeAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const currRate = rates[selectedCurrencyCode] || 1;
      const khrRate = rates.KHR || 4050;
      const usdVal = num / currRate;
      setUsdAmount(usdVal < 10 ? usdVal.toFixed(2) : (Math.round(usdVal * 100) / 100).toString());
      setKhrAmount(Math.round(usdVal * khrRate).toLocaleString('en-US'));
    } else {
      setUsdAmount('');
      setKhrAmount('');
    }
  };

  // Handle USD Input Change
  const handleUsdChange = (val: string) => {
    setUsdAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      recalculateFromUsd(num);
    } else {
      setHomeAmount('');
      setKhrAmount('');
    }
  };

  // Handle KHR Input Change
  const handleKhrChange = (val: string) => {
    const rawVal = val.replace(/,/g, '');
    setKhrAmount(val);
    const num = parseFloat(rawVal);
    if (!isNaN(num)) {
      const khrRate = rates.KHR || 4050;
      const usdVal = num / khrRate;
      setUsdAmount(usdVal.toFixed(2));

      const currRate = rates[selectedCurrencyCode] || 1;
      const homeVal = usdVal * currRate;
      setHomeAmount(homeVal < 10 ? homeVal.toFixed(2) : Math.round(homeVal).toString());
    } else {
      setUsdAmount('');
      setHomeAmount('');
    }
  };

  const presets = [
    { label: language === 'km' ? '$1 កាហ្វេទឹកកក' : '$1 Iced Coffee', usd: 1 },
    { label: language === 'km' ? '$3 ជិះ PassApp/កង់បី' : '$3 PassApp Ride', usd: 3 },
    { label: language === 'km' ? '$5 បាយឡុកឡាក់' : '$5 Lok Lak Meal', usd: 5 },
    { label: language === 'km' ? '$37 សំបុត្រអង្គរ' : '$37 Angkor Pass', usd: 37 }
  ];

  const handleCopy = () => {
    const text = `${homeAmount || '0'} ${selectedCurrency.code} (${selectedCurrency.symbol}) = $${usdAmount || '0'} USD = ${khrAmount || '0'} KHR (1 USD = ${Math.round(rates.KHR || 4050).toLocaleString()} ៛)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Rate calculations display
  const khrPerUsd = Math.round(rates.KHR || 4050);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Title & Live Rate Refresh */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center font-bold">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-[#1E293B] text-xs sm:text-sm flex items-center gap-1.5">
              <span>{t('currency.title', 'Multi-Region Currency Converter')}</span>
            </h4>
            <p className="text-[10px] text-slate-500">
              {t('currency.live_rate', 'Live Rate')}: 1 USD = <span className="font-bold text-[#0B7A5C]">{khrPerUsd.toLocaleString()} ៛</span>
            </p>
          </div>
        </div>

        <button
          onClick={fetchExchangeRates}
          disabled={loading}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
          title={t('currency.refresh', 'Refresh exchange rates')}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Select Foreign Tourist Home Currency */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-[#0B7A5C]" />
          <span>{t('currency.select_home', 'Select Your Home Currency:')}</span>
        </label>
        <div className="relative">
          <select
            value={selectedCurrencyCode}
            onChange={(e) => handleCurrencySelect(e.target.value)}
            className="w-full bg-[#F8FCFA] border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#0B7A5C] cursor-pointer"
          >
            {SUPPORTED_CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.flag} {curr.code} - {language === 'km' ? curr.khmerName : curr.name} ({curr.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Fields Stack */}
      <div className="space-y-3 pt-1">
        {/* Home Currency Input (If not USD) */}
        {selectedCurrencyCode !== 'USD' && (
          <div>
            <label className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
              <span>{t('currency.home_label', 'Your Home Currency')} ({selectedCurrency.flag} {selectedCurrency.code})</span>
              <span className="text-[10px] font-medium text-slate-400">{t('currency.region_tag', 'Tourist Region')}</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">
                {selectedCurrency.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                value={homeAmount}
                onChange={(e) => handleHomeAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs font-bold text-[#0B7A5C] focus:outline-none focus:border-[#0B7A5C]"
              />
            </div>
          </div>
        )}

        {/* Swap visual */}
        {selectedCurrencyCode !== 'USD' && (
          <div className="flex justify-center -my-1">
            <div className="w-5 h-5 rounded-full bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center border border-[#21C87A]/30">
              <ArrowLeftRight className="w-2.5 h-2.5" />
            </div>
          </div>
        )}

        {/* USD Input */}
        <div>
          <label className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
            <span>{t('currency.usd_label', 'US Dollar ($ USD)')}</span>
            <span className="text-[10px] font-medium text-slate-400">{t('currency.usd_tag', 'Primary Foreign Currency in KH')}</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">$</span>
            <input
              type="number"
              step="any"
              min="0"
              value={usdAmount}
              onChange={(e) => handleUsdChange(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-3 py-2 bg-[#F8FCFA] border border-slate-200 rounded-xl text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#0B7A5C]"
            />
          </div>
        </div>

        {/* Swap Visual */}
        <div className="flex justify-center -my-1">
          <div className="w-5 h-5 rounded-full bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center border border-[#21C87A]/30">
            <ArrowLeftRight className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* KHR Input */}
        <div>
          <label className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
            <span>{t('currency.khr_label', 'Cambodian Riel (KHR ៛)')}</span>
            <span className="text-[10px] font-medium text-slate-400">{t('currency.khr_tag', 'Local Khmer Currency')}</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">៛</span>
            <input
              type="text"
              value={khrAmount}
              onChange={(e) => handleKhrChange(e.target.value)}
              placeholder="0"
              className="w-full pl-8 pr-3 py-2 bg-[#F8FCFA] border border-slate-200 rounded-xl text-xs font-bold text-[#0B7A5C] focus:outline-none focus:border-[#0B7A5C]"
            />
          </div>
        </div>
      </div>

      {/* Common Cambodian Presets */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {t('currency.common_prices', 'Common Travel Prices:')}
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleUsdChange(p.usd.toString())}
              className="p-1.5 bg-[#F8FCFA] hover:bg-[#DFF7ED] border border-slate-200 hover:border-[#0B7A5C] rounded-xl text-[11px] font-medium text-slate-700 hover:text-[#0B7A5C] transition-all text-left truncate cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={handleCopy}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? t('currency.copied', 'Copied!') : t('currency.copy_rate', 'Copy Rate')}</span>
        </button>

        {onSendToChat && (
          <button
            onClick={() => {
              const promptQuery = language === 'km'
                ? `តើតម្លៃ ${selectedCurrency.symbol}${homeAmount || '10'} ${selectedCurrency.code} ($${usdAmount || '10'} USD / ${khrAmount || '40,500'} KHR) សមរម្យដែរឬទេ សម្រាប់អាហារតាមផ្លូវ ឬការជិះកង់បី (Tuk-Tuk) នៅកម្ពុជា?`
                : `Is paying ${selectedCurrency.symbol}${homeAmount || '10'} ${selectedCurrency.code} ($${usdAmount || '10'} USD / ${khrAmount || '40,500'} KHR) a fair price for local street food or tuk-tuk in Cambodia?`;
              onSendToChat(promptQuery);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#21C87A]" />
            <span>{t('currency.ask_ai_price', 'Ask AI Price')}</span>
          </button>
        )}
      </div>

      {/* Dual Currency Tip */}
      <p className="text-[10px] text-slate-500 leading-tight bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-start gap-1">
        <Info className="w-3 h-3 text-[#0B7A5C] shrink-0 mt-0.5" />
        <span>{t('currency.dual_currency_tip', 'Cambodia uses a dual-currency system (USD & KHR ៛). Change under $1 USD is given back in Cambodian Riel.')}</span>
      </p>
    </div>
  );
};
