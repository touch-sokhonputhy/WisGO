import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bookmark, 
  Calendar, 
  Mail, 
  Share2, 
  Clock, 
  DollarSign, 
  Navigation, 
  MapPin, 
  Sparkles, 
  Check, 
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Info,
  Download,
  Loader2
} from 'lucide-react';
import { TripPlan, TripDay, TripActivity } from '../types';
import { GoogleCalendarModal } from './GoogleCalendarModal';
import { SendToGmailModal } from './SendToGmailModal';
import { ShareTripModal } from './ShareTripModal';
import { downloadTripPdf } from '../utils/shareExport';
import { ItineraryCostChart } from './ItineraryCostChart';

interface ActionableItineraryCardProps {
  trip: TripPlan;
  onSaveTrip?: (trip: TripPlan) => void;
  onRefineTrip?: (refinementPrompt: string) => void;
  isSaved?: boolean;
}

export const ActionableItineraryCard: React.FC<ActionableItineraryCardProps> = ({
  trip,
  onSaveTrip,
  onRefineTrip,
  isSaved = false
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGmailOpen, setIsGmailOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isSaved);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const currentDay: TripDay | undefined = trip.days[activeDayIndex] || trip.days[0];

  const handleSave = () => {
    if (onSaveTrip) {
      onSaveTrip(trip);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }
  };

  const handleDirectPdfDownload = () => {
    setPdfDownloading(true);
    setTimeout(() => {
      try {
        const ok = downloadTripPdf(trip);
        if (ok) {
          setPdfDownloaded(true);
          setTimeout(() => setPdfDownloaded(false), 4000);
        }
      } catch (err) {
        console.error('Failed to export PDF:', err);
      } finally {
        setPdfDownloading(false);
      }
    }, 150);
  };

  const getSlotIcon = (slot: string) => {
    switch (slot.toLowerCase()) {
      case 'morning':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'afternoon':
        return <Sun className="w-3.5 h-3.5 text-orange-500" />;
      case 'evening':
        return <Sunset className="w-3.5 h-3.5 text-rose-500" />;
      case 'night':
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const refineSuggestions = [
    { label: '💰 Make it cheaper', prompt: `Please make this ${trip.title} cheaper and more budget-friendly by suggesting free temple spots, budget street eats, and walking or low-cost PassApp routes while preserving the structure.` },
    { label: '🌅 Add a sunset spot on Day 2', prompt: `Please modify Day 2 of this itinerary to include a picturesque sunset viewpoint (such as Phnom Bakheng, Pre Rup, or Kampot riverboat).` },
    { label: '👨‍👩‍👧 Family-friendly pace', prompt: `Please adjust this trip itinerary for a family traveling with children, allowing slightly more relaxed pacing and fun engaging stops.` },
    { label: '🛵 Add PassApp Tuk-Tuk tips', prompt: `Please add specific PassApp and Grab Tuk-Tuk fare estimates and route instructions for every major stop in this plan.` },
    { label: '🍲 More local Khmer food', prompt: `Please upgrade the dining recommendations with authentic youth street food stalls (Fish Amok, Lok Lak, Num Banh Chok, fresh fruit shakes).` }
  ];

  return (
    <div className="my-4 bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden text-slate-800">
      {/* Top Banner & Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-[#DFF7ED]/90 via-[#F0FAF5] to-white border-b border-slate-200/70">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0B7A5C] text-white text-[11px] font-bold shadow-2xs">
                <span>🇰🇭</span>
                <span>Actionable Itinerary</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold">
                {trip.durationDays} Days • {trip.destination}
              </span>
              {trip.startDate && (
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold">
                  Starts: {trip.startDate}
                </span>
              )}
              {trip.totalEstimatedCost && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                  {trip.totalEstimatedCost}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {trip.title}
            </h3>

            {trip.summaryNote && (
              <p className="text-xs text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
                {trip.summaryNote}
              </p>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Save Trip Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className={`px-3.5 py-2 min-h-[38px] rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                savedSuccess || isSaved
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-[#0B7A5C] hover:bg-[#086048] text-white'
              }`}
              title="Save to My Trips"
            >
              {savedSuccess || isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved to Trips</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>Save Trip</span>
                </>
              )}
            </motion.button>

            {/* Add to Google Calendar Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCalendarOpen(true)}
              className="px-3 py-2 min-h-[38px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Convert activities into Google Calendar events"
            >
              <Calendar className="w-3.5 h-3.5 text-[#0B7A5C]" />
              <span>Calendar</span>
            </motion.button>

            {/* Send to Gmail Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsGmailOpen(true)}
              className="px-3 py-2 min-h-[38px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Send mobile travel document to Gmail"
            >
              <Mail className="w-3.5 h-3.5 text-red-500" />
              <span>Gmail</span>
            </motion.button>

            {/* Export PDF Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDirectPdfDownload}
              disabled={pdfDownloading}
              className={`px-3 py-2 min-h-[38px] rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                pdfDownloaded
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
              title="Download clean multi-page PDF itinerary"
            >
              {pdfDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-[#0B7A5C] animate-spin" />
                  <span>PDF...</span>
                </>
              ) : pdfDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>PDF</span>
                </>
              )}
            </motion.button>

            {/* Export / Share & Embed Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsShareOpen(true)}
              className="px-3 py-2 min-h-[38px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Share or embed itinerary on your website"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Itinerary Cost Breakdown Summary (Pie Chart) */}
      <div className="p-4 sm:p-5 bg-slate-50/60 border-b border-slate-200/70">
        <ItineraryCostChart trip={trip} />
      </div>

      {/* Day Tabs */}
      <div className="px-4 sm:px-6 pt-3 bg-slate-50/70 border-b border-slate-200/70 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {trip.days.map((day, idx) => (
          <button
            key={day.dayNumber}
            type="button"
            onClick={() => setActiveDayIndex(idx)}
            className={`pb-3 px-3 sm:px-3.5 min-h-[40px] text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeDayIndex === idx
                ? 'border-[#0B7A5C] text-[#0B7A5C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Day {day.dayNumber}</span>
            {day.theme && (
              <span className="hidden md:inline font-normal text-[11px] text-slate-500 ml-1.5">
                : {day.theme}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Day Activities Schedule */}
      <div className="p-5 sm:p-6 space-y-4 bg-white">
        {currentDay && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0B7A5C]/10 text-[#0B7A5C] flex items-center justify-center text-xs">
                    {currentDay.dayNumber}
                  </span>
                  <span>Day {currentDay.dayNumber}: {currentDay.theme || 'Exploration'}</span>
                </h4>
                {currentDay.date && (
                  <p className="text-xs text-slate-500 mt-0.5 ml-8">{currentDay.date}</p>
                )}
              </div>
            </div>

            {/* Activity Cards */}
            <div className="space-y-3 ml-1 sm:ml-2">
              {currentDay.activities.map((activity, aIdx) => (
                <div
                  key={activity.id || aIdx}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-[#0B7A5C]/40 bg-slate-50/40 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-bold">
                        {getSlotIcon(activity.timeSlot)}
                        <span className="capitalize">{activity.timeSlot}</span>
                      </span>
                      <span className="text-xs font-semibold text-[#0B7A5C]">
                        {activity.time}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      {activity.estimatedDuration && (
                        <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{activity.estimatedDuration}</span>
                        </span>
                      )}
                      {activity.estimatedCost && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md font-bold">
                          <DollarSign className="w-3 h-3" />
                          <span>{activity.estimatedCost}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h5 className="text-sm font-bold text-slate-900">
                    {activity.title}
                  </h5>

                  <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0B7A5C] shrink-0" />
                    <span>{activity.location}</span>
                    {activity.openingHours && (
                      <span className="text-slate-400 ml-2">• Hours: {activity.openingHours}</span>
                    )}
                  </div>

                  {activity.description && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {activity.description}
                    </p>
                  )}

                  {/* Transport & Youth Tips */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    {activity.transportTip && (
                      <div className="flex items-start gap-1.5 text-slate-600 bg-white p-2 rounded-xl border border-slate-200/70">
                        <Navigation className="w-3.5 h-3.5 text-[#0B7A5C] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-700">Transport: </span>
                          <span>{activity.transportTip}</span>
                        </div>
                      </div>
                    )}
                    {activity.practicalNotes && (
                      <div className="flex items-start gap-1.5 text-slate-600 bg-amber-50/50 p-2 rounded-xl border border-amber-200/60">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-900">Local Tip: </span>
                          <span>{activity.practicalNotes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refine / Context Chips */}
        {onRefineTrip && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#21C87A]" />
              <span>Refine or Customize This Trip Plan with WisGO AI:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {refineSuggestions.map((s, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => onRefineTrip(s.prompt)}
                  className="px-3 py-1.5 rounded-full bg-[#F8FCFA] border border-slate-200 hover:border-[#0B7A5C] hover:bg-[#DFF7ED]/40 text-slate-700 hover:text-[#0B7A5C] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>{s.label}</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals for Calendar, Gmail, and Share */}
      <GoogleCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        trip={trip}
      />

      <SendToGmailModal
        isOpen={isGmailOpen}
        onClose={() => setIsGmailOpen(false)}
        trip={trip}
      />

      <ShareTripModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trip={trip}
      />
    </div>
  );
};
