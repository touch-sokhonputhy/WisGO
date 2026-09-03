import { TripPlan, TripCostBreakdown } from '../types';

export interface CostCategoryItem {
  id: 'accommodation' | 'food' | 'transport' | 'activities';
  name: string;
  value: number; // in USD
  percentage: number;
  color: string;
  lightBg: string;
  borderColor: string;
  badgeClass: string;
  detail: string;
}

export interface CalculatedCostSummary {
  items: CostCategoryItem[];
  totalCost: number;
  perPersonCost: number;
  travelersCount: number;
  currency: string;
}

/**
 * Extracts numeric dollar amounts from text like "$37", "$18 ticket + ~$6 street dinner"
 */
function extractDollars(text?: string): number[] {
  if (!text) return [];
  const matches = text.match(/\$\s*(\d+(?:\.\d{1,2})?)/g);
  if (!matches) return [];
  return matches.map(m => parseFloat(m.replace(/[$\s]/g, ''))).filter(n => !isNaN(n) && n > 0);
}

/**
 * Computes or resolves a reliable 4-category cost breakdown (Accommodation, Food, Transport, Activities)
 * for any given Cambodian trip itinerary.
 */
export function getTripCostBreakdown(trip: TripPlan): CalculatedCostSummary {
  const travelersCount = Math.max(1, trip.travelersCount || 1);
  const daysCount = Math.max(1, trip.durationDays || trip.days?.length || 3);
  const nightsCount = Math.max(1, daysCount - 1);
  const tier = trip.budgetTier || 'moderate';

  // 1. If explicit costBreakdown is attached to the trip, use it directly
  if (trip.costBreakdown && 
      (trip.costBreakdown.accommodation > 0 || 
       trip.costBreakdown.food > 0 || 
       trip.costBreakdown.transport > 0 || 
       trip.costBreakdown.activities > 0)) {
    const acc = Math.max(0, Math.round(trip.costBreakdown.accommodation));
    const food = Math.max(0, Math.round(trip.costBreakdown.food));
    const trans = Math.max(0, Math.round(trip.costBreakdown.transport));
    const act = Math.max(0, Math.round(trip.costBreakdown.activities));
    const total = acc + food + trans + act;
    const safeTotal = total > 0 ? total : 100;

    return buildSummaryFromValues(acc, food, trans, act, safeTotal, travelersCount, daysCount, nightsCount, tier);
  }

  // 2. Otherwise, estimate from activities and destination/budget tier
  let activitySum = 0;
  let transportSum = 0;
  let foodSum = 0;

  if (trip.days && trip.days.length > 0) {
    for (const day of trip.days) {
      for (const a of day.activities || []) {
        const titleLower = (a.title || '').toLowerCase();
        const descLower = (a.description || '').toLowerCase();
        const combined = `${titleLower} ${descLower}`;

        const costValues = extractDollars(a.estimatedCost);
        const maxCost = costValues.length > 0 ? Math.max(...costValues) : 0;

        // Categorize by keywords
        const isFood = combined.includes('dinner') || combined.includes('lunch') || 
                       combined.includes('breakfast') || combined.includes('food') || 
                       combined.includes('eats') || combined.includes('noodle') || 
                       combined.includes('amok') || combined.includes('market street') ||
                       combined.includes('restaurant') || combined.includes('coffee') || combined.includes('cafe');

        const isTransport = combined.includes('tuk-tuk') || combined.includes('passapp') || 
                            combined.includes('taxi') || combined.includes('ferry') || 
                            combined.includes('transfer') || combined.includes('flight') || 
                            combined.includes('bus') || combined.includes('minivan');

        if (isFood && maxCost > 0) {
          foodSum += maxCost;
        } else if (isTransport && maxCost > 0) {
          transportSum += maxCost;
        } else if (maxCost > 0) {
          activitySum += maxCost;
        }

        // Also check transport tip for extra transit expenses
        const transTipValues = extractDollars(a.transportTip);
        if (transTipValues.length > 0) {
          transportSum += transTipValues[0];
        }
      }
    }
  }

  // Baseline standard Cambodian costs per person based on tier
  const tierRates = {
    budget: {
      nightlyAcc: 18,    // guesthouse / hostel with A/C
      dailyFood: 12,     // local markets, street food stalls
      dailyTransport: 6, // PassApp tuk-tuk, walking
      dailyActivity: 12  // standard viewpoints, local passes
    },
    moderate: {
      nightlyAcc: 42,    // 3-star boutique hotel with pool
      dailyFood: 24,     // mix of Khmer restaurants & youth cafes
      dailyTransport: 14,// PassApp remorques & day hires
      dailyActivity: 25  // Angkor Pass, Phare Circus, boat trips
    },
    luxury: {
      nightlyAcc: 110,   // luxury resort / heritage hotel
      dailyFood: 55,     // fine dining, river cruises & cocktails
      dailyTransport: 35,// private SUV / VIP transfers
      dailyActivity: 48  // private guided tours, wellness spas
    }
  }[tier];

  // Derive final values per person, then scale for total travelers
  const baseAccPerPerson = Math.round(tierRates.nightlyAcc * nightsCount);
  const baseFoodPerPerson = Math.max(Math.round(foodSum) || Math.round(tierRates.dailyFood * daysCount), Math.round(tierRates.dailyFood * daysCount));
  const baseTransportPerPerson = Math.max(Math.round(transportSum) || Math.round(tierRates.dailyTransport * daysCount), Math.round(tierRates.dailyTransport * daysCount));
  const baseActivityPerPerson = Math.max(Math.round(activitySum) || Math.round(tierRates.dailyActivity * daysCount), Math.round(tierRates.dailyActivity * daysCount));

  // Check if trip.totalEstimatedCost provides a target total
  const estimatedCostMatches = extractDollars(trip.totalEstimatedCost);
  let targetTotal = (baseAccPerPerson + baseFoodPerPerson + baseTransportPerPerson + baseActivityPerPerson) * travelersCount;

  if (estimatedCostMatches.length > 0) {
    const avgExtracted = estimatedCostMatches.reduce((acc, v) => acc + v, 0) / estimatedCostMatches.length;
    // If text says "per person" or has 1 traveler, scale by travelersCount
    const isPerPersonText = /per\s*(person|traveler)/i.test(trip.totalEstimatedCost || '');
    const suggestedTotal = isPerPersonText ? avgExtracted * travelersCount : avgExtracted;
    if (suggestedTotal >= 30) {
      targetTotal = Math.round(suggestedTotal);
    }
  }

  // Proportions
  const rawSum = (baseAccPerPerson + baseFoodPerPerson + baseTransportPerPerson + baseActivityPerPerson) * travelersCount;
  const scale = targetTotal / (rawSum || 1);

  const finalAcc = Math.max(15, Math.round(baseAccPerPerson * travelersCount * scale));
  const finalFood = Math.max(15, Math.round(baseFoodPerPerson * travelersCount * scale));
  const finalTrans = Math.max(10, Math.round(baseTransportPerPerson * travelersCount * scale));
  const finalAct = Math.max(15, Math.round(baseActivityPerPerson * travelersCount * scale));

  const safeTotal = finalAcc + finalFood + finalTrans + finalAct;

  return buildSummaryFromValues(finalAcc, finalFood, finalTrans, finalAct, safeTotal, travelersCount, daysCount, nightsCount, tier);
}

