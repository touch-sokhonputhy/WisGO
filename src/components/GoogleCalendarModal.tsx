import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Check, 
  ExternalLink, 
  Download, 
  X, 
  Clock, 
  MapPin, 
  AlertCircle, 
  HelpCircle,
  Loader2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { TripPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  convertTripToCalendarEvents,
  downloadIcsCalendarFile,
  buildGoogleCalendarUrl,
  getGoogleCalendarImportUrl,
  CalendarEventItem
} from '../utils/calendarExport';
import { syncTripToGoogleCalendar } from '../services/googleWorkspace';

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripPlan;
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({ isOpen, onClose, trip }) => {
  const { googleOAuthToken, connectGoogleWorkspace } = useAuth();
  const [events, setEvents] = useState<CalendarEventItem[]>(() => convertTripToCalendarEvents(trip));
  const [downloaded, setDownloaded] = useState(false);
  const [showImportHelp, setShowImportHelp] = useState(false);

  // Direct sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncedCalendarEvents, setSyncedCalendarEvents] = useState<Array<{ id: string; title: string; htmlLink?: string }>>([]);

  // Re-sync if trip changes
  React.useEffect(() => {
    if (isOpen) {
      setEvents(convertTripToCalendarEvents(trip));
      setDownloaded(false);
      setSyncSuccess(false);
      setSyncError(null);
      setSyncedCalendarEvents([]);
    }
  }, [isOpen, trip]);

  if (!isOpen) return null;

  const toggleSelectEvent = (id: string) => {
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, selected: !e.selected } : e)));
  };

  const toggleSelectAll = () => {
    const allSelected = events.every(e => e.selected);
    setEvents(prev => prev.map(e => ({ ...e, selected: !allSelected })));
  };

  const selectedCount = events.filter(e => e.selected).length;

  const handleDownloadIcs = () => {
    downloadIcsCalendarFile(trip, events);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  const handleDirectGoogleCalendarSync = async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      let token = googleOAuthToken;
      if (!token) {
        token = await connectGoogleWorkspace();
      }

      if (!token) {
        throw new Error('Google sign-in is required to sync events with your Google Calendar.');
      }

      const selectedEventItems = events.filter(e => e.selected);
      const result = await syncTripToGoogleCalendar(token, trip, selectedEventItems);

      setSyncedCount(result.syncedCount);
      setSyncedCalendarEvents(result.events);
      setSyncSuccess(true);
    } catch (err: any) {
      console.error('Google Calendar Sync Error:', err);
      // If token expired, offer re-auth prompt
      if (err?.message?.includes('401') || err?.message?.includes('UNAUTHENTICATED') || err?.message?.includes('invalid')) {
        try {
          const freshToken = await connectGoogleWorkspace();
          if (freshToken) {
            const selectedEventItems = events.filter(e => e.selected);
            const result = await syncTripToGoogleCalendar(freshToken, trip, selectedEventItems);
            setSyncedCount(result.syncedCount);
            setSyncedCalendarEvents(result.events);
            setSyncSuccess(true);
            return;
          }
        } catch {
          // fall through
        }
      }
      setSyncError(err?.message || 'Could not sync with Google Calendar. You can use the .ICS file download as an alternative.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-[#DFF7ED]/50 via-white to-sky-50/40">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0B7A5C] text-white flex items-center justify-center shadow-md shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Add to Google Calendar
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    1-Click Direct Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Directly schedule all {trip.title} stops into your primary Google Calendar or download an .ICS file.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Banner if Synced */}
          {syncSuccess && (
            <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    Successfully synced {syncedCount} activities directly to Google Calendar!
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Reminders and full details (PassApp tips, locations, costs) are scheduled.
                  </p>
                </div>
              </div>
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                <span>Open Google Calendar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Error Banner */}
          {syncError && (
            <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{syncError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSyncError(null)}
                className="text-xs font-bold text-amber-900 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Controls Bar */}
          <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-[#0B7A5C] hover:underline cursor-pointer font-bold"
              >
                {events.every(e => e.selected) ? 'Deselect All' : 'Select All'}
              </button>
              <span>•</span>
              <span>{selectedCount} of {events.length} activities selected</span>
            </div>
            <button
              type="button"
              onClick={() => setShowImportHelp(!showImportHelp)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B7A5C] hover:underline cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showImportHelp ? 'Hide offline guide' : 'Offline / Apple Calendar Guide'}</span>
            </button>
          </div>

          {/* Import Guide Accordion */}
          {showImportHelp && (
            <div className="px-6 py-3.5 bg-emerald-50/70 border-b border-emerald-100 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
                <span>🗓️ How to use the .ICS file for other calendars:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                <li>Click <strong>&quot;Download .ICS File&quot;</strong> below to save your itinerary.</li>
                <li>For Apple Calendar or Outlook: double click the downloaded file to import automatically.</li>
                <li>
                  For manual Google Calendar import, visit{' '}
                  <a
                    href={getGoogleCalendarImportUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0B7A5C] font-bold underline inline-flex items-center gap-0.5"
                  >
                    Google Calendar Settings
                    <ExternalLink className="w-3 h-3 inline ml-0.5" />
                  </a>.
                </li>
              </ol>
            </div>
          )}

          {/* Event Review List */}
          <div className="p-6 overflow-y-auto space-y-3 flex-1">
            {events.map((evt) => {
              const googleUrl = buildGoogleCalendarUrl(evt);
              const syncedItem = syncedCalendarEvents.find(s => s.title === evt.title);

              return (
                <div
                  key={evt.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    evt.selected
                      ? 'bg-white border-[#0B7A5C]/40 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200/70 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={evt.selected}
                    onChange={() => toggleSelectEvent(evt.id)}
                    className="mt-1 w-4 h-4 rounded text-[#0B7A5C] focus:ring-[#0B7A5C] cursor-pointer"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {evt.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {syncedItem?.htmlLink && (
                          <a
                            href={syncedItem.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md hover:underline"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>View on Calendar</span>
                          </a>
                        )}
                        <a
                          href={googleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B7A5C] hover:underline bg-[#DFF7ED]/60 px-2 py-0.5 rounded-md"
                          title="Open single event link in new tab"
                        >
                          <span>Preview event</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-[#0B7A5C]" />
                        <span>{evt.dateStr} • {evt.startTimeStr} – {evt.endTimeStr}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-600 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Timezone: Asia/Phnom_Penh (UTC+7, Cambodia).</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadIcs}
                disabled={selectedCount === 0 || isSyncing}
                className={`px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  downloaded ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : ''
                }`}
                title="Download .ICS file for offline import"
              >
                {downloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>.ICS Saved</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export .ICS File</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDirectGoogleCalendarSync}
                disabled={selectedCount === 0 || isSyncing}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#0B7A5C] hover:bg-[#086048] active:scale-95 text-white disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Syncing {selectedCount} Activities...</span>
                  </>
                ) : syncSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Re-Sync to Calendar ({selectedCount})</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#21C87A]" />
                    <span>Sync to Google Calendar ({selectedCount})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
