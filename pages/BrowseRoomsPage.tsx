import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, BedDouble, Bath, Tag, Hop as Home, ShieldCheck, ChevronLeft, ChevronRight, ListFilter as Filter, X } from 'lucide-react';
import type { Property, FilterState } from '../types';
import { api } from '../services/api';

interface BrowseRoomsPageProps {
  initialFilters: Partial<FilterState>;
  onSelectProperty: (propertyId: string) => void;
}

const CITIES = ['all', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara'];
const PROPERTY_TYPES = ['all', 'Single Room', 'Studio', '1BHK Flat', '2BHK Flat', '3BHK Flat', 'Shared Room'];
const FURNISH_OPTIONS = ['all', 'Furnished', 'Semi-Furnished', 'Unfurnished'];
const BEDROOMS = ['all', '1', '2', '3+'];
const AVAILABILITY = ['all', 'available', 'rented'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export function BrowseRoomsPage({ initialFilters, onSelectProperty }: BrowseRoomsPageProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    city: initialFilters.city || 'all',
    neighborhood: '',
    search: initialFilters.search || '',
    type: initialFilters.type || 'all',
    furnished: initialFilters.furnished || 'all',
    minRent: initialFilters.minRent || '',
    maxRent: initialFilters.maxRent || '',
    bedrooms: initialFilters.bedrooms || 'all',
    availability: initialFilters.availability || 'available',
    sortBy: initialFilters.sortBy || 'newest',
    page: 1,
    limit: 9,
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getProperties(filters);
      setProperties(res.properties);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      city: 'all', neighborhood: '', search: '', type: 'all', furnished: 'all',
      minRent: '', maxRent: '', bedrooms: 'all', availability: 'available',
      sortBy: 'newest', page: 1, limit: 9,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Browse Rooms &amp; Flats</h1>
        <p className="text-slate-500 text-sm mt-1">{total} {total === 1 ? 'listing' : 'listings'} found across Nepal.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'fixed inset-0 z-50 bg-black/50 lg:bg-transparent lg:static' : 'hidden lg:block'}`}>
          <div className={`bg-white rounded-xl border border-slate-200 p-5 ${showFilters ? 'fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-b-none lg:static lg:rounded-xl' : ''}`}>
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="font-bold text-slate-900">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Neighborhood, amenity..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* City */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">City</label>
              <select value={filters.city} onChange={(e) => updateFilter('city', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
                {CITIES.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Cities' : c}</option>)}
              </select>
            </div>

            {/* Property Type */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Property Type</label>
              <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
              </select>
            </div>

            {/* Furnished */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Furnished</label>
              <select value={filters.furnished} onChange={(e) => updateFilter('furnished', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
                {FURNISH_OPTIONS.map((f) => <option key={f} value={f}>{f === 'all' ? 'Any' : f}</option>)}
              </select>
            </div>

            {/* Bedrooms */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Bedrooms</label>
              <select value={filters.bedrooms} onChange={(e) => updateFilter('bedrooms', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
                {BEDROOMS.map((b) => <option key={b} value={b}>{b === 'all' ? 'Any' : b}</option>)}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Price Range (NPR)</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" placeholder="Min" value={filters.minRent} onChange={(e) => updateFilter('minRent', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                <span className="text-slate-400">-</span>
                <input type="number" min="0" placeholder="Max" value={filters.maxRent} onChange={(e) => updateFilter('maxRent', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            {/* Sort */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Sort By</label>
              <select value={filters.sortBy} onChange={(e) => updateFilter('sortBy', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <button onClick={resetFilters} className="w-full py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">
              Reset Filters
            </button>
          </div>
        </aside>

        {/* Listings Grid */}
        <div className="flex-1">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 mb-4 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-6 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50 rounded-xl">
              <p className="text-red-600">{error}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-xl">
              <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No properties match your filters. Try adjusting your search.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => onSelectProperty(property.id)}
                    className="group bg-white rounded-xl border border-slate-200 overflow-hidden text-left hover:shadow-lg transition-all"
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      {property.images.length > 0 ? (
                        <img src={property.images[property.coverPhotoIndex || 0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-10 h-10 text-slate-300" />
                        </div>
                      )}
                      {property.isVerified && (
                        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                        <MapPin className="w-3.5 h-3.5" /> {property.neighborhood}, {property.city}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-emerald-700">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {property.bedrooms}</span>
                        <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms}</span>
                        <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {property.propertyType}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-emerald-600">Rs. {property.monthlyRentNPR.toLocaleString()}</span>
                        <span className="text-xs text-slate-400">/month</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page <= 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-slate-600 px-4">
                    Page {filters.page} of {totalPages}
                  </span>
                  <button
                    onClick={() => updateFilter('page', Math.min(totalPages, filters.page + 1))}
                    disabled={filters.page >= totalPages}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
