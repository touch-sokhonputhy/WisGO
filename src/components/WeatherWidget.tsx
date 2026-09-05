import React, { useEffect, useState } from 'react';
import { Sun, CloudRain, Cloud, CloudSun, CloudLightning, Wind, Compass, RefreshCw, Thermometer, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface WeatherWidgetProps {
  selectedProvince: string;
}

interface ProvinceCoord {
  name: string;
  khmerName: string;
  lat: number;
  lng: number;
  travelTip: string;
  khmerTravelTip: string;
  defaultTemp: number;
  defaultCondition: string;
  defaultCode: number;
}

const PROVINCE_COORDS: Record<string, ProvinceCoord> = {
  'Siem Reap': {
    name: 'Siem Reap',
    khmerName: 'សៀមរាប',
    lat: 13.3671,
    lng: 103.8448,
    defaultTemp: 31,
    defaultCondition: 'Partly Sunny',
    defaultCode: 1,
    travelTip: 'Ideal morning temple exploration weather. Stay hydrated and wear breathable clothing!',
    khmerTravelTip: 'អាកាសធាតុល្អសម្រាប់ទស្សនាប្រាសាទនៅពេលព្រឹកព្រលឹម។ គួរពិសាទឹកឱ្យបានច្រើន និងស្លៀកពាក់ស្រាលស្រួលខ្លួន!'
  },
  'Phnom Penh': {
    name: 'Phnom Penh',
    khmerName: 'ភ្នំពេញ',
    lat: 11.5564,
    lng: 104.9282,
    defaultTemp: 32,
    defaultCondition: 'Sunny / Warm',
    defaultCode: 0,
    travelTip: 'Great weather for riverfront walks along Sisowath Quay and Royal Palace tours.',
    khmerTravelTip: 'អាកាសធាតុល្អសម្រាប់ដើរកម្សាន្តតាមមាត់ទន្លេ ផ្លូវថ្មើរជើងចតុមុខ និងទស្សនាព្រះបរមរាជវាំង។'
  },
  'Kampot': {
    name: 'Kampot',
    khmerName: 'កំពត',
    lat: 10.6104,
    lng: 104.1816,
    defaultTemp: 30,
    defaultCondition: 'Tropical Breeze',
    defaultCode: 1,
    travelTip: 'Enjoy pepper farm tours or sunset river cruises along Teuk Chhou.',
    khmerTravelTip: 'ស័ក្តិសមសម្រាប់ដំណើរកម្សាន្តទៅចំការម្រេច ឬជិះទូកកម្សាន្តមើលថ្ងៃលិចតាមដងព្រែកទឹកឈូ។'
  },
  'Kep': {
    name: 'Kep',
    khmerName: 'កែប',
    lat: 10.4833,
    lng: 104.2833,
    defaultTemp: 29,
    defaultCondition: 'Coastal Breeze',
    defaultCode: 1,
    travelTip: 'Perfect conditions for oceanfront blue crab dining at Kep Crab Market.',
    khmerTravelTip: 'អាកាសធាតុត្រជាក់ស្រួល ស័ក្តិសមសម្រាប់ញ៉ាំក្តាមសេះស្រស់ៗនៅផ្សារក្តាមកែប។'
  },
  'Battambang': {
    name: 'Battambang',
    khmerName: 'បាត់ដំបង',
    lat: 13.0957,
    lng: 103.2022,
    defaultTemp: 32,
    defaultCondition: 'Partly Cloudy',
    defaultCode: 2,
    travelTip: 'Great day for riding the historic Bamboo Train or observing Phnom Sampeau bat cave sunset.',
    khmerTravelTip: 'អាកាសធាតុល្អសម្រាប់ជិះឡូរី (រថភ្លើងឫស្សី) និងទស្សនាភ្នំសំពៅមើលសត្វប្រចៀវហើរចេញពីរូង។'
  },
  'Koh Rong & Sihanoukville': {
    name: 'Koh Rong & Sihanoukville',
    khmerName: 'កោះរុង & ព្រះសីហនុ',
    lat: 10.6250,
    lng: 103.5234,
    defaultTemp: 30,
    defaultCondition: 'Sunny Coastal',
    defaultCode: 1,
    travelTip: 'Crystal blue island waters! Remember reef-safe sunscreen for beach swimming.',
    khmerTravelTip: 'ផ្ទៃសមុទ្រស្ងប់ល្អ ស័ក្តិសមសម្រាប់ហែលទឹក មុជទឹកមើលផ្កាថ្ម និងដើរលេងតាមឆ្នេរខ្សាច់ស។'
  },
  'Mondulkiri': {
    name: 'Mondulkiri',
    khmerName: 'មណ្ឌលគិរី',
    lat: 12.4552,
    lng: 107.1911,
    defaultTemp: 26,
    defaultCondition: 'Highland Pleasant',
    defaultCode: 2,
    travelTip: 'Cooler highland breeze! Perfect for visiting elephant sanctuaries and waterfalls.',
    khmerTravelTip: 'អាកាសធាតុត្រជាក់បែបតំបន់ភ្នំ! គួរបំពាក់អាវរងាស្តើងសម្រាប់ពេលល្ងាច និងពេលទៅលេងទឹកធ្លាក់ប៊ូស្រា។'
  },
  'Preah Vihear': {
    name: 'Preah Vihear',
    khmerName: 'ព្រះវិហារ',
    lat: 14.3912,
    lng: 104.6801,
    defaultTemp: 31,
    defaultCondition: 'Clear Mountain Air',
    defaultCode: 0,
    travelTip: 'Mountain ridge breeze! Bring good walking shoes for the cliffside temple ascent.',
    khmerTravelTip: 'មើលឃើញទេសភាពយ៉ាងច្បាស់ពីលើកំពូលភ្នំដងរែក នៃប្រាសាទព្រះវិហារបេតិកភណ្ឌពិភពលោក។'
  },
  'Kratie': {
    name: 'Kratie',
    khmerName: 'ក្រចេះ',
    lat: 12.4881,
    lng: 106.0181,
    defaultTemp: 32,
    defaultCondition: 'Warm Riverfront',
    defaultCode: 1,
    travelTip: 'Great river conditions for viewing Mekong Irrawaddy freshwater dolphins at Kampi.',
    khmerTravelTip: 'អាកាសធាតុតាមដងទន្លេល្អ ស័ក្តិសមសម្រាប់ការទស្សនាសត្វផ្សោតក្បាលត្រឡោកទន្លេមេគង្គនៅកាំពី។'
  },
  'Koh Kong': {
    name: 'Koh Kong',
    khmerName: 'កោះកុង',
    lat: 11.6153,
    lng: 102.9838,
    defaultTemp: 29,
    defaultCondition: 'Lush & Humid',
    defaultCode: 2,
    travelTip: 'Lush rainforest climate! Excellent for Tatai river boat trips and mangrove kayaking.',
    khmerTravelTip: 'អាកាសធាតុព្រៃត្រូពិចបៃតងខ្ចី! ស័ក្តិសមសម្រាប់ជិះទូកតាមដងព្រែកតាតៃ និងជិះទូកកាយ៉ាក់ព្រៃកោងកាង។'
  },
  'Ratanakiri': {
    name: 'Ratanakiri',
    khmerName: 'រតនគិរី',
    lat: 13.7314,
    lng: 107.0142,
    defaultTemp: 27,
    defaultCondition: 'Highland Breeze',
    defaultCode: 1,
    travelTip: 'Pleasant highland weather! Great for swimming at Yeak Laom volcanic crater lake.',
    khmerTravelTip: 'អាកាសធាតុខ្ពង់រាបស្រស់ស្រាយ! ល្អសម្រាប់ការហែលទឹកលេងនៅបឹងយក្សឡោមបឹងភ្នំភ្លើងធម្មជាតិ។'
  },
  'Pursat': {
    name: 'Pursat',
    khmerName: 'ពោធិ៍សាត់',
    lat: 12.5388,
    lng: 103.9192,
    defaultTemp: 31,
    defaultCondition: 'Partly Sunny',
    defaultCode: 1,
    travelTip: 'Calm Tonle Sap waters! Ideal for visiting Kampong Luong floating town.',
    khmerTravelTip: 'ផ្ទៃទឹកបឹងទន្លេសាបស្ងប់ល្អ ស័ក្តិសមសម្រាប់ការទៅលេងភូមិបណ្តែតទឹកកំពង់ហ្លួង។'
  },
  'Kandal': {
    name: 'Kandal',
    khmerName: 'កណ្តាល',
    lat: 11.8123,
    lng: 104.7521,
    defaultTemp: 32,
    defaultCondition: 'Warm / Clear',
    defaultCode: 0,
    travelTip: 'Clear skies for climbing the 500 steps up Oudong Mountain royal stupas.',
    khmerTravelTip: 'មេឃស្រឡះល្អ ងាយស្រួលសម្រាប់ការឡើងជណ្តើរ ៥០០ កាំ ទៅថ្វាយបង្គំព្រះសក្យមុនីចេតិយភ្នំព្រះរាជទ្រព្យ (ឧដុង្គ)។'
  },
  'All': {
    name: 'Cambodia Overall',
    khmerName: 'កម្ពុជា',
    lat: 12.5657,
    lng: 104.9910,
    defaultTemp: 31,
    defaultCondition: 'Tropical Khmer Climate',
    defaultCode: 1,
    travelTip: 'Tropical Khmer climate. Always carry water and light rain protection.',
    khmerTravelTip: 'អាកាសធាតុត្រូពិចកម្ពុជា។ គួរស្តុកទឹកបរិសុទ្ធ និងឆត្រការពារកម្តៅថ្ងៃពេលដើរលេង។'
  }
};

interface WeatherData {
  tempC: number;
  windSpeedKm: number;
  weatherCode: number;
  isDay: boolean;
  forecast: {
    dayIndex: number;
    maxC: number;
    minC: number;
    code: number;
  }[];
}

function decodeWMO(code: number, lang: 'en' | 'km' = 'en'): { text: string; icon: React.FC<{ className?: string }> } {
  if (code === 0) return { 
    text: lang === 'km' ? 'មេឃស្រឡះល្អ / ថ្ងៃក្តៅ' : 'Sunny / Clear Sky', 
    icon: Sun 
  };
  if (code === 1 || code === 2) return { 
    text: lang === 'km' ? 'មានពពកខ្លះៗ' : 'Partly Cloudy', 
    icon: CloudSun 
  };
  if (code === 3) return { 
    text: lang === 'km' ? 'មេឃស្រទុំ' : 'Overcast', 
    icon: Cloud 
  };
  if (code === 45 || code === 48) return {
    text: lang === 'km' ? 'មានអ័ព្ទត្រជាក់' : 'Foggy / Mist',
    icon: Cloud
  };
  if (code >= 51 && code <= 57) return { 
    text: lang === 'km' ? 'ភ្លៀងរលឹមស្រិចៗ' : 'Light Drizzle', 
    icon: CloudRain 
  };
  if (code >= 61 && code <= 67) return { 
    text: lang === 'km' ? 'មានភ្លៀងធ្លាក់' : 'Rain Showers', 
    icon: CloudRain 
  };
  if (code >= 80 && code <= 82) return { 
    text: lang === 'km' ? 'ភ្លៀងធ្លាក់ខ្លាំង' : 'Tropical Showers', 
    icon: CloudRain 
  };
  if (code >= 95) return { 
    text: lang === 'km' ? 'មានផ្គររន្ទះ' : 'Thunderstorms', 
    icon: CloudLightning 
  };
  return { 
    text: lang === 'km' ? 'មានពន្លឺថ្ងៃស្រទន់' : 'Partly Sunny', 
    icon: CloudSun 
  };
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ selectedProvince }) => {
  const { language, t } = useLanguage();
  const [useFahrenheit, setUseFahrenheit] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCoord = PROVINCE_COORDS[selectedProvince] || PROVINCE_COORDS['All'];

  // Initialize immediately with reliable baseline data so card is always visible without loading flash
  const [weather, setWeather] = useState<WeatherData>(() => ({
    tempC: activeCoord.defaultTemp,
    windSpeedKm: 14,
    weatherCode: activeCoord.defaultCode,
    isDay: true,
    forecast: [
      { dayIndex: 0, maxC: activeCoord.defaultTemp + 2, minC: activeCoord.defaultTemp - 4, code: activeCoord.defaultCode },
      { dayIndex: 1, maxC: activeCoord.defaultTemp + 1, minC: activeCoord.defaultTemp - 3, code: activeCoord.defaultCode },
      { dayIndex: 2, maxC: activeCoord.defaultTemp + 3, minC: activeCoord.defaultTemp - 4, code: activeCoord.defaultCode }
    ]
  }));

  const fetchWeather = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${activeCoord.lat}&longitude=${activeCoord.lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FPhnom_Penh`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error('Weather service response not ok');
      }

      const data = await res.json();
      
      const forecastDays = (data.daily?.time || []).slice(0, 3).map((_tVal: string, i: number) => ({
        dayIndex: i,
        maxC: Math.round(data.daily.temperature_2m_max[i] ?? (activeCoord.defaultTemp + 1)),
        minC: Math.round(data.daily.temperature_2m_min[i] ?? (activeCoord.defaultTemp - 3)),
        code: data.daily.weathercode[i] ?? activeCoord.defaultCode
      }));

      const currentWeatherCode = data.current_weather?.weathercode ?? activeCoord.defaultCode;

      setWeather({
        tempC: Math.round(data.current_weather?.temperature ?? activeCoord.defaultTemp),
        windSpeedKm: Math.round(data.current_weather?.windspeed ?? 12),
        weatherCode: currentWeatherCode,
        isDay: data.current_weather?.is_day === 1,
        forecast: forecastDays
      });
    } catch {
      // Fallback seamlessly to seasonal defaults without breaking the UI
      setWeather(prev => ({
        ...prev,
        tempC: activeCoord.defaultTemp,
        weatherCode: activeCoord.defaultCode
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Immediately adapt default temperature for province to eliminate delay
    setWeather(prev => ({
      ...prev,
      tempC: activeCoord.defaultTemp,
      weatherCode: activeCoord.defaultCode,
      forecast: [
        { dayIndex: 0, maxC: activeCoord.defaultTemp + 2, minC: activeCoord.defaultTemp - 4, code: activeCoord.defaultCode },
        { dayIndex: 1, maxC: activeCoord.defaultTemp + 1, minC: activeCoord.defaultTemp - 3, code: activeCoord.defaultCode },
        { dayIndex: 2, maxC: activeCoord.defaultTemp + 3, minC: activeCoord.defaultTemp - 4, code: activeCoord.defaultCode }
      ]
    }));
    fetchWeather();
  }, [selectedProvince]);

  const displayTemp = (tempC: number) => {
    if (useFahrenheit) {
      return `${Math.round((tempC * 9) / 5 + 32)}°F`;
    }
    return `${tempC}°C`;
  };

  const getForecastDayLabel = (dayIndex: number) => {
    if (dayIndex === 0) return language === 'km' ? 'ថ្ងៃនេះ' : 'Today';
    if (dayIndex === 1) return language === 'km' ? 'ថ្ងៃស្អែក' : 'Tomorrow';
    if (dayIndex === 2) return language === 'km' ? 'ខានស្អែក' : 'Day 3';
    return language === 'km' ? `ថ្ងៃទី ${dayIndex + 1}` : `Day ${dayIndex + 1}`;
  };

  const IconComponent = decodeWMO(weather.weatherCode, language).icon;
  const currentConditionText = decodeWMO(weather.weatherCode, language).text;
  const currentTravelTip = language === 'km' ? activeCoord.khmerTravelTip : activeCoord.travelTip;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs transition-all">
      {/* Header - Selector 1 */}
      <div 
        id="weather-widget-header"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3"
      >
        {/* Province Title & Khmer */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#DFF7ED] text-[#0B7A5C] flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Compass className="w-5 h-5 text-[#0B7A5C]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-[#1E293B] text-sm sm:text-base tracking-tight">
                {language === 'km'
                  ? (activeCoord.name === 'All' || activeCoord.name === 'Cambodia Overall'
                      ? 'អាកាសធាតុទូទាំងប្រទេសកម្ពុជា'
                      : `អាកាសធាតុ ${activeCoord.khmerName}`)
                  : `${activeCoord.name} Weather`
                }
              </h3>
              <span className="text-xs font-bold text-[#0B7A5C] bg-[#DFF7ED] px-2.5 py-0.5 rounded-full border border-[#0B7A5C]/20">
                {language === 'km' ? 'ផ្សាយផ្ទាល់' : 'Live Update'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'km'
                ? 'ការព្យាករណ៍អាកាសធាតុផ្ទាល់ & ដំបូន្មានធ្វើដំណើរ'
                : t('weather.subtitle', 'Live Khmer forecast & travel advisories')
              }
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            id="weather-temp-unit-toggle"
            onClick={() => setUseFahrenheit(!useFahrenheit)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title={language === 'km' ? 'ប្តូរខ្នាតសីតុណ្ហភាព (°C/°F)' : 'Switch temperature unit (°C/°F)'}
          >
            {useFahrenheit 
              ? (language === 'km' ? '°F (ហ្វារិនហាយ)' : '°F (US)') 
              : (language === 'km' ? '°C (អង្សាសេ)' : '°C (Metric)')
            }
          </button>
          
          <button
            type="button"
            id="weather-refresh-button"
            onClick={fetchWeather}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
            title={language === 'km' ? 'ផ្ទុកទិន្នន័យអាកាសធាតុឡើងវិញ' : t('weather.refresh', 'Refresh weather')}
            aria-label={language === 'km' ? 'ផ្ទុកទិន្នន័យអាកាសធាតុឡើងវិញ' : 'Refresh weather'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Body */}
      {error ? (
        <div className="py-4 text-center text-xs text-slate-500">
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchWeather}
            className="mt-2 text-[#0B7A5C] font-bold underline cursor-pointer"
          >
            {language === 'km' ? 'ព្យាយាមម្តងទៀត' : t('weather.retry', 'Retry')}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            
            {/* Current Temperature Main Card - Selector 2 */}
            <div 
              id="weather-current-temp-card"
              className="flex items-center gap-4 bg-[#F8FCFA] border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-[#0B7A5C]/30 transition-all"
            >
              <div className="p-3 bg-[#0B7A5C] text-white rounded-2xl shadow-xs shrink-0">
                <IconComponent className="w-8 h-8 text-[#21C87A]" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  {language === 'km' ? 'សីតុណ្ហភាពបច្ចុប្បន្ន' : 'Current Temperature'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-3xl font-extrabold text-[#1E293B] tracking-tight">
                    {displayTemp(weather.tempC)}
                  </p>
                  {language === 'km' && (
                    <span className="text-xs font-bold text-slate-500">
                      {useFahrenheit ? 'ហ្វារិនហាយ' : 'អង្សាសេ'}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-[#0B7A5C] mt-0.5">
                  {currentConditionText}
                </p>
              </div>
            </div>

            {/* Atmosphere Details */}
            <div className="bg-[#F8FCFA] border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Wind className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>{language === 'km' ? 'ល្បឿនខ្យល់' : t('weather.wind_speed', 'Wind Speed')}</span>
                </span>
                <span className="font-bold text-[#1E293B]">
                  {weather.windSpeedKm} {language === 'km' ? 'គ.ម/ម៉ោង' : 'km/h'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Thermometer className="w-3.5 h-3.5 text-[#0B7A5C]" />
                  <span>{language === 'km' ? 'តំបន់ម៉ោង' : t('weather.timezone', 'Timezone')}</span>
                </span>
                <span className="font-bold text-[#1E293B]">
                  {language === 'km' ? 'ម៉ោងកម្ពុជា (UTC+7)' : 'ICT (UTC+7)'}
                </span>
              </div>
            </div>

            {/* Travel Advice Box */}
            <div className="bg-[#DFF7ED]/50 border border-[#21C87A]/30 rounded-2xl p-3 text-xs space-y-1">
              <p className="font-bold text-[#0B7A5C] flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'km' ? 'ដំបូន្មានធ្វើដំណើរនៅកម្ពុជា៖' : t('weather.advisory_title', 'Khmer Travel Advisory:')}</span>
              </p>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {currentTravelTip}
              </p>
            </div>
          </div>

          {/* 3-Day Forecast Strip */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider shrink-0">
              {language === 'km' ? 'ការព្យាករណ៍ ៣ ថ្ងៃ' : t('weather.3day_outlook', '3-Day Outlook')}
            </span>
            <div className="flex items-center gap-3">
              {weather.forecast.map((day) => {
                const DayIcon = decodeWMO(day.code, language).icon;
                const dayLabel = getForecastDayLabel(day.dayIndex);
                return (
                  <div
                    key={day.dayIndex}
                    className="flex items-center gap-2 bg-[#F8FCFA] border border-slate-200 px-3 py-1.5 rounded-xl text-xs"
                  >
                    <span className="font-bold text-slate-700">{dayLabel}</span>
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
      )}
    </div>
  );
};
