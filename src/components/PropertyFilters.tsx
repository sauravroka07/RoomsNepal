import React from 'react';
import { FilterState } from '../types';
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react';

interface PropertyFiltersProps {
  filters: FilterState;
  onChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  totalCount?: number;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span>Filters</span>
          {totalCount !== undefined && (
            <span className="text-xs font-normal text-slate-500 font-mono">
              ({totalCount} found)
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          className="text-xs font-medium text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* City Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Target City</label>
        <select
          value={filters.city}
          onChange={(e) => onChange({ city: e.target.value })}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">All Nepal Cities</option>
          <option value="Kathmandu">Kathmandu</option>
          <option value="Lalitpur">Lalitpur (Patan)</option>
          <option value="Bhaktapur">Bhaktapur</option>
          <option value="Pokhara">Pokhara</option>
        </select>
      </div>

      {/* Neighborhood / Area Text Filter */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Neighborhood / Landmark</label>
        <div className="relative">
          <input
            type="text"
            value={filters.neighborhood}
            onChange={(e) => onChange({ neighborhood: e.target.value })}
            placeholder="e.g. Baneshwor, Jhamsikhel, Lakeside..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Property Type</label>
        <select
          value={filters.propertyType}
          onChange={(e) => onChange({ propertyType: e.target.value })}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">All Types</option>
          <option value="Single Room">Single Room</option>
          <option value="Shared Room">Shared Room</option>
          <option value="Studio">Studio Apartment</option>
          <option value="1BHK Flat">1BHK Flat</option>
          <option value="2BHK Flat">2BHK Flat</option>
          <option value="3BHK+ Flat">3BHK+ Flat</option>
        </select>
      </div>

      {/* Budget Range (NPR) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Monthly Rent (NPR / Rs.)</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500">Min (Rs.)</span>
            <input
              type="number"
              placeholder="0"
              value={filters.minRent}
              onChange={(e) => onChange({ minRent: e.target.value ? Number(e.target.value) : '' })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Max (Rs.)</span>
            <input
              type="number"
              placeholder="50000"
              value={filters.maxRent}
              onChange={(e) => onChange({ maxRent: e.target.value ? Number(e.target.value) : '' })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Furnishing */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Furnishing</label>
        <select
          value={filters.furnished}
          onChange={(e) => onChange({ furnished: e.target.value })}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">Any Furnishing</option>
          <option value="Furnished">Furnished</option>
          <option value="Semi-Furnished">Semi-Furnished</option>
          <option value="Unfurnished">Unfurnished</option>
        </select>
      </div>

      {/* Bedrooms */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Bedrooms</label>
        <div className="grid grid-cols-4 gap-1.5">
          {['all', '1', '2', '3'].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onChange({ bedrooms: b })}
              className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                filters.bedrooms === b
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {b === 'all' ? 'All' : b === '3' ? '3+' : `${b} Bed`}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Status */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Availability</label>
        <select
          value={filters.availability}
          onChange={(e) => onChange({ availability: e.target.value as any })}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">All (Available & Rented)</option>
          <option value="available">Available Now Only</option>
          <option value="rented">Rented History</option>
        </select>
      </div>
    </div>
  );
};
