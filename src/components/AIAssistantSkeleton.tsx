import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, Sparkles, Compass, MapPin, Route, Coins, CalendarCheck, Clock, Bookmark, Share2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AIAssistantSkeletonProps {
  userPrompt?: string;
}

export const AIAssistantSkeleton: React.FC<AIAssistantSkeletonProps> = ({ userPrompt }) => {
  const { language } = useLanguage();

  const stepsEn = [
    { text: 'Scanning authentic local attractions & hidden spots...', icon: Compass },
    { text: 'Optimizing PassApp & tuk-tuk travel routes...', icon: Route },
    { text: 'Calculating realistic costs in USD & Cambodian Riel (KHR)...', icon: Coins },
    { text: 'Structuring day-by-day morning, afternoon & evening stops...', icon: CalendarCheck },
    { text: 'Finalizing youth insider tips & calendar integration...', icon: Sparkles }
  ];

  const stepsKm = [
    { text: 'កំពុងស្រាវជ្រាវទីតាំងទេសចរណ៍ និងអនុសាសន៍យុវជនក្នុងស្រុក...', icon: Compass },
    { text: 'កំពុងគណនារយៈពេលធ្វើដំណើរ និងមធ្យោបាយ PassApp...', icon: Route },
    { text: 'កំពុងប៉ាន់ប្រមាណការចំណាយគិតជា ដុល្លារ (USD) និងរៀល (KHR)...', icon: Coins },
    { text: 'កំពុងរៀបចំកាលវិភាគលម្អិតតាមថ្ងៃ ព្រឹក រសៀល និងល្ងាច...', icon: CalendarCheck },
    { text: 'កំពុងរៀបចំគន្លឹះយុវជន និងទម្រង់រក្សាទុកក្នុងប្រតិទិន...', icon: Sparkles }
  ];

  const currentSteps = language === 'km' ? stepsKm : stepsEn;
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(18);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStepIndex(prev => {
        const next = (prev + 1) % currentSteps.length;
        setProgressPercent(Math.min(92, 18 + next * 18));
        return next;
      });
    }, 2200);

    return () => clearInterval(stepInterval);
  }, [currentSteps.length]);

  const CurrentIcon = currentSteps[activeStepIndex].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 w-full"
    >
      {/* Bot Avatar with pulsating ring */}
      <div className="relative shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#0B7A5C] to-[#086048] text-white flex items-center justify-center shadow-xs">
          <Bot className="w-4 h-4" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#21C87A] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#21C87A]"></span>
        </span>
      </div>

      {/* Main Skeleton Wrapper */}
      <div className="flex-1 max-w-[96%] sm:max-w-[90%] space-y-3.5">
        
        {/* Dynamic AI Generation Progress Pill */}
        <div className="bg-white border border-[#0B7A5C]/25 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center shrink-0">
                <CurrentIcon className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-[#0B7A5C] truncate">
                {currentSteps[activeStepIndex].text}
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">
              {progressPercent}%
            </span>
          </div>

          {/* Smooth Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0B7A5C] to-[#21C87A] rounded-full"
              initial={{ width: '15%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Text Bubble Skeleton (Simulating conversational intro) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-32 bg-slate-200/80 rounded-md animate-pulse" />
            <div className="h-3 w-16 bg-[#DFF7ED] rounded-full animate-pulse" />
          </div>
          <div className="h-3 bg-slate-200/70 rounded-full w-5/6 animate-pulse" />
          <div className="h-3 bg-slate-200/60 rounded-full w-full animate-pulse" />
          <div className="h-3 bg-slate-200/50 rounded-full w-3/4 animate-pulse" />
        </div>

        {/* Structured Itinerary Card Skeleton */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          
          {/* Itinerary Header Skeleton */}
          <div className="p-4 sm:p-6 bg-gradient-to-b from-[#F8FCFA] to-white border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-2 w-full max-w-md">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-28 bg-[#DFF7ED] rounded-full animate-pulse" />
                  <div className="h-4 w-16 bg-slate-200/70 rounded-md animate-pulse" />
                </div>
                <div className="h-6 sm:h-7 w-3/4 bg-slate-200/90 rounded-xl animate-pulse" />
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-4 w-24 bg-slate-100 rounded-md animate-pulse" />
                  <div className="h-4 w-20 bg-slate-100 rounded-md animate-pulse" />
                  <div className="h-4 w-24 bg-slate-100 rounded-md animate-pulse" />
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0">
                <div className="h-8 w-20 bg-[#0B7A5C]/20 rounded-xl animate-pulse" />
                <div className="h-8 w-16 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-8 w-16 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-8 w-16 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* Day Tabs Skeleton */}
          <div className="px-4 sm:px-6 pt-3 bg-slate-50/60 border-b border-slate-200/70 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="pb-3 px-4 flex items-center gap-2 border-b-2 border-[#0B7A5C]">
              <div className="h-4 w-16 bg-[#0B7A5C]/25 rounded-md animate-pulse" />
            </div>
            <div className="pb-3 px-4 flex items-center gap-2">
              <div className="h-4 w-16 bg-slate-200/70 rounded-md animate-pulse" />
            </div>
            <div className="pb-3 px-4 flex items-center gap-2">
              <div className="h-4 w-16 bg-slate-200/70 rounded-md animate-pulse" />
            </div>
          </div>

          {/* Day Theme Banner Skeleton */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#DFF7ED]/40 to-transparent border-b border-slate-100 flex items-center justify-between">
            <div className="space-y-1.5 w-full max-w-sm">
              <div className="h-3 w-20 bg-[#0B7A5C]/30 rounded-md animate-pulse" />
              <div className="h-4 w-48 bg-slate-200/80 rounded-md animate-pulse" />
            </div>
            <div className="h-4 w-24 bg-slate-100 rounded-md animate-pulse hidden sm:block" />
          </div>

          {/* Activities List Skeleton (Stops 1, 2, 3) */}
          <div className="p-4 sm:p-6 space-y-4">
            
            {/* Activity 1 Skeleton (Morning) */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-[#FAFCFB] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 bg-amber-100/80 rounded-full animate-pulse" />
                  <div className="h-4 w-40 bg-slate-200/90 rounded-md animate-pulse" />
                </div>
                <div className="h-4 w-14 bg-emerald-100 rounded-md animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-28 bg-slate-200/60 rounded-md animate-pulse" />
                <div className="h-3 w-20 bg-slate-200/60 rounded-md animate-pulse" />
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 w-full bg-slate-200/50 rounded-full animate-pulse" />
                <div className="h-2.5 w-4/5 bg-slate-200/40 rounded-full animate-pulse" />
              </div>
              <div className="h-7 bg-[#DFF7ED]/50 border border-[#0B7A5C]/20 rounded-xl w-full flex items-center px-3 animate-pulse">
                <div className="h-2.5 w-44 bg-[#0B7A5C]/30 rounded-md" />
              </div>
            </div>

            {/* Activity 2 Skeleton (Afternoon) */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-[#FAFCFB] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-24 bg-blue-100/80 rounded-full animate-pulse" />
                  <div className="h-4 w-48 bg-slate-200/90 rounded-md animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-emerald-100 rounded-md animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-32 bg-slate-200/60 rounded-md animate-pulse" />
                <div className="h-3 w-24 bg-slate-200/60 rounded-md animate-pulse" />
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 w-full bg-slate-200/50 rounded-full animate-pulse" />
                <div className="h-2.5 w-3/4 bg-slate-200/40 rounded-full animate-pulse" />
              </div>
              <div className="h-7 bg-amber-50/60 border border-amber-200/50 rounded-xl w-full flex items-center px-3 animate-pulse">
                <div className="h-2.5 w-52 bg-amber-600/30 rounded-md" />
              </div>
            </div>

            {/* Activity 3 Skeleton (Sunset / Evening) */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-[#FAFCFB] space-y-2.5 hidden sm:block">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 bg-purple-100/80 rounded-full animate-pulse" />
                  <div className="h-4 w-36 bg-slate-200/90 rounded-md animate-pulse" />
                </div>
                <div className="h-4 w-12 bg-emerald-100 rounded-md animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-24 bg-slate-200/60 rounded-md animate-pulse" />
              </div>
              <div className="h-2.5 w-2/3 bg-slate-200/40 rounded-full animate-pulse" />
            </div>

          </div>

          {/* Footer Card Skeleton */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="h-3 w-36 bg-slate-200/70 rounded-md animate-pulse" />
            <div className="h-3 w-28 bg-slate-200/70 rounded-md animate-pulse" />
          </div>

        </div>

      </div>
    </motion.div>
  );
};
