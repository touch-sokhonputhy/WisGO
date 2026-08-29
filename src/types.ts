export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
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
  province: Province;
  items: ItineraryItem[];
  createdAt?: string;
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
}
