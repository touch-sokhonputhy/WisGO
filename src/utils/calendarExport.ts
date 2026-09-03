import { TripPlan, TripActivity, TripDay } from '../types';
import { parseItineraryFromResponse } from './tripParser';

export interface CalendarEventItem {
  id: string;
  title: string;
  dateStr: string;
  startTimeStr: string;
  endTimeStr: string;
  startDateTime: Date;
  endDateTime: Date;
  location: string;
  description: string;
  selected: boolean;
}

export interface IcsGenerationOptions {
  includeReminders?: boolean; // default: true (30-min alarm)
  includePassAppNotes?: boolean; // default: true
  timeZone?: string; // default: 'Asia/Phnom_Penh'
  includeGoogleMapsLink?: boolean; // default: true
  selectedEventIds?: string[]; // optional filter for specific activities
}

export interface ParseIcsResult {
  success: boolean;
  icsContent: string;
  trip: TripPlan | null;
  eventCount: number;
  filename: string;
  download: (customFilename?: string) => boolean;
  error?: string;
}

/**
 * Main requested function:
 * Parses structured AI itinerary output (raw text with JSON/markdown or parsed TripPlan)
 * and generates an RFC 5545 compliant .ics calendar file ready for importing into Google Calendar.
 */
export function parseAiItineraryToIcs(
  aiOutput: string | TripPlan | Record<string, any>,
  options: IcsGenerationOptions = {}
): ParseIcsResult {
  try {
    let trip: TripPlan | null = null;

    if (typeof aiOutput === 'string') {
      trip = parseItineraryFromResponse(aiOutput);
      if (!trip) {
        // Attempt fallback JSON parse if user provided direct JSON string
        try {
          const raw = JSON.parse(aiOutput.trim());
          if (raw && (raw.days || raw.title)) {
            trip = raw as TripPlan;
          }
        } catch {
          // not raw JSON
        }
      }
    } else if (aiOutput && typeof aiOutput === 'object') {
      trip = aiOutput as TripPlan;
    }

    if (!trip || !Array.isArray(trip.days) || trip.days.length === 0) {
      return {
        success: false,
        icsContent: '',
        trip: null,
        eventCount: 0,
        filename: 'WisGO_Cambodia_Trip.ics',
        download: () => false,
        error: 'Could not extract valid day-by-day itinerary activities from the AI output.'
      };
    }

    const events = convertTripToCalendarEvents(trip);
    const filteredEvents = options.selectedEventIds && options.selectedEventIds.length > 0
      ? events.filter(e => options.selectedEventIds!.includes(e.id))
      : events;

    const icsContent = generateIcsContent(trip, filteredEvents, options);
    const safeDest = (trip.destination || 'Cambodia').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeTitle = (trip.title || 'Itinerary').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 32);
    const filename = `WisGO_${safeDest}_${safeTitle}.ics`;

    const downloadFn = (customFilename?: string): boolean => {
      try {
        return triggerIcsDownload(icsContent, customFilename || filename);
      } catch (err) {
        console.error('Failed to trigger .ics download:', err);
        return false;
      }
    };

    return {
      success: true,
      icsContent,
      trip,
      eventCount: filteredEvents.length,
      filename,
      download: downloadFn
    };
  } catch (err: any) {
    console.error('parseAiItineraryToIcs error:', err);
    return {
      success: false,
      icsContent: '',
      trip: null,
      eventCount: 0,
      filename: 'WisGO_Cambodia_Trip.ics',
      download: () => false,
      error: err?.message || 'An unexpected error occurred generating .ics calendar file.'
    };
  }
}

/**
 * Convenient wrapper that takes AI itinerary output and directly returns the raw .ics calendar string.
 */
export function generateIcsFromAiItinerary(
  aiOutput: string | TripPlan | Record<string, any>,
  options: IcsGenerationOptions = {}
): string {
  const res = parseAiItineraryToIcs(aiOutput, options);
  return res.icsContent;
}

/**
 * Convenient 1-call action: parses AI output and triggers browser download of the .ics file.
 */
export function downloadIcsFromAiItinerary(
  aiOutput: string | TripPlan | Record<string, any>,
  filename?: string,
  options: IcsGenerationOptions = {}
): boolean {
  const res = parseAiItineraryToIcs(aiOutput, options);
  if (!res.success || !res.icsContent) {
    console.warn('Could not download .ics:', res.error);
    return false;
  }
  return res.download(filename);
}

/**
 * Returns Google Calendar web import URL for quick user access.
 */
export function getGoogleCalendarImportUrl(): string {
  return 'https://calendar.google.com/calendar/u/0/r/settings/export';
}

/**
 * Transforms a TripPlan into actionable calendar events with calculated Date objects.
 */
