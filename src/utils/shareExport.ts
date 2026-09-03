import { jsPDF } from 'jspdf';
import { TripPlan } from '../types';

export function getShareableTripUrl(trip: TripPlan): string {
  const tripParam = encodeURIComponent(trip.id || 'plan');
  const destParam = encodeURIComponent(trip.destination || 'Cambodia');
  return `https://wis-go.vercel.app/trips/${tripParam}?dest=${destParam}`;
}

export async function shareTripNative(trip: TripPlan): Promise<boolean> {
  const shareData = {
    title: trip.title,
    text: `Check out my ${trip.durationDays}-day Cambodia trip itinerary for ${trip.destination} on WisGO Cambodia!`,
    url: 'https://wis-go.vercel.app/'
  };

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.warn('Native share failed:', e);
      }
      return false;
    }
  }

  // Fallback to clipboard
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`https://wis-go.vercel.app/ - ${trip.title}`);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Clean text for standard jsPDF fonts (removes emojis and unprintable Unicode that can corrupt PDF output)
 * while ensuring non-empty fallbacks for non-Latin titles/text.
 */
function sanitizePdfText(str: string, fallback: string = ''): string {
  if (!str) return fallback;
  // Replace emojis and problematic characters with spaces
  const cleaned = str
    .replace(/[^\x20-\x7E\xA0-\xFF\u2013\u2014\u2018\u2019\u201C\u201D\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned || fallback;
}

/**
 * Generates and directly triggers download of an authentic, styled PDF itinerary.
 * Uses a multi-strategy download engine (doc.save, Blob URL <a>, base64 dataURI, and printable window fallback).
 */
export function downloadTripPdf(trip: TripPlan): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);
    let y = 14;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin - 10) {
        doc.addPage();
        y = margin + 4;
        // Running header
        doc.setFontSize(8);
        doc.setTextColor(130, 140, 150);
        doc.text(`WisGO Cambodia — ${sanitizePdfText(trip.title, trip.destination || 'Cambodia Itinerary')}`, margin, y);
        doc.setDrawColor(220, 230, 225);
        doc.line(margin, y + 2, pageWidth - margin, y + 2);
        y += 7;
      }
    };

    // Header Banner
    doc.setFillColor(11, 122, 92); // #0B7A5C
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('WisGO CAMBODIA • ACTIONABLE TRAVEL ITINERARY', margin + 6, y + 8);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Authentic Youth Travel Guide • wis-go.vercel.app • Exported ${new Date().toLocaleDateString()}`, margin + 6, y + 14.5);

    y += 26;

    // Trip Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    const cleanTitle = sanitizePdfText(trip.title, `${trip.destination || 'Cambodia'} ${trip.durationDays}-Day Itinerary`);
    const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 6 + 2;

    // Meta details card
    doc.setFillColor(242, 249, 246);
    doc.setDrawColor(180, 225, 210);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 122, 92);
    doc.text(`Destination: ${sanitizePdfText(trip.destination, 'Cambodia')}`, margin + 4, y + 5.5);
    doc.text(`Duration: ${trip.durationDays} Days`, margin + 65, y + 5.5);
    if (trip.startDate) {
      doc.text(`Starts: ${sanitizePdfText(trip.startDate, 'Upcoming')}`, margin + 115, y + 5.5);
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 80, 95);
    doc.text(`Estimated Cost: ${sanitizePdfText(trip.totalEstimatedCost, 'Moderate Budget ($ / KHR)')} (Estimate)`, margin + 4, y + 10.5);

    y += 18;

    // Summary note if present
    if (trip.summaryNote) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(90, 100, 110);
      const noteLines = doc.splitTextToSize(`Overview: ${sanitizePdfText(trip.summaryNote, 'Actionable travel plan curated by WisGO Cambodia.')}`, contentWidth);
      checkPageBreak(noteLines.length * 4 + 4);
      doc.text(noteLines, margin, y);
      y += noteLines.length * 4 + 3;
    }

    // Days & Activities
    trip.days.forEach((day) => {
      checkPageBreak(22);

      // Day Header
      doc.setFillColor(230, 244, 238);
      doc.setDrawColor(11, 122, 92);
      doc.roundedRect(margin, y, contentWidth, 7.5, 1.5, 1.5, 'F');

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(11, 122, 92);
      const dayTheme = sanitizePdfText(day.theme, 'Exploration');
      const dayHeader = `DAY ${day.dayNumber}: ${dayTheme}${day.date ? ` (${sanitizePdfText(day.date)})` : ''}`;
      doc.text(dayHeader, margin + 4, y + 5.2);
      y += 10.5;

      day.activities.forEach((act, actIdx) => {
        checkPageBreak(18);

        // Activity Time & Title
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        const fallbackTitle = `Stop ${actIdx + 1}: ${act.location || trip.destination}`;
        const cleanActTitle = sanitizePdfText(act.title, fallbackTitle);
        const slotText = `[${(act.timeSlot || 'any').toUpperCase()}] ${act.time ? `${act.time} - ` : ''}${cleanActTitle}`;
        const actLines = doc.splitTextToSize(slotText, contentWidth - 4);
        doc.text(actLines, margin + 2, y);
        y += actLines.length * 4.2;

        // Location & Budget
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 90, 100);
        let metaStr = `Location: ${sanitizePdfText(act.location, trip.destination)}`;
        if (act.estimatedDuration) metaStr += `  |  Duration: ${sanitizePdfText(act.estimatedDuration)}`;
        if (act.estimatedCost) metaStr += `  |  Cost: ${sanitizePdfText(act.estimatedCost)}`;
        doc.text(metaStr, margin + 2, y);
        y += 4;

        // Description
        if (act.description) {
          doc.setFontSize(7.5);
          doc.setTextColor(100, 110, 120);
          const descLines = doc.splitTextToSize(sanitizePdfText(act.description, 'Local visit in Cambodia.'), contentWidth - 4);
          checkPageBreak(descLines.length * 3.4);
          doc.text(descLines, margin + 2, y);
          y += descLines.length * 3.4 + 1;
        }

        // Transport & Local Tip
        if (act.transportTip || act.practicalNotes) {
          doc.setFontSize(7.2);
          if (act.transportTip) {
            doc.setTextColor(11, 122, 92);
            const trLines = doc.splitTextToSize(`Transport: ${sanitizePdfText(act.transportTip, 'PassApp / Grab Tuk-Tuk')}`, contentWidth - 4);
            checkPageBreak(trLines.length * 3.2);
            doc.text(trLines, margin + 2, y);
            y += trLines.length * 3.2 + 0.5;
          }
          if (act.practicalNotes) {
            doc.setTextColor(180, 100, 20);
            const tipLines = doc.splitTextToSize(`Local Youth Tip: ${sanitizePdfText(act.practicalNotes, 'Enjoy local Khmer hospitality')}`, contentWidth - 4);
            checkPageBreak(tipLines.length * 3.2);
            doc.text(tipLines, margin + 2, y);
            y += tipLines.length * 3.2 + 0.5;
          }
        }

        y += 3; // spacing between activities
      });

      y += 3; // spacing between days
    });

    // Page Numbers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(140, 150, 160);
      doc.text(
        `WisGO Cambodia • Page ${i} of ${totalPages} • Real-time youth-led travel planner • All prices are estimates`,
        margin,
        pageHeight - 6
      );
    }

    const safeDest = (trip.destination || 'Cambodia').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `WisGO_${safeDest}_${trip.durationDays}Days_Itinerary.pdf`;

    // Multi-strategy trigger
    // Strategy 1: doc.save
    try {
      doc.save(filename);
      return true;
    } catch (saveErr) {
      console.warn('doc.save failed, trying Blob download fallback:', saveErr);
    }

    // Strategy 2: Blob URL download via invisible <a> click
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 2000);
      return true;
    } catch (blobErr) {
      console.warn('Blob download failed, trying new window fallback:', blobErr);
    }

    // Strategy 3: Open PDF blob directly in new tab
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) {
        return true;
      }
    } catch {
      // ignore
    }

    // Strategy 4: Fallback to printable document window
    printTripToPdf(trip);
    return true;
  } catch (err) {
    console.error('downloadTripPdf error:', err);
    // Ultimate fallback: open print sheet
    printTripToPdf(trip);
    return false;
  }
}

/**
 * Opens a clean, beautifully formatted printable itinerary window
 * with full Unicode, Khmer script, styling, and triggers browser print-to-PDF.
 */
export function printTripToPdf(trip?: TripPlan): void {
  if (!trip) {
    try {
      window.print();
    } catch (e) {
      console.warn('window.print failed:', e);
    }
    return;
  }

  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const daysHtml = trip.days.map(day => `
      <div style="margin-bottom: 24px; break-inside: avoid;">
        <div style="background: #E6F4EE; color: #0B7A5C; padding: 8px 14px; border-radius: 8px; font-weight: 800; font-size: 14px; margin-bottom: 12px; border-left: 4px solid #0B7A5C;">
          DAY ${day.dayNumber}: ${day.theme || 'Exploration'}${day.date ? ` (${day.date})` : ''}
        </div>
        <div style="padding-left: 8px;">
          ${day.activities.map(act => `
            <div style="padding: 10px 14px; margin-bottom: 8px; border: 1px solid #E2E8F0; border-radius: 8px; background: #FAFCFB; break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: 700; color: #0F172A; font-size: 13px;">
                  [${(act.timeSlot || 'any').toUpperCase()}] ${act.time ? `${act.time} - ` : ''}${act.title}
                </span>
                ${act.estimatedCost ? `<span style="color: #0B7A5C; font-weight: 700; font-size: 12px;">${act.estimatedCost}</span>` : ''}
              </div>
              <div style="color: #64748B; font-size: 11px; margin-bottom: 4px;">
                📍 ${act.location}${act.estimatedDuration ? ` • ⏱️ ${act.estimatedDuration}` : ''}
              </div>
              ${act.description ? `<p style="color: #334155; font-size: 12px; margin: 4px 0; line-height: 1.4;">${act.description}</p>` : ''}
              ${act.transportTip ? `<div style="color: #0B7A5C; font-size: 11px; margin-top: 4px;"><strong>Transport:</strong> ${act.transportTip}</div>` : ''}
              ${act.practicalNotes ? `<div style="color: #B45309; font-size: 11px; margin-top: 2px;"><strong>Youth Tip:</strong> ${act.practicalNotes}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>WisGO Itinerary - ${trip.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Khmer", sans-serif;
      color: #1E293B;
      margin: 0;
      padding: 24px;
      background: #FFFFFF;
      line-height: 1.5;
    }
    .header {
      background: #0B7A5C;
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .title {
      font-size: 20px;
      font-weight: 900;
      margin: 0 0 6px 0;
    }
    .subtitle {
      font-size: 12px;
      opacity: 0.9;
      margin: 0;
    }
    .meta-box {
      background: #F0FAF5;
      border: 1px solid #D1EADE;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 20px;
      display: flex;
      gap: 20px;
      font-size: 12px;
      font-weight: 600;
      color: #0B7A5C;
    }
    .overview {
      font-size: 13px;
      color: #475569;
      margin-bottom: 20px;
      font-style: italic;
      padding: 8px 12px;
      background: #F8FAFC;
      border-left: 3px solid #CBD5E1;
    }
    .print-bar {
      margin-bottom: 16px;
      padding: 10px 14px;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }
    .print-btn {
      background: #0B7A5C;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
    }
    @media print {
      .print-bar { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span>💡 <strong>Tip:</strong> Select <strong>"Save as PDF"</strong> in the destination dropdown to export this itinerary as a file.</span>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="header">
    <div class="title">🇰🇭 WisGO CAMBODIA • ${trip.title}</div>
    <div class="subtitle">Actionable Youth Travel Itinerary • wis-go.vercel.app • ${new Date().toLocaleDateString()}</div>
  </div>
  <div class="meta-box">
    <span>📍 Destination: <strong>${trip.destination}</strong></span>
    <span>⏱️ Duration: <strong>${trip.durationDays} Days</strong></span>
    ${trip.startDate ? `<span>📅 Starts: <strong>${trip.startDate}</strong></span>` : ''}
    ${trip.totalEstimatedCost ? `<span>💰 Budget: <strong>${trip.totalEstimatedCost}</strong></span>` : ''}
  </div>
  ${trip.summaryNote ? `<div class="overview">${trip.summaryNote}</div>` : ''}
  <div>
    ${daysHtml}
  </div>
  <div style="margin-top: 30px; padding-top: 12px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8;">
    WisGO Cambodia • Real-time youth-led travel planner • All prices & PassApp tuk-tuk fares are estimates
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  } catch (err) {
    console.error('printTripToPdf error:', err);
    window.print();
  }
}

/**
 * Generates an embeddable responsive HTML card or iframe for websites and travel blogs.
 */
export function getWebsiteEmbedCode(trip: TripPlan): string {
  const shareUrl = getShareableTripUrl(trip);
  return `<!-- WisGO Cambodia Trip Itinerary Embed -->
<iframe 
  src="${shareUrl}&embed=1" 
  width="100%" 
  height="620" 
  style="border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); overflow: hidden;"
  title="${trip.title} - WisGO Cambodia"
  loading="lazy"
></iframe>`;
}

/**
 * Generates a clean, standalone HTML card widget snippet ready to paste into any website.
 */
export function getWebsiteHtmlCard(trip: TripPlan): string {
  const shareUrl = getShareableTripUrl(trip);
  return `<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; background: #ffffff; color: #1e293b; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
    <span style="background: #DFF7ED; color: #0B7A5C; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px;">🇰🇭 WisGO Itinerary</span>
    <span style="color: #64748b; font-size: 12px;">${trip.durationDays} Days • ${trip.destination}</span>
  </div>
  <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 800; color: #0f172a;">${trip.title}</h3>
  <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.5;">${trip.summaryNote || `Authentic ${trip.durationDays}-day travel itinerary for ${trip.destination} with estimated PassApp fares and local tips.`}</p>
  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 14px;">
    <span style="font-size: 12px; font-weight: 700; color: #0B7A5C;">Budget: ${trip.totalEstimatedCost || 'Moderate'}</span>
    <a href="${shareUrl}" target="_blank" rel="noopener noreferrer" style="background: #0B7A5C; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block;">View on WisGO &rarr;</a>
  </div>
</div>`;
}

