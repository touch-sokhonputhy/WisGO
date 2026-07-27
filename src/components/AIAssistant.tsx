import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Globe, DollarSign, Languages, Compass, Loader2, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types';
import { CurrencyConverter } from './CurrencyConverter';
import { WisgoLogo } from './WisgoLogo';

interface AIAssistantProps {
  initialPrompt?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ initialPrompt }) => {
  const { userProfile } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Som Swakum! 🇰🇭 I'm **WisGO AI**, your authentic Cambodian youth local guide and travel assistant.\n\nI can build **custom Khmer itineraries**, estimate PassApp/tuk-tuk fare prices, recommend street food spots (Fish Amok, Lok Lak, Crab with Kampot pepper), and provide polite Khmer phrase pronunciations.\n\nHow can I help you explore Cambodia today?`,
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [showConverterMobile, setShowConverterMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          userPreferences: userProfile?.preferences
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to generate response');
      }

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **WisGO Notice:** I couldn't process that query right now (${err.message || 'Server error'}). Please ensure your Gemini API key is configured or try again in a moment!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: '3-Day Siem Reap & Angkor Itinerary',
      icon: Compass,
      query: 'Generate a 3-day authentic Siem Reap itinerary including Angkor Wat sunrise, Bayon, and Pub Street Khmer street food.'
    },
    {
      label: 'Kampot & Kep Weekend Trip',
      icon: Globe,
      query: 'What is the best 2-day plan to experience Kampot pepper farms, kayaking down the river, and fresh Kep crab market?'
    },
    {
      label: 'Essential Khmer Phrases',
      icon: Languages,
      query: 'Provide 5 essential Khmer phrases for ordering food and greeting locals, written with English phonetics.'
    },
    {
      label: 'PassApp Tuk-Tuk & Currency Guide',
      icon: DollarSign,
      query: 'Explain USD ($) and Cambodian Riel (KHR) dual currency usage, PassApp tuk-tuk pricing, and tipping in Cambodia.'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      {/* Main Chat Interface */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col h-[650px] overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#F8FCFA] border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-[#0B7A5C] flex items-center justify-center font-bold shadow-xs p-1">
              <WisgoLogo className="w-6 h-6" strokeColor="#0B7A5C" />
            </div>
            <div>
              <h3 className="font-bold text-[#1E293B] text-base flex items-center gap-2">
                <span>WisGO AI Local Travel Assistant</span>
              </h3>
              <p className="text-xs text-slate-500">
                Powered by Gemini 3.6 Flash • Context: {userProfile?.preferences?.preferredLanguage || 'English'} ({userProfile?.preferences?.preferredCurrency || 'USD'})
              </p>
            </div>
          </div>

          {/* Mobile Converter Toggle */}
          <button
            onClick={() => setShowConverterMobile(!showConverterMobile)}
            className="lg:hidden px-3 py-1.5 rounded-xl bg-[#DFF7ED] text-[#0B7A5C] text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>USD ⇄ KHR</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.query)}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#DFF7ED] text-slate-700 hover:text-[#0B7A5C] border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <Icon className="w-3.5 h-3.5 text-[#0B7A5C]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F8FCFA]">
          {messages.map(msg => (
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

              {/* Bubble */}
              <div className={`max-w-[85%] sm:max-w-[78%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#0B7A5C] text-white font-medium rounded-tr-none shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-wrap shadow-xs'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#DFF7ED] text-[#0B7A5C] border border-[#21C87A]/30 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-[#0B7A5C] flex items-center gap-2 shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>WisGO AI is preparing local Cambodian insights...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about Siem Reap, Kampot pepper, Kep crab, or PassApp tuk-tuks..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-[#F8FCFA] border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B7A5C]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3.5 rounded-2xl bg-[#0B7A5C] hover:bg-[#086048] text-white font-bold transition-all shadow-xs disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Sidebar Tool Column (Desktop & Mobile view) */}
      <div className={`space-y-4 ${showConverterMobile ? 'block' : 'hidden lg:block'}`}>
        <CurrencyConverter onSendToChat={(text) => handleSendMessage(text)} />
      </div>

    </div>
  );
};
