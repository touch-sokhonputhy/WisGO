import { TripPlan, TripDay, TripActivity } from '../types';

/**
 * Builds the subject line according to user requirement:
 * "Your WisGO Trip Plan – {X} Days in {Destination}"
 */
export function getTripEmailSubject(trip: TripPlan): string {
  return `Your WisGO Trip Plan – ${trip.durationDays} Days in ${trip.destination}`;
}

/**
 * Generates a clean travel-plan document formatted for mobile and email clients.
 */
export function generateTripEmailText(trip: TripPlan): string {
  const lines: string[] = [];

  lines.push(`🇰🇭 WISGO CAMBODIA TRAVEL PLAN`);
  lines.push(`==========================================`);
  lines.push(`Trip: ${trip.title}`);
  lines.push(`Destination: ${trip.destination}, Cambodia`);
  lines.push(`Duration: ${trip.durationDays} Days`);
  if (trip.startDate) lines.push(`Start Date: ${trip.startDate}`);
  lines.push(`Travelers: ${trip.travelersCount} Person(s)`);
  lines.push(`Estimated Budget: ${trip.totalEstimatedCost || 'Moderate'}`);
  lines.push(`==========================================\n`);

  if (trip.summaryNote) {
    lines.push(`TRIP OVERVIEW:`);
    lines.push(`${trip.summaryNote}\n`);
  }

  trip.days.forEach((day: TripDay) => {
    lines.push(`------------------------------------------`);
    lines.push(`DAY ${day.dayNumber}: ${day.theme || 'Exploration'}`);
    if (day.date) lines.push(`Date: ${day.date}`);
    lines.push(`------------------------------------------`);

    day.activities.forEach((act: TripActivity, idx: number) => {
      const slotName = act.timeSlot.toUpperCase();
      lines.push(`\n[${slotName}] ${act.title}`);
      lines.push(`• Time: ${act.time}`);
      lines.push(`• Location: ${act.location}`);
      if (act.estimatedDuration) lines.push(`• Duration: ${act.estimatedDuration}`);
      if (act.estimatedCost) lines.push(`• Cost: ${act.estimatedCost}`);
      if (act.transportTip) lines.push(`• Transport: ${act.transportTip}`);
      if (act.openingHours) lines.push(`• Hours: ${act.openingHours}`);
      if (act.description) lines.push(`• Highlights: ${act.description}`);
      if (act.practicalNotes) lines.push(`• Youth Local Tip: ${act.practicalNotes}`);
    });
    lines.push(`\n`);
  });

  lines.push(`==========================================`);
  lines.push(`PRACTICAL CAMBODIAN TRAVEL ESSENTIALS:`);
  lines.push(`• Currency: Dual system (USD for major bills, KHR for change: $1 ≈ 4,000 - 4,100 KHR).`);
  lines.push(`• Transport: Use PassApp or Grab mobile app for upfront, meter-accurate tuk-tuk fares.`);
  lines.push(`• Temple Etiquette: Cover shoulders & knees. Remove hats inside pagoda shrines.`);
  lines.push(`• Greetings: "Choum Reap Sur" (Hello), "Orkun" (Thank you).`);
  lines.push(`==========================================`);
  lines.push(`Created with WisGO AI Travel Planning Assistant (https://ai.studio)`);

  return lines.join('\n');
}

/**
 * Builds direct Gmail web compose link.
 */
export function buildGmailComposeUrl(recipientEmail: string, trip: TripPlan): string {
  const subject = getTripEmailSubject(trip);
  const body = generateTripEmailText(trip);

  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: recipientEmail.trim(),
    su: subject,
    body: body
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Builds default mailto link.
 */
export function buildMailtoUrl(recipientEmail: string, trip: TripPlan): string {
  const subject = getTripEmailSubject(trip);
  const body = generateTripEmailText(trip);

  return `mailto:${encodeURIComponent(recipientEmail.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
