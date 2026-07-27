import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Destination } from '../types';
import { MapPin, Star, Heart, Navigation, Sparkles, Filter, Info, Compass } from 'lucide-react';
import { OpenStreetMapFallback } from './OpenStreetMapFallback';

interface MapViewProps {
  destinations: Destination[];
  savedSpotIds: string[];
  onToggleSaveSpot: (destination: Destination) => void;
  onAskAI: (destination: Destination) => void;
  selectedProvince?: string;
  onSelectProvince?: (province: string) => void;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Center of Cambodia
const CAMBODIA_CENTER = { lat: 12.5657, lng: 104.9910 };
const DEFAULT_ZOOM = 7.5;

function MapPanController({ selectedDestination }: { selectedDestination: Destination | null }) {
  const map = useMap();

  useEffect(() => {
    if (map && selectedDestination) {
      map.panTo({
        lat: selectedDestination.location.lat,
        lng: selectedDestination.location.lng
      });
      map.setZoom(12);
    }
  }, [map, selectedDestination]);

  return null;
}

export const MapView: React.FC<MapViewProps> = ({
  destinations,
  savedSpotIds,
  onToggleSaveSpot,
  onAskAI,
  selectedProvince = 'All',
  onSelectProvince
}) => {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(destinations.map(d => d.category)))];

  const filteredDestinations = destinations.filter(d => {
    const matchesProvince = selectedProvince === 'All' || d.province === selectedProvince;
    const matchesCategory = filterCategory === 'All' || d.category === filterCategory;
    return matchesProvince && matchesCategory;
  });

  if (!hasValidKey) {
    return (
      <OpenStreetMapFallback
        destinations={destinations}
        savedSpotIds={savedSpotIds}
        onToggleSaveSpot={onToggleSaveSpot}
        onAskAI={onAskAI}
        selectedProvince={selectedProvince}
        onSelectProvince={onSelectProvince}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Compass className="w-4 h-4 text-[#0B7A5C]" />
          <span>Interactive Cambodia Map ({filteredDestinations.length} Spots)</span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#0B7A5C] text-white border-[#0B7A5C]'
                  : 'bg-[#F8FCFA] text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        
        {/* Google Map Container */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 overflow-hidden shadow-xs relative h-full">
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={CAMBODIA_CENTER}
              defaultZoom={DEFAULT_ZOOM}
              mapId="WISGO_CAMBODIA_MAP"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              options={{
                gestureHandling: 'greedy',
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true,
              }}
            >
              <MapPanController selectedDestination={selectedDestination} />

              {/* Advanced Markers for filtered destinations */}
              {filteredDestinations.map(dest => {
                const isSelected = selectedDestination?.id === dest.id;
                const isSaved = savedSpotIds.includes(dest.id);

                return (
                  <AdvancedMarker
                    key={dest.id}
                    position={{ lat: dest.location.lat, lng: dest.location.lng }}
                    onClick={() => setSelectedDestination(dest)}
                    title={dest.title}
                  >
                    <Pin
                      background={isSelected ? '#21C87A' : isSaved ? '#E11D48' : '#0B7A5C'}
                      glyphColor="#FFFFFF"
                      borderColor={isSelected ? '#086048' : '#04382A'}
                      scale={isSelected ? 1.25 : 1.0}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* InfoWindow on marker click */}
              {selectedDestination && (
                <InfoWindow
                  position={{
                    lat: selectedDestination.location.lat,
                    lng: selectedDestination.location.lng
                  }}
                  onCloseClick={() => setSelectedDestination(null)}
                >
                  <div className="p-1 max-w-xs text-slate-800 font-sans">
                    <div className="relative rounded-xl overflow-hidden mb-2.5 h-28 bg-slate-100">
                      <img
                        src={selectedDestination.image}
                        alt={selectedDestination.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#0B7A5C]">
                        {selectedDestination.province}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DFF7ED] text-[#0B7A5C]">
                        {selectedDestination.category}
                      </span>
                      <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{selectedDestination.rating}</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#1E293B] leading-tight">
                      {selectedDestination.title}
                    </h4>

                    {selectedDestination.khmerName && (
                      <p className="text-xs font-bold text-[#0B7A5C] mt-0.5">
                        {selectedDestination.khmerName}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-2 my-2 leading-relaxed">
                      {selectedDestination.description}
                    </p>

                    <div className="p-2 rounded-xl bg-[#F8FCFA] border border-slate-200 text-[11px] text-slate-600 space-y-1 my-2">
                      <p className="truncate">🚌 <strong>Transport:</strong> {selectedDestination.transportTips || 'Local Tuk-Tuk / PassApp'}</p>
                      <p>🎟️ <strong>Entry:</strong> {selectedDestination.entryFee || 'Free'}</p>
                    </div>

                    {/* InfoWindow Action Buttons */}
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => onToggleSaveSpot(selectedDestination)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          savedSpotIds.includes(selectedDestination.id)
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Heart className="w-3 h-3 fill-current" />
                        <span>{savedSpotIds.includes(selectedDestination.id) ? 'Saved' : 'Save'}</span>
                      </button>

                      <button
                        onClick={() => onAskAI(selectedDestination)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-[#0B7A5C] hover:bg-[#086048] text-white text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-[#21C87A]" />
                        <span>Ask AI</span>
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        </div>

        {/* Destination List Sidebar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs overflow-y-auto h-full flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Destinations ({filteredDestinations.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Click to focus map</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {filteredDestinations.map(dest => {
              const isSelected = selectedDestination?.id === dest.id;
              const isSaved = savedSpotIds.includes(dest.id);

              return (
                <div
                  key={dest.id}
                  onClick={() => setSelectedDestination(dest)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center ${
                    isSelected
                      ? 'bg-[#DFF7ED]/60 border-[#0B7A5C] shadow-xs'
                      : 'bg-[#F8FCFA] border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={dest.image}
                    alt={dest.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#0B7A5C] truncate">
                        {dest.province}
                      </span>
                      <span className="text-[11px] font-bold text-amber-500">
                        ★ {dest.rating}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#1E293B] truncate mt-0.5">
                      {dest.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {dest.category}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
