export interface SubscriptionInfo {
  plan: 'free' | 'trip-pass' | 'wisgo-plus';
  status: 'active' | 'expired' | 'canceled';
  startDate: string;
  expiryDate?: string;
  transactionId?: string;
  autoRenew?: boolean;
  amountPaid?: number;
  currency?: string;
}

export interface TransactionRecord {
  id: string;
  type: 'top_up' | 'subscription_purchase';
  amount: number;
  currency: 'USD' | 'KHR';
  planName?: string;
  paymentMethod: 'bakong_khqr' | 'credit_card' | 'wallet_balance' | 'aba_pay';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  referenceId: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  walletBalance?: number;
  subscription?: SubscriptionInfo;
  transactions?: TransactionRecord[];
  preferences?: {
    preferredLanguage: string;
    preferredCurrency: string;
    interests: string[];
    dietaryRestrictions: string[];
  };
}

export type Province = 
  | 'Siem Reap'
  | 'Phnom Penh'
  | 'Kampot'
  | 'Kep'
  | 'Battambang'
  | 'Koh Rong & Sihanoukville'
  | 'Mondulkiri'
  | 'Preah Vihear'
  | 'Kratie'
  | 'Koh Kong'
  | 'Ratanakiri'
  | 'Pursat'
  | 'Kandal';

export type Category = 
  | 'Temple & Heritage'
  | 'Street Food & Dining'
  | 'Nature & Adventure'
  | 'Nature & Culture'
  | 'Local Market & Craft'
  | 'Beach & Island'
  | 'Hotel & Eco-Lodge'
  | 'Youth Experience';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  province?: Province;
}

export interface Destination {
  id: string;
  title: string;
  province: Province;
  category: Category;
  rating: number;
  reviewCount?: number;
  location: Location;
  image: string;
  description: string;
  tags?: string[];
  transportTips?: string;
  khmerName?: string;
  khmerTitle?: string;
  khmerDescription?: string;
  khmerEntryFee?: string;
  khmerTransportTips?: string;
  entryFee?: string;
}

export interface TripActivity {
  id: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  time: string; // e.g. "5:00 AM – 8:00 AM"
  title: string; // e.g. "Angkor Wat Sunrise"
  description: string; // e.g. "Watch the sunrise over the ancient temple..."
  location: string; // e.g. "Angkor Wat Main Complex, Siem Reap"
  estimatedDuration: string; // e.g. "3 hours"
  estimatedCost: string; // e.g. "$37 (Angkor Pass) or Free with pass"
  transportTip: string; // e.g. "PassApp Tuk-Tuk (~$4-6) or hired day driver"
  openingHours?: string; // e.g. "5:00 AM – 5:30 PM"
  practicalNotes?: string; // e.g. "Dress modestly (cover shoulders & knees)"
  isCustomAdded?: boolean;
}

export interface TripDay {
  dayNumber: number;
  date?: string; // e.g. "2026-09-10"
  theme?: string; // e.g. "Angkor Sunrise & Ancient Splendor"
  activities: TripActivity[];
}

export interface TripCostBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  currency?: string;
}

export interface TripPlan {
  id: string;
  userId?: string;
  title: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  durationDays: number;
  travelersCount: number;
  budgetTier: 'budget' | 'moderate' | 'luxury';
  interests?: string[];
  totalEstimatedCost?: string;
  costBreakdown?: TripCostBreakdown;
  days: TripDay[];
  summaryNote?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TripPlannerInput {
  destination: string;
  durationDays: number;
  startDate: string;
  travelersCount: number;
  budgetTier: 'budget' | 'moderate' | 'luxury';
  interests: string[];
  transportPreference: 'passapp' | 'private_driver' | 'budget_bus' | 'any';
  pace: 'relaxed' | 'moderate' | 'action_packed';
  specialNotes?: string;
}

export interface ItineraryItem {
  time?: string;
  duration?: string;
  title: string;
  description: string;
  destinationId?: string;
  locationName?: string;
  transportTip?: string;
}

export interface Itinerary {
  id: string;
  userId: string;
  title: string;
  durationDays: number;
  province?: Province | string;
  destination?: string;
  startDate?: string;
  budgetTier?: string;
  travelersCount?: number;
  totalCost?: string;
  days?: TripDay[];
  items?: ItineraryItem[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Favorite {
  id: string;
  userId: string;
  destinationId: string;
  createdAt?: string;
}

export interface Review {
  id: string;
  destinationId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  tripPlan?: TripPlan;
}
