import { TripPlan } from '../types';
import { CalendarEventItem, convertTripToCalendarEvents } from '../utils/calendarExport';

export interface CalendarSyncResult {
  success: boolean;
  syncedCount: number;
  totalCount: number;
  events: Array<{ id: string; title: string; htmlLink?: string }>;
  error?: string;
}

export interface GmailSendResult {
  success: boolean;
  messageId?: string;
  recipientEmail: string;
  error?: string;
}

/**
 * Checks if a Google OAuth Access Token is still valid by querying tokeninfo
 */
export async function checkGoogleToken(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(token)}`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Syncs selected activities or an entire TripPlan into the user's primary Google Calendar.
 */
export async function syncTripToGoogleCalendar(
  token: string,
  trip: TripPlan,
  selectedEvents?: CalendarEventItem[]
): Promise<CalendarSyncResult> {
  if (!token) {
    throw new Error('Google OAuth token is required to access Google Calendar.');
  }

  const eventsToSync = selectedEvents && selectedEvents.length > 0
    ? selectedEvents.filter(e => e.selected !== false)
    : convertTripToCalendarEvents(trip);

  if (eventsToSync.length === 0) {
    return {
      success: true,
      syncedCount: 0,
      totalCount: 0,
      events: []
    };
  }

  const createdEvents: Array<{ id: string; title: string; htmlLink?: string }> = [];
  const errors: string[] = [];

  for (const event of eventsToSync) {
    try {
      const summary = `🇰🇭 [WisGO] ${event.title}`;
      const description = [
        `Trip: ${trip.title} (${trip.destination})`,
        `Time: ${event.startTimeStr} – ${event.endTimeStr}`,
        `Location: ${event.location}`,
        '',
        `Details:`,
        event.description,
        '',
        `--`,
        `Curated by WisGO - Cambodian Youth Travel Companion`,
        `https://wisgo-cambodia.app`
      ].join('\n');

      const payload = {
        summary,
        location: event.location || trip.destination,
        description,
        start: {
          dateTime: event.startDateTime.toISOString(),
          timeZone: 'Asia/Phnom_Penh'
        },
        end: {
          dateTime: event.endDateTime.toISOString(),
          timeZone: 'Asia/Phnom_Penh'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'popup', minutes: 120 }
          ]
        }
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || `Failed with status ${response.status}`;
        errors.push(`${event.title}: ${errMsg}`);
        continue;
      }

      const data = await response.json();
      createdEvents.push({
        id: data.id,
        title: event.title,
        htmlLink: data.htmlLink
      });
    } catch (err: any) {
      errors.push(`${event.title}: ${err?.message || 'Unknown error'}`);
    }
  }

  if (createdEvents.length === 0 && errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return {
    success: true,
    syncedCount: createdEvents.length,
    totalCount: eventsToSync.length,
    events: createdEvents,
    error: errors.length > 0 ? `${errors.length} activities could not be added` : undefined
  };
}

/**
 * Builds clean, responsive HTML email content for a WisGO itinerary.
 */
