import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Destination } from '../types';
import { getDirectImageUrl, getDriveThumbnailUrl, FALLBACK_BACKUP_IMAGE } from '../lib/imageUtils';
import { Compass, Filter, Heart, Sparkles, Navigation, Layers, Info, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface OpenStreetMapFallbackProps {
  destinations: Destination[];
  savedSpotIds: string[];
  onToggleSaveSpot: (destination: Destination) => void;
  onAskAI: (destination: Destination) => void;
  selectedProvince?: string;
  onSelectProvince?: (province: string) => void;
  onShowKeyModal?: () => void;
}

const CAMBODIA_CENTER: [number, number] = [12.5657, 104.9910];
const DEFAULT_ZOOM = 7.5;

export const OpenStreetMapFallback: React.FC<OpenStreetMapFallbackProps> = ({
  destinations,
  savedSpotIds,
  onToggleSaveSpot,
  onAskAI,
  selectedProvince = 'All',
  onSelectProvince
}) => {
  const { language, tProvince, tCategory } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'topo'>('streets');
  const [showConfigNotice, setShowConfigNotice] = useState<boolean>(false);

  const rawCategories = ['All', ...Array.from(new Set(destinations.map(d => d.category)))];

  const filteredDestinations = destinations.filter(d => {
    const matchesProvince = selectedProvince === 'All' || d.province === selectedProvince;
    const matchesCategory = filterCategory === 'All' || d.category === filterCategory;
    return matchesProvince && matchesCategory;
  });

  // Tile layer URLs
  const TILE_URLS = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  const ATTRIBUTIONS = {
    streets: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    topo: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: CAMBODIA_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      const tileLayer = L.tileLayer(TILE_URLS.streets, {
        attribution: ATTRIBUTIONS.streets,
        maxZoom: 18,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when style changes
  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const newTileLayer = L.tileLayer(TILE_URLS[mapStyle], {
        attribution: ATTRIBUTIONS[mapStyle],
        maxZoom: mapStyle === 'topo' ? 17 : 18,
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newTileLayer;
    }
  }, [mapStyle]);

  // Update Markers when destinations or filters change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    filteredDestinations.forEach(dest => {
      const isSaved = savedSpotIds.includes(dest.id);
      const pinColor = isSaved ? '#E11D48' : '#0B7A5C';
      const destTitle = (language === 'km' && dest.khmerTitle) ? dest.khmerTitle : dest.title;

      // Custom SVG Pin Icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${pinColor};
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      });

      const marker = L.marker([dest.location.lat, dest.location.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedDestination(dest);
        mapInstanceRef.current?.panTo([dest.location.lat, dest.location.lng]);
      });

      marker.bindTooltip(destTitle, {
        permanent: false,
        direction: 'top',
        className: 'font-sans text-xs font-semibold px-2 py-1 bg-white text-slate-800 rounded-lg shadow-md border border-slate-200'
      });

      marker.addTo(mapInstanceRef.current!);
      markersRef.current[dest.id] = marker;
    });
  }, [filteredDestinations, savedSpotIds, language]);

  // Center on selected spot
  const handleSelectSpot = (dest: Destination) => {
    setSelectedDestination(dest);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([dest.location.lat, dest.location.lng], 12, { duration: 1.2 });
    }
  };

  const handleResetView = () => {
    setSelectedDestination(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(CAMBODIA_CENTER, DEFAULT_ZOOM, { duration: 1.0 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#1E293B] flex items-center gap-2">
                <span>
                  {language === 'km'
                    ? `ផែនទីអន្តរកម្មកម្ពុជា (${filteredDestinations.length} ទីតាំង)`
                    : `Interactive Cambodia Map (${filteredDestinations.length} Spots)`}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'km'
                  ? 'ចុចលើទីតាំងដើម្បីមើលព័ត៌មានលម្អិត និងបន្ថែមទៅក្នុងគម្រោង'
                  : 'Click markers to explore destinations & calculate itineraries'}
              </p>
            </div>
          </div>

          {/* Map Layer Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#F8FCFA] p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-[#0B7A5C] mx-1.5" />
              <button
                onClick={() => setMapStyle('streets')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  mapStyle === 'streets' ? 'bg-[#0B7A5C] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'km' ? 'ធម្មតា' : 'Street'}
              </button>
              <button
                onClick={() => setMapStyle('satellite')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  mapStyle === 'satellite' ? 'bg-[#0B7A5C] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'km' ? 'ផ្កាយរណប' : 'Satellite'}
              </button>
              <button
                onClick={() => setMapStyle('topo')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  mapStyle === 'topo' ? 'bg-[#0B7A5C] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'km' ? 'ភូមិសាស្ត្រ' : 'Terrain'}
              </button>
            </div>

            <button
              onClick={handleResetView}
              className="px-3 py-1.5 bg-[#F8FCFA] hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              {language === 'km' ? 'កំណត់ផែនទីឡើងវិញ' : 'Reset Map'}
            </button>

            <button
              onClick={() => setShowConfigNotice(!showConfigNotice)}
              className="px-3 py-1.5 bg-[#DFF7ED] hover:bg-[#c9f0df] text-[#0B7A5C] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ព័ត៌មានផែនទី' : 'Google Maps Info'}</span>
            </button>
          </div>
        </div>

        {/* Optional Google Maps API key info collapsible notice */}
        {showConfigNotice && (
          <div className="bg-[#F8FCFA] border border-emerald-200 rounded-xl p-3 text-xs text-slate-700 space-y-1.5 animate-in fade-in duration-200">
            <p className="font-bold text-[#0B7A5C] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'km' ? 'ដំណើរការផែនទី Google Maps (ជាជម្រើស)' : 'Using Google Maps Platform (Optional)'}</span>
            </p>
            <p className="text-slate-600">
              {language === 'km'
                ? 'WisGO ដំណើរការយ៉ាងពេញលេញជាមួយ OpenStreetMap ដោយផ្ទាល់! ប្រសិនបើអ្នកចង់ប្រើផ្កាយរណប Google Maps ផ្លូវការ៖'
                : 'WisGO works 100% interactively right now with OpenStreetMap! If you wish to switch to official Google Maps Platform vector satellite rendering:'}
            </p>
            <ol className="list-decimal list-inside text-slate-600 space-y-1 pl-1">
              <li>{language === 'km' ? 'បើក Settings (⚙️ រូបកង់ធ្មេញនៅខាងស្តាំលើ AI Studio)' : 'Open Settings (⚙️ gear icon in top right corner of AI Studio).'}</li>
              <li>{language === 'km' ? 'ជ្រើសរើស Secrets' : 'Select Secrets.'}</li>
              <li>{language === 'km' ? 'បន្ថែម Secret ឈ្មោះ GOOGLE_MAPS_PLATFORM_KEY ជាមួយ Key របស់អ្នក' : 'Add secret named GOOGLE_MAPS_PLATFORM_KEY with your Google Maps API key.'}</li>
            </ol>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {rawCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#0B7A5C] text-white border-[#0B7A5C]'
                  : 'bg-[#F8FCFA] text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat === 'All' ? (language === 'km' ? 'ទាំងអស់' : 'All') : tCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Sidebar layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        {/* Leaflet Map container */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 overflow-hidden shadow-xs relative h-full">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating detail overlay if a spot is selected */}
          {selectedDestination && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl z-[1000] max-w-lg mx-auto flex gap-4 items-center animate-in slide-in-from-bottom-4 duration-200">
              <img
                src={getDirectImageUrl(selectedDestination.image)}
                alt={selectedDestination.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallbackCount = parseInt(target.dataset.fallbackCount || '0', 10);
                  if (fallbackCount === 0 && (selectedDestination.image.includes('drive.google.com') || selectedDestination.image.includes('file/d/'))) {
                    target.dataset.fallbackCount = '1';
                    target.src = getDriveThumbnailUrl(selectedDestination.image);
                  } else if (fallbackCount < 2) {
                    target.dataset.fallbackCount = '2';
                    target.src = FALLBACK_BACKUP_IMAGE;
                  }
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-slate-200/80 shadow-xs bg-slate-100 transition-all duration-300"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#DFF7ED] text-[#0B7A5C]">
                    {tProvince(selectedDestination.province)}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{selectedDestination.rating}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-[#1E293B] truncate mt-1">
                  {(language === 'km' && selectedDestination.khmerTitle) ? selectedDestination.khmerTitle : selectedDestination.title}
                </h4>
                {selectedDestination.khmerName && language !== 'km' && (
                  <p className="text-[11px] text-[#0B7A5C] font-semibold">
                    {selectedDestination.khmerName}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onToggleSaveSpot(selectedDestination)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all duration-200 cursor-pointer active:scale-90 hover:scale-[1.02] ${
                      savedSpotIds.includes(selectedDestination.id)
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Heart className="w-3 h-3 fill-current" />
                    <span>
                      {savedSpotIds.includes(selectedDestination.id)
                        ? (language === 'km' ? 'បានរក្សាទុក' : 'Saved')
                        : (language === 'km' ? 'រក្សាទុក' : 'Save')}
                    </span>
                  </button>

                  <button
                    onClick={() => onAskAI(selectedDestination)}
                    className="px-2.5 py-1 bg-[#0B7A5C] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-[#086048] transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#21C87A]" />
                    <span>{language === 'km' ? 'សួរ AI' : 'Ask AI'}</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${selectedDestination.title} ${selectedDestination.province} Cambodia`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3 h-3 text-[#0B7A5C]" />
                    <span>{language === 'km' ? 'ទិសដៅ' : 'Directions'}</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar spot list */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-col h-full overflow-hidden">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
              {language === 'km' ? `ទីតាំង (${filteredDestinations.length})` : `Destinations (${filteredDestinations.length})`}
            </h4>
            <span className="text-[11px] font-semibold text-[#0B7A5C]">
              {tProvince(selectedProvince)}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1">
            {filteredDestinations.map(dest => {
              const isSelected = selectedDestination?.id === dest.id;
              const isSaved = savedSpotIds.includes(dest.id);
              const destTitle = (language === 'km' && dest.khmerTitle) ? dest.khmerTitle : dest.title;
              const destProvince = tProvince(dest.province);

              return (
                <div
                  key={dest.id}
                  onClick={() => handleSelectSpot(dest)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center ${
                    isSelected
                      ? 'border-[#0B7A5C] bg-[#F0FAF5] shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={getDirectImageUrl(dest.image)}
                    alt={destTitle}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallbackCount = parseInt(target.dataset.fallbackCount || '0', 10);
                      if (fallbackCount === 0 && (dest.image.includes('drive.google.com') || dest.image.includes('file/d/'))) {
                        target.dataset.fallbackCount = '1';
                        target.src = getDriveThumbnailUrl(dest.image);
                      } else if (fallbackCount < 2) {
                        target.dataset.fallbackCount = '2';
                        target.src = FALLBACK_BACKUP_IMAGE;
                      }
                    }}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200/80 shadow-2xs bg-slate-100 transition-all duration-300"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1E293B] truncate">{destTitle}</p>
                    {dest.khmerName && language !== 'km' && (
                      <p className="text-[11px] text-[#0B7A5C] font-semibold">{dest.khmerName}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span>{destProvince}</span>
                      <span>•</span>
                      <span className="font-semibold text-amber-600">★ {dest.rating}</span>
                    </div>
                  </div>
                  {isSaved && <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
