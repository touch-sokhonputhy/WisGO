import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Check, ExternalLink, Download, X, Clock, MapPin, AlertCircle, HelpCircle } from 'lucide-react';
import { TripPlan } from '../types';
import {
  convertTripToCalendarEvents,
  downloadIcsCalendarFile,
  buildGoogleCalendarUrl,
  getGoogleCalendarImportUrl,
  CalendarEventItem
} from '../utils/calendarExport';

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripPlan;
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({ isOpen, onClose, trip }) => {
  const [events, setEvents] = useState<CalendarEventItem[]>(() => convertTripToCalendarEvents(trip));
  const [downloaded, setDownloaded] = useState(false);
  const [showImportHelp, setShowImportHelp] = useState(false);

  // Re-sync if trip changes
  React.useEffect(() => {
    if (isOpen) {
      setEvents(convertTripToCalendarEvents(trip));
      setDownloaded(false);
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
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-[#DFF7ED]/50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0B7A5C] text-white flex items-center justify-center shadow-md shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Import into Google Calendar
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export structured activities as standard .ICS calendar file for Google, Apple, or Outlook Calendar.
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
              <span>{showImportHelp ? 'Hide instructions' : 'How to import into Google Calendar?'}</span>
            </button>
          </div>

          {/* Import Guide Accordion */}
          {showImportHelp && (
            <div className="px-6 py-3.5 bg-emerald-50/70 border-b border-emerald-100 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
                <span>🗓️ How to import all activities into Google Calendar:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                <li>Click <strong>&quot;Download .ICS Calendar File&quot;</strong> below to save your itinerary file.</li>
                <li>
                  Open{' '}
                  <a
                    href={getGoogleCalendarImportUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0B7A5C] font-bold underline inline-flex items-center gap-0.5"
                  >
                    Google Calendar Settings &gt; Import &amp; Export
                    <ExternalLink className="w-3 h-3 inline ml-0.5" />
                  </a>.
                </li>
                <li>Select the downloaded <strong>.ics</strong> file, pick your calendar, and click <strong>Import</strong>!</li>
              </ol>
            </div>
          )}

          {/* Event Review List */}
          <div className="p-6 overflow-y-auto space-y-3 flex-1">
            {events.map((evt) => {
              const googleUrl = buildGoogleCalendarUrl(evt);
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
                      <a
                        href={googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B7A5C] hover:underline bg-[#DFF7ED]/60 px-2 py-0.5 rounded-md"
                        title="Add this single event directly to Google Calendar"
                      >
                        <span>Add single event</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
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
              <span>Timezone: Asia/Phnom_Penh (UTC+7). Compatible with Google, Apple &amp; Outlook.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadIcs}
                disabled={selectedCount === 0}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  downloaded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0B7A5C] hover:bg-[#086048] text-white'
                }`}
              >
                {downloaded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Calendar File Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download .ICS (All {selectedCount} Activities)</span>
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
