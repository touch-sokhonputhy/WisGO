import { TripPlan, TripDay, TripActivity } from '../types';

/**
 * Extracts a TripPlan from AI response text.
 * Looks first for ```json:wisgo-trip ... ``` block.
 * If not found, attempts markdown heuristic parsing.
 */
export function parseItineraryFromResponse(text: string, destinationHint?: string): TripPlan | null {
  if (!text) return null;

  // 1. Try finding ```json:wisgo-trip ... ``` or ```json ... ``` with trip structure
  const jsonMatch = text.match(/```(?:json:wisgo-trip|json)\s*([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim());
      if (parsed && (parsed.days || parsed.itinerary || parsed.title)) {
        return normalizeTripPlan(parsed, destinationHint);
      }
    } catch {
      // Continue to heuristic
    }
  }

  // 2. Also check for raw JSON object if the text is pure JSON
  if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(text.trim());
      if (parsed && (parsed.days || parsed.title)) {
        return normalizeTripPlan(parsed, destinationHint);
      }
    } catch {}
  }

  // 3. Fallback Heuristic: Parse Day-by-Day markdown structure
  const hasDayMarkers = /Day\s*\d+|ថ្ងៃទី\s*\d+/i.test(text);
  if (!hasDayMarkers) return null;

  return parseMarkdownItinerary(text, destinationHint);
}

function normalizeTripPlan(raw: any, fallbackDestination = 'Cambodia'): TripPlan {
  const days: TripDay[] = (raw.days || []).map((d: any, index: number) => ({
    dayNumber: d.dayNumber || index + 1,
    date: d.date || `Day ${d.dayNumber || index + 1}`,
    theme: d.theme || `Day ${index + 1} Exploration`,
    activities: (d.activities || []).map((a: any, aIdx: number) => ({
      id: a.id || `act-${index + 1}-${aIdx + 1}`,
      timeSlot: a.timeSlot || 'morning',
      time: a.time || 'Flexible',
      title: a.title || 'Scheduled Spot',
      description: a.description || '',
      location: a.location || 'Cambodia',
      estimatedDuration: a.estimatedDuration || '2 hours',
      estimatedCost: a.estimatedCost || 'Free / Low cost',
      transportTip: a.transportTip || 'PassApp tuk-tuk (~$2 - $4)',
      openingHours: a.openingHours || 'Normal business hours',
      practicalNotes: a.practicalNotes || ''
    }))
  }));

  const destination = raw.destination || fallbackDestination;
  const durationDays = raw.durationDays || days.length || 3;

  return {
    id: raw.id || `trip-${Date.now()}`,
    userId: raw.userId,
    title: raw.title || `${durationDays}-Day Authentic ${destination} Trip`,
    destination,
    startDate: raw.startDate || new Date().toISOString().split('T')[0],
    durationDays,
    travelersCount: raw.travelersCount || 2,
    budgetTier: raw.budgetTier || 'moderate',
    totalEstimatedCost: raw.totalEstimatedCost || '$80 – $150 per traveler (Estimated)',
    costBreakdown: raw.costBreakdown ? {
      accommodation: Number(raw.costBreakdown.accommodation) || 0,
      food: Number(raw.costBreakdown.food) || 0,
      transport: Number(raw.costBreakdown.transport) || 0,
      activities: Number(raw.costBreakdown.activities) || 0
    } : undefined,
    days,
    summaryNote: raw.summaryNote || 'Customized authentic Cambodian youth itinerary.',
    isPublic: raw.isPublic ?? true,
    createdAt: raw.createdAt || new Date().toISOString()
  };
}

function parseMarkdownItinerary(markdown: string, defaultDest = 'Cambodia'): TripPlan | null {
  const daySections = markdown.split(/(?=###?\s*(?:Day\s*\d+|ថ្ងៃទី\s*\d+))/i);
  if (daySections.length < 2) return null;

  const days: TripDay[] = [];
  let dayCounter = 1;

  for (const section of daySections) {
    const dayHeaderMatch = section.match(/###?\s*(Day\s*\d+|ថ្ងៃទី\s*\d+)[^:\n]*:?\s*([^\n]*)/i);
    if (!dayHeaderMatch) continue;

    const theme = dayHeaderMatch[2]?.trim() || `Day ${dayCounter} Highlights`;
    const activities: TripActivity[] = [];

    // Parse activities by time slots or bullet points
    const lines = section.split('\n');
    let currentActivity: Partial<TripActivity> | null = null;

    for (const line of lines) {
      const slotMatch = line.match(/\*\s*\*\*(Morning|Afternoon|Evening|Night|ព្រឹក|រសៀល|ល្ងាច)(?:\s*\(([^)]+)\))?:\*\*\s*(.+)/i);
      
      if (slotMatch) {
        if (currentActivity && currentActivity.title) {
          activities.push(finalizeActivity(currentActivity, dayCounter, activities.length));
        }

        const slotRaw = slotMatch[1].toLowerCase();
        const slot = slotRaw.includes('morn') || slotRaw.includes('ព្រឹក') ? 'morning'
          : slotRaw.includes('after') || slotRaw.includes('រសៀល') ? 'afternoon'
          : slotRaw.includes('even') || slotRaw.includes('ល្ងាច') ? 'evening' : 'night';

        currentActivity = {
          timeSlot: slot as any,
          time: slotMatch[2]?.trim() || (slot === 'morning' ? '8:30 AM – 11:30 AM' : slot === 'afternoon' ? '1:30 PM – 4:30 PM' : '6:00 PM – 9:00 PM'),
          title: cleanMarkdown(slotMatch[3]),
          description: '',
          location: defaultDest,
          estimatedDuration: '2.5 hours',
          estimatedCost: 'Free or Pass fee (Estimated)',
          transportTip: 'PassApp Tuk-Tuk (~$2 - $3)',
          openingHours: 'Daytime',
          practicalNotes: ''
        };
      } else if (currentActivity) {
        if (line.includes('Location:') || line.includes('ទីតាំង:')) {
          currentActivity.location = cleanMarkdown(line.replace(/.*(?:Location|ទីតាំង):\s*/i, ''));
        } else if (line.includes('Estimated Time:') || line.includes('រយៈពេល:')) {
          currentActivity.estimatedDuration = cleanMarkdown(line.replace(/.*(?:Estimated Time|រយៈពេល):\s*/i, ''));
        } else if (line.includes('Estimated Cost:') || line.includes('តម្លៃ:')) {
          currentActivity.estimatedCost = cleanMarkdown(line.replace(/.*(?:Estimated Cost|តម្លៃ):\s*/i, ''));
        } else if (line.includes('Transportation') || line.includes('Transport') || line.includes('ការធ្វើដំណើរ:')) {
          currentActivity.transportTip = cleanMarkdown(line.replace(/.*(?:Transportation Suggestion|Transport Suggestion|Transport Tip|ការធ្វើដំណើរ):\s*/i, ''));
        } else if (line.includes('Opening Hours:') || line.includes('ម៉ោងបើក:')) {
          currentActivity.openingHours = cleanMarkdown(line.replace(/.*(?:Opening Hours|ម៉ោងបើក):\s*/i, ''));
        } else if (line.includes('Practical Notes:') || line.includes('Notes:') || line.includes('ចំណាំ:')) {
          currentActivity.practicalNotes = cleanMarkdown(line.replace(/.*(?:Practical Notes|Notes|ចំណាំ):\s*/i, ''));
        } else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
          const detail = cleanMarkdown(line.replace(/^[-*]\s*/, ''));
          if (!currentActivity.description) {
            currentActivity.description = detail;
          } else {
            currentActivity.description += ` ${detail}`;
          }
        }
      }
    }

    if (currentActivity && currentActivity.title) {
      activities.push(finalizeActivity(currentActivity, dayCounter, activities.length));
    }

    if (activities.length > 0) {
      days.push({
        dayNumber: dayCounter,
        theme,
        activities
      });
      dayCounter++;
    }
  }

  if (days.length === 0) return null;

  return {
    id: `trip-${Date.now()}`,
    title: `${days.length}-Day Cambodia Actionable Itinerary`,
    destination: defaultDest,
    startDate: new Date().toISOString().split('T')[0],
    durationDays: days.length,
    travelersCount: 2,
    budgetTier: 'moderate',
    totalEstimatedCost: '$90 – $160 per traveler (Estimated)',
    days,
    summaryNote: 'Real-world schedule optimized for local travel.',
    isPublic: true,
    createdAt: new Date().toISOString()
  };
}

function finalizeActivity(act: Partial<TripActivity>, dayNum: number, idx: number): TripActivity {
  return {
    id: act.id || `act-${dayNum}-${idx + 1}`,
    timeSlot: act.timeSlot || 'morning',
    time: act.time || '9:00 AM – 12:00 PM',
    title: act.title || 'Sightseeing & Culture',
    description: act.description || 'Explore local heritage and highlights.',
    location: act.location || 'Cambodia',
    estimatedDuration: act.estimatedDuration || '2.5 hours',
    estimatedCost: act.estimatedCost || 'Estimated: ~$5 - $10',
    transportTip: act.transportTip || 'PassApp auto-rickshaw (~$2 - $3)',
    openingHours: act.openingHours || 'Open daily',
    practicalNotes: act.practicalNotes || ''
  };
}

function cleanMarkdown(str: string): string {
  return str.replace(/\*\*/g, '').replace(/[\*_]/g, '').trim();
}

/**
 * Removes the ```json:wisgo-trip ... ``` block from markdown text so the
 * chat interface displays clean conversational markdown without raw code blocks.
 */
export function cleanChatText(text: string): string {
  if (!text) return '';
  return text.replace(/```(?:json:wisgo-trip|json)\s*[\s\S]*?```/g, '').trim();
}

// Re-export calendar ICS parsing & generation utilities
export {
  parseAiItineraryToIcs,
  generateIcsFromAiItinerary,
  downloadIcsFromAiItinerary
} from './calendarExport';