function buildTripHtmlEmail(trip: TripPlan, recipientEmail: string, customNote?: string): string {
  const destination = trip.destination || 'Cambodia';
  const duration = trip.durationDays || 1;
  const cost = trip.totalEstimatedCost || 'Estimated on-site';

  const daysHtml = (trip.days || []).map(day => {
    const activitiesHtml = (day.activities || []).map(act => `
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 12px;">
        <div style="display: flex; align-items: baseline; justify-content: space-between;">
          <span style="font-weight: 700; color: #0B7A5C; font-size: 13px; text-transform: uppercase;">
            ${act.timeSlot || 'Activity'} • ${act.time || ''}
          </span>
          ${act.estimatedCost ? `<span style="font-weight: 700; color: #1e293b; font-size: 12px; background-color: #f1f5f9; padding: 2px 8px; border-radius: 6px;">${act.estimatedCost}</span>` : ''}
        </div>
        <h4 style="margin: 6px 0 4px 0; font-size: 15px; color: #0f172a;">${act.title}</h4>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569; line-height: 1.5;">${act.description}</p>
        <div style="font-size: 12px; color: #64748b; line-height: 1.5;">
          ${act.location ? `<div><strong>📍 Location:</strong> ${act.location}</div>` : ''}
          ${act.transportTip ? `<div><strong>🛵 Transport / PassApp:</strong> ${act.transportTip}</div>` : ''}
          ${act.openingHours ? `<div><strong>⏰ Hours:</strong> ${act.openingHours}</div>` : ''}
          ${act.practicalNotes ? `<div style="color: #b45309;"><strong>💡 Youth Tip:</strong> ${act.practicalNotes}</div>` : ''}
        </div>
      </div>
    `).join('');

    return `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0B7A5C; border-bottom: 2px solid #DFF7ED; padding-bottom: 6px; margin-bottom: 12px;">
          Day ${day.dayNumber}: ${day.theme || `Exploring ${destination}`}
        </h3>
        ${activitiesHtml}
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${trip.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px;">
  <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #0B7A5C 0%, #086048 100%); padding: 32px 24px; color: #ffffff;">
      <div style="font-size: 12px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #21C87A; margin-bottom: 6px;">
        🇰🇭 WisGO • Cambodian Travel Companion
      </div>
      <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 800; line-height: 1.3;">
        ${trip.title}
      </h1>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">
        ${destination} • ${duration} Days • Budget: ${trip.budgetTier || 'Moderate'}
      </p>
    </div>

    <!-- Quick Info Cards -->
    <div style="background-color: #f0fdf4; border-bottom: 1px solid #dcfce7; padding: 16px 24px; display: flex; flex-wrap: wrap; gap: 16px;">
      <div>
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #15803d;">Total Estimated Cost</div>
        <div style="font-size: 14px; font-weight: 800; color: #166534;">${cost}</div>
      </div>
      ${trip.startDate ? `
      <div style="margin-left: 20px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #15803d;">Start Date</div>
        <div style="font-size: 14px; font-weight: 800; color: #166534;">${trip.startDate}</div>
      </div>
      ` : ''}
    </div>

    <!-- Custom User Note if provided -->
    ${customNote ? `
    <div style="padding: 16px 24px; background-color: #fefce8; border-bottom: 1px solid #fef08a; font-size: 13px; color: #854d0e;">
      <strong>Note from traveler:</strong> ${customNote}
    </div>
    ` : ''}

    <!-- Itinerary Body -->
    <div style="padding: 24px;">
      ${daysHtml}
    </div>

    <!-- Cambodia Youth Travel Tips Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; font-size: 12px; color: #64748b; line-height: 1.6;">
      <div style="font-weight: 700; color: #334155; margin-bottom: 6px;">💡 Cambodia Essential Reminders:</div>
      <div>• <strong>PassApp & Grab:</strong> Use local mobile ride apps for honest, non-metered fares.</div>
      <div>• <strong>Dual Currency:</strong> $1 USD ≈ 4,000 - 4,100 KHR. Keep small bills ($1, $5, 10,000៛) handy.</div>
      <div>• <strong>Temple Etiquette:</strong> Always cover shoulders and knees when visiting pagodas and sacred ancient monuments.</div>
    </div>

    <!-- Signature -->
    <div style="background-color: #0f172a; color: #94a3b8; text-align: center; padding: 16px; font-size: 11px;">
      Sent with ❤️ via <strong style="color: #ffffff;">WisGO</strong> — AI Travel Assistant & Youth Discovery App
    </div>

  </div>
</body>
</html>
  `.trim();
}

/**
 * Sends a structured TripPlan directly via the user's Gmail account using the Gmail REST API.
 */
export async function sendTripViaGmail(
  token: string,
  trip: TripPlan,
  recipientEmail: string,
  customNote?: string
): Promise<GmailSendResult> {
  if (!token) {
    throw new Error('Google OAuth token is required to send via Gmail.');
  }

  if (!recipientEmail || !recipientEmail.includes('@')) {
    throw new Error('A valid recipient email address is required.');
  }

  const subject = `🇰🇭 WisGO Itinerary: ${trip.title} (${trip.destination})`;
  const htmlContent = buildTripHtmlEmail(trip, recipientEmail, customNote);

  // Encode RFC 2822 email
  const utf8Base64 = (str: string) => {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  };

  const emailLines = [
    `To: ${recipientEmail}`,
    `Subject: =?utf-8?B?${utf8Base64(subject)}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    htmlContent
  ];

  const rawEmail = emailLines.join('\r\n');
  const base64UrlEncoded = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: base64UrlEncoded })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errMsg = errorData?.error?.message || `Gmail API returned status ${response.status}`;
    throw new Error(`Failed to send email via Gmail: ${errMsg}`);
  }

  const data = await response.json();

  return {
    success: true,
    messageId: data.id,
    recipientEmail
  };
}
