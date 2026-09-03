import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, 
  Calendar, 
  Mail, 
  Share2, 
  Trash2, 
  Edit3, 
  Eye, 
  Sparkles, 
  Plus, 
  MapPin, 
  Clock, 
  DollarSign, 
  Check, 
  X,
  Compass,
  ArrowRight,
  Download
} from 'lucide-react';
import { TripPlan } from '../types';
import { loadSavedTrips, persistTrip, removeSavedTrip } from '../utils/tripStorage';
import { useAuth } from '../context/AuthContext';
import { ActionableItineraryCard } from './ActionableItineraryCard';
import { GoogleCalendarModal } from './GoogleCalendarModal';
import { SendToGmailModal } from './SendToGmailModal';
import { ShareTripModal } from './ShareTripModal';
import { downloadTripPdf } from '../utils/shareExport';

interface MyTripsDashboardProps {
  onPlanNewTrip: () => void;
  onSelectTripForChat?: (trip: TripPlan) => void;
}

export const MyTripsDashboard: React.FC<MyTripsDashboardProps> = ({
  onPlanNewTrip,
  onSelectTripForChat
}) => {
  const { userProfile } = useAuth();
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<TripPlan | null>(null);

  // Modals state
  const [calendarTrip, setCalendarTrip] = useState<TripPlan | null>(null);
  const [gmailTrip, setGmailTrip] = useState<TripPlan | null>(null);
  const [shareTrip, setShareTrip] = useState<TripPlan | null>(null);

  // Rename/Edit Modal
  const [editingTrip, setEditingTrip] = useState<TripPlan | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStartDate, setEditStartDate] = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await loadSavedTrips(userProfile?.uid);
      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [userProfile?.uid]);

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to remove this trip plan?')) {
      await removeSavedTrip(tripId, userProfile?.uid);
      setTrips(prev => prev.filter(t => t.id !== tripId));
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(null);
      }
    }
  };

  const handleOpenEdit = (trip: TripPlan) => {
    setEditingTrip(trip);
    setEditTitle(trip.title);
    setEditStartDate(trip.startDate || '');
  };

  const handleSaveEdit = async () => {
    if (!editingTrip) return;
    const updated: TripPlan = {
      ...editingTrip,
      title: editTitle.trim() || editingTrip.title,
      startDate: editStartDate || editingTrip.startDate,
      updatedAt: new Date().toISOString()
    };
    await persistTrip(updated, userProfile?.uid);
    setTrips(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    if (selectedTrip?.id === updated.id) {
      setSelectedTrip(updated);
    }
    setEditingTrip(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B7A5C]/10 text-[#0B7A5C] text-xs font-bold mb-2">
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Trip Itinerary Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Saved Trips
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your customized Cambodian travel itineraries, sync with Google Calendar, or email to Gmail.
          </p>
        </div>

        <button
          type="button"
          onClick={onPlanNewTrip}
          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 min-h-[44px] rounded-2xl bg-[#0B7A5C] hover:bg-[#086048] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#21C87A]" />
          <span>Plan New Trip with AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
          Loading your travel plans...
        </div>
      )}

      {/* Empty state */}
      {!loading && trips.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-[#DFF7ED] text-[#0B7A5C] mx-auto flex items-center justify-center shadow-inner">
            <Compass className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              No saved itineraries yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Ask WisGO AI to create an actionable itinerary for Siem Reap, Kampot, Phnom Penh, or the islands, then tap &quot;Save Trip&quot;!
            </p>
          </div>
          <button
            type="button"
            onClick={onPlanNewTrip}
            className="px-5 py-2.5 rounded-xl bg-[#0B7A5C] text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#21C87A]" />
            <span>Create First Trip Plan</span>
          </button>
        </div>
      )}

      {/* Trips Grid */}
      {!loading && trips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const isViewing = selectedTrip?.id === trip.id;
            return (
              <motion.div
                key={trip.id}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs ${
                  isViewing ? 'border-[#0B7A5C] ring-2 ring-[#0B7A5C]/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Top */}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DFF7ED] text-[#0B7A5C] font-bold text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{trip.destination}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {trip.durationDays} Days
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug line-clamp-2">
                    {trip.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    {trip.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{trip.startDate}</span>
                      </span>
                    )}
                    {trip.totalEstimatedCost && (
                      <span className="text-emerald-700 font-semibold">
                        {trip.totalEstimatedCost}
                      </span>
                    )}
                  </div>

                  {trip.summaryNote && (
                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {trip.summaryNote}
                    </p>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="p-3.5 sm:p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTrip(isViewing ? null : trip)}
                      className={`flex-1 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isViewing
                          ? 'bg-[#0B7A5C] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-[#0B7A5C] hover:text-[#0B7A5C]'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isViewing ? 'Hide Details' : 'View Itinerary'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(trip)}
                      className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      title="Rename or edit trip details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-rose-500 transition-colors cursor-pointer"
                      title="Delete trip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Secondary export shortcuts */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCalendarTrip(trip)}
                      className="py-1.5 min-h-[34px] rounded-lg text-slate-600 hover:text-[#0B7A5C] hover:bg-white font-medium flex items-center justify-center gap-1 cursor-pointer border border-transparent hover:border-slate-200"
                      title="Add to Google Calendar"
                    >
                      <Calendar className="w-3 h-3 text-[#0B7A5C]" />
                      <span>Cal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGmailTrip(trip)}
                      className="py-1.5 min-h-[34px] rounded-lg text-slate-600 hover:text-red-600 hover:bg-white font-medium flex items-center justify-center gap-1 cursor-pointer border border-transparent hover:border-slate-200"
                      title="Send itinerary to Gmail"
                    >
                      <Mail className="w-3 h-3 text-red-500" />
                      <span>Gmail</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadTripPdf(trip)}
                      className="py-1.5 min-h-[34px] rounded-lg text-slate-600 hover:text-[#0B7A5C] hover:bg-white font-medium flex items-center justify-center gap-1 cursor-pointer border border-transparent hover:border-slate-200"
                      title="Download PDF document"
                    >
                      <Download className="w-3 h-3 text-[#0B7A5C]" />
                      <span>PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShareTrip(trip)}
                      className="py-1.5 min-h-[34px] rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white font-medium flex items-center justify-center gap-1 cursor-pointer border border-transparent hover:border-slate-200"
                      title="Share link or embed on website"
                    >
                      <Share2 className="w-3 h-3 text-slate-400" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Viewer when user clicks "View Itinerary" */}
      <AnimatePresence>
        {selectedTrip && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Active Itinerary View:</span>
                <span className="text-[#0B7A5C]">{selectedTrip.title}</span>
              </h3>
              <button
                onClick={() => setSelectedTrip(null)}
                className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Close View
              </button>
            </div>

            <ActionableItineraryCard
              trip={selectedTrip}
              isSaved={true}
              onRefineTrip={(prompt) => {
                if (onSelectTripForChat) {
                  onSelectTripForChat(selectedTrip);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit / Rename Trip Modal */}
      <AnimatePresence>
        {editingTrip && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-base font-extrabold text-slate-900">
                  Edit Trip Details
                </h4>
                <button
                  onClick={() => setEditingTrip(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trip Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0B7A5C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0B7A5C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTrip(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 rounded-xl bg-[#0B7A5C] text-white font-bold text-xs shadow-xs hover:bg-[#086048] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calendar, Gmail, and Share Modals for individual trip cards */}
      {calendarTrip && (
        <GoogleCalendarModal
          isOpen={true}
          onClose={() => setCalendarTrip(null)}
          trip={calendarTrip}
        />
      )}

      {gmailTrip && (
        <SendToGmailModal
          isOpen={true}
          onClose={() => setGmailTrip(null)}
          trip={gmailTrip}
        />
      )}

      {shareTrip && (
        <ShareTripModal
          isOpen={true}
          onClose={() => setShareTrip(null)}
          trip={shareTrip}
        />
      )}
    </div>
  );
};
