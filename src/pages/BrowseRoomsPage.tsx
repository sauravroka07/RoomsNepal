import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Building2, RotateCcw } from 'lucide-react';
import { Property, FilterState } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFilters } from '../components/PropertyFilters';
import { api } from '../services/api';

interface BrowseRoomsPageProps {
  initialFilters?: Partial<FilterState>;
  onSelectProperty: (propertyId: string) => void;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  city: 'all',
  neighborhood: '',
  propertyType: 'all',
  furnished: 'all',
  minRent: '',
  maxRent: '',
  bedrooms: 'all',
  availability: 'all',
  sortBy: 'newest',
};

export const BrowseRoomsPage: React.FC<BrowseRoomsPageProps> = ({
  initialFilters = {},
  onSelectProperty,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);

  // Sync initial filters when props change
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  // Load properties whenever filters or page changes
  useEffect(() => {
    let isCancelled = false;
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await api.getProperties({
          ...filters,
          page,
          limit,
        });
        if (!isCancelled) {
          setProperties(res.properties);
          setTotalCount(res.total);
        }
      } catch (err) {
        console.error('Failed to load listings', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchRooms();
    return () => {
      isCancelled = true;
    };
  }, [filters, page, limit]);

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Browse Rooms, Flats & Apartments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified room listings across Kathmandu, Lalitpur, Bhaktapur, and Pokhara
          </p>
        </div>

        {/* Global Keyword Search bar */}
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            placeholder="Search keyword (e.g. WiFi, Balcony, Flat)..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Main Browse Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <PropertyFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              totalCount={totalCount}
            />
          </div>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded-xl flex items-center gap-2 shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Filters ({totalCount})</span>
          </button>

          {/* Mobile Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1 bg-white p-4 rounded-2xl border border-slate-200">
            <PropertyFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              totalCount={totalCount}
            />
          </div>
        )}

        {/* Listings Catalog Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Bar with Sort Dropdown */}
          <div className="hidden lg:flex items-center justify-between pb-2 border-b border-slate-200/80">
            <div className="text-xs font-medium text-slate-500">
              Showing <span className="font-bold text-slate-900">{properties.length}</span> of{' '}
              <span className="font-bold text-slate-900">{totalCount}</span> properties
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="newest">Newest Listed</option>
                <option value="price_asc">Price: Lowest (Rs.) First</option>
                <option value="price_desc">Price: Highest (Rs.) First</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 py-12">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse"
                >
                  <div className="aspect-4/3 bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-5 bg-slate-100 rounded w-1/3 pt-2" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No properties available yet. Check back soon as landlords add their listings.
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {totalCount === 0
                  ? "RoomsNepal strictly features genuine, administrator-approved property listings. Check back soon as verified homeowners publish new rooms and flats."
                  : "We couldn't find any listings matching your specific combination of filters. Try widening your price range, choosing 'All Cities', or clearing keyword search."}
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl inline-flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            /* Properties Grid */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onSelect={onSelectProperty}
                  />
                ))}
              </div>

              {/* Pagination controls */}
              {totalCount > limit && (
                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500 font-mono">
                    Page {page} of {Math.ceil(totalCount / limit)}
                  </span>
                  <button
                    disabled={page * limit >= totalCount}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
