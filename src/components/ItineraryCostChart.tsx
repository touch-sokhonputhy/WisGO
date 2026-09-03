import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { 
  Hotel, 
  Utensils, 
  Car, 
  Ticket, 
  PieChart as PieChartIcon, 
  DollarSign, 
  Users,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { TripPlan } from '../types';
import { getTripCostBreakdown, CostCategoryItem } from '../utils/costBreakdown';

interface ItineraryCostChartProps {
  trip: TripPlan;
  className?: string;
  defaultExpanded?: boolean;
}

const CATEGORY_ICONS = {
  accommodation: Hotel,
  food: Utensils,
  transport: Car,
  activities: Ticket
};

export const ItineraryCostChart: React.FC<ItineraryCostChartProps> = ({
  trip,
  className = '',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'total' | 'perPerson'>('total');

  const summary = getTripCostBreakdown(trip);
  const travelers = summary.travelersCount;
  const isMultipleTravelers = travelers > 1;

  // Transform data if viewing per person
  const chartData = summary.items.map((item) => ({
    ...item,
    chartValue: viewMode === 'perPerson' ? Math.round(item.value / travelers) : item.value
  }));

  const displayedTotal = viewMode === 'perPerson' 
    ? summary.perPersonCost 
    : summary.totalCost;

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handlePieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all ${className}`}>
      {/* Header Bar */}
      <div className="px-4 py-3 sm:px-5 bg-gradient-to-r from-slate-50 via-white to-[#DFF7ED]/20 border-b border-slate-200/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#0B7A5C]/10 text-[#0B7A5C] flex items-center justify-center shrink-0">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                Estimated Cost Breakdown
              </h4>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#0B7A5C] border border-emerald-200/60">
                4 Categories
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              Accommodation, Food, Transport & Activities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Per Person / Total Toggle (when multiple travelers) */}
          {isMultipleTravelers && (
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/70 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('total')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'total'
                    ? 'bg-white text-[#0B7A5C] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Total ({travelers})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('perPerson')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'perPerson'
                    ? 'bg-white text-[#0B7A5C] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Per Person
              </button>
            </div>
          )}

          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
            title={isExpanded ? 'Collapse cost chart' : 'Expand cost chart'}
            aria-label={isExpanded ? 'Collapse cost chart' : 'Expand cost chart'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isExpanded && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Recharts Pie Chart Container */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-w-0">
              <div className="w-full max-w-[240px] h-[190px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as CostCategoryItem & { chartValue: number };
                          return (
                            <div className="bg-slate-900/95 text-white backdrop-blur-xs px-3 py-2 rounded-xl shadow-xl border border-slate-700 text-xs z-50">
                              <div className="flex items-center gap-1.5 font-bold">
                                <span 
                                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                                  style={{ backgroundColor: item.color }} 
                                />
                                <span>{item.name}</span>
                              </div>
                              <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-slate-300">
                                <span className="font-mono text-emerald-400 font-bold">
                                  ${item.chartValue.toLocaleString()} USD
                                </span>
                                <span className="font-bold bg-white/15 px-1.5 py-0.2 rounded text-[10px]">
                                  {item.percentage}%
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={chartData}
                      dataKey="chartValue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      stroke="#ffffff"
                      strokeWidth={2}
                      onMouseEnter={handlePieEnter}
                      onMouseLeave={handlePieLeave}
                      cursor="pointer"
                    >
                      {chartData.map((entry, index) => {
                        const isSelected = activeIndex === index;
                        return (
                          <Cell
                            key={`cell-${entry.id}-${index}`}
                            fill={entry.color}
                            opacity={activeIndex === null || isSelected ? 1 : 0.45}
                            stroke={isSelected ? '#0B7A5C' : '#ffffff'}
                            strokeWidth={isSelected ? 3 : 2}
                            style={{
                              filter: isSelected ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' : 'none',
                              transition: 'all 0.2s ease-in-out'
                            }}
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {activeIndex !== null ? chartData[activeIndex].name : (viewMode === 'perPerson' ? 'Per Person' : 'Total Est.')}
                  </span>
                  <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-mono">
                    ${activeIndex !== null ? chartData[activeIndex].chartValue.toLocaleString() : displayedTotal.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {activeIndex !== null ? `${chartData[activeIndex].percentage}% of budget` : 'USD ($)'}
                  </span>
                </div>
              </div>

              {/* Mobile quick hint */}
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Hover or tap slices to view category details</span>
              </p>
            </div>

            {/* Category Breakdown Cards (Accommodation, Food, Transport, Activities) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {summary.items.map((cat, idx) => {
                const IconComponent = CATEGORY_ICONS[cat.id];
                const isSelected = activeIndex === idx;
                const valueToShow = viewMode === 'perPerson' 
                  ? Math.round(cat.value / travelers) 
                  : cat.value;

                return (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0B7A5C] bg-[#DFF7ED]/20 shadow-xs ring-1 ring-[#0B7A5C]/20'
                        : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                          style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {cat.name}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.badgeClass}`}>
                        {cat.percentage}%
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2 mt-1">
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        ${valueToShow.toLocaleString()}
                        <span className="text-[10px] font-normal text-slate-500 font-sans ml-1">
                          USD
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-500 truncate text-right">
                        {cat.detail}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer note with travelers & tier info */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3 h-3 text-[#0B7A5C]" />
              <span>
                Based on <strong>{trip.budgetTier || 'moderate'}</strong> tier rates in Cambodia (PassApp tuk-tuks, local Khmer dining, Angkor/cultural passes).
              </span>
            </div>
            {isMultipleTravelers && (
              <div className="flex items-center gap-1 text-slate-600 font-medium">
                <Users className="w-3 h-3 text-slate-400" />
                <span>Calculated for {travelers} travelers</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
