import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, RefreshCw, DollarSign, Coins, Sparkles, Copy, Check, Info } from 'lucide-react';

interface CurrencyConverterProps {
  onSendToChat?: (text: string) => void;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onSendToChat }) => {
  const [rate, setRate] = useState<number>(4050); // Default standard Cambodian bank rate
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Standard Rate');
  const [copied, setCopied] = useState<boolean>(false);

  const [usdAmount, setUsdAmount] = useState<string>('10');
  const [khrAmount, setKhrAmount] = useState<string>('40500');

  const fetchExchangeRate = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && data.rates.KHR) {
          const khrRate = Math.round(data.rates.KHR);
          setRate(khrRate);
          setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          
          // Re-calculate KHR based on current USD
          const usdVal = parseFloat(usdAmount) || 0;
          setKhrAmount(Math.round(usdVal * khrRate).toLocaleString('en-US'));
        }
      }
    } catch (err) {
      console.warn('Currency API offline, using standard Cambodian exchange rate 1 USD = 4,050 KHR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const handleUsdChange = (val: string) => {
    setUsdAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setKhrAmount(Math.round(num * rate).toLocaleString('en-US'));
    } else {
      setKhrAmount('');
    }
  };

  const handleKhrChange = (val: string) => {
    const rawVal = val.replace(/,/g, '');
    setKhrAmount(val);
    const num = parseFloat(rawVal);
    if (!isNaN(num)) {
      setUsdAmount((num / rate).toFixed(2));
    } else {
      setUsdAmount('');
    }
  };

  const presets = [
    { label: '$1 Iced Coffee', usd: '1' },
    { label: '$3 PassApp Ride', usd: '3' },
    { label: '$5 Lok Lak Meal', usd: '5' },
    { label: '$37 Angkor Pass', usd: '37' }
  ];

  const handleCopy = () => {
    const text = `$${usdAmount || '0'} USD = ${khrAmount || '0'} KHR (Rate: 1 USD = ${rate.toLocaleString()} KHR)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Title & Live Rate Badge */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center font-bold">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-[#1E293B] text-xs sm:text-sm">
              USD ⇄ KHR Converter
            </h4>
            <p className="text-[10px] text-slate-500">
              1 USD = <span className="font-bold text-[#0B7A5C]">{rate.toLocaleString()} ៛</span>
            </p>
          </div>
        </div>

        <button
          onClick={fetchExchangeRate}
          disabled={loading}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh exchange rate"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Input Fields */}
      <div className="space-y-3">
        {/* USD Input */}
        <div>
          <label className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
            <span>US Dollar ($)</span>
            <span className="text-[10px] font-medium text-slate-400">Primary Currency</span>
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
          <div className="w-6 h-6 rounded-full bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center border border-[#21C87A]/30">
            <ArrowLeftRight className="w-3 h-3" />
          </div>
        </div>

        {/* KHR Input */}
        <div>
          <label className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
            <span>Cambodian Riel (KHR ៛)</span>
            <span className="text-[10px] font-medium text-slate-400">Local Currency</span>
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
          Common Travel Prices:
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleUsdChange(p.usd)}
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
          <span>{copied ? 'Copied!' : 'Copy Rate'}</span>
        </button>

        {onSendToChat && (
          <button
            onClick={() => {
              onSendToChat(`Can you explain if paying $${usdAmount || '10'} (${khrAmount || '40,500'} KHR) is standard price for local street food or PassApp tuk-tuk in Cambodia?`);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#21C87A]" />
            <span>Ask AI Price</span>
          </button>
        )}
      </div>

      {/* Dual Currency Tip */}
      <p className="text-[10px] text-slate-500 leading-tight bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-start gap-1">
        <Info className="w-3 h-3 text-[#0B7A5C] shrink-0 mt-0.5" />
        <span>In Cambodia, USD is used for major items, while KHR ៛ is given back as change for amounts under $1.</span>
      </p>
    </div>
  );
};
