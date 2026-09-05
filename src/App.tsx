import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PreferencesModal } from './components/PreferencesModal';
import { AuthModal } from './components/AuthModal';
import { MapAndPlanner } from './components/MapAndPlanner';
import { AIAssistant } from './components/AIAssistant';
import { WeatherWidget } from './components/WeatherWidget';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';
import { Destination, TripPlan } from './types';
import { CAMBODIA_DESTINATIONS } from './data/mockDestinations';
import { getDirectImageUrl, getDriveThumbnailUrl, FALLBACK_BACKUP_IMAGE } from './lib/imageUtils';
import { MapPin, Compass, Sparkles, Heart, Search, Filter, Route, Check, X, Bookmark } from 'lucide-react';
import { scrollToTop } from './utils/scrollUtils';
import { MyTripsDashboard } from './components/MyTripsDashboard';

function MainApp() {
  const { language, t, tProvince, tCategory } = useLanguage();
  const { userProfile, updateSavedSpots } = useAuth();
  const [activeTab, setActiveTab] = useState<'explore' | 'planner' | 'assistant' | 'trips' | 'favorites' | 'pricing'>('explore');
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [assistantPrompt, setAssistantPrompt] = useState<string>('');
  const [activeTripContext, setActiveTripContext] = useState<TripPlan | undefined>(undefined);
  const [isEmbedMode, setIsEmbedMode] = useState(false);

  // Check URL parameters for website embed mode & direct trip links
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const embedParam = params.get('embed');
        if (embedParam === '1' || embedParam === 'true') {
          setIsEmbedMode(true);
        }
        const tripIdParam = params.get('tripId');
        if (tripIdParam) {
          setActiveTab('trips');
        }
        const tabParam = params.get('tab');
        if (tabParam && ['explore', 'planner', 'assistant', 'trips', 'favorites', 'pricing'].includes(tabParam)) {
          setActiveTab(tabParam as any);
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // Saved Destinations State initialized from local storage or default
  const [savedSpotIds, setSavedSpotIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('wisgo_saved_spots');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [
      CAMBODIA_DESTINATIONS[0].id,
      CAMBODIA_DESTINATIONS[1].id
    ];
  });

  // Keep local savedSpotIds in sync when user account changes or loads from cloud profile
  useEffect(() => {
    if (userProfile?.savedSpots && Array.isArray(userProfile.savedSpots)) {
      setSavedSpotIds(userProfile.savedSpots);
      try {
        localStorage.setItem('wisgo_saved_spots', JSON.stringify(userProfile.savedSpots));
      } catch (e) {}
    }
  }, [userProfile?.uid, userProfile?.savedSpots]);

  // Toast Notification & Scale Animation State
  const [toast, setToast] = useState<{
    id: number;
    title: string;
    description: string;
    image?: string;
    type: 'saved' | 'removed';
  } | null>(null);
  const [animatingSpotId, setAnimatingSpotId] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (title: string, description: string, image?: string, type: 'saved' | 'removed' = 'saved') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({
      id: Date.now(),
      title,
      description,
      image,
      type
    });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const toggleSaveSpot = (destination: Destination) => {
    const destTitle = (language === 'km' && (destination.khmerTitle || destination.khmerName))
      ? (destination.khmerTitle || destination.khmerName)
      : destination.title;

    // Trigger subtle scale animation on the target destination's heart button
    setAnimatingSpotId(destination.id);
    setTimeout(() => {
      setAnimatingSpotId(null);
    }, 450);

    if (savedSpotIds.includes(destination.id)) {
      const nextIds = savedSpotIds.filter(id => id !== destination.id);
      setSavedSpotIds(nextIds);
      updateSavedSpots(nextIds);
      showToast(
        language === 'km' ? 'បានដកចេញពីកន្លែងរក្សាទុក' : 'Removed from Saved',
        destTitle,
        destination.image,
        'removed'
      );
    } else {
      const nextIds = [...savedSpotIds, destination.id];
      setSavedSpotIds(nextIds);
      updateSavedSpots(nextIds);
      showToast(
        language === 'km' ? 'បានរក្សាទុកដោយជោគជ័យ!' : 'Destination Saved!',
        destTitle,
        destination.image,
        'saved'
      );
    }
  };

  const handleExploreClick = () => {
    setActiveTab('explore');
    if (typeof window !== 'undefined' && window.scrollY > 120) {
      scrollToTop('smooth');
    }
  };

  const handleViewMapClick = () => {
    setActiveTab('planner');
    if (typeof window !== 'undefined' && window.scrollY > 120) {
      scrollToTop('smooth');
    }
  };

  const handleViewSpotOnMap = (destination: Destination) => {
    setSelectedProvince(destination.province);
    setActiveTab('planner');
    if (typeof window !== 'undefined' && window.scrollY > 120) {
      scrollToTop('smooth');
    }
  };

  const handleAskAIAboutSpot = (destination: Destination) => {
    const promptText = language === 'km'
      ? `សូមជួយប្រាប់ព័ត៌មានលម្អិតអំពីការទៅទស្សនា ${destination.khmerName || destination.title} នៅខេត្ត ${tProvince(destination.province)} ប្រទេសកម្ពុជា។ តើមានដំបូន្មានទេសចរណ៍យុវជនក្នុងស្រុក មធ្យោបាយធ្វើដំណើរ តម្លៃសំបុត្រ និងម្ហូបឆ្ងាញ់ៗនៅក្បែរនោះអ្វីខ្លះ?`
      : `Tell me more about visiting ${destination.title} in ${destination.province}, Cambodia. What are the best local youth tips, transport options, entry fees, and nearby local street food?`;
    
    setAssistantPrompt(promptText);
    setActiveTab('assistant');
    if (typeof window !== 'undefined' && window.scrollY > 120) {
      scrollToTop('smooth');
    }
  };

  const filteredDestinations = CAMBODIA_DESTINATIONS.filter(item => {
    const matchesProvince = selectedProvince === 'All' || item.province === selectedProvince;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.khmerName && item.khmerName.includes(searchQuery)) ||
      (item.khmerTitle && item.khmerTitle.includes(searchQuery)) ||
      (item.khmerDescription && item.khmerDescription.includes(searchQuery)) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesProvince && matchesSearch;
  });

  const savedDestinations = CAMBODIA_DESTINATIONS.filter(d => savedSpotIds.includes(d.id));

  const allProvinces = [
    'All', 'Siem Reap', 'Phnom Penh', 'Kampot', 'Kep', 
    'Battambang', 'Koh Rong & Sihanoukville', 'Mondulkiri', 
    'Preah Vihear', 'Kratie', 'Koh Kong', 'Ratanakiri', 'Pursat', 'Kandal'
  ];

  return (
    <div className="min-h-screen bg-[#F8FCFA] text-[#1E293B] flex flex-col font-sans selection:bg-[#DFF7ED] selection:text-[#0B7A5C]">
      
      {/* Navbar or Embed Banner */}
      {isEmbedMode ? (
        <header className="bg-[#0B7A5C]/95 backdrop-blur-md text-white px-4 py-2.5 flex items-center justify-between border-b border-[#086048] shadow-xs sticky top-0 z-50 transition-all">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#21C87A] animate-pulse" />
            <span className="font-extrabold text-sm tracking-tight">🇰🇭 WisGO Cambodia</span>
            <span className="text-xs text-white/80 hidden sm:inline">• Youth-Led Travel Planner</span>
          </div>
          <a
            href={typeof window !== 'undefined' ? window.location.origin : 'https://wis-go.vercel.app/'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-2xs active:scale-95"
          >
            <span>Open in WisGO</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </header>
      ) : (
        <Navbar
          onOpenPreferences={() => setIsPreferencesOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Hero Welcome Banner (Hidden in embed mode) */}
      {!isEmbedMode && (
        <section className="bg-gradient-to-b from-[#DFF7ED]/60 to-transparent pt-6 sm:pt-8 pb-4 px-3.5 sm:px-6 lg:px-8 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
            <div className="w-full md:max-w-2xl">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-[#0B7A5C]/10 text-[#0B7A5C] text-xs font-bold mb-2.5 sm:mb-3">
                <span>🇰🇭</span>
                <span>{t('hero.badge', 'Youth-Led Local Tourism in Cambodia')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1E293B] tracking-tight leading-tight">
                {t('hero.title_prefix', 'Discover Authentic')}{' '}
                <span className="text-[#0B7A5C]">{t('hero.title_highlight', 'Khmer Experiences')}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-2 leading-relaxed">
                {t('hero.desc', 'Explore hidden gems in Siem Reap, Kampot pepper farms, Kep seafood markets, Battambang bamboo train, and Phnom Penh royal history with your local AI guide.')}
              </p>

              {/* Quick jump navigation links */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3.5 text-xs">
                <span className="text-slate-400 font-medium">{language === 'km' ? 'ផ្លូវកាត់:' : 'Quick links:'}</span>
                <button
                  id="hero-explore-link"
                  onClick={handleExploreClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1 min-h-[32px] rounded-full bg-white border border-slate-200/80 text-[#0B7A5C] font-semibold hover:bg-[#DFF7ED]/70 hover:border-[#0B7A5C]/40 transition-colors cursor-pointer shadow-2xs"
                >
                  <Compass className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>{language === 'km' ? 'រុករកទីតាំង' : 'Explore'}</span>
                </button>
                <button
                  id="hero-view-map-link"
                  onClick={handleViewMapClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1 min-h-[32px] rounded-full bg-white border border-slate-200/80 text-[#0B7A5C] font-semibold hover:bg-[#DFF7ED]/70 hover:border-[#0B7A5C]/40 transition-colors cursor-pointer shadow-2xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>{language === 'km' ? 'មើលផែនទី' : 'View Map'}</span>
                </button>
                <button
                  id="hero-trips-link"
                  onClick={() => {
                    setActiveTab('trips');
                    if (typeof window !== 'undefined' && window.scrollY > 120) {
                      scrollToTop('smooth');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 min-h-[32px] rounded-full bg-white border border-slate-200/80 text-[#0B7A5C] font-semibold hover:bg-[#DFF7ED]/70 hover:border-[#0B7A5C]/40 transition-colors cursor-pointer shadow-2xs"
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>{language === 'km' ? 'គម្រោងដំណើរកម្សាន្ត' : 'My Trips'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
              <button
                id="hero-explore-btn"
                onClick={handleExploreClick}
                className="px-4 sm:px-5 py-2.5 sm:py-3 min-h-[44px] rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#0B7A5C]" />
                <span>{language === 'km' ? 'រុករក' : 'Explore'}</span>
              </button>

              <button
                id="hero-view-map-btn"
                onClick={handleViewMapClick}
                className="px-4 sm:px-5 py-2.5 sm:py-3 min-h-[44px] rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Route className="w-4 h-4 text-[#0B7A5C]" />
                <span>{t('hero.view_map_btn', 'View Map & Planner')}</span>
              </button>

              <button
                onClick={() => {
                  setAssistantPrompt('');
                  setActiveTab('assistant');
                  if (typeof window !== 'undefined' && window.scrollY > 120) {
                    scrollToTop('smooth');
                  }
                }}
                className="sm:col-span-1 md:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 min-h-[44px] rounded-2xl bg-[#0B7A5C] hover:bg-[#086048] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#21C87A]" />
                <span>{t('hero.ask_ai_btn', 'Ask WisGO AI Guide')}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Tab Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 pb-28 sm:pb-10">
        <AnimatePresence mode="wait">
          {/* EXPLORE TAB */}
          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              id="explore-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Real-Time Weather Forecast Widget */}
              <WeatherWidget selectedProvince={selectedProvince} />

              {/* Search & Province Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-xs">
                
                {/* Search input */}
                <div className="relative w-full sm:w-80 md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder={t('explore.search_placeholder', 'Search Angkor Wat, Kampot pepper, Kep crab...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 min-h-[42px] bg-[#F8FCFA] border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B7A5C] text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                {/* Province Pills */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
                  {allProvinces.map(prov => (
                    <button
                      key={prov}
                      onClick={() => setSelectedProvince(prov)}
                      className={`px-3 sm:px-3.5 py-1.5 min-h-[38px] rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                        selectedProvince === prov
                          ? 'bg-[#0B7A5C] text-white border-[#0B7A5C] shadow-xs'
                          : 'bg-[#F8FCFA] text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {tProvince(prov)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destinations Grid */}
              {filteredDestinations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-3">
                  <p className="text-sm text-slate-600">{t('explore.no_results', 'No destinations found matching your search.')}</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedProvince('All'); }}
                    className="px-4 py-2 min-h-[40px] rounded-xl bg-[#0B7A5C] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {t('explore.clear_search', 'Clear Search')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {filteredDestinations.map(item => {
                    const isSaved = savedSpotIds.includes(item.id);
                    const primaryTitle = language === 'km' ? (item.khmerTitle || item.khmerName || item.title) : item.title;
                    const secondaryTitle = language === 'km' ? item.title : (item.khmerName || item.khmerTitle);
                    const displayDescription = (language === 'km' && item.khmerDescription) ? item.khmerDescription : item.description;
                    const displayEntryFee = (language === 'km' && item.khmerEntryFee) ? item.khmerEntryFee : (item.entryFee || t('explore.free_entry', 'Free Entry'));

                    return (
                      <motion.div 
                        key={item.id}
                        whileHover={{ 
                          y: -5, 
                          scale: 1.01,
                          boxShadow: '0 20px 25px -5px rgba(11, 122, 92, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.04)' 
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs group flex flex-col"
                      >
                        <div className="relative aspect-[16/10] sm:h-52 overflow-hidden bg-slate-100">
                          <img
                            src={getDirectImageUrl(item.image)}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallbackCount = parseInt(target.dataset.fallbackCount || '0', 10);
                              if (fallbackCount === 0 && (item.image.includes('drive.google.com') || item.image.includes('file/d/'))) {
                                target.dataset.fallbackCount = '1';
                                target.src = getDriveThumbnailUrl(item.image);
                              } else if (fallbackCount < 2) {
                                target.dataset.fallbackCount = '2';
                                target.src = FALLBACK_BACKUP_IMAGE;
                              }
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#0B7A5C] shadow-xs flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{tProvince(item.province)}</span>
                          </div>
                          
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ scale: 1.08 }}
                            animate={animatingSpotId === item.id ? { scale: [1, 1.35, 0.9, 1.15, 1] } : { scale: 1 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            onClick={() => toggleSaveSpot(item)}
                            className={`absolute top-3 right-3 p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full backdrop-blur-md transition-colors shadow-xs cursor-pointer z-10 ${
                              isSaved
                                ? 'bg-rose-500 text-white shadow-rose-500/30 shadow-md'
                                : 'bg-white/85 text-slate-600 hover:text-rose-500 hover:bg-white'
                            }`}
                            title={isSaved ? t('explore.remove', 'Remove') : t('nav.saved', 'Saved')}
                          >
                            <Heart className={`w-4 h-4 fill-current transition-transform duration-200 ${isSaved ? 'scale-105' : ''}`} />
                          </motion.button>
                        </div>

                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-semibold text-[#0B7A5C] bg-[#DFF7ED] px-2.5 py-0.5 rounded-full">
                                {tCategory(item.category)}
                              </span>
                              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                                ★ {item.rating} <span className="text-slate-400 font-normal">({item.reviewCount})</span>
                              </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-[#1E293B] group-hover:text-[#0B7A5C] transition-colors leading-snug">
                              {primaryTitle}
                            </h3>
                            {secondaryTitle && (
                              <p className="text-xs font-semibold text-[#0B7A5C]/80 mt-0.5">
                                {secondaryTitle}
                              </p>
                            )}

                            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                              {displayDescription}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleAskAIAboutSpot(item)}
                                className="flex items-center gap-1 text-[#0B7A5C] font-bold hover:underline cursor-pointer py-1 min-h-[32px]"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-[#21C87A]" />
                                <span>{t('explore.ask_ai', 'Ask AI Guide')}</span>
                              </button>
                              <button
                                onClick={() => handleViewSpotOnMap(item)}
                                className="flex items-center gap-1 text-slate-600 hover:text-[#0B7A5C] font-medium hover:underline cursor-pointer py-1 min-h-[32px]"
                              >
                                <MapPin className="w-3.5 h-3.5 text-[#0B7A5C]" />
                                <span>{t('nav.view_map', language === 'km' ? 'មើលផែនទី' : 'View Map')}</span>
                              </button>
                            </div>
                            <span className="font-bold text-[#0B7A5C]">{displayEntryFee}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* MAP & PLANNER TAB */}
          {activeTab === 'planner' && (
            <motion.div
              key="planner"
              id="map-planner-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <MapAndPlanner
                destinations={CAMBODIA_DESTINATIONS}
                savedSpotIds={savedSpotIds}
                onToggleSaveSpot={toggleSaveSpot}
                onAskAI={handleAskAIAboutSpot}
                onRequestAIPlanner={() => {
                  const prompt = language === 'km'
                    ? 'សូមជួយបង្កើតគម្រោងដើរលេងកម្ពុជា ៤ ថ្ងៃ នៅសៀមរាប និងកំពត តាមចំណង់ចំណូលចិត្តរបស់ខ្ញុំ។'
                    : 'Generate a customized 4-day Cambodia trip itinerary across Siem Reap and Kampot tailored to my preferences.';
                  setAssistantPrompt(prompt);
                  setActiveTab('assistant');
                }}
                selectedProvince={selectedProvince}
                onSelectProvince={setSelectedProvince}
              />
            </motion.div>
          )}

          {/* AI GUIDE & TRIP PLANNER TAB */}
          {activeTab === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <AIAssistant 
                initialPrompt={assistantPrompt} 
                initialTripContext={activeTripContext}
                onOpenMyTrips={() => {
                  setActiveTab('trips');
                  if (typeof window !== 'undefined' && window.scrollY > 120) {
                    scrollToTop('smooth');
                  }
                }}
              />
            </motion.div>
          )}

          {/* MY TRIPS TAB */}
          {activeTab === 'trips' && (
            <motion.div
              key="trips"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <MyTripsDashboard
                onPlanNewTrip={() => {
                  setAssistantPrompt('');
                  setActiveTripContext(undefined);
                  setActiveTab('assistant');
                  if (typeof window !== 'undefined' && window.scrollY > 120) {
                    scrollToTop('smooth');
                  }
                }}
                onSelectTripForChat={(trip) => {
                  setActiveTripContext(trip);
                  setAssistantPrompt(`I want to refine my ${trip.durationDays}-day trip to ${trip.destination}: "${trip.title}". What can we adjust?`);
                  setActiveTab('assistant');
                  if (typeof window !== 'undefined' && window.scrollY > 120) {
                    scrollToTop('smooth');
                  }
                }}
              />
            </motion.div>
          )}

          {/* FAVORITES TAB */}
          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold text-[#1E293B]">
                {t('explore.saved_destinations', 'Saved Destinations')} ({savedDestinations.length})
              </h2>
              {savedDestinations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
                  <p className="text-sm text-slate-600">
                    {t('explore.no_saved', "You haven't saved any destinations yet.")}
                  </p>
                  <button
                    onClick={handleExploreClick}
                    className="px-4 py-2 rounded-xl bg-[#0B7A5C] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {t('explore.explore_destinations', 'Explore Destinations')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedDestinations.map(item => {
                    const primaryTitle = language === 'km' ? (item.khmerTitle || item.khmerName || item.title) : item.title;
                    const secondaryTitle = language === 'km' ? item.title : (item.khmerName || item.khmerTitle);
                    return (
                      <motion.div 
                        key={item.id} 
                        whileHover={{ 
                          y: -4, 
                          scale: 1.01,
                          boxShadow: '0 12px 20px -3px rgba(11, 122, 92, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)' 
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className="bg-white border border-slate-200 rounded-3xl overflow-hidden p-4 flex gap-4 items-center shadow-xs"
                      >
                        <img
                          src={getDirectImageUrl(item.image)}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-2xl object-cover shrink-0"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.fallback) {
                              target.dataset.fallback = 'true';
                              target.src = FALLBACK_BACKUP_IMAGE;
                            }
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-[#1E293B] truncate">{primaryTitle}</h3>
                          {secondaryTitle && (
                            <p className="text-[11px] text-slate-500 truncate">{secondaryTitle}</p>
                          )}
                          <p className="text-xs text-[#0B7A5C] font-semibold mt-0.5">{tProvince(item.province)}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <button
                              onClick={() => handleAskAIAboutSpot(item)}
                              className="text-xs text-[#0B7A5C] font-bold hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-[#21C87A]" />
                              <span>{t('explore.ask_ai', 'Ask AI')}</span>
                            </button>
                            <button
                              onClick={() => handleViewSpotOnMap(item)}
                              className="text-xs text-slate-600 hover:text-[#0B7A5C] font-medium hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <MapPin className="w-3 h-3 text-[#0B7A5C]" />
                              <span>{t('nav.view_map', language === 'km' ? 'មើលផែនទី' : 'View Map')}</span>
                            </button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleSaveSpot(item)}
                              className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                            >
                              {t('explore.remove', 'Remove')}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
          {/* PRICING TAB */}
          {activeTab === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Pricing
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  if (typeof window !== 'undefined' && window.scrollY > 120) {
                    scrollToTop('smooth');
                  }
                }}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer (Hidden in embed mode) */}
      {!isEmbedMode && (
        <Footer
          onSelectProvince={(province) => {
            setSelectedProvince(province);
            setActiveTab('explore');
            if (typeof window !== 'undefined' && window.scrollY > 120) {
              scrollToTop('smooth');
            }
          }}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            if (typeof window !== 'undefined' && window.scrollY > 120) {
              scrollToTop('smooth');
            }
          }}
        />
      )}

      {/* Modals */}
      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Mobile Bottom Dock Navigation (Hidden in embed mode) */}
      {!isEmbedMode && (
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          savedCount={savedSpotIds.length}
        />
      )}

      {/* Toast Notification for Saving Destinations */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-[9999] pointer-events-none flex justify-center sm:justify-end"
          >
            <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-2xl p-3 sm:py-3 sm:px-4 max-w-sm w-full flex items-center gap-3.5">
              {toast.image ? (
                <div className="relative shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70">
                  <img
                    src={getDirectImageUrl(toast.image)}
                    alt={toast.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute bottom-0 right-0 p-1 rounded-tl-lg ${
                      toast.type === 'saved' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-white'
                    }`}
                  >
                    {toast.type === 'saved' ? (
                      <Heart className="w-2.5 h-2.5 fill-current" />
                    ) : (
                      <Check className="w-2.5 h-2.5" />
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    toast.type === 'saved'
                      ? 'bg-rose-50 text-rose-500 border border-rose-100'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Heart className="w-5 h-5 fill-current" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {toast.title}
                  </p>
                  {toast.type === 'saved' && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-emerald-50 text-[#0B7A5C] border border-emerald-200/60">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                  {toast.description}
                </p>
              </div>

              <button
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </AuthProvider>
  );
}
