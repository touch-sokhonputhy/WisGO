import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { TripPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTripEmailSubject, generateTripEmailText, buildGmailComposeUrl, buildMailtoUrl } from '../utils/emailExport';
import { sendTripViaGmail } from '../services/googleWorkspace';

interface SendToGmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripPlan;
}

export const SendToGmailModal: React.FC<SendToGmailModalProps> = ({ isOpen, onClose, trip }) => {
  const { userProfile, googleOAuthToken, connectGoogleWorkspace } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState(userProfile?.email || '');
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);

  // Direct sending states
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sentMessageId, setSentMessageId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Sync email if user logged in
  React.useEffect(() => {
    if (isOpen) {
      if (userProfile?.email && !recipientEmail) {
        setRecipientEmail(userProfile.email);
      }
      setSendSuccess(false);
      setSendError(null);
      setSentMessageId(null);
    }
  }, [isOpen, userProfile]);

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

  const handleDirectSendViaGmail = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setSendError('Please enter a valid recipient email address.');
      return;
    }

    try {
      setIsSending(true);
      setSendError(null);

      let token = googleOAuthToken;
      if (!token) {
        token = await connectGoogleWorkspace();
      }

      if (!token) {
        throw new Error('Google sign-in is required to send emails from your Gmail account.');
      }

      const result = await sendTripViaGmail(token, trip, recipientEmail.trim(), customNote.trim() || undefined);

      setSentMessageId(result.messageId || 'sent');
      setSendSuccess(true);
    } catch (err: any) {
      console.error('Send via Gmail Error:', err);
      // If token expired, offer re-auth prompt
      if (err?.message?.includes('401') || err?.message?.includes('UNAUTHENTICATED') || err?.message?.includes('invalid')) {
        try {
          const freshToken = await connectGoogleWorkspace();
          if (freshToken) {
            const result = await sendTripViaGmail(freshToken, trip, recipientEmail.trim(), customNote.trim() || undefined);
            setSentMessageId(result.messageId || 'sent');
            setSendSuccess(true);
            return;
          }
        } catch {
          // fall through
        }
      }
      setSendError(err?.message || 'Failed to send directly via Gmail. You can still use the "Open in Gmail" button below.');
    } finally {
      setIsSending(false);
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
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-red-50/70 via-white to-amber-50/50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Send Trip Plan to Gmail
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                    Gmail API Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deliver a beautifully formatted HTML travel itinerary directly to your inbox or travel buddies.
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

          {/* Success Banner */}
          {sendSuccess && (
            <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    Itinerary successfully sent via your Gmail to {recipientEmail}!
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Check your sent folder or inbox. Complete with Cambodia transport tips and daily schedule.
                  </p>
                </div>
              </div>
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:underline shrink-0"
              >
                <span>Open Gmail</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Error Banner */}
          {sendError && (
            <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{sendError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSendError(null)}
                className="text-xs font-bold text-amber-900 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Form Fields */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Recipient Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0B7A5C] focus:bg-white transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                You can send this to your own email or share it with travel companions.
              </p>
            </div>

            {/* Custom Note Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Personal Note / Group Message (Optional)
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Here is our 3-day Siem Reap schedule! Make sure to pack temple-appropriate clothing and get your Angkor pass ready."
                rows={2}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0B7A5C] focus:bg-white transition-all resize-none"
              />
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
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3.5 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono leading-relaxed h-36 overflow-y-auto whitespace-pre-wrap border border-slate-800 selection:bg-[#0B7A5C]">
                {emailBody}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenGmail}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Open Gmail Web compose window as a fallback"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Web Compose</span>
              </button>
              <button
                type="button"
                onClick={handleOpenMailto}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                title="Open system default mail application"
              >
                Mail App
              </button>
            </div>

            <button
              type="button"
              onClick={handleDirectSendViaGmail}
              disabled={isSending}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending via Gmail...</span>
                </>
              ) : sendSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Send Again</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Directly via Gmail</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
