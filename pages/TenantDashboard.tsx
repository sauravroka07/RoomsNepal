import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Hop as Home, MapPin, BedDouble, Bath, Tag, ShieldCheck, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Property, Inquiry } from '../types';

interface TenantDashboardProps {
  onSelectProperty: (propertyId: string) => void;
  onNavigateBrowse: () => void;
}

export function TenantDashboard({ onSelectProperty, onNavigateBrowse }: TenantDashboardProps) {
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'saved' | 'inquiries'>('saved');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [savedRes, inqRes] = await Promise.all([
        api.getSaved(user.id),
        api.getInquiries(user.id, 'tenant'),
      ]);
      setSavedProperties(savedRes.properties);
      setInquiries(inqRes.inquiries);
    } catch (err) {
      console.error('Failed to load tenant data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUnsave = async (propertyId: string) => {
    if (!user) return;
    try {
      await api.unsaveProperty(propertyId, user.id);
      setSavedProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (err) {
      console.error('Failed to unsave:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Tenant Dashboard</h2>
        <p className="text-slate-500">Please sign in as a tenant to access this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tenant Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome, {user.name}. Track your saved properties and inquiries.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <Heart className="w-5 h-5 text-slate-400 mb-2" />
          <div className="text-2xl font-bold text-slate-900">{savedProperties.length}</div>
          <div className="text-xs text-slate-500">Saved Properties</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <Search className="w-5 h-5 text-slate-400 mb-2" />
          <div className="text-2xl font-bold text-slate-900">{inquiries.length}</div>
          <div className="text-xs text-slate-500">Inquiries Sent</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <Home className="w-5 h-5 text-slate-400 mb-2" />
          <div className="text-2xl font-bold text-slate-900">{inquiries.filter((i) => i.status === 'contacted').length}</div>
          <div className="text-xs text-slate-500">Responses Received</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        <button onClick={() => setTab('saved')} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === 'saved' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          Saved ({savedProperties.length})
        </button>
        <button onClick={() => setTab('inquiries')} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === 'inquiries' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          My Inquiries ({inquiries.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : tab === 'saved' ? (
        savedProperties.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">You haven't saved any properties yet.</p>
            <button onClick={onNavigateBrowse} className="text-emerald-600 font-semibold hover:text-emerald-700">Browse listings</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelectProperty(property.id)}>
                <div className="flex gap-3">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {property.images.length > 0 ? (
                      <img src={property.images[property.coverPhotoIndex || 0]} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-1">{property.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <MapPin className="w-3 h-3" /> {property.neighborhood}, {property.city}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {property.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {property.bathrooms}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-600 text-sm">Rs. {property.monthlyRentNPR.toLocaleString()}/mo</span>
                      <button onClick={(e) => { e.stopPropagation(); handleUnsave(property.id); }} className="text-slate-400 hover:text-red-500">
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        inquiries.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">You haven't made any inquiries yet.</p>
            <button onClick={onNavigateBrowse} className="text-emerald-600 font-semibold hover:text-emerald-700">Browse listings</button>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div key={inq.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 text-sm">{inq.propertyTitle}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    inq.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    inq.status === 'contacted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    inq.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>{inq.status}</span>
                </div>
                <p className="text-sm text-slate-600 mb-1"><span className="font-semibold">Rent:</span> Rs. {inq.propertyRent.toLocaleString()}/mo</p>
                <p className="text-sm text-slate-600 mb-1"><span className="font-semibold">Move-in:</span> {inq.moveInDate}</p>
                <p className="text-sm text-slate-600 mb-2"><span className="font-semibold">Your message:</span> {inq.message}</p>
                <button onClick={() => onSelectProperty(inq.propertyId)} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  View Property
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
