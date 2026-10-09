import React, { useState, useEffect } from 'react';
import { Search, MapPin, BedDouble, Bath, Tag, ArrowRight, Building2, Users, ShieldCheck, Sparkles, Hop as Home, Star } from 'lucide-react';
import type { Property, FilterState } from '../types';
import { api } from '../services/api';

interface HomePageProps {
  featuredProperties: Property[];
  onSelectProperty: (propertyId: string) => void;
  onNavigateBrowse: (filters?: Partial<FilterState>) => void;
  onOpenAddListing: () => void;
}

export function HomePage({ featuredProperties, onSelectProperty, onNavigateBrowse, onOpenAddListing }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('all');

  const handleSearch = () => {
    onNavigateBrowse({ search: searchQuery, city: searchCity });
  };

  const stats = [
    { icon: Building2, label: 'Active Listings', value: `${featuredProperties.length}+` },
    { icon: Users, label: 'Happy Tenants', value: '500+' },
    { icon: ShieldCheck, label: 'Verified Landlords', value: '100+' },
    { icon: MapPin, label: 'Cities Covered', value: '4' },
  ];

  const features = [
    { icon: ShieldCheck, title: 'Verified Listings', desc: 'Every listing is reviewed and approved by our admin team before going live.' },
    { icon: Users, title: 'Direct Contact', desc: 'Connect directly with landlords. No brokers, no middlemen, zero commission.' },
    { icon: Sparkles, title: 'AI Rental Assistant', desc: 'Get instant help from Sathi AI for rental advice, pricing, and property matching.' },
    { icon: Home, title: 'All Over Nepal', desc: 'Listings across Kathmandu, Lalitpur, Bhaktapur, and Pokhara with more cities coming.' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16,185,129,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(20,184,166,0.2) 0%, transparent 40%)',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-4">
              Find Your Perfect <span className="text-emerald-400">Room</span> or <span className="text-emerald-400">Flat</span> in Nepal
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Browse verified rental listings across Kathmandu, Lalitpur, Bhaktapur, and Pokhara.
              Connect directly with landlords. Zero broker commissions.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by neighborhood, type, or amenity..."
                  className="w-full py-2.5 text-slate-900 placeholder-slate-400 outline-none text-sm"
                />
              </div>
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="px-3 py-2.5 text-slate-700 text-sm border border-slate-200 rounded-lg outline-none"
              >
                <option value="all">All Cities</option>
                <option value="Kathmandu">Kathmandu</option>
                <option value="Lalitpur">Lalitpur</option>
                <option value="Bhaktapur">Bhaktapur</option>
                <option value="Pokhara">Pokhara</option>
              </select>
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Search <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <Icon className="w-6 h-6 text-emerald-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-300">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Why RoomsNepal?</h2>
          <p className="text-slate-500">The trusted rental platform built for Nepal.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Listings</h2>
            <p className="text-slate-500 text-sm mt-1">Handpicked rooms and flats available now.</p>
          </div>
          <button
            onClick={() => onNavigateBrowse()}
            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {featuredProperties.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl">
            <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No listings available yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} onClick={() => onSelectProperty(property.id)} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Have a Room or Flat to Rent?</h2>
          <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
            List your property for free and reach thousands of tenants across Nepal. Our AI assistant can even help you write a better description.
          </p>
          <button
            onClick={onOpenAddListing}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-700 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Post a Listing <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

function PropertyCard({ property, onClick }: { property: Property; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden text-left hover:shadow-lg transition-all"
    >
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {property.images.length > 0 ? (
          <img
            src={property.images[property.coverPhotoIndex || 0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
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
          <MapPin className="w-3.5 h-3.5" />
          {property.neighborhood}, {property.city}
        </div>
        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {property.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {property.bedrooms} Bed</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms} Bath</span>
          <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {property.propertyType}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-extrabold text-emerald-600">Rs. {property.monthlyRentNPR.toLocaleString()}</span>
          <span className="text-xs text-slate-400">/month</span>
        </div>
      </div>
    </button>
  );
}
