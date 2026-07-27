import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Destination, ItineraryItem } from '../types';
import { MapView } from './MapView';
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
  MapPin
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
  const savedDestinations = destinations.filter(d => savedSpotIds.includes(d.id));

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([
    {
      dayNumber: 1,
      title: 'Day 1: Siem Reap Ancient Temples & Pub Street Night Market',
      activities: [
        {
          id: 'act-1-1',
          time: '05:30 AM',
          title: 'Angkor Wat Sunrise',
          description: 'Experience sunrise reflections over the main temple lotus pond.',
          locationName: 'Angkor Wat, Siem Reap',
          transportTip: 'Book a local PassApp tuk-tuk ($18 full day).'
        },
        {
          id: 'act-1-2',
          time: '11:00 AM',
          title: 'Bayon Temple & Terrace of the Elephants',
          description: 'Explore the 216 giant serene stone faces of King Jayavarman VII.',
          locationName: 'Angkor Thom, Siem Reap',
          transportTip: 'Tuk-tuk short drive inside Angkor Thom complex.'
        },
        {
          id: 'act-1-3',
          time: '06:30 PM',
          title: 'Pub Street Khmer Street Food & Coconut Amok',
          description: 'Taste authentic Lok Lak, Fish Amok, and fresh fruit smoothies.',
          locationName: 'Pub Street, Siem Reap'
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
          title: 'La Plantation Kampot Pepper Farm Tour',
          description: 'Taste world-famous organic Kampot red, white, and green pepper.',
          locationName: 'Kampot Pepper Farm'
        },
        {
          id: 'act-2-2',
          time: '01:00 PM',
          title: 'Kep Crab Market Fresh Seafood',
          description: 'Savor stir-fried blue crab with fresh green pepper corns by the ocean.',
          locationName: 'Kep Crab Market'
        }
      ]
    }
  ]);

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [newActivityTitle, setNewActivityTitle] = useState('');

  const handleAddDay = () => {
    const nextDayNum = itineraryDays.length + 1;
    setItineraryDays([
      ...itineraryDays,
      {
        dayNumber: nextDayNum,
        title: `Day ${nextDayNum}: Exploring Cambodia`,
        activities: []
      }
    ]);
    setActiveDayIndex(itineraryDays.length);
  };

  const handleAddActivity = () => {
    if (!newActivityTitle.trim()) return;
    const updated = [...itineraryDays];
    updated[activeDayIndex].activities.push({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: '02:00 PM',
      title: newActivityTitle.trim(),
      description: 'Custom activity added to itinerary.'
    });
    setItineraryDays(updated);
    setNewActivityTitle('');
  };

  const handleAddDestinationToDay = (dest: Destination) => {
    const updated = [...itineraryDays];
    updated[activeDayIndex].activities.push({
      id: `act-dest-${dest.id}-${Date.now()}`,
      time: '10:00 AM',
      title: dest.title,
      description: dest.description,
      destinationId: dest.id,
      locationName: `${dest.title}, ${dest.province}`,
      transportTip: dest.transportTips
    });
    setItineraryDays(updated);
  };

  const handleRemoveActivity = (dayIdx: number, actIdx: number) => {
    const updated = [...itineraryDays];
    updated[dayIdx].activities.splice(actIdx, 1);
    setItineraryDays(updated);
  };

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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const activities = Array.from(itineraryDays[activeDayIndex].activities);
    const [reorderedItem] = activities.splice(result.source.index, 1);
    activities.splice(result.destination.index, 0, reorderedItem);

    const updated = [...itineraryDays];
    updated[activeDayIndex].activities = activities;
    setItineraryDays(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[#0B7A5C] text-xs font-bold mb-1">
            <Route className="w-4 h-4" />
            <span>Interactive Map & Drag-and-Drop Schedule Reorder</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1E293B] tracking-tight">
            Cambodia Map & Drag-and-Drop Planner
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Drag activities to reorder your daily route, or click map markers to explore destination details.
          </p>
        </div>

        <button
          onClick={onRequestAIPlanner}
          className="px-5 py-3 rounded-2xl bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#21C87A]" />
          <span>Ask AI to Generate Trip Plan</span>
        </button>
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

      {/* Drag & Drop Schedule Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center font-bold shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#1E293B] text-base">Day-by-Day Route Planner</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Drag to Reorder
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Drag cards or use up/down arrows to reorder activities for Day {itineraryDays[activeDayIndex]?.dayNumber}
              </p>
            </div>
          </div>

          <button
            onClick={handleAddDay}
            className="px-3.5 py-2 rounded-xl bg-[#F8FCFA] hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#0B7A5C] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Day</span>
          </button>
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
              Day {day.dayNumber} ({day.activities.length} stops)
            </button>
          ))}
        </div>

        {/* Saved Destinations Quick Add Ribbon */}
        {savedDestinations.length > 0 && (
          <div className="p-3 bg-[#F8FCFA] border border-slate-200 rounded-2xl space-y-2">
            <p className="text-[11px] font-bold text-[#0B7A5C] flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Quick Add Saved Spots to Day {itineraryDays[activeDayIndex]?.dayNumber}:</span>
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {savedDestinations.map(spot => (
                <button
                  key={spot.id}
                  onClick={() => handleAddDestinationToDay(spot)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#DFF7ED] border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#0B7A5C] flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
                >
                  <MapPin className="w-3 h-3 text-[#0B7A5C]" />
                  <span>{spot.title}</span>
                  <Plus className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Drag Drop Context */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`day-${activeDayIndex}`}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-3 min-h-[120px] p-2 rounded-2xl transition-colors ${
                  snapshot.isDraggingOver ? 'bg-[#DFF7ED]/40 border-2 border-dashed border-[#0B7A5C]' : ''
                }`}
              >
                {itineraryDays[activeDayIndex]?.activities.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#F8FCFA] border border-dashed border-slate-300 text-center">
                    <p className="text-xs font-medium text-slate-500">
                      No stops scheduled for Day {itineraryDays[activeDayIndex]?.dayNumber} yet.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Click quick add buttons above or enter an activity below!
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
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DFF7ED] text-[#0B7A5C] border border-[#21C87A]/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{act.time}</span>
                              </span>
                              <span className="text-[11px] font-bold text-slate-400">
                                Stop #{actIdx + 1}
                              </span>
                            </div>

                            <p className="font-bold text-[#1E293B] text-sm leading-snug">
                              {act.title}
                            </p>

                            <p className="text-slate-600 leading-relaxed text-xs">
                              {act.description}
                            </p>

                            {act.transportTip && (
                              <p className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block font-medium mt-1 border border-emerald-100">
                                🚌 {act.transportTip}
                              </p>
                            )}
                          </div>

                          {/* Up / Down & Remove Actions */}
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleMoveActivity(actIdx, 'up')}
                              disabled={actIdx === 0}
                              className="p-1 text-slate-400 hover:text-[#0B7A5C] disabled:opacity-30 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Move up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleMoveActivity(actIdx, 'down')}
                              disabled={actIdx === itineraryDays[activeDayIndex].activities.length - 1}
                              className="p-1 text-slate-400 hover:text-[#0B7A5C] disabled:opacity-30 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Move down"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRemoveActivity(activeDayIndex, actIdx)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-50 transition-colors mt-1 cursor-pointer"
                              title="Delete activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

        {/* Add Custom Activity Input */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder={`Type custom activity for Day ${itineraryDays[activeDayIndex]?.dayNumber}...`}
            value={newActivityTitle}
            onChange={(e) => setNewActivityTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddActivity();
              }
            }}
            className="flex-1 bg-[#F8FCFA] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B7A5C]"
          />
          <button
            onClick={handleAddActivity}
            className="px-5 py-2.5 rounded-xl bg-[#0B7A5C] hover:bg-[#086048] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            Add Stop
          </button>
        </div>
      </div>
    </div>
  );
};
