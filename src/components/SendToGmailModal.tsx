import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Send, Copy, Check, ExternalLink, X, AlertCircle } from 'lucide-react';
import { TripPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTripEmailSubject, generateTripEmailText, buildGmailComposeUrl, buildMailtoUrl } from '../utils/emailExport';

interface SendToGmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripPlan;
}

export const SendToGmailModal: React.FC<SendToGmailModalProps> = ({ isOpen, onClose, trip }) => {
  const { userProfile } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState(userProfile?.email || '');
  const [copied, setCopied] = useState(false);

  // Sync email if user logged in
  React.useEffect(() => {
    if (userProfile?.email && !recipientEmail) {
      setRecipientEmail(userProfile.email);
    }
  }, [userProfile, recipientEmail]);

  if (!isOpen) return null;

  const subject = getTripEmailSubject(trip);
  const emailBody = generateTripEmailText(trip);

  const handleOpenGmail = () => {
    const gmailUrl = buildGmailComposeUrl(recipientEmail, trip);
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenMailto = () => {
    const mailtoUrl = buildMailtoUrl(recipientEmail, trip);
    window.location.href = mailtoUrl;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${emailBody}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
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
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-red-50/60 via-amber-50/40 to-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Send Trip Plan to Gmail
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate a clean, mobile-optimized travel document ready to email.
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

          {/* Form Fields */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Recipient Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Recipient Gmail Address
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0B7A5C] focus:bg-white transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                You can send to your own inbox or email it to travel companions.
              </p>
            </div>

            {/* Subject Preview */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                Email Subject
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {subject}
              </p>
            </div>

            {/* Document Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Travel Document Preview
                </label>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-xs font-bold text-[#0B7A5C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Document Text</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono leading-relaxed h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800 selection:bg-[#0B7A5C]">
                {emailBody}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Opens Gmail directly with recipient and full itinerary pre-filled.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenMailto}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                title="Open system default mail client"
              >
                Default App
              </button>
              <button
                type="button"
                onClick={handleOpenGmail}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Gmail</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
