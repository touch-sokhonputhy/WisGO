import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { TripPlan } from '../types';

const LOCAL_STORAGE_KEY = 'wisgo_saved_trips';

// Default starter trips for Cambodia so the dashboard is immediately rich & instructive
export const DEFAULT_DEMO_TRIPS: TripPlan[] = [
  {
    id: 'demo-siem-reap-3d',
    title: '3 Days in Siem Reap: Ancient Angkor & Youth Hidden Gems',
    destination: 'Siem Reap',
    startDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    durationDays: 3,
    travelersCount: 2,
    budgetTier: 'moderate',
    interests: ['Temples & Culture', 'Local Street Food', 'Photography'],
    totalEstimatedCost: '$95 – $140 per person (Estimated)',
    costBreakdown: {
      accommodation: 84,
      food: 72,
      transport: 36,
      activities: 68
    },
    days: [
      {
        dayNumber: 1,
        theme: 'Angkor Wat Sunrise & Enigmatic Smiles',
        activities: [
          {
            id: 'act-sr-1',
            timeSlot: 'morning',
            time: '5:00 AM – 8:30 AM',
            title: 'Angkor Wat Sunrise Reflection',
            description: 'Witness the iconic dawn reflection over the sacred northern lotus ponds before exploring the central bas-reliefs.',
            location: 'Angkor Wat Main Complex, Siem Reap',
            estimatedDuration: '3.5 hours',
            estimatedCost: '$37 Angkor 1-day pass (Estimated)',
            transportTip: 'Hired Tuk-Tuk from city center (~$4-5 via PassApp or $20 full day)',
            openingHours: '5:00 AM – 5:30 PM',
            practicalNotes: 'Dress code: Knees & shoulders strictly covered. Bring a small pocket flashlight.'
          },
          {
            id: 'act-sr-2',
            timeSlot: 'afternoon',
            time: '1:30 PM – 4:00 PM',
            title: 'Bayon Temple & Terrace of the Elephants',
            description: 'Stand amid 216 giant smiling stone faces of Avalokiteshvara in Angkor Thom ancient walled city.',
            location: 'Angkor Thom, Siem Reap',
            estimatedDuration: '2.5 hours',
            estimatedCost: 'Included in Angkor Pass',
            transportTip: '5 min tuk-tuk ride from Angkor Wat north gate',
            openingHours: '7:30 AM – 5:30 PM',
            practicalNotes: 'Mid-afternoon has dramatic light through the face corridors.'
          },
          {
            id: 'act-sr-3',
            timeSlot: 'evening',
            time: '6:30 PM – 9:00 PM',
            title: 'Phare Cambodian Circus & Pub Street Khmer Noodle Alley',
            description: 'Experience high-energy acrobatic storytelling by talented Khmer youth artists, followed by local Fish Amok.',
            location: 'Phare Circus Ring, Kommai Road, Siem Reap',
            estimatedDuration: '2.5 hours',
            estimatedCost: '$18 ticket + ~$6 street dinner (Estimated)',
            transportTip: 'PassApp Remorque (~$1.50 - $2.50 from old market)',
            openingHours: 'Circus show starts promptly at 8:00 PM',
            practicalNotes: 'Arrive 45 minutes early for live youth band performance.'
          }
        ]
      },
      {
        dayNumber: 2,
        theme: 'Tomb Raider Roots & Pink Sandstone Jewels',
        activities: [
          {
            id: 'act-sr-4',
            timeSlot: 'morning',
            time: '7:30 AM – 10:00 AM',
            title: 'Ta Prohm Temple (Tomb Raider Temple)',
            description: 'Marvel at gigantic strangler fig and silk-cotton tree roots embracing ancient centuries-old stone galleries.',
            location: 'Ta Prohm, East Angkor',
            estimatedDuration: '2.5 hours',
            estimatedCost: 'Included in Angkor Pass',
            transportTip: '15 min tuk-tuk ride east from Angkor Thom',
            openingHours: '7:30 AM – 5:30 PM',
            practicalNotes: 'Arrive right at 7:30 AM before tour groups to hear forest birds.'
          },
          {
            id: 'act-sr-5',
            timeSlot: 'afternoon',
            time: '1:30 PM – 4:30 PM',
            title: 'Banteay Srei (Citadel of Women)',
            description: 'Visit the 10th-century temple carved from fine rose-pink sandstone with the most intricate filigree carvings in Asia.',
            location: '32 km north of Siem Reap town',
            estimatedDuration: '3 hours including travel',
            estimatedCost: 'Included in Angkor Pass',
            transportTip: 'Tuk-Tuk roundtrip (~$15 - $18) or air-conditioned car',
            openingHours: '7:30 AM – 5:00 PM',
            practicalNotes: 'Scenic country road past sugar palm plantations and village stalls.'
          }
        ]
      },
      {
        dayNumber: 3,
        theme: 'Floating Village of Tonle Sap & Old Market Bargains',
        activities: [
          {
            id: 'act-sr-6',
            timeSlot: 'morning',
            time: '8:30 AM – 12:00 PM',
            title: 'Kompong Phluk Stilt Village & Mangrove Canoe',
            description: 'Explore wooden stilt homes soaring 8 meters high and glide through submerged mangrove forests on small wooden canoes.',
            location: 'Kompong Phluk, Tonle Sap Lake',
            estimatedDuration: '3.5 hours',
            estimatedCost: '$20 community boat ticket + $5 canoe (Estimated)',
            transportTip: '40 min tuk-tuk (~$12 return) or shared minivan',
            openingHours: '8:00 AM – 5:00 PM',
            practicalNotes: 'Proceeds directly fund local village school and river guides.'
          }
        ]
      }
    ],
    summaryNote: 'Includes essential sunrise timing, PassApp fare estimates, and dress codes.',
    isPublic: true,
    createdAt: new Date().toISOString()
  }
];

