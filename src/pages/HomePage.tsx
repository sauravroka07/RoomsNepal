import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Shield, ArrowRight, PlusCircle, CheckCircle2, Building2 } from 'lucide-react';
import { Property, FilterState } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  featuredProperties: Property[];
  onSelectProperty: (propertyId: string) => void;
  onNavigateBrowse: (initialFilters?: Partial<FilterState>) => void;
  onOpenAddListing: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  featuredProperties,
  onSelectProperty,
  onNavigateBrowse,
  onOpenAddListing,
}) => {
  const { user } = useAuth();
  const [searchCity, setSearchCity] = useState('Kathmandu');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchBudget, setSearchBudget] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateBrowse({
      city: searchCity,
      neighborhood: searchLocation,
      propertyType: searchType,
      maxRent: searchBudget ? Number(searchBudget) : '',
    });
  };

  const POPULAR_LOCATIONS = [
    {
      city: 'Kathmandu',
      subtitle: 'New Baneshwor, Thamel, Koteshwor, Baluwatar',
      tag: 'Capital Valley',
    },
    {
      city: 'Lalitpur',
      subtitle: 'Jhamsikhel, Kupondole, Sanepa, Pulchowk',
      tag: 'Historic & Modern Hub',
    },
    {
      city: 'Pokhara',
      subtitle: 'Lakeside, Zero KM, Prithvi Chowk, Nadipur',
      tag: 'Lake & Mountain Valley',
    },
    {
      city: 'Bhaktapur',
      subtitle: 'Suryabinayak, Sallaghari, Thimi, Kamalbinayak',
      tag: 'Cultural Heritage Valley',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl min-h-[480px] lg:min-h-[560px] flex items-center">
            {/* Background Image with Contrast Scrim */}
            <div className="absolute inset-0 z-0">
              <img
                src="/images/hero_rooms_nepal.jpg"
                alt="Room rental in Nepal with mountain view"
                className="w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
            </div>

            {/* Hero Copy & Search Bar */}
            <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-10 py-12 text-center flex flex-col items-center">
              {/* Natural editorial kicker without pill box */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-4 tracking-wide uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Nepal’s Dedicated Room & Flat Rental Marketplace</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
                Find Your Perfect Room in Nepal
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Connect directly with property owners across Kathmandu, Lalitpur, Bhaktapur, and Pokhara. Verified rooms, transparent water & sub-meter terms, and zero brokerage fees.
              </p>

              {/* Integrated Hero Search Form */}
              <form
                onSubmit={handleHeroSearch}
                className="mt-8 w-full bg-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-slate-200/80 text-left"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* City */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      City
                    </label>
                    <div className="relative">
                      <select
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Kathmandu">Kathmandu</option>
                        <option value="Lalitpur">Lalitpur</option>
                        <option value="Pokhara">Pokhara</option>
                        <option value="Bhaktapur">Bhaktapur</option>
                        <option value="all">All Cities</option>
                      </select>
                    </div>
                  </div>

                  {/* Neighborhood */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Area / Neighborhood
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        placeholder="e.g. Baneshwor, Jhamsikhel"
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Property Type
                    </label>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">All Types</option>
                      <option value="Single Room">Single Room</option>
                      <option value="Shared Room">Shared Room</option>
                      <option value="Studio">Studio</option>
                      <option value="1BHK Flat">1BHK Flat</option>
                      <option value="2BHK Flat">2BHK Flat</option>
                      <option value="3BHK+ Flat">3BHK+ Flat</option>
                    </select>
                  </div>

                  {/* Monthly Budget */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Max Rent (NPR / Rs.)
                    </label>
                    <input
                      type="number"
                      value={searchBudget}
                      onChange={(e) => setSearchBudget(e.target.value)}
                      placeholder="e.g. 20000"
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Search Submit CTA */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Free service for tenants — direct owner contact</span>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Search Available Rooms</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Locations in Nepal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Popular Cities & Rental Hubs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore handpicked neighborhoods with easy public transport, water supply, and markets
            </p>
          </div>
          <button
            onClick={() => onNavigateBrowse()}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Nepal Areas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_LOCATIONS.map((loc) => (
            <div
              key={loc.city}
              onClick={() => onNavigateBrowse({ city: loc.city })}
              className="group relative h-36 rounded-2xl overflow-hidden cursor-pointer bg-slate-900 border border-slate-800 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-400">
                  {loc.tag}
                </span>
                <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {loc.city}
                </h3>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {loc.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Room Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
              Verified Properties
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Featured Rooms & Flats
            </h2>
          </div>
          <button
            onClick={() => onNavigateBrowse()}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            <span>Explore All Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredProperties.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 max-w-2xl mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No properties available yet. Check back soon as landlords add their listings.
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              RoomsNepal strictly requires administrator verification of genuine homeowner submissions before listings are published to the public.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenAddListing}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Are you a homeowner? List your property free
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.slice(0, 6).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSelect={onSelectProperty}
              />
            ))}
          </div>
        )}
      </section>

      {/* How RoomsNepal Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
              Simple & Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              How RoomsNepal Works
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Say goodbye to middlemen, excessive commissions, and misleading room descriptions in Kathmandu Valley.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-bold flex items-center justify-center font-mono">
                01
              </div>
              <h3 className="text-base font-bold text-white">Search & Filter</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Filter by verified 24/7 water supply (Melamchi/groundwater), furnished status, separate sub-meter electricity, and your exact NPR budget.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-bold flex items-center justify-center font-mono">
                02
              </div>
              <h3 className="text-base font-bold text-white">Direct Owner Connection</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Send an inquiry directly to the landlord or schedule an in-person inspection visit without any broker commission.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-bold flex items-center justify-center font-mono">
                03
              </div>
              <h3 className="text-base font-bold text-white">Move In With Peace</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Agree on rental terms, sign your tenancy agreement, and move into your clean new home with transparent monthly utility costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Landlord Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 rounded-3xl border border-emerald-200/80 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>For House & Flat Owners in Nepal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Have an Empty Room or Flat in Nepal?
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              List your vacant property in less than 2 minutes. Receive direct inquiries from verified students and professionals without paying commission to middle agents.
            </p>
            <div className="pt-1 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Free Listing
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Direct Tenant Inquiries & Visits
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Toggle Available / Rented
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOpenAddListing}
              className="px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>List Your Property Free</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
