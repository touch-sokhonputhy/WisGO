import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Send, Bot, User, Globe, DollarSign, Languages, Compass, Loader2, Coins, RotateCw, Sparkles, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ChatMessage, TripPlan } from '../types';
import { CurrencyConverter } from './CurrencyConverter';
import { WisgoLogo } from './WisgoLogo';
import { parseItineraryFromResponse, cleanChatText } from '../utils/tripParser';
import { persistTrip } from '../utils/tripStorage';
import { ActionableItineraryCard } from './ActionableItineraryCard';
import { AITripPlannerModal } from './AITripPlannerModal';
import { AIAssistantSkeleton } from './AIAssistantSkeleton';

interface AIAssistantProps {
  initialPrompt?: string;
  initialTripContext?: TripPlan;
  onOpenMyTrips?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  initialPrompt,
  initialTripContext,
  onOpenMyTrips
}) => {
  const { userProfile } = useAuth();
  const { language, t } = useLanguage();

  const getWelcomeMessage = (lang: 'en' | 'km'): string => {
    if (lang === 'km') {
      return `សូមស្វាគមន៍មកកាន់ប្រទេសកម្ពុជា! 🇰🇭 ខ្ញុំជា **WisGO AI** ជាជំនួយការរៀបចំដំណើរកម្សាន្តឆ្លាតវៃ និងមគ្គុទ្ទេសក៍ទេសចរណ៍យុវជនក្នុងស្រុក។\n\nខ្ញុំមិនត្រឹមតែផ្តល់យោបល់ទេសចរណ៍ទូទៅប៉ុណ្ណោះទេ ប៉ុន្តែជួយអ្នក **បង្កើតគម្រោងធ្វើដំណើរជាក់ស្តែង (Actionable Itinerary)** ដោយបែងចែកតាម **ថ្ងៃ (Day 1, 2...) និងពេល (ព្រឹក រសៀល ល្ងាច)** រួមមានតម្លៃ PassApp ប៉ាន់ស្មាន ម៉ោងបើកទ្វារ និងគន្លឹះយុវជនក្នុងស្រុក។\n\nចុចប៊ូតុង **"Plan a Trip with AI"** ឬសរសេរសំណួររបស់អ្នកខាងក្រោម!`;
    }
    return `Som Swakum! 🇰🇭 I'm **WisGO AI**, your authentic Cambodian youth local guide & actionable travel planning assistant.\n\nWisGO doesn't just give generic recommendations — I help turn ideas into organized, actionable schedules. I can build **structured Day-by-Day itineraries** with PassApp tuk-tuk fares, opening hours, local youth tips, and instant sync to **Google Calendar** and **Gmail**!\n\nClick **"Plan a Trip with AI"** above, or ask me anything to get started!`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: getWelcomeMessage(language),
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [lastSentPrompt, setLastSentPrompt] = useState<string>('');
  const [showConverterMobile, setShowConverterMobile] = useState(false);
  const [isPlannerModalOpen, setIsPlannerModalOpen] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState<TripPlan | null>(initialTripContext || null);
  const [savedTripIds, setSavedTripIds] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update initial welcome message if no user interaction yet
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'msg-welcome') {
        return [{
          id: 'msg-welcome',
          sender: 'assistant',
          text: getWelcomeMessage(language),
          timestamp: new Date()
        }];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (initialTripContext) {
      setCurrentItinerary(initialTripContext);
    }
  }, [initialTripContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSaveTripAction = async (trip: TripPlan) => {
    try {
      await persistTrip(trip, userProfile?.uid);
      setSavedTripIds(prev => new Set([...prev, trip.id]));
    } catch (err) {
      console.error('Failed to save trip:', err);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    setLastSentPrompt(textToSend.trim());
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      // Build conversation history to send for continuous contextual conversation
      const conversationHistory = messages.slice(-5).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory,
          currentTripContext: currentItinerary ? {
            id: currentItinerary.id,
            title: currentItinerary.title,
            destination: currentItinerary.destination,
            durationDays: currentItinerary.durationDays,
            days: currentItinerary.days
          } : undefined,
          userPreferences: {
            ...userProfile?.preferences,
            preferredLanguage: language === 'km' ? 'Khmer' : 'English'
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to generate response');
      }

      const responseText = data.text || "Orkun! I'm ready to help with your Cambodian journey.";

      // Check if response contains an actionable itinerary
      const extractedPlan = parseItineraryFromResponse(responseText);
      if (extractedPlan) {
        setCurrentItinerary(extractedPlan);
      }

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const raw = err?.message || String(err || '');
      let cleanMessage = raw;
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed?.error?.message) {
            cleanMessage = parsed.error.message;
          }
        }
      } catch {}

      const isDemandError = cleanMessage.includes('503') || cleanMessage.includes('high demand') || cleanMessage.includes('UNAVAILABLE');

      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: language === 'km'
          ? (isDemandError
              ? `⚠️ **បណ្តាញ AI កំពុងមានតម្រូវការខ្ពស់បណ្តោះអាសន្ន (503):** ម៉ូដែលកំពុងមានចរាចរណ៍ច្រើន។ សូមចុចប៊ូតុង **សាកល្បងម្តងទៀត** ខាងក្រោម!`
              : `⚠️ **WisGO សេចក្តីជូនដំណឹង:** មិនអាចដំណើរការសំណួរនេះបានទេ (${cleanMessage})។ សូមព្យាយាមម្តងទៀត!`)
          : (isDemandError
              ? `⚠️ **AI Service High Demand (503):** The model is experiencing a temporary spike in traffic. Please tap **Retry Question** below to resend!`
              : `⚠️ **WisGO Notice:** Could not process query (${cleanMessage}). Please try again!`),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: t('assistant.starter_1', '3-Day Siem Reap & Angkor Itinerary'),
      icon: Compass,
      query: 'Plan an actionable 3-day trip to Siem Reap for 2 travelers, moderate budget. Include Angkor Wat sunrise, Bayon, PassApp fares, estimated costs, and Pub Street Khmer food.'
    },
    {
      label: t('assistant.starter_2', 'Kampot & Kep Weekend Trip'),
      icon: Globe,
      query: 'Create a 2-day actionable itinerary for Kampot & Kep focusing on pepper plantation visits, river kayaking, and fresh Kep crab market with estimated tuk-tuk costs.'
    },
    {
      label: t('assistant.starter_3', 'Essential Khmer Phrases'),
      icon: Languages,
      query: 'Provide 5 essential Khmer phrases for ordering food and greeting locals, written with English phonetics and Khmer script.'
    },
    {
      label: t('assistant.starter_4', 'PassApp Tuk-Tuk & Currency Guide'),
      icon: DollarSign,
      query: 'Explain USD ($) and Cambodian Riel (KHR) dual currency usage, PassApp tuk-tuk pricing, and tipping etiquette in Cambodia.'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      {/* Main Chat Interface */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col h-[580px] sm:h-[650px] lg:h-[720px] overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-[#F8FCFA] via-white to-[#F0FAF5] border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white border-2 border-[#0B7A5C] flex items-center justify-center font-bold shadow-xs p-1 shrink-0">
              <WisgoLogo className="w-5 h-5 sm:w-6 sm:h-6" strokeColor="#0B7A5C" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#1E293B] text-sm sm:text-base truncate">
                  {t('assistant.title', 'WisGO AI Travel Planning Assistant')}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DFF7ED] text-[#0B7A5C] text-[10px] font-extrabold uppercase shrink-0">
                  Actionable Itineraries
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {t('assistant.subtitle', 'Powered by Gemini AI')} • {language === 'km' ? 'ភាសា៖ ខ្មែរ' : 'Language: English'} ({userProfile?.preferences?.preferredCurrency || 'USD'})
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsPlannerModalOpen(true)}
              className="px-3 sm:px-3.5 py-2 min-h-[38px] rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all shrink-0"
              title="Open structured trip generator"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#21C87A]" />
              <span className="hidden sm:inline">Plan a Trip</span>
            </button>

            {onOpenMyTrips && (
              <button
                onClick={onOpenMyTrips}
                className="px-2.5 sm:px-3 py-2 min-h-[38px] rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                title="View My Saved Trips"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden md:inline">My Trips</span>
              </button>
            )}

            {/* Mobile Converter Toggle */}
            <button
              onClick={() => setShowConverterMobile(!showConverterMobile)}
              className={`lg:hidden p-2 min-h-[38px] min-w-[38px] rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${
                showConverterMobile ? 'bg-[#0B7A5C] text-white' : 'bg-[#DFF7ED] text-[#0B7A5C]'
              }`}
              title="Currency Converter"
            >
              <Coins className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 sm:p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.query)}
                disabled={loading}
                className="px-3 py-1.5 min-h-[36px] rounded-xl bg-white hover:bg-[#DFF7ED] text-slate-700 hover:text-[#0B7A5C] border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <Icon className="w-3.5 h-3.5 text-[#0B7A5C]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 bg-[#F8FCFA]">
          {messages.map(msg => {
            const parsedPlan = msg.sender === 'assistant' ? parseItineraryFromResponse(msg.text) : null;
            const cleanedText = msg.sender === 'assistant' ? cleanChatText(msg.text) : msg.text;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#0B7A5C] text-white'
                    : 'bg-[#DFF7ED] text-[#0B7A5C] border border-[#21C87A]/30'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className={`max-w-[94%] sm:max-w-[88%] ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed inline-block text-left ${
                    msg.sender === 'user'
                      ? 'bg-[#0B7A5C] text-white font-medium rounded-tr-none shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs w-full'
                  }`}>
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div>
                        <div className="markdown-body">
                          <Markdown>{cleanedText}</Markdown>
                        </div>
                        {msg.text.startsWith('⚠️') && lastSentPrompt && (
                          <button
                            onClick={() => handleSendMessage(lastSentPrompt)}
                            disabled={loading}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>{language === 'km' ? 'សាកល្បងម្តងទៀត (Retry)' : 'Retry Question'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* If assistant returned a structured itinerary, render the interactive card! */}
                  {parsedPlan && (
                    <ActionableItineraryCard
                      trip={parsedPlan}
                      isSaved={savedTripIds.has(parsedPlan.id)}
                      onSaveTrip={handleSaveTripAction}
                      onRefineTrip={(refinePrompt) => handleSendMessage(refinePrompt)}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <AIAssistantSkeleton userPrompt={lastSentPrompt} />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={t('assistant.input_placeholder', 'Plan a 3-day Siem Reap trip, ask about PassApp tuk-tuks, or request adjustments...')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 min-h-[44px] bg-[#F8FCFA] border border-slate-200 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B7A5C]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 sm:p-3.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-[#0B7A5C] hover:bg-[#086048] active:scale-95 text-white font-bold transition-all shadow-xs disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Sidebar Tool Column (Desktop & Mobile view) */}
      <div className={`space-y-4 ${showConverterMobile ? 'block' : 'hidden lg:block'}`}>
        {/* Mobile close toggle */}
        {showConverterMobile && (
          <div className="lg:hidden flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Quick Travel Tools</span>
            <button
              type="button"
              onClick={() => setShowConverterMobile(false)}
              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        {/* Quick Trip Planner Callout Card */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-[#DFF7ED] to-white rounded-3xl border border-[#0B7A5C]/20 shadow-xs">
          <div className="flex items-center gap-2 text-[#0B7A5C] font-extrabold text-xs mb-1">
            <Sparkles className="w-4 h-4 text-[#21C87A]" />
            <span>AI Travel Planner</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            Need a Complete Itinerary?
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Generate day-by-day schedules with PassApp fares, estimated costs, and 1-click Google Calendar sync.
          </p>
          <button
            type="button"
            onClick={() => setIsPlannerModalOpen(true)}
            className="mt-3.5 w-full py-2.5 min-h-[40px] rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Trip Planner</span>
          </button>
        </div>

        {/* Currency Converter */}
        <CurrencyConverter onSendToChat={(text) => handleSendMessage(text)} />
      </div>

      {/* Structured AI Trip Planner Modal */}
      <AITripPlannerModal
        isOpen={isPlannerModalOpen}
        onClose={() => setIsPlannerModalOpen(false)}
        onGenerateTrip={(prompt) => handleSendMessage(prompt)}
      />

    </div>
  );
};
