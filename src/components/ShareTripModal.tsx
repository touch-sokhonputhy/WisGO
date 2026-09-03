import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Copy, Check, X, Download, Code2, Globe, Loader2, Printer, ExternalLink, FileText } from 'lucide-react';
import { TripPlan } from '../types';
import { shareTripNative, downloadTripPdf, printTripToPdf, getWebsiteEmbedCode, getWebsiteHtmlCard } from '../utils/shareExport';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripPlan;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({ isOpen, onClose, trip }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'embed'>('export');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [embedFormat, setEmbedFormat] = useState<'iframe' | 'card'>('iframe');
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

  const officialWebsiteUrl = 'https://wis-go.vercel.app/';

  if (!isOpen) return null;

  const handleCopyWebsiteLink = async () => {
    try {
      await navigator.clipboard.writeText(officialWebsiteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyEmbed = async () => {
    const code = embedFormat === 'iframe' ? getWebsiteEmbedCode(trip) : getWebsiteHtmlCard(trip);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    const success = await shareTripNative(trip);
    if (success && (!navigator.share || !navigator.canShare)) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleDownloadPdf = () => {
    setPdfStatus('generating');
    try {
      const ok = downloadTripPdf(trip);
      if (ok) {
        setPdfStatus('success');
        setTimeout(() => setPdfStatus('idle'), 4000);
      } else {
        setPdfStatus('error');
        setTimeout(() => setPdfStatus('idle'), 4000);
      }
    } catch (err) {
      console.error('PDF error:', err);
      setPdfStatus('error');
      setTimeout(() => setPdfStatus('idle'), 4000);
    }
  };

  const currentEmbedCode = embedFormat === 'iframe' ? getWebsiteEmbedCode(trip) : getWebsiteHtmlCard(trip);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col my-auto"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-emerald-50/70 via-[#F8FCFA] to-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0B7A5C] text-white flex items-center justify-center shadow-md shrink-0">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Export & Share Itinerary
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save as a PDF document, embed on your website, or share with friends.
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

          {/* Sub Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('export')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'export'
                  ? 'border-[#0B7A5C] text-[#0B7A5C]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF & Direct Share</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('embed')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'embed'
                  ? 'border-[#0B7A5C] text-[#0B7A5C]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Embed on My Website</span>
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {activeTab === 'export' ? (
              <>
                {/* Primary Action: Download PDF Document */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#DFF7ED]/60 via-white to-emerald-50/30 border border-[#0B7A5C]/30 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#0B7A5C] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Export as PDF Document (.pdf)
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Clean multi-page PDF with day schedules, PassApp tuk-tuk fares, and local tips.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={pdfStatus === 'generating'}
                      className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        pdfStatus === 'success'
                          ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                          : pdfStatus === 'error'
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#0B7A5C] hover:bg-[#086048] text-white'
                      }`}
                    >
                      {pdfStatus === 'generating' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating PDF...</span>
                        </>
                      ) : pdfStatus === 'success' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Downloaded PDF!</span>
                        </>
                      ) : pdfStatus === 'error' ? (
                        <span>Retry Download</span>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Direct PDF Download</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => printTripToPdf(trip)}
                      className="w-full py-2.5 px-3.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                      title="Open printable itinerary with native browser Print & Save as PDF"
                    >
                      <Printer className="w-4 h-4 text-[#0B7A5C]" />
                      <span>Print / Save as PDF</span>
                    </button>
                  </div>
                </div>

                {/* Official Website Section */}
                <div className="p-3.5 sm:p-4 rounded-2xl border border-emerald-200/80 bg-[#DFF7ED]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#0B7A5C] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">WisGO Cambodia</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0B7A5C]">
                          Official Website
                        </span>
                      </div>
                      <a
                        href={officialWebsiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-medium text-[#0B7A5C] hover:underline flex items-center gap-1 mt-0.5 truncate"
                      >
                        <span>wis-go.vercel.app</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyWebsiteLink}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                      title="Copy official website link"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    <a
                      href={officialWebsiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Native Send to Friends */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-[#0B7A5C] hover:bg-[#DFF7ED]/20 hover:shadow-xs transition-all text-left group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-[#0B7A5C] group-hover:text-white flex items-center justify-center text-slate-700 transition-colors mb-2 shadow-2xs">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0B7A5C]">
                        Send to Friends
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Share via Telegram, WhatsApp, Messenger, or AirDrop.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('embed')}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-[#0B7A5C] hover:bg-[#DFF7ED]/20 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-[#0B7A5C] group-hover:text-white flex items-center justify-center text-slate-700 transition-colors mb-2">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0B7A5C]">
                      Embed on My Website
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Get HTML or iframe code to embed on your travel blog.
                    </p>
                  </button>
                </div>
              </>
            ) : (
              /* Embed On Website View */
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#DFF7ED]/50 border border-[#0B7A5C]/20 text-xs text-slate-700 leading-relaxed">
                  <p className="font-bold text-[#0B7A5C] mb-0.5">Embed on Your Website or Travel Blog</p>
                  Copy the snippet below and paste it into WordPress, Webflow, Notion, Squarespace, Wix, or your custom HTML website.
                </div>

                {/* Format Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Embed Type:</span>
                  <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEmbedFormat('iframe')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        embedFormat === 'iframe'
                          ? 'bg-white text-[#0B7A5C] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Responsive Iframe
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmbedFormat('card')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        embedFormat === 'card'
                          ? 'bg-white text-[#0B7A5C] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      HTML Card Widget
                    </button>
                  </div>
                </div>

                {/* Code Snippet Box */}
                <div className="relative">
                  <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-44 border border-slate-800 leading-relaxed select-all">
                    {currentEmbedCode}
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopyEmbed}
                    className={`absolute top-2.5 right-2.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      copiedEmbed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/90 hover:bg-white text-slate-900'
                    }`}
                  >
                    {copiedEmbed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied Code!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Embed Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Mini Preview */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Live Preview:
                  </label>
                  <div className="p-4 rounded-2xl border border-slate-200 bg-[#F8FCFA]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-[#DFF7ED] text-[#0B7A5C] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                        🇰🇭 WisGO Itinerary
                      </span>
                      <span className="text-xs text-slate-500">
                        {trip.durationDays} Days • {trip.destination}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">
                      {trip.title}
                    </h5>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {trip.summaryNote || `Authentic ${trip.durationDays}-day travel itinerary with estimated PassApp tuk-tuk fares and local tips.`}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0B7A5C]">
                        Est. Budget: {trip.totalEstimatedCost || 'Moderate'}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Powered by WisGO Cambodia
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