export function convertTripToCalendarEvents(trip: TripPlan): CalendarEventItem[] {
  const events: CalendarEventItem[] = [];
  const baseDate = trip.startDate ? new Date(trip.startDate) : new Date();

  // If baseDate is invalid, fallback to tomorrow
  const validBaseDate = isNaN(baseDate.getTime()) ? new Date(Date.now() + 86400000) : baseDate;

  trip.days.forEach((day: TripDay, dayIdx: number) => {
    // Determine the calendar date for this day
    const eventDate = new Date(validBaseDate);
    eventDate.setDate(validBaseDate.getDate() + dayIdx);
    const dateFormatted = eventDate.toISOString().split('T')[0];

    day.activities.forEach((act: TripActivity, actIdx: number) => {
      const { start, end } = parseActivityTimes(act.time, eventDate, act.timeSlot, actIdx);

      const locationQuery = encodeURIComponent(`${act.location || trip.destination}, Cambodia`);
      const googleMapsLink = `https://maps.google.com/?q=${locationQuery}`;

      const descriptionLines = [
        `🇰🇭 WisGO Cambodia Travel Itinerary: ${trip.title}`,
        `Day ${day.dayNumber}: ${day.theme || 'Exploration'}${day.date ? ` (${day.date})` : ''}`,
        `Slot: ${(act.timeSlot || 'any').toUpperCase()}${act.time ? ` [${act.time}]` : ''}`,
        act.description ? `\nOverview:\n${act.description}` : '',
        act.openingHours ? `\n⏰ Opening Hours: ${act.openingHours}` : '',
        act.estimatedCost ? `💰 Estimated Cost: ${act.estimatedCost}` : '',
        act.transportTip ? `🚕 PassApp / Transport: ${act.transportTip}` : '',
        act.practicalNotes ? `\n💡 Local Youth Tip:\n${act.practicalNotes}` : '',
        `\n📍 Google Maps: ${googleMapsLink}`,
        `\nPlan customized with WisGO Cambodia (https://wis-go.vercel.app/)`
      ].filter(Boolean).join('\n');

      events.push({
        id: act.id || `event-${day.dayNumber}-${actIdx}-${Date.now()}`,
        title: `${act.title} (Day ${day.dayNumber})`,
        dateStr: dateFormatted,
        startTimeStr: formatTimeHuman(start),
        endTimeStr: formatTimeHuman(end),
        startDateTime: start,
        endDateTime: end,
        location: act.location ? `${act.location}, Cambodia` : `${trip.destination}, Cambodia`,
        description: descriptionLines,
        selected: true
      });
    });
  });

  return events;
}

/**
 * Builds RFC 5545 compliant iCalendar string for Google Calendar, Apple Calendar, and Outlook.
 */
