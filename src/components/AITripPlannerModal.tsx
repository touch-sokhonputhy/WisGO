import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Users, DollarSign, Compass, MapPin, X, Check, ArrowRight } from 'lucide-react';
import { TripPlannerInput } from '../types';

interface AITripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateTrip: (prompt: string, input: TripPlannerInput) => void;
}

const CAMBODIA_DESTINATIONS = [
  'Siem Reap (Angkor Wat)',
  'Phnom Penh (Royal Palace & Mekong)',
  'Kampot & Kep (Pepper & Crab)',
  'Battambang (Bamboo Train & Bats)',
  'Koh Rong & Koh Rong Sanloem',
  'Mondulkiri (Highlands & Elephants)',
  'Siem Reap & Kampot Combined',
  'All-Cambodia Grand Tour'
];

const INTEREST_OPTIONS = [
  'Ancient Temples & History',
  'Local Khmer Street Food',
  'Nature, Waterfalls & Jungle',
  'Beaches & Island Relaxation',
  'Youth Art & Night Markets',
  'River Kayaking & Boating',
  'Photography & Sunrise Spots',
  'Ethical Wildlife & Elephants'
];

export const AITripPlannerModal: React.FC<AITripPlannerModalProps> = ({
  isOpen,
  onClose,
  onGenerateTrip
}) => {
  const [destination, setDestination] = useState(CAMBODIA_DESTINATIONS[0]);
  const [durationDays, setDurationDays] = useState(3);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [travelersCount, setTravelersCount] = useState(2);
  const [budgetTier, setBudgetTier] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
  const [interests, setInterests] = useState<string[]>([
    'Ancient Temples & History',
    'Local Khmer Street Food',
    'Photography & Sunrise Spots'
  ]);
  const [transportPreference, setTransportPreference] = useState<'passapp' | 'private_driver' | 'budget_bus' | 'any'>('passapp');
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'action_packed'>('moderate');
  const [specialNotes, setSpecialNotes] = useState('');

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleBuildTrip = () => {
    const transportLabel =
      transportPreference === 'passapp' ? 'PassApp/Grab Tuk-Tuk focus'
      : transportPreference === 'private_driver' ? 'Private air-conditioned driver'
      : transportPreference === 'budget_bus' ? 'Budget local transport' : 'Flexible transport';

    const promptText = `Please create an actionable, realistic ${durationDays}-day trip itinerary for ${destination}, Cambodia.
• Travel Date: Starting ${startDate} (${durationDays} days)
• Travelers: ${travelersCount} traveler(s)
• Budget: ${budgetTier.toUpperCase()} tier (${budgetTier === 'budget' ? '$25-$40/day' : budgetTier === 'moderate' ? '$50-$90/day' : '$120+/day'})
• Travel Interests: ${interests.join(', ')}
• Pace: ${pace}
• Transport Preference: ${transportLabel}
${specialNotes ? `• Special Requests: ${specialNotes}` : ''}

CRITICAL: Provide structured Day 1, Day 2... with Morning, Afternoon, Evening breakdown.
Include specific places, opening hours, estimated duration, estimated cost (clearly labeled as estimated), PassApp tuk-tuk route suggestions, and youth insider tips.
At the end, include the \`\`\`json:wisgo-trip code block as required!`;

    const inputData: TripPlannerInput = {
      destination,
      durationDays,
      startDate,
      travelersCount,
      budgetTier,
      interests,
      transportPreference,
      pace,
      specialNotes
    };

    onGenerateTrip(promptText, inputData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-[#DFF7ED] via-white to-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0B7A5C] text-white flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="w-6 h-6 text-[#21C87A]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0B7A5C]/10 text-[#0B7A5C] text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span>AI Trip Planner</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Plan Your Actionable Cambodia Trip
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  WisGO builds real-world schedules with PassApp fares, opening hours, and local youth tips.
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

          {/* Form Body */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Destination Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0B7A5C]" />
                <span>Destination in Cambodia</span>
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-[#0B7A5C] focus:bg-white transition-all cursor-pointer"
              >
                {CAMBODIA_DESTINATIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Duration & Start Date & Travelers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>Duration</span>
                </label>
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                  {[1, 2, 3, 4, 5, 7].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDurationDays(num)}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        durationDays === num
                          ? 'bg-[#0B7A5C] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      {num}D
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>Start Date</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0B7A5C] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>Travelers</span>
                </label>
                <select
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-[#0B7A5C] focus:bg-white transition-all cursor-pointer"
                >
                  <option value={1}>1 Solo Explorer</option>
                  <option value={2}>2 Travelers (Couple/Friends)</option>
                  <option value={3}>3-4 Small Group</option>
                  <option value={5}>5+ Family / Big Group</option>
                </select>
              </div>
            </div>

            {/* Budget Tier */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#0B7A5C]" />
                <span>Budget Level</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'budget', label: 'Budget Backpacker', desc: '$25–$40 / day' },
                  { id: 'moderate', label: 'Moderate Explorer', desc: '$50–$90 / day' },
                  { id: 'luxury', label: 'Luxury Comfort', desc: '$120+ / day' }
                ].map(tier => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setBudgetTier(tier.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      budgetTier === tier.id
                        ? 'border-[#0B7A5C] bg-[#DFF7ED]/40 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <p className="font-bold text-xs">{tier.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{tier.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Interests */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#0B7A5C]" />
                <span>Interests & Experiences (Pick Any)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map(item => {
                  const selected = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-3 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                        selected
                          ? 'bg-[#0B7A5C] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pace & Transport */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Pace Preference
                </label>
                <select
                  value={pace}
                  onChange={(e) => setPace(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-[#0B7A5C] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="relaxed">Relaxed (1-2 main spots/day, peaceful)</option>
                  <option value="moderate">Balanced (Ideal mix of sights & rest)</option>
                  <option value="action_packed">Action-Packed (See everything possible)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Transportation Style
                </label>
                <select
                  value={transportPreference}
                  onChange={(e) => setTransportPreference(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-[#0B7A5C] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="passapp">PassApp / Tuk-Tuk (Authentic & Local)</option>
                  <option value="private_driver">Private Air-Conditioned Driver</option>
                  <option value="budget_bus">Budget Local Minivan & Walking</option>
                  <option value="any">Any / Best Recommended</option>
                </select>
              </div>
            </div>

            {/* Special Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Special Requests or Notes (Optional)
              </label>
              <input
                type="text"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g. Vegetarian, early riser for photography, traveling with young child..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-[#0B7A5C] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleBuildTrip}
              className="px-6 py-2.5 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#21C87A]" />
              <span>Generate Actionable Trip ({durationDays} Days)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
