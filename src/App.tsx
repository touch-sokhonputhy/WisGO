import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { PreferencesModal } from './components/PreferencesModal';
import { AuthModal } from './components/AuthModal';
import { MapAndPlanner } from './components/MapAndPlanner';
import { AIAssistant } from './components/AIAssistant';
import { WeatherWidget } from './components/WeatherWidget';
import { Destination } from './types';
import { CAMBODIA_DESTINATIONS } from './data/mockDestinations';
import { MapPin, Compass, Sparkles, Heart, Search, Filter, Route } from 'lucide-react';

function MainApp() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'explore' | 'planner' | 'assistant' | 'favorites'>('explore');
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [assistantPrompt, setAssistantPrompt] = useState<string>('');

  // Saved Destinations State
  const [savedSpotIds, setSavedSpotIds] = useState<string[]>([
    CAMBODIA_DESTINATIONS[0].id,
    CAMBODIA_DESTINATIONS[1].id
  ]);

  const toggleSaveSpot = (destination: Destination) => {
    if (savedSpotIds.includes(destination.id)) {
      setSavedSpotIds(savedSpotIds.filter(id => id !== destination.id));
    } else {
      setSavedSpotIds([...savedSpotIds, destination.id]);
    }
  };

  const handleAskAIAboutSpot = (destination: Destination) => {
    setAssistantPrompt(`Tell me more about visiting ${destination.title} in ${destination.province}, Cambodia. What are the best local youth tips, transport options, entry fees, and nearby local street food?`);
    setActiveTab('assistant');
  };

  const filteredDestinations = CAMBODIA_DESTINATIONS.filter(item => {
    const matchesProvince = selectedProvince === 'All' || item.province === selectedProvince;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.khmerName && item.khmerName.includes(searchQuery));
    return matchesProvince && matchesSearch;
  });

  const savedDestinations = CAMBODIA_DESTINATIONS.filter(d => savedSpotIds.includes(d.id));

  return (
    <div className="min-h-screen bg-[#F8FCFA] text-[#1E293B] flex flex-col font-sans selection:bg-[#DFF7ED] selection:text-[#0B7A5C]">
      
      {/* Navbar */}
      <Navbar
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Hero Welcome Banner */}
      <section className="bg-gradient-to-b from-[#DFF7ED]/60 to-transparent pt-8 pb-4 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B7A5C]/10 text-[#0B7A5C] text-xs font-bold mb-3">
              <span>🇰🇭</span>
              <span>Youth-Led Local Tourism in Cambodia</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              Discover Authentic <span className="text-[#0B7A5C]">Khmer Experiences</span>
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl mt-2">
              Explore hidden gems in Siem Reap, Kampot pepper farms, Kep seafood markets, Battambang bamboo train, and Phnom Penh royal history with your local AI guide.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                setAssistantPrompt('');
                setActiveTab('assistant');
              }}
              className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-[#0B7A5C] hover:bg-[#086048] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#21C87A]" />
              <span>Ask WisGO AI Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className="px-5 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Route className="w-4 h-4 text-[#0B7A5C]" />
              <span>View Map</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Tab Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* EXPLORE TAB */}
          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Real-Time Weather Forecast Widget */}
              <WeatherWidget selectedProvince={selectedProvince} />

              {/* Search & Province Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                
                {/* Search input */}
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder={t('explore.search_placeholder', 'Search Angkor Wat, Kampot pepper, Kep crab...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#F8FCFA] border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0B7A5C] text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                {/* Province Pills */}
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
                  {['All', 'Siem Reap', 'Phnom Penh', 'Kampot', 'Kep', 'Battambang', 'Koh Rong & Sihanoukville', 'Mondulkiri', 'Preah Vihear', 'Kratie', 'Koh Kong', 'Ratanakiri', 'Pursat', 'Kandal'].map(prov => (
                    <button
                      key={prov}
                      onClick={() => setSelectedProvince(prov)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                        selectedProvince === prov
                          ? 'bg-[#0B7A5C] text-white border-[#0B7A5C] shadow-xs'
                          : 'bg-[#F8FCFA] text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destinations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDestinations.map(item => {
                  const isSaved = savedSpotIds.includes(item.id);
                  return (
                    <motion.div 
                      key={item.id}
                      whileHover={{ 
                        y: -6, 
                        scale: 1.01,
                        boxShadow: '0 20px 25px -5px rgba(11, 122, 92, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.04)' 
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs group flex flex-col"
                    >
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#0B7A5C] shadow-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{item.province}</span>
                        </div>
                        
                        <button
                          onClick={() => toggleSaveSpot(item)}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-xs cursor-pointer ${
                            isSaved
                              ? 'bg-rose-500 text-white'
                              : 'bg-white/80 text-slate-600 hover:text-rose-500 hover:bg-white'
                          }`}
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-[#0B7A5C] bg-[#DFF7ED] px-2.5 py-0.5 rounded-full">
                              {item.category}
                            </span>
                            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                              ★ {item.rating} <span className="text-slate-400 font-normal">({item.reviewCount})</span>
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-[#1E293B] group-hover:text-[#0B7A5C] transition-colors leading-snug">
                            {item.title}
                          </h3>
                          {item.khmerName && (
                            <p className="text-xs font-bold text-[#0B7A5C]/80 mt-0.5">
                              {item.khmerName}
                            </p>
                          )}

                          <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <button
                            onClick={() => handleAskAIAboutSpot(item)}
                            className="flex items-center gap-1 text-[#0B7A5C] font-bold hover:underline cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#21C87A]" />
                            <span>Ask AI Guide</span>
                          </button>
                          <span className="font-bold text-[#0B7A5C]">{item.entryFee}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* MAP & PLANNER TAB */}
          {activeTab === 'planner' && (
            <motion.div
              key="planner"
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
                  setAssistantPrompt('Generate a customized 4-day Cambodia trip itinerary across Siem Reap and Kampot tailored to my preferences.');
                  setActiveTab('assistant');
                }}
                selectedProvince={selectedProvince}
                onSelectProvince={setSelectedProvince}
              />
            </motion.div>
          )}

          {/* AI GUIDE TAB */}
          {activeTab === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <AIAssistant initialPrompt={assistantPrompt} />
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
              <h2 className="text-xl font-bold text-[#1E293B]">Saved Destinations ({savedDestinations.length})</h2>
              {savedDestinations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
                  <p className="text-sm text-slate-600">You haven't saved any destinations yet.</p>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="px-4 py-2 rounded-xl bg-[#0B7A5C] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Explore Destinations
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedDestinations.map(item => (
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
                      <img src={item.image} alt={item.title} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-[#1E293B] truncate">{item.title}</h3>
                        <p className="text-xs text-[#0B7A5C] font-semibold">{item.province}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => handleAskAIAboutSpot(item)}
                            className="text-xs text-[#0B7A5C] font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-[#21C87A]" />
                            <span>Ask AI</span>
                          </button>
                          <button
                            onClick={() => toggleSaveSpot(item)}
                            className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} WisGO — Authentic Cambodian Youth Local Travel Platform.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Google Maps API</span>
            <span>•</span>
            <span>Gemini AI Assistant</span>
            <span>•</span>
            <span>Firebase Auth & Firestore</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

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
