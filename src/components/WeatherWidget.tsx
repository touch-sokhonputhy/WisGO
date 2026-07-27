import React, { useEffect, useState } from 'react';
import { Sun, CloudRain, Cloud, CloudSun, CloudLightning, Wind, Droplets, Compass, RefreshCw, Thermometer, Info } from 'lucide-react';

interface WeatherWidgetProps {
  selectedProvince: string;
}

interface ProvinceCoord {
  name: string;
  khmerName: string;
  lat: number;
  lng: number;
  travelTip: string;
}

const PROVINCE_COORDS: Record<string, ProvinceCoord> = {
  'Siem Reap': {
    name: 'Siem Reap',
    khmerName: 'សៀមរាប',
    lat: 13.3671,
    lng: 103.8448,
    travelTip: 'Ideal morning temple exploration weather. Stay hydrated and wear breathable clothing!'
  },
  'Phnom Penh': {
    name: 'Phnom Penh',
    khmerName: 'ភ្នំពេញ',
    lat: 11.5564,
    lng: 104.9282,
    travelTip: 'Great weather for riverfront walks along Sisowath Quay and Royal Palace tours.'
  },
  'Kampot': {
    name: 'Kampot',
    khmerName: 'កំពត',
    lat: 10.6104,
    lng: 104.1816,
    travelTip: 'Enjoy pepper farm tours or sunset river cruises along Teuk Chhou.'
  },
  'Kep': {
    name: 'Kep',
    khmerName: 'កែប',
    lat: 10.4833,
    lng: 104.2833,
    travelTip: 'Perfect conditions for oceanfront blue crab dining at Kep Crab Market.'
  },
  'Battambang': {
    name: 'Battambang',
    khmerName: 'បាត់ដំបង',
    lat: 13.0957,
    lng: 103.2022,
    travelTip: 'Great day for riding the historic Bamboo Train or observing Phnom Sampeau bat cave sunset.'
  },
  'Koh Rong & Sihanoukville': {
    name: 'Koh Rong & Sihanoukville',
    khmerName: 'កោះរុង',
    lat: 10.6250,
    lng: 103.5234,
    travelTip: 'Crystal blue island waters! Remember reef-safe sunscreen for beach swimming.'
  },
  'Mondulkiri': {
    name: 'Mondulkiri',
    khmerName: 'មណ្ឌលគិរី',
    lat: 12.4552,
    lng: 107.1911,
    travelTip: 'Cooler highland breeze! Perfect for visiting elephant sanctuaries and waterfalls.'
  },
  'Preah Vihear': {
    name: 'Preah Vihear',
    khmerName: 'ព្រះវិហារ',
    lat: 14.3912,
    lng: 104.6801,
    travelTip: 'Mountain ridge breeze! Bring good walking shoes for the cliffside temple ascent.'
  },
  'Kratie': {
    name: 'Kratie',
    khmerName: 'ក្រចេះ',
    lat: 12.4881,
    lng: 106.0181,
    travelTip: 'Great river conditions for viewing Mekong Irrawaddy freshwater dolphins at Kampi.'
  },
  'Koh Kong': {
    name: 'Koh Kong',
    khmerName: 'កោះកុង',
    lat: 11.6153,
    lng: 102.9838,
    travelTip: 'Lush rainforest climate! Excellent for Tatai river boat trips and mangrove kayaking.'
  },
  'Ratanakiri': {
    name: 'Ratanakiri',
    khmerName: 'រតនគិរី',
    lat: 13.7314,
    lng: 107.0142,
    travelTip: 'Pleasant highland weather! Great for swimming at Yeak Laom volcanic crater lake.'
  },
  'Pursat': {
    name: 'Pursat',
    khmerName: 'ពោធិ៍សាត់',
    lat: 12.5388,
    lng: 103.9192,
    travelTip: 'Calm Tonle Sap waters! Ideal for visiting Kampong Luong floating town.'
  },
  'Kandal': {
    name: 'Kandal',
    khmerName: 'កណ្តាល',
    lat: 11.8123,
    lng: 104.7521,
    travelTip: 'Clear skies for climbing the 500 steps up Oudong Mountain royal stupas.'
  },
  'All': {
    name: 'Cambodia Overall',
    khmerName: 'កម្ពុជា',
    lat: 12.5657,
    lng: 104.9910,
    travelTip: 'Tropical Khmer climate. Always carry water and light rain protection.'
  }
};

interface WeatherData {
  tempC: number;
  windSpeedKm: number;
  weatherCode: number;
  conditionText: string;
  isDay: boolean;
  forecast: {
    date: string;
    maxC: number;
    minC: number;
    code: number;
  }[];
}

