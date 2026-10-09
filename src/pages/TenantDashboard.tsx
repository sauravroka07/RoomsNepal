import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  MessageSquare,
  User as UserIcon,
  Phone,
  Mail,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Building2
} from 'lucide-react';
import { Property, Inquiry } from '../types';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from '../components/PropertyCard';
import { api } from '../services/api';

interface TenantDashboardProps {
  onSelectProperty: (id: string) => void;
  onNavigateBrowse: () => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
  onSelectProperty,
  onNavigateBrowse,
}) => {
  const { user, savedPropertyIds, toggleSave, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'saved' | 'inquiries' | 'profile'>('saved');
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile fields
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileSaved, setProfileSaved] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const savedData = await api.getSavedProperties(user.id);
      setSavedProperties(savedData.properties);

      const inqData = await api.getInquiries(user.id, 'tenant');
      setInquiries(inqData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, savedPropertyIds]);

  const handleRemoveSaved = async (propId: string) => {
    await toggleSave(propId);
    setSavedProperties(prev => prev.filter(p => p.id !== propId));
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updatedUser = {
      ...user,
      name: profileName.trim(),
      phone: profilePhone.trim(),
    };
    localStorage.setItem('roomsnepal_current_user', JSON.stringify(updatedUser));
    setProfileSaved(true);
    showToast('Profile information updated successfully!');
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <span>Tenant Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Namaste, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your saved favorites, sent room inquiries, and personal rental profile.
          </p>
        </div>

        <button
          onClick={onNavigateBrowse}
          className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4 text-emerald-400" />
          <span>Browse More Rooms</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'saved'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Properties ({savedProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'inquiries'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Inquiries ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Tenant Profile</span>
        </button>
      </div>

      {/* Tab 1: Saved Properties */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedProperties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No saved properties</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click the heart icon on any room or flat card to bookmark properties and compare them later.
              </p>
              <button
                onClick={onNavigateBrowse}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-xl inline-flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Browse Available Rooms</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((prop) => (
                <div key={prop.id} className="relative group">
                  <PropertyCard
                    property={prop}
                    onSelect={onSelectProperty}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSaved(prop.id);
                    }}
                    className="absolute bottom-4 right-4 p-2 bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 shadow-2xs transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sent Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No sent inquiries</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When you contact a landlord through RoomsNepal, your message and status updates will be logged here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <h4
                        onClick={() => onSelectProperty(inq.propertyId)}
                        className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{inq.propertyTitle}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {inq.propertyCity} · Rent: Rs. {new Intl.NumberFormat('en-IN').format(inq.propertyRent)} / month
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Inquiry Status:</span>
                      <span
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase ${
                          inq.status === 'contacted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inq.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : inq.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block mb-1">Your Sent Message:</span>
                    "{inq.message}"
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                    <div>Requested Move-in: <span className="font-semibold text-slate-700">{inq.moveInDate}</span></div>
                    <div>Sent on: {new Date(inq.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Tenant Profile Details</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your contact details up to date for fast landlord responses.
            </p>
          </div>

          {profileSaved && (
            <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Your profile changes have been saved!</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none"
                />
                <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email (Account ID)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg pl-8 pr-3 py-2.5 text-slate-500 cursor-not-allowed"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Nepali Contact Mobile</label>
              <div className="relative">
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+977 98xxxxxxxx"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none font-mono"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