export function getLocalSavedTrips(): TripPlan[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      // Seed with demo trip
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_TRIPS));
      return DEFAULT_DEMO_TRIPS;
    }
    const trips = JSON.parse(raw);
    return Array.isArray(trips) && trips.length > 0 ? trips : DEFAULT_DEMO_TRIPS;
  } catch {
    return DEFAULT_DEMO_TRIPS;
  }
}

export function saveLocalTrip(trip: TripPlan): void {
  try {
    const trips = getLocalSavedTrips();
    const existingIdx = trips.findIndex(t => t.id === trip.id);
    let updated: TripPlan[];
    if (existingIdx >= 0) {
      updated = [...trips];
      updated[existingIdx] = { ...trip, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...trip, createdAt: trip.createdAt || new Date().toISOString() }, ...trips];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving local trip:', err);
  }
}

export function deleteLocalTrip(tripId: string): void {
  try {
    const trips = getLocalSavedTrips();
    const filtered = trips.filter(t => t.id !== tripId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error deleting local trip:', err);
  }
}

/**
 * Saves or updates a trip in Firestore (if user signed in) AND in LocalStorage.
 */
export async function persistTrip(trip: TripPlan, userId?: string): Promise<TripPlan> {
  const finalTrip: TripPlan = {
    ...trip,
    userId: userId || trip.userId || auth.currentUser?.uid,
    updatedAt: new Date().toISOString()
  };

  // 1. Always save to LocalStorage immediately
  saveLocalTrip(finalTrip);

  // 2. If authenticated, persist to Firestore 'itineraries'
  const activeUid = finalTrip.userId || auth.currentUser?.uid;
  if (activeUid) {
    try {
      const tripDocRef = doc(db, 'itineraries', finalTrip.id);
      await setDoc(tripDocRef, {
        id: finalTrip.id,
        userId: activeUid,
        title: finalTrip.title,
        destination: finalTrip.destination,
        startDate: finalTrip.startDate || '',
        durationDays: finalTrip.durationDays,
        travelersCount: finalTrip.travelersCount || 1,
        budgetTier: finalTrip.budgetTier || 'moderate',
        totalCost: finalTrip.totalEstimatedCost || '',
        days: finalTrip.days,
        isPublic: finalTrip.isPublic ?? true,
        summaryNote: finalTrip.summaryNote || '',
        createdAt: finalTrip.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (firestoreErr) {
      console.warn('Firestore trip sync failed (saved locally):', firestoreErr);
    }
  }

  return finalTrip;
}

/**
 * Loads all saved trips, merging Firestore remote trips with local cache.
 */
export async function loadSavedTrips(userId?: string): Promise<TripPlan[]> {
  const localTrips = getLocalSavedTrips();
  const activeUid = userId || auth.currentUser?.uid;

  if (!activeUid) {
    return localTrips;
  }

  try {
    const q = query(collection(db, 'itineraries'), where('userId', '==', activeUid));
    const snapshot = await getDocs(q);
    const remoteTrips: TripPlan[] = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data && data.title) {
        remoteTrips.push({
          id: data.id || docSnap.id,
          userId: data.userId,
          title: data.title,
          destination: data.destination || data.province || 'Cambodia',
          startDate: data.startDate,
          durationDays: data.durationDays || (data.days ? data.days.length : 3),
          travelersCount: data.travelersCount || 2,
          budgetTier: data.budgetTier || 'moderate',
          totalEstimatedCost: data.totalCost || data.totalEstimatedCost,
          days: data.days || [],
          summaryNote: data.summaryNote,
          isPublic: data.isPublic ?? true,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt
        });
      }
    });

    if (remoteTrips.length > 0) {
      // Merge unique trips
      const map = new Map<string, TripPlan>();
      localTrips.forEach(t => map.set(t.id, t));
      remoteTrips.forEach(t => map.set(t.id, t));
      const merged = Array.from(map.values()).sort((a, b) => 
        new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Could not fetch remote Firestore trips, using local cache:', err);
  }

  return localTrips;
}

/**
 * Removes a trip from both Firestore and LocalStorage.
 */
export async function removeSavedTrip(tripId: string, userId?: string): Promise<void> {
  deleteLocalTrip(tripId);
  const activeUid = userId || auth.currentUser?.uid;
  if (activeUid) {
    try {
      await deleteDoc(doc(db, 'itineraries', tripId));
    } catch (err) {
      console.warn('Error deleting trip from Firestore:', err);
    }
  }
}
