import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, BedDouble, Bath, Building, Tag, Check, ShieldCheck, Phone, Mail, MessageCircle, Heart, Share2, Flag, Hop as Home, Droplets, Zap, Calendar, Send, Loader as Loader2 } from 'lucide-react';
import type { Property, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface PropertyDetailPageProps {
  propertyId: string;
  onBack: () => void;
  onSelectProperty: (propertyId: string) => void;
  onOpenAuth: (mode: 'login' | 'register' | 'admin', initialRole?: UserRole) => void;
}

export function PropertyDetailPage({ propertyId, onBack, onOpenAuth }: PropertyDetailPageProps) {
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inquiry, setInquiry] = useState({ name: '', email: '', phone: '', moveInDate: '', message: '' });

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.getProperty(propertyId, user?.id);
        setProperty(res.property);
        if (user) {
          const saved = await api.getSaved(user.id);
          setIsSaved(saved.savedIds.includes(propertyId));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId, user]);

  const handleSave = async () => {
    if (!user) {
      onOpenAuth('login', 'tenant');
      return;
    }
    try {
      if (isSaved) {
        await api.unsaveProperty(propertyId, user.id);
        setIsSaved(false);
      } else {
        await api.saveProperty(propertyId, user.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handleInquiry = async () => {
    if (!inquiry.name || !inquiry.phone || !inquiry.message) return;
    setSubmitting(true);
    try {
      await api.createInquiry({
        propertyId,
        tenantId: user?.id || 'guest-tenant',
        tenantName: inquiry.name,
        tenantEmail: inquiry.email,
        tenantPhone: inquiry.phone,
        moveInDate: inquiry.moveInDate || 'Flexible',
        message: inquiry.message,
      });
      setInquirySent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-32" />
          <div className="h-80 bg-slate-200 rounded-xl" />
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error || 'Property not found.'}</p>
        <button onClick={onBack} className="text-emerald-600 font-semibold hover:text-emerald-700">Back to listings</button>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/977${property.whatsappPhone || property.ownerPhone}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Listings
      </button>

      {/* Image Gallery */}
      <div className="relative h-64 sm:h-96 bg-slate-100 rounded-xl overflow-hidden mb-4">
        {property.images.length > 0 ? (
          <img src={property.images[activeImage]} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-16 h-16 text-slate-300" />
          </div>
        )}
        {property.isVerified && (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Verified
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {property.images.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {property.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${activeImage === i ? 'border-emerald-500' : 'border-transparent'}`}
            >
              <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + Actions */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{property.title}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={handleSave} className={`p-2 rounded-lg border transition-colors ${isSaved ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'border-slate-200 text-slate-400 hover:text-emerald-500'}`}>
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-emerald-500' : ''}`} />
                </button>
                <button onClick={() => setShowReportModal(true)} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500">
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-4 h-4" /> {property.fullAddress}
            </div>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms },
              { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
              { icon: Building, label: 'Floor', value: property.floor },
              { icon: Tag, label: 'Type', value: property.propertyType },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <Icon className="w-5 h-5 text-slate-400 mb-1.5" />
                  <div className="text-sm font-bold text-slate-900">{item.value}</div>
                  <div className="text-xs text-slate-500">{item.label}</div>
                </div>
              );
            })}
          </div>

          {/* Description */}
          <div>
            <h2 className="font-bold text-slate-900 mb-2">Description</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
          </div>

          {/* Utilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
              <Droplets className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-xs text-slate-500">Water Supply</div>
                <div className="text-sm font-semibold text-slate-900">{property.waterSupply}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-amber-50 rounded-lg p-3 border border-amber-100">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-xs text-slate-500">Electricity</div>
                <div className="text-sm font-semibold text-slate-900">{property.electricity}</div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div>
              <h2 className="font-bold text-slate-900 mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span key={amenity} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium px-3 py-1.5 rounded-full border border-emerald-100">
                    <Check className="w-3.5 h-3.5" /> {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-5 h-5 text-slate-400" />
            <span className="text-slate-600">Available from: <span className="font-semibold text-slate-900">{property.availableFrom}</span></span>
          </div>
        </div>

        {/* Sidebar: Price + Contact */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20">
            <div className="mb-4">
              <div className="text-3xl font-extrabold text-emerald-600">Rs. {property.monthlyRentNPR.toLocaleString()}</div>
              <div className="text-sm text-slate-400">per month</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <div className="text-xs text-slate-500 mb-1">Security Deposit</div>
              <div className="text-lg font-bold text-slate-900">Rs. {property.securityDepositNPR.toLocaleString()}</div>
            </div>

            <div className="border-t border-slate-100 pt-4 mb-4">
              <div className="text-xs text-slate-500 mb-1">Listed by</div>
              <div className="font-semibold text-slate-900">{property.ownerName}</div>
            </div>

            {/* Inquiry Form */}
            {inquirySent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center mb-4">
                <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-700">Inquiry sent successfully!</p>
                <p className="text-xs text-emerald-600 mt-1">The landlord will contact you soon.</p>
              </div>
            ) : showInquiryForm ? (
              <div className="space-y-3 mb-4">
                <input type="text" placeholder="Your Name *" value={inquiry.name} onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                <input type="email" placeholder="Email" value={inquiry.email} onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                <input type="text" placeholder="Phone *" value={inquiry.phone} onChange={(e) => setInquiry({ ...inquiry, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                <input type="date" value={inquiry.moveInDate} onChange={(e) => setInquiry({ ...inquiry, moveInDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                <textarea placeholder="Message to landlord *" value={inquiry.message} onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 resize-none" />
                <button onClick={handleInquiry} disabled={submitting || !inquiry.name || !inquiry.phone || !inquiry.message} className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Inquiry
                </button>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                <button onClick={() => setShowInquiryForm(true)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">
                  <Send className="w-4 h-4" /> Send Inquiry
                </button>
                <a href={`tel:+977${property.ownerPhone}`} className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50">
                  <Phone className="w-4 h-4" /> Call Landlord
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            )}

            <button onClick={handleSave} className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold border transition-colors ${isSaved ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'border-slate-200 text-slate-500 hover:text-emerald-500'}`}>
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-emerald-500' : ''}`} /> {isSaved ? 'Saved' : 'Save Listing'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal propertyId={property.id} propertyTitle={property.title} onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
}

function ReportModal({ propertyId, propertyTitle, onClose }: { propertyId: string; propertyTitle: string; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const reasons = [
    { value: 'fraud_or_scam', label: 'Fraud or Scam' },
    { value: 'fake_or_misleading_photos', label: 'Fake or Misleading Photos' },
    { value: 'incorrect_rent_or_terms', label: 'Incorrect Rent or Terms' },
    { value: 'unresponsive_landlord', label: 'Unresponsive Landlord' },
    { value: 'inaccurate_location', label: 'Inaccurate Location' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!reason || !details.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.submitReport({ propertyId, reporterName: name, reporterEmail: email, reporterPhone: phone, reason, details });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Report Listing</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">&times;</button>
        </div>
        {success ? (
          <div className="p-6 text-center">
            <Check className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">Report submitted.</p>
            <p className="text-sm text-slate-500 mt-1">Our team will review it shortly.</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-500">Reporting: <span className="font-semibold text-slate-700">{propertyTitle}</span></p>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Reason *</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
                <option value="">Select a reason...</option>
                {reasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Details *</label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="Explain the issue..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
            </div>
            <input type="text" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
            <button onClick={handleSubmit} disabled={submitting || !reason || !details.trim()} className="w-full py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