function decodeWMO(code: number): { text: string; icon: React.FC<{ className?: string }> } {
  if (code === 0) return { text: 'Sunny / Clear Sky', icon: Sun };
  if (code === 1 || code === 2) return { text: 'Partly Cloudy', icon: CloudSun };
  if (code === 3) return { text: 'Overcast', icon: Cloud };
  if (code >= 51 && code <= 67) return { text: 'Light Drizzle', icon: CloudRain };
  if (code >= 80 && code <= 82) return { text: 'Tropical Showers', icon: CloudRain };
  if (code >= 95) return { text: 'Thunderstorms', icon: CloudLightning };
  return { text: 'Partly Sunny', icon: CloudSun };
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ selectedProvince }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFahrenheit, setUseFahrenheit] = useState(false);

  const activeCoord = PROVINCE_COORDS[selectedProvince] || PROVINCE_COORDS['All'];

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${activeCoord.lat}&longitude=${activeCoord.lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FPhnom_Penh`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather network error');
      const data = await res.json();

      const current = data.current_weather;
      const daily = data.daily;

      const condition = decodeWMO(current.weathercode);

      const forecastList = daily.time.slice(1, 4).map((timeStr: string, idx: number) => ({
        date: new Date(timeStr).toLocaleDateString('en-US', { weekday: 'short' }),
        maxC: Math.round(daily.temperature_2m_max[idx + 1]),
        minC: Math.round(daily.temperature_2m_min[idx + 1]),
        code: daily.weathercode[idx + 1]
      }));

      setWeather({
        tempC: Math.round(current.temperature),
        windSpeedKm: Math.round(current.windspeed),
        weatherCode: current.weathercode,
        conditionText: condition.text,
        isDay: Boolean(current.is_day),
        forecast: forecastList
      });
    } catch (err: any) {
      console.error('Weather fetch failed:', err);
      setError('Could not fetch real-time weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [selectedProvince]);

  const displayTemp = (tempC: number) => {
    if (useFahrenheit) {
      return `${Math.round((tempC * 9) / 5 + 32)}°F`;
    }
    return `${tempC}°C`;
  };

  const IconComponent = weather ? decodeWMO(weather.weatherCode).icon : Sun;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        
        {/* Province Title & Khmer */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center font-bold">
            <Compass className="w-5 h-5 text-[#0B7A5C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#1E293B] text-sm sm:text-base">
                {activeCoord.name} Weather
              </h3>
              <span className="text-xs font-bold text-[#0B7A5C] bg-[#DFF7ED] px-2 py-0.5 rounded-full">
                {activeCoord.khmerName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Live Khmer forecast & travel advisories</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setUseFahrenheit(!useFahrenheit)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {useFahrenheit ? '°F (US)' : '°C (Metric)'}
          </button>
          
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-500 space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#0B7A5C]" />
          <p>Fetching real-time weather for {activeCoord.name}...</p>
        </div>
      ) : error ? (
        <div className="py-4 text-center text-xs text-slate-500">
          <p>{error}</p>
          <button
            onClick={fetchWeather}
            className="mt-2 text-[#0B7A5C] font-bold underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : weather ? (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            
            {/* Current Temperature Main Card */}
            <div className="flex items-center gap-4 bg-[#F8FCFA] border border-slate-200 rounded-2xl p-4">
              <div className="p-3 bg-[#0B7A5C] text-white rounded-2xl shadow-xs">
                <IconComponent className="w-8 h-8 text-[#21C87A]" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#1E293B]">
                  {displayTemp(weather.tempC)}
                </p>
                <p className="text-xs font-bold text-[#0B7A5C]">
                  {weather.conditionText}
                </p>
              </div>
            </div>

            {/* Atmosphere Details */}
            <div className="bg-[#F8FCFA] border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Wind className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>Wind Speed</span>
                </span>
                <span className="font-bold text-[#1E293B]">{weather.windSpeedKm} km/h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Thermometer className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>Timezone</span>
                </span>
                <span className="font-bold text-[#1E293B]">ICT (UTC+7)</span>
              </div>
            </div>

            {/* Travel Advice Box */}
            <div className="bg-[#DFF7ED]/50 border border-[#21C87A]/30 rounded-2xl p-3 text-xs space-y-1">
              <p className="font-bold text-[#0B7A5C] flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Khmer Travel Advisory:</span>
              </p>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {activeCoord.travelTip}
              </p>
            </div>
          </div>

          {/* 3-Day Forecast Strip */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider shrink-0">
              3-Day Outlook
            </span>
            <div className="flex items-center gap-3">
              {weather.forecast.map((day, i) => {
                const DayIcon = decodeWMO(day.code).icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-[#F8FCFA] border border-slate-200 px-3 py-1.5 rounded-xl text-xs"
                  >
                    <span className="font-bold text-slate-700">{day.date}</span>
                    <DayIcon className="w-3.5 h-3.5 text-[#0B7A5C]" />
                    <span className="font-semibold text-slate-800">
                      {displayTemp(day.maxC)}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      / {displayTemp(day.minC)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
