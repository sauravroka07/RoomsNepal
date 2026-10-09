import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, MapPin, BedDouble, Bath, Tag, Hop as Home, ShieldCheck, Clock, Check, X, CircleAlert as AlertCircle, CreditCard as Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Property, Inquiry, UserRole } from '../types';

interface LandlordDashboardProps {
  onSelectProperty: (propertyId: string) => void;
  onOpenAddModal: () => void;
}

export function LandlordDashboard({ onSelectProperty, onOpenAddModal }: LandlordDashboardProps) {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'listings' | 'inquiries'>('listings');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [propRes, inqRes] = await Promise.all([
        api.getProperties({ ownerId: user.id }),
        api.getInquiries(user.id, 'landlord'),
      ]);
      setProperties(propRes.properties);
      setInquiries(inqRes.inquiries);
    } catch (err) {
      console.error('Failed to load landlord data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user || user.role !== 'landlord') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Landlord Dashboard</h2>
        <p className="text-slate-500">Please sign in as a landlord to access this dashboard.</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.deleteProperty(id, user.id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete property.');
    }
  };

  const handleInquiryStatus = async (id: string, status: string) => {
    if (!user) return;
    try {
      await api.updateInquiry(id, { status, requestUserId: user.id });
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status: status as Inquiry['status'] } : i)));
    } catch (err) {
      alert('Failed to update inquiry.');
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Landlord Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome, {user.name}. Manage your rental listings.</p>
        </div>
        <button onClick={onOpenAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm">
          <Plus className="w-4 h-4" /> Post New Listing
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Building2} label="Total Listings" value={properties.length} />
        <StatCard icon={Check} label="Approved" value={properties.filter((p) => p.approvalStatus === 'approved').length} />
        <StatCard icon={Clock} label="Pending" value={properties.filter((p) => p.approvalStatus === 'pending').length} />
        <StatCard icon={AlertCircle} label="Inquiries" value={inquiries.length} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        <button onClick={() => setTab('listings')} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === 'listings' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          My Listings ({properties.length})
        </button>
        <button onClick={() => setTab('inquiries')} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === 'inquiries' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          Inquiries ({inquiries.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : tab === 'listings' ? (
        properties.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl">
            <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">You haven't posted any listings yet.</p>
            <button onClick={onOpenAddModal} className="text-emerald-600 font-semibold hover:text-emerald-700">Post your first listing</button>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow">
                <div className="w-full sm:w-32 h-32 sm:h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  {property.images.length > 0 ? (
                    <img src={property.images[property.coverPhotoIndex || 0]} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{property.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${statusBadge(property.approvalStatus)}`}>
                      {property.approvalStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {property.neighborhood}, {property.city}</span>
                    <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {property.bedrooms}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {property.propertyType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-600">Rs. {property.monthlyRentNPR.toLocaleString()}/mo</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onSelectProperty(property.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(property.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {property.approvalStatus === 'rejected' && property.rejectionReason && (
                    <p className="text-xs text-red-500 mt-2 bg-red-50 rounded-lg px-3 py-1.5">
                      Rejected: {property.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        inquiries.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No inquiries yet. They will appear here when tenants contact you.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div key={inq.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{inq.tenantName}</h3>
                    <p className="text-xs text-slate-500">{inq.tenantPhone} {inq.tenantEmail && `· ${inq.tenantEmail}`}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    inq.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    inq.status === 'contacted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    inq.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>{inq.status}</span>
                </div>
                <p className="text-sm text-slate-600 mb-1"><span className="font-semibold">Property:</span> {inq.propertyTitle}</p>
                <p className="text-sm text-slate-600 mb-1"><span className="font-semibold">Move-in:</span> {inq.moveInDate}</p>
                <p className="text-sm text-slate-600 mb-3"><span className="font-semibold">Message:</span> {inq.message}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleInquiryStatus(inq.id, 'contacted')} className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">Mark Contacted</button>
                  <button onClick={() => handleInquiryStatus(inq.id, 'rejected')} className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">Reject</button>
                  <button onClick={() => handleInquiryStatus(inq.id, 'closed')} className="px-3 py-1.5 text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100">Close</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <Icon className="w-5 h-5 text-slate-400 mb-2" />
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