function buildSummaryFromValues(
  acc: number,
  food: number,
  trans: number,
  act: number,
  total: number,
  travelersCount: number,
  daysCount: number,
  nightsCount: number,
  tier: string
): CalculatedCostSummary {
  const pAcc = Math.round((acc / total) * 100);
  const pFood = Math.round((food / total) * 100);
  const pTrans = Math.round((trans / total) * 100);
  const pAct = Math.max(0, 100 - (pAcc + pFood + pTrans)); // normalize to 100%

  const items: CostCategoryItem[] = [
    {
      id: 'accommodation',
      name: 'Accommodation',
      value: acc,
      percentage: pAcc,
      color: '#6366F1', // Indigo
      lightBg: 'bg-indigo-50/70',
      borderColor: 'border-indigo-200',
      badgeClass: 'text-indigo-700 bg-indigo-50',
      detail: `${nightsCount} nights • ${tier} tier stay`
    },
    {
      id: 'food',
      name: 'Food & Dining',
      value: food,
      percentage: pFood,
      color: '#F59E0B', // Warm Amber
      lightBg: 'bg-amber-50/70',
      borderColor: 'border-amber-200',
      badgeClass: 'text-amber-800 bg-amber-50',
      detail: `${daysCount} days • Khmer meals & drinks`
    },
    {
      id: 'transport',
      name: 'Transport',
      value: trans,
      percentage: pTrans,
      color: '#0284C7', // Sky blue
      lightBg: 'bg-sky-50/70',
      borderColor: 'border-sky-200',
      badgeClass: 'text-sky-800 bg-sky-50',
      detail: 'PassApp, Remorque & transfers'
    },
    {
      id: 'activities',
      name: 'Activities & Passes',
      value: act,
      percentage: pAct,
      color: '#0B7A5C', // WisGO Emerald
      lightBg: 'bg-emerald-50/70',
      borderColor: 'border-emerald-200',
      badgeClass: 'text-emerald-800 bg-emerald-50',
      detail: 'Temple tickets, tours & entry'
    }
  ];

  return {
    items,
    totalCost: total,
    perPersonCost: Math.round(total / travelersCount),
    travelersCount,
    currency: 'USD ($)'
  };
}