function generateIcsContent(
  trip: TripPlan,
  events: CalendarEventItem[],
  options: IcsGenerationOptions = {}
): string {
  const nowUtc = formatIcsDateTimeUtc(new Date());
  const tz = options.timeZone || 'Asia/Phnom_Penh';
  const includeReminders = options.includeReminders ?? true;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WisGO Cambodia//AI Travel Assistant//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:WisGO - ${escapeIcsString(trip.title)}`,
    `X-WR-TIMEZONE:${tz}`,
    `X-WR-CALDESC:Actionable youth travel itinerary for ${escapeIcsString(trip.destination)} generated by WisGO Cambodia`,
    'BEGIN:VTIMEZONE',
    `TZID:${tz}`,
    `X-LIC-LOCATION:${tz}`,
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0700',
    'TZOFFSETTO:+0700',
    'TZNAME:+07',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE'
  ];

  events.forEach((evt, idx) => {
    const uid = `wisgo-${trip.id || 'trip'}-${idx}-${evt.id}@wisgo.cambodia`;
    const locationQuery = encodeURIComponent(evt.location);
    const mapUrl = `https://maps.google.com/?q=${locationQuery}`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowUtc}`,
      `DTSTART;TZID=${tz}:${formatIcsDateTimeLocal(evt.startDateTime)}`,
      `DTEND;TZID=${tz}:${formatIcsDateTimeLocal(evt.endDateTime)}`,
      foldIcsLine(`SUMMARY:${escapeIcsString(evt.title)}`),
      foldIcsLine(`LOCATION:${escapeIcsString(evt.location)}`),
      foldIcsLine(`DESCRIPTION:${escapeIcsString(evt.description)}`),
      foldIcsLine(`URL:${mapUrl}`),
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'SEQUENCE:0'
    );

    if (includeReminders) {
      lines.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        foldIcsLine(`DESCRIPTION:Reminder: ${escapeIcsString(evt.title)}`),
        'TRIGGER:-PT30M',
        'END:VALARM'
      );
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Triggers client-side download of the .ics file.
 */
function triggerIcsDownload(icsContent: string, filename: string): boolean {
  try {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
    return true;
  } catch (err) {
    console.error('triggerIcsDownload error:', err);
    return false;
  }
}

/**
 * Existing legacy function maintained for direct modal calls.
 */
export function downloadIcsCalendarFile(trip: TripPlan, events?: CalendarEventItem[]): void {
  const eventList = events && events.length > 0 ? events.filter(e => e.selected) : convertTripToCalendarEvents(trip);
  if (eventList.length === 0) return;

  const icsContent = generateIcsContent(trip, eventList);
  const safeDest = (trip.destination || 'Cambodia').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `WisGO_${safeDest}_Itinerary.ics`;
  triggerIcsDownload(icsContent, filename);
}

/**
 * Parse human time ranges like "5:00 AM – 8:30 AM" or "14:00 - 16:30" into Date objects.
 */
function parseActivityTimes(
  timeStr: string | undefined, 
  baseDate: Date, 
  slot: 'morning' | 'afternoon' | 'evening' | 'night' | undefined,
  index: number
): { start: Date; end: Date } {
  const start = new Date(baseDate);
  const end = new Date(baseDate);

  if (timeStr) {
    // 1. Try matching range "5:00 AM – 8:30 AM" or "05:00 - 08:30"
    const rangeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[-–—to]+\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (rangeMatch) {
      let startH = parseInt(rangeMatch[1], 10);
      const startM = parseInt(rangeMatch[2], 10);
      const startPeriod = rangeMatch[3]?.toUpperCase();

      let endH = parseInt(rangeMatch[4], 10);
      const endM = parseInt(rangeMatch[5], 10);
      const endPeriod = rangeMatch[6]?.toUpperCase() || startPeriod;

      if (startPeriod === 'PM' && startH < 12) startH += 12;
      if (startPeriod === 'AM' && startH === 12) startH = 0;

      if (endPeriod === 'PM' && endH < 12) endH += 12;
      if (endPeriod === 'AM' && endH === 12) endH = 0;

      start.setHours(startH, startM, 0, 0);
      end.setHours(endH, endM, 0, 0);
      return { start, end };
    }

    // 2. Try single time like "8:00 AM" or "15:30"
    const singleMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (singleMatch) {
      let h = parseInt(singleMatch[1], 10);
      const m = parseInt(singleMatch[2], 10);
      const p = singleMatch[3]?.toUpperCase();

      if (p === 'PM' && h < 12) h += 12;
      if (p === 'AM' && h === 12) h = 0;

      start.setHours(h, m, 0, 0);
      end.setHours(h + 2, m, 0, 0); // default 2 hour activity
      return { start, end };
    }
  }

  // Fallbacks by timeSlot with slight stagger for multiple stops
  const minuteStagger = (index % 3) * 20;
  if (slot === 'morning') {
    start.setHours(8, 30 + minuteStagger, 0, 0);
    end.setHours(11, 30, 0, 0);
  } else if (slot === 'afternoon') {
    start.setHours(13, 30 + minuteStagger, 0, 0);
    end.setHours(16, 30, 0, 0);
  } else if (slot === 'evening') {
    start.setHours(18, 0 + minuteStagger, 0, 0);
    end.setHours(20, 30, 0, 0);
  } else {
    start.setHours(20, 30, 0, 0);
    end.setHours(22, 30, 0, 0);
  }

  return { start, end };
}

function formatTimeHuman(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatIcsDateTimeUtc(d: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const mins = pad(d.getUTCMinutes());
  const secs = pad(d.getUTCSeconds());
  return `${year}${month}${day}T${hours}${mins}${secs}Z`;
}

function formatIcsDateTimeLocal(d: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  const secs = pad(d.getSeconds());
  return `${year}${month}${day}T${hours}${mins}${secs}`;
}

/**
 * Builds direct Google Calendar web render URL for an individual event.
 */
export function buildGoogleCalendarUrl(event: CalendarEventItem): string {
  const dates = `${formatIcsDateTimeUtc(event.startDateTime)}/${formatIcsDateTimeUtc(event.endDateTime)}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates,
    details: event.description,
    location: event.location,
    sf: 'true',
    output: 'xml'
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * RFC 5545 line folding: Max 75 octets per line, continuation begins with space.
 */
function foldIcsLine(line: string): string {
  if (line.length <= 72) return line;

  const parts: string[] = [];
  let remaining = line;

  // First chunk
  parts.push(remaining.slice(0, 72));
  remaining = remaining.slice(72);

  // Subsequent folded chunks start with a single space
  while (remaining.length > 70) {
    parts.push(' ' + remaining.slice(0, 70));
    remaining = remaining.slice(70);
  }

  if (remaining.length > 0) {
    parts.push(' ' + remaining);
  }

  return parts.join('\r\n');
}

/**
 * RFC 5545 string escaping for TEXT property values.
 */
function escapeIcsString(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n');
}
