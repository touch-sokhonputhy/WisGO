import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Destination, ItineraryItem } from '../types';
import { MapView } from './MapView';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Route,
  GripVertical,
  MoveUp,
  MoveDown,
  PlusCircle,
  MapPin,
  Edit3,
  Check,
  X,
  Search,
  Save,
  Compass,
  Timer,
  ArrowUpDown
} from 'lucide-react';

interface MapAndPlannerProps {
  destinations: Destination[];
  savedSpotIds: string[];
  onToggleSaveSpot: (destination: Destination) => void;
  onAskAI: (destination: Destination) => void;
  onRequestAIPlanner: () => void;
  selectedProvince?: string;
  onSelectProvince?: (province: string) => void;
}

interface ActivityItem extends ItineraryItem {
  id: string;
}

interface ItineraryDay {
  dayNumber: number;
  title: string;
  activities: ActivityItem[];
}

const TIME_OPTIONS = [
  '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM',
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
  '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM'
];

const DURATION_OPTIONS = [
  '30 mins', '45 mins', '1 hour', '1.5 hours', '2 hours', '2.5 hours', '3 hours', '4 hours', 'Half day', 'Full day'
];

const DraggableComponent = Draggable as React.ComponentType<any>;

export const MapAndPlanner: React.FC<MapAndPlannerProps> = ({
  destinations,
  savedSpotIds,
  onToggleSaveSpot,
  onAskAI,
  onRequestAIPlanner,
  selectedProvince = 'All',
  onSelectProvince
}) => {
  const { currentUser } = useAuth();
  const { language, t, tProvince, tCategory } = useLanguage();
  const savedDestinations = destinations.filter(d => savedSpotIds.includes(d.id));

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([
    {
      dayNumber: 1,
      title: 'Day 1: Siem Reap Ancient Temples & Pub Street Night Market',
      activities: [
        {
          id: 'act-1-1',
          time: '05:30 AM',
          duration: '2.5 hours',
          title: 'Angkor Wat Sunrise',
          description: 'Experience sunrise reflections over the main temple lotus pond.',
          locationName: 'Angkor Wat, Siem Reap',
          destinationId: 'angkor-wat',
          transportTip: 'Book a local PassApp tuk-tuk ($18 full day).'
        },
        {
          id: 'act-1-2',
          time: '11:00 AM',
          duration: '2 hours',
          title: 'Bayon Temple & Terrace of the Elephants',
          description: 'Explore the 216 giant serene stone faces of King Jayavarman VII.',
          locationName: 'Bayon Temple, Siem Reap',
          destinationId: 'bayon-temple',
          transportTip: 'Tuk-tuk short drive inside Angkor Thom complex.'
        },
        {
          id: 'act-1-3',
          time: '06:30 PM',
          duration: '3 hours',
          title: 'Pub Street Khmer Street Food & Coconut Amok',
          description: 'Taste authentic Lok Lak, Fish Amok, and fresh fruit smoothies.',
          locationName: 'Pub Street, Siem Reap',
          destinationId: 'pub-street'
        }
      ]
    },
    {
      dayNumber: 2,
      title: 'Day 2: Kampot Pepper Farms & Kep Fresh Crab Market',
      activities: [
        {
          id: 'act-2-1',
          time: '09:00 AM',
          duration: '2 hours',
          title: 'La Plantation Kampot Pepper Farm Tour',
          description: 'Taste world-famous organic Kampot red, white, and green pepper.',
          locationName: 'Kampot Pepper Farm',
          destinationId: 'kampot-pepper'
        },
        {
          id: 'act-2-2',
          time: '01:00 PM',
          duration: '2 hours',
          title: 'Kep Crab Market Fresh Seafood',
          description: 'Savor stir-fried blue crab with fresh green pepper corns by the ocean.',
          locationName: 'Kep Crab Market',
          destinationId: 'kep-crab-market'
        }
      ]
    }
  ]);

  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Modal / Form state for Adding Activity
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDestId, setSelectedDestId] = useState<string>('');
  const [customLocationName, setCustomLocationName] = useState<string>('');
  const [activityTime, setActivityTime] = useState<string>('09:00 AM');
  const [activityDuration, setActivityDuration] = useState<string>('1.5 hours');
  const [activityTitle, setActivityTitle] = useState<string>('');
  const [activityDescription, setActivityDescription] = useState<string>('');
  const [activityTransportTip, setActivityTransportTip] = useState<string>('');
  const [destSearchQuery, setDestSearchQuery] = useState<string>('');

  // Editing existing activity
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState<string>('');
  const [editDuration, setEditDuration] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editLocationName, setEditLocationName] = useState<string>('');

  // Day Title Editing
  const [editingDayTitle, setEditingDayTitle] = useState<boolean>(false);
  const [dayTitleInput, setDayTitleInput] = useState<string>('');

  // Firestore save status
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Handle adding a new day
  const handleAddDay = () => {
    const nextDayNum = itineraryDays.length + 1;
    const defaultTitle = language === 'km'
      ? `ថ្ងៃទី ${nextDayNum}៖ ការរុករកកម្ពុជាដ៏អស្ចារ្យ`
      : `Day ${nextDayNum}: Authentic Khmer Discoveries`;
    setItineraryDays([
      ...itineraryDays,
      {
        dayNumber: nextDayNum,
        title: defaultTitle,
        activities: []
      }
    ]);
    setActiveDayIndex(itineraryDays.length);
  };

  // Handle deleting active day
  const handleDeleteActiveDay = () => {
    if (itineraryDays.length <= 1) return;
    const updated = itineraryDays.filter((_, idx) => idx !== activeDayIndex);
    // Renumber days
    const renumbered = updated.map((d, i) => ({
      ...d,
      dayNumber: i + 1,
      title: d.title.startsWith('Day ') || d.title.startsWith('ថ្ងៃទី ') 
        ? (language === 'km' ? `ថ្ងៃទី ${i + 1}៖ ${d.title.split('៖ ')[1] || 'រុករកកម្ពុជា'}` : `Day ${i + 1}: ${d.title.split(': ')[1] || 'Exploring Cambodia'}`) 
        : d.title
    }));
    setItineraryDays(renumbered);
    setActiveDayIndex(Math.max(0, activeDayIndex - 1));
  };

  // When user selects a destination from the dropdown, auto-fill fields
  const handleSelectDestinationForForm = (destId: string) => {
    setSelectedDestId(destId);
    const found = destinations.find(d => d.id === destId);
    if (found) {
      const destTitle = (language === 'km' && found.khmerTitle) ? found.khmerTitle : found.title;
      const destProvince = tProvince(found.province);
      const destDesc = (language === 'km' && found.khmerDescription) ? found.khmerDescription : found.description;
      const destTips = (language === 'km' && found.khmerTransportTips) ? found.khmerTransportTips : found.transportTips;

      setCustomLocationName(`${destTitle}, ${destProvince}`);
      if (!activityTitle) setActivityTitle(destTitle);
      if (!activityDescription) setActivityDescription(destDesc);
      if (!activityTransportTip && destTips) setActivityTransportTip(destTips);
    }
  };

  // Submit adding activity
  const handleSaveNewActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;

    const matchedDest = destinations.find(d => d.id === selectedDestId);
    const locName = customLocationName.trim() || (matchedDest ? `${matchedDest.title}, ${matchedDest.province}` : '');

    const newAct: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: activityTime,
      duration: activityDuration,
      title: activityTitle.trim(),
      description: activityDescription.trim() || (language === 'km' ? 'សកម្មភាពកម្សាន្តតាមកាលវិភាគ' : 'Custom scheduled stop.'),
      locationName: locName,
      destinationId: selectedDestId || undefined,
      transportTip: activityTransportTip.trim() || undefined
    };

    const updated = [...itineraryDays];
    updated[activeDayIndex].activities.push(newAct);
    setItineraryDays(updated);

    // Reset form
    setShowAddModal(false);
    setSelectedDestId('');
    setCustomLocationName('');
    setActivityTitle('');
    setActivityDescription('');
    setActivityTransportTip('');
    setDestSearchQuery('');
  };

  // Quick Add Saved Spot
  const handleQuickAddDestination = (dest: Destination) => {
    const destTitle = (language === 'km' && dest.khmerTitle) ? dest.khmerTitle : dest.title;
    const destDesc = (language === 'km' && dest.khmerDescription) ? dest.khmerDescription : dest.description;
    const destProvince = tProvince(dest.province);
    const destTips = (language === 'km' && dest.khmerTransportTips) ? dest.khmerTransportTips : dest.transportTips;

    const newAct: ActivityItem = {
      id: `act-quick-${dest.id}-${Date.now()}`,
      time: '10:00 AM',
      duration: '1.5 hours',
      title: destTitle,
      description: destDesc,
      destinationId: dest.id,
      locationName: `${destTitle}, ${destProvince}`,
      transportTip: destTips
    };

    const updated = [...itineraryDays];
    updated[activeDayIndex].activities.push(newAct);
    setItineraryDays(updated);
  };

  // Remove Activity
  const handleRemoveActivity = (dayIdx: number, actIdx: number) => {
    const updated = [...itineraryDays];
    updated[dayIdx].activities.splice(actIdx, 1);
    setItineraryDays(updated);
  };

  // Reorder up/down
  const handleMoveActivity = (fromIdx: number, direction: 'up' | 'down') => {
    const activities = [...itineraryDays[activeDayIndex].activities];
    const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= activities.length) return;

    const [moved] = activities.splice(fromIdx, 1);
    activities.splice(toIdx, 0, moved);

    const updated = [...itineraryDays];
    updated[activeDayIndex].activities = activities;
    setItineraryDays(updated);
  };

  // Drag and drop reorder
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const activities = Array.from(itineraryDays[activeDayIndex].activities);
    const [reorderedItem] = activities.splice(result.source.index, 1);
    activities.splice(result.destination.index, 0, reorderedItem);

    const updated = [...itineraryDays];
    updated[activeDayIndex].activities = activities;
    setItineraryDays(updated);
  };

  // Start editing an activity
  const handleStartEditActivity = (act: ActivityItem) => {
    setEditingActivityId(act.id);
    setEditTime(act.time || '09:00 AM');
    setEditDuration(act.duration || '1 hour');
    setEditTitle(act.title);
    setEditDescription(act.description || '');
    setEditLocationName(act.locationName || '');
  };

  // Save edited activity
  const handleSaveEditedActivity = (actId: string) => {
    const updated = [...itineraryDays];
    const activities = updated[activeDayIndex].activities;
    const idx = activities.findIndex(a => a.id === actId);
    if (idx !== -1) {
      activities[idx] = {
        ...activities[idx],
        time: editTime,
        duration: editDuration,
        title: editTitle.trim(),
        description: editDescription.trim(),
        locationName: editLocationName.trim()
      };
    }
    setItineraryDays(updated);
    setEditingActivityId(null);
  };

  // Sort chronologically
  const handleSortChronologically = () => {
    const updated = [...itineraryDays];
    const activities = [...updated[activeDayIndex].activities];

    // Simple time string to minutes parser
    const parseTimeToMinutes = (timeStr?: string) => {
      if (!timeStr) return 9999;
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 9999;
      let hrs = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      if (period === 'PM' && hrs < 12) hrs += 12;
      if (period === 'AM' && hrs === 12) hrs = 0;
      return hrs * 60 + mins;
    };

    activities.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
    updated[activeDayIndex].activities = activities;
    setItineraryDays(updated);
  };

  // Save whole itinerary to Firestore
  const handleSaveItineraryToFirestore = async () => {
    if (!currentUser) {
      alert(t('planner.sign_in_to_save', 'Please sign in to save your itinerary to Firebase'));
      return;
    }
    setSaveStatus('saving');
    try {
      const docData = {
        userId: currentUser.uid,
        title: itineraryDays[0]?.title || 'Custom Cambodia Itinerary',
        durationDays: itineraryDays.length,
        province: selectedProvince !== 'All' ? selectedProvince : 'Cambodia Nationwide',
        days: itineraryDays,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'itineraries'), docData);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save itinerary to Firestore:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const filteredDestinationsForModal = destinations.filter(d => {
    if (!destSearchQuery.trim()) return true;
    const q = destSearchQuery.toLowerCase();
    const matchKhmerTitle = d.khmerTitle ? d.khmerTitle.toLowerCase().includes(q) : false;
    return d.title.toLowerCase().includes(q) || d.province.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || matchKhmerTitle;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[#0B7A5C] text-xs font-bold mb-1">
            <Route className="w-4 h-4" />
            <span>{t('planner.title', 'Cambodia Trip Itinerary Planner')}</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1E293B] tracking-tight">
            {language === 'km' ? 'ផែនទីកម្ពុជា & កម្មវិធីរៀបចំគម្រោងធ្វើដំណើរ' : 'Cambodia Map & Custom Timeline Planner'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {t('planner.subtitle', 'Customize activity start times, durations, and locations. Drag cards to reorder or pick directly from destination database.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveItineraryToFirestore}
            className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              saveStatus === 'saved'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Save className="w-4 h-4 text-[#0B7A5C]" />
            <span>
              {saveStatus === 'saving'
                ? t('pref.saving', 'Saving...')
                : saveStatus === 'saved'
                ? t('planner.save_success', 'Saved to Cloud!')
                : t('planner.save_itinerary', 'Save Itinerary')}
            </span>
          </button>

          <button
            onClick={onRequestAIPlanner}
            className="px-5 py-3 rounded-2xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#21C87A]" />
            <span>{t('planner.ai_generate', 'AI Itinerary Generator')}</span>
          </button>
        </div>
      </div>

      {/* Google Maps Component */}
      <MapView
        destinations={destinations}
        savedSpotIds={savedSpotIds}
        onToggleSaveSpot={onToggleSaveSpot}
        onAskAI={onAskAI}
        selectedProvince={selectedProvince}
        onSelectProvince={onSelectProvince}
      />

      {/* Dynamic Schedule & Timeline Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center font-bold shadow-xs shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              {editingDayTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={dayTitleInput}
                    onChange={(e) => setDayTitleInput(e.target.value)}
                    className="border border-[#0B7A5C] rounded-lg px-2 py-1 text-sm font-bold text-[#1E293B] focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const updated = [...itineraryDays];
                      updated[activeDayIndex].title = dayTitleInput;
                      setItineraryDays(updated);
                      setEditingDayTitle(false);
                    }}
                    className="p-1 rounded bg-[#0B7A5C] text-white cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#1E293B] text-base truncate">
                    {itineraryDays[activeDayIndex]?.title}
                  </h3>
                  <button
                    onClick={() => {
                      setDayTitleInput(itineraryDays[activeDayIndex]?.title || '');
                      setEditingDayTitle(true);
                    }}
                    className="p-1 text-slate-400 hover:text-[#0B7A5C] cursor-pointer"
                    title={language === 'km' ? 'កែឈ្មោះថ្ងៃ' : 'Rename Day'}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-500">
                {language === 'km'
                  ? `${itineraryDays[activeDayIndex]?.activities.length} សកម្មភាពសម្រាប់ថ្ងៃទី ${itineraryDays[activeDayIndex]?.dayNumber}`
                  : `${itineraryDays[activeDayIndex]?.activities.length} scheduled stops for Day ${itineraryDays[activeDayIndex]?.dayNumber}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSortChronologically}
              className="px-3 py-2 rounded-xl bg-[#F8FCFA] hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title={language === 'km' ? 'រៀបតាមលំដាប់ពេលវេលា' : 'Sort stops by time chronologically'}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#0B7A5C]" />
              <span>{language === 'km' ? 'រៀបតាមម៉ោង' : 'Sort by Time'}</span>
            </button>

            {itineraryDays.length > 1 && (
              <button
                onClick={handleDeleteActiveDay}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                title={language === 'km' ? 'លុបថ្ងៃនេះ' : 'Delete Day'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleAddDay}
              className="px-3.5 py-2 rounded-xl bg-[#F8FCFA] hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#0B7A5C] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('planner.add_day', '+ Add Day')}</span>
            </button>
          </div>
        </div>

        {/* Day Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {itineraryDays.map((day, idx) => (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDayIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                activeDayIndex === idx
                  ? 'bg-[#0B7A5C] text-white border-[#0B7A5C] shadow-xs'
                  : 'bg-[#F8FCFA] text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {language === 'km'
                ? `ថ្ងៃទី ${day.dayNumber} (${day.activities.length} ទីតាំង)`
                : `Day ${day.dayNumber} (${day.activities.length} stops)`}
            </button>
          ))}
        </div>

        {/* Saved Destinations Quick Add Ribbon */}
        {savedDestinations.length > 0 && (
          <div className="p-3 bg-[#F8FCFA] border border-slate-200 rounded-2xl space-y-2">
            <p className="text-[11px] font-bold text-[#0B7A5C] flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>
                {language === 'km'
                  ? `បន្ថែមទីតាំងដែលបានរក្សាទុកទៅថ្ងៃទី ${itineraryDays[activeDayIndex]?.dayNumber}៖`
                  : `Quick Add Saved Spots to Day ${itineraryDays[activeDayIndex]?.dayNumber}:`}
              </span>
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {savedDestinations.map(spot => {
                const spotTitle = (language === 'km' && spot.khmerTitle) ? spot.khmerTitle : spot.title;
                return (
                  <button
                    key={spot.id}
                    onClick={() => handleQuickAddDestination(spot)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#DFF7ED] border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#0B7A5C] flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-3 h-3 text-[#0B7A5C]" />
                    <span>{spotTitle}</span>
                    <Plus className="w-3 h-3 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action button to open Add Time Slot Modal */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-[#0B7A5C]" />
            <span>{language === 'km' ? 'សកម្មភាពតាមកាលវិភាគ & ទីតាំងជាក់លាក់' : 'Timeline Activities & Specific Locations'}</span>
          </p>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('planner.add_activity', 'Add Activity')}</span>
          </button>
        </div>

        {/* Drag Drop Context */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`day-${activeDayIndex}`}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-3 min-h-[140px] p-2 rounded-2xl transition-colors ${
                  snapshot.isDraggingOver ? 'bg-[#DFF7ED]/40 border-2 border-dashed border-[#0B7A5C]' : ''
                }`}
              >
                {itineraryDays[activeDayIndex]?.activities.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#F8FCFA] border border-dashed border-slate-300 text-center">
                    <p className="text-xs font-bold text-slate-600">
                      {t('planner.no_activities', `No scheduled stops for this day yet.`)}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      {t('planner.drag_hint', 'Click "Add Activity" above to set specific start times, durations, and destinations!')}
                    </p>
                  </div>
                ) : (
                  itineraryDays[activeDayIndex]?.activities.map((act, actIdx) => (
                    <DraggableComponent key={act.id} draggableId={act.id} index={actIdx}>
                      {(provided: any, snapshot: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 rounded-2xl border transition-all flex items-start gap-3 text-xs bg-white ${
                            snapshot.isDragging
                              ? 'shadow-xl ring-2 ring-[#0B7A5C] border-[#0B7A5C] z-50 bg-[#F0FAF5]'
                              : 'border-slate-200 hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="p-1.5 text-slate-400 hover:text-[#0B7A5C] cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-100 transition-colors shrink-0 mt-0.5"
                            title={language === 'km' ? 'ទាញដើម្បីតម្រៀបលំដាប់' : 'Drag to reorder timeline'}
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Content or Inline Editor */}
                          <div className="flex-1 space-y-1.5 min-w-0">
                            {editingActivityId === act.id ? (
                              /* Inline Editing Mode */
                              <div className="space-y-2 bg-[#F8FCFA] p-3 rounded-xl border border-slate-200">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{t('planner.time', 'Start Time')}</label>
                                    <select
                                      value={editTime}
                                      onChange={(e) => setEditTime(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800"
                                    >
                                      {TIME_OPTIONS.map(timeOption => (
                                        <option key={timeOption} value={timeOption}>{timeOption}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{t('planner.duration', 'Duration')}</label>
                                    <select
                                      value={editDuration}
                                      onChange={(e) => setEditDuration(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800"
                                    >
                                      {DURATION_OPTIONS.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{t('planner.activity_title', 'Activity Title')}</label>
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{t('planner.location', 'Location Name')}</label>
                                  <input
                                    type="text"
                                    value={editLocationName}
                                    onChange={(e) => setEditLocationName(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{t('planner.description', 'Description / Notes')}</label>
                                  <textarea
                                    rows={2}
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 resize-none"
                                  />
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => handleSaveEditedActivity(act.id)}
                                    className="px-3 py-1 rounded-lg bg-[#0B7A5C] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{language === 'km' ? 'រក្សាទុក' : 'Save'}</span>
                                  </button>
                                  <button
                                    onClick={() => setEditingActivityId(null)}
                                    className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                                  >
                                    {t('planner.cancel', 'Cancel')}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Standard View Card */
                              <>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DFF7ED] text-[#0B7A5C] border border-[#21C87A]/30 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{act.time || '09:00 AM'}</span>
                                  </span>

                                  {act.duration && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                                      <Timer className="w-3 h-3 text-slate-400" />
                                      <span>{act.duration}</span>
                                    </span>
                                  )}

                                  {act.locationName && (
                                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-[#0B7A5C]" />
                                      <span className="truncate">{act.locationName}</span>
                                    </span>
                                  )}
                                </div>

                                <h4 className="font-bold text-[#1E293B] text-sm">{act.title}</h4>
                                <p className="text-slate-600 leading-relaxed text-xs">{act.description}</p>

                                {act.transportTip && (
                                  <p className="text-[11px] font-medium text-emerald-700 bg-emerald-50/80 p-2 rounded-xl border border-emerald-100 flex items-start gap-1.5">
                                    <Compass className="w-3.5 h-3.5 text-[#0B7A5C] shrink-0 mt-0.5" />
                                    <span>{act.transportTip}</span>
                                  </p>
                                )}
                              </>
                            )}
                          </div>

                          {/* Action Buttons Column */}
                          {editingActivityId !== act.id && (
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleStartEditActivity(act)}
                                className="p-1 text-slate-400 hover:text-[#0B7A5C] rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                title={language === 'km' ? 'កែសម្រួល' : 'Edit activity'}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleMoveActivity(actIdx, 'up')}
                                disabled={actIdx === 0}
                                className="p-1 text-slate-400 hover:text-[#0B7A5C] disabled:opacity-30 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                title={language === 'km' ? 'ផ្លាស់ទីឡើងលើ' : 'Move up'}
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleMoveActivity(actIdx, 'down')}
                                disabled={actIdx === itineraryDays[activeDayIndex].activities.length - 1}
                                className="p-1 text-slate-400 hover:text-[#0B7A5C] disabled:opacity-30 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                title={language === 'km' ? 'ផ្លាស់ទីចុះក្រោម' : 'Move down'}
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleRemoveActivity(activeDayIndex, actIdx)}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-50 transition-colors mt-1 cursor-pointer"
                                title={t('planner.delete_activity', 'Remove activity')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </DraggableComponent>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Modal / Dialog for Adding Custom Time Slot & Selecting Location */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 text-slate-800 shadow-2xl relative overflow-hidden space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#0B7A5C] font-bold text-sm">
                <Compass className="w-5 h-5" />
                <span>{language === 'km' ? 'បន្ថែមពេលវេលា & ជ្រើសរើសទីតាំង' : 'Add Time Slot & Select Location'}</span>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewActivity} className="space-y-4">
              {/* Time & Duration row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('planner.time', 'Start Time')}</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={activityTime}
                      onChange={(e) => setActivityTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#0B7A5C] outline-none"
                    >
                      {TIME_OPTIONS.map(timeOption => (
                        <option key={timeOption} value={timeOption}>{timeOption}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('planner.duration', 'Duration')}</label>
                  <div className="relative">
                    <Timer className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={activityDuration}
                      onChange={(e) => setActivityDuration(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#0B7A5C] outline-none"
                    >
                      {DURATION_OPTIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Destination Searchable Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'km' ? 'ជ្រើសរើសទីតាំងទេសចរណ៍នៅកម្ពុជា (ជាជម្រើស)' : 'Select Cambodia Destination (Optional)'}
                </label>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder={language === 'km' ? 'ស្វែងរកទីតាំងតាមឈ្មោះ ឬខេត្ត...' : 'Filter destination database by name or province...'}
                      value={destSearchQuery}
                      onChange={(e) => setDestSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={selectedDestId}
                      onChange={(e) => handleSelectDestinationForForm(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#0B7A5C] outline-none"
                    >
                      <option value="">{language === 'km' ? '-- ជ្រើសរើសទីតាំងកម្សាន្តនៅកម្ពុជា --' : '-- Choose from Cambodia Destinations --'}</option>
                      {filteredDestinationsForModal.map(d => {
                        const spotTitle = (language === 'km' && d.khmerTitle) ? d.khmerTitle : d.title;
                        const spotProvince = tProvince(d.province);
                        const spotCategory = tCategory(d.category);
                        return (
                          <option key={d.id} value={d.id}>
                            📍 {spotTitle} ({spotProvince}) - {spotCategory}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Custom Location Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'km' ? 'ឈ្មោះទីតាំងជាក់លាក់' : 'Custom Location Name'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder={language === 'km' ? 'ឧ. មាត់ទន្លេ, ផ្សាររាត្រី ឬឡប់ប៊ីសណ្ឋាគារ' : 'e.g. Pub Street Alley 2, Siem Reap or Hotel Lobby'}
                    value={customLocationName}
                    onChange={(e) => setCustomLocationName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B7A5C] outline-none"
                  />
                </div>
              </div>

              {/* Activity Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('planner.activity_title', 'Activity Title')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'km' ? 'ឧ. មើលថ្ងៃរះ & ថតរូបនៅប្រាសាទអង្គរវត្ត' : 'e.g. Sunrise Photos & Temple Exploration'}
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#0B7A5C] outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('planner.description', 'Description / Notes')}
                </label>
                <textarea
                  rows={3}
                  placeholder={language === 'km' ? 'ឧ. ណាត់ជួបតៃកុង PassApp ម៉ោង ៥ ព្រឹក។ ត្រូវយកសំបុត្រចូលទស្សនាប្រាសាទមកជាមួយ។' : 'e.g. Meet tuk-tuk driver at 5:00 AM. Bring temple entrance pass.'}
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0B7A5C] outline-none resize-none"
                />
              </div>

              {/* Transport Tip */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('planner.transport_tip', 'Transport Tip (Optional)')}
                </label>
                <input
                  type="text"
                  placeholder={language === 'km' ? 'ឧ. ជិះ PassApp កង់បី ~$5 ឬជិះកង់ ១០ នាទី' : 'e.g. PassApp tuk-tuk ~$5 or 10 min bicycle ride'}
                  value={activityTransportTip}
                  onChange={(e) => setActivityTransportTip(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0B7A5C] outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  {t('planner.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {language === 'km'
                      ? `បន្ថែមសកម្មភាពទៅថ្ងៃទី ${itineraryDays[activeDayIndex]?.dayNumber}`
                      : `Add Activity to Day ${itineraryDays[activeDayIndex]?.dayNumber}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
