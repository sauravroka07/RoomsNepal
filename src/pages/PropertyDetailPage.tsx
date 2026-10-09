import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Layers,
  Droplets,
  Zap,
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Building,
  UserCheck,
  MessageCircle,
  Compass,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Bot
} from 'lucide-react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { InquiryModal } from '../components/InquiryModal';
import { ReportModal } from '../components/ReportModal';
import { PropertyCard } from '../components/PropertyCard';
import { api } from '../services/api';

interface PropertyDetailPageProps {
  propertyId: string;
  onBack: () => void;
  onSelectProperty: (id: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  propertyId,
  onBack,
  onSelectProperty,
  onOpenAuth,
}) => {
  const { user, isPropertySaved, toggleSave, showToast } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Quick inline inquiry state
  const [inlineName, setInlineName] = useState(user?.name || '');
  const [inlinePhone, setInlinePhone] = useState(user?.phone || '');
  const [inlineMessage, setInlineMessage] = useState('Namaste, I want to inspect this room. What time is suitable?');
  const [inlineSubmitting, setInlineSubmitting] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const prop = await api.getPropertyById(propertyId, user?.id);
        if (!isCancelled && prop) {
          setProperty(prop);
          setActiveImageIndex(0);

          // Fetch related in same city
          const related = await api.getProperties({ city: prop.city, limit: 3 });
          if (!isCancelled) {
            setRelatedProperties(related.properties.filter(p => p.id !== prop.id).slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to load property details', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      isCancelled = true;
    };
  }, [propertyId, user?.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Property Not Available</h2>
        <p className="text-xs text-slate-500">
          This listing may be under review or has been unlisted.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  const saved = isPropertySaved(property.id);
  const formattedRent = new Intl.NumberFormat('en-IN').format(property.monthlyRentNPR);
  const formattedDeposit = new Intl.NumberFormat('en-IN').format(property.securityDepositNPR);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Listing link copied to clipboard!');
    }
  };

  const handleInlineInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineName.trim() || !inlinePhone.trim()) {
      showToast('Please provide your name and phone number', 'error');
      return;
    }
    setInlineSubmitting(true);
    try {
      await api.createInquiry({
        propertyId: property.id,
        tenantId: user?.id || `guest-${Date.now()}`,
        tenantName: inlineName.trim(),
        tenantEmail: user?.email || '',
        tenantPhone: inlinePhone.trim(),
        moveInDate: 'Flexible',
        message: inlineMessage.trim(),
      });
      showToast(`Inquiry sent to ${property.ownerName}!`);
      setInlineMessage('Thank you! Inquiry delivered.');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit inquiry', 'error');
    } finally {
      setInlineSubmitting(false);
    }
  };

  const hasLocation = Boolean(property.location?.lat && property.location?.lng);
  const mapLat = property.location?.lat ?? 27.7172;
  const mapLng = property.location?.lng ?? 85.3240;

  // Directions URL
  const directionsUrl = hasLocation
    ? `https://www.google.com/maps/dir/?api=1&destination=${mapLat},${mapLng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.fullAddress)}`;

  // WhatsApp link (format: +977 9766602378)
  const rawWhatsApp = property.whatsappPhone || property.ownerPhone || '9766602378';
  const cleanPhone = rawWhatsApp.replace(/\D/g, '');
  const nepPhone = cleanPhone.startsWith('977') ? cleanPhone : `977${cleanPhone}`;
  const whatsappUrl = `https://wa.me/${nepPhone}?text=${encodeURIComponent(`Namaste, I am inquiring about your listing: ${property.title} on RoomsNepal.`)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back & Actions Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Listings</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            title="Report inaccurate or suspicious listing"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Share listing"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleSave(property.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              saved
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current text-rose-600' : ''}`} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Hero Gallery Grid */}
      <div className="space-y-3">
        {property.images && property.images.length > 0 ? (
          <>
            {/* Main Display Image */}
            <div
              onClick={() => setLightboxOpen(true)}
              className="relative aspect-16/9 md:aspect-21/9 w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md cursor-zoom-in group"
            >
              <img
                src={property.images[activeImageIndex] || property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
              />

              {/* Click to expand pill */}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white text-xs font-semibold rounded-xl backdrop-blur-md transition-colors flex items-center gap-1.5 shadow-sm">
                <span>View Full Photo ({activeImageIndex + 1}/{property.images.length})</span>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-lg backdrop-blur-md shadow-xs ${
                    property.status === 'available'
                      ? 'bg-slate-950/85 text-emerald-300'
                      : 'bg-rose-950/85 text-rose-200'
                  }`}
                >
                  {property.status === 'available' ? 'Available for Rent' : 'Already Rented'}
                </span>
                {property.isSample ? (
                  <span className="px-2.5 py-1 text-[11px] font-semibold text-amber-200 bg-amber-950/80 backdrop-blur-md rounded-lg border border-amber-500/30">
                    Sample Demonstration Listing
                  </span>
                ) : property.isVerified ? (
                  <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 backdrop-blur-md rounded-lg border border-emerald-500/30">
                    ✓ Verified by Admin
                  </span>
                ) : null}
              </div>
            </div>

            {/* Thumbnail Selector */}
            {property.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-emerald-600 shadow-sm scale-102'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="relative aspect-16/9 md:aspect-21/9 w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 mb-3">
              <Building className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Photos Uploaded by Landlord</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
              The property owner has not uploaded interior photos yet. You can inspect the room in person by scheduling a visit or messaging the landlord directly.
            </p>
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 text-xs font-bold rounded-lg shadow-xs ${
                  property.status === 'available'
                    ? 'bg-slate-900 text-emerald-300'
                    : 'bg-rose-900 text-rose-200'
                }`}
              >
                {property.status === 'available' ? 'Available for Rent' : 'Already Rented'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Details and Sidebar Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Details, Specifications, and Google Map */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Info */}
          <div className="space-y-3 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-slate-800 font-semibold">{property.city}</span>
              <span aria-hidden="true">·</span>
              <span>{property.propertyType}</span>
              <span aria-hidden="true">·</span>
              <span>{property.furnished}</span>
              <span aria-hidden="true">·</span>
              <span>Available {property.availableFrom}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{property.fullAddress}</span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Bedrooms</span>
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                <Bed className="w-4 h-4 text-slate-400" />
                <span>{property.bedrooms} Bed</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Bathrooms</span>
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                <Bath className="w-4 h-4 text-slate-400" />
                <span>{property.bathrooms} Bath</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Floor</span>
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>{property.floor}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Type</span>
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="truncate">{property.propertyType}</span>
              </div>
            </div>
          </div>

          {/* Nepal Utility Insights */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Essential Utilities & Living Terms (Nepal)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200/70">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">Water Supply</span>
                  <p className="text-slate-600 mt-0.5">{property.waterSupply}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200/70">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">Electricity / Sub-Meter</span>
                  <p className="text-slate-600 mt-0.5">{property.electricity}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">About this Property</h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </div>
          </div>

          {/* Amenities checklist */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Amenities & Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sathi AI Nepal Inspection Checklist Advisory */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200/80 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Sathi AI · Nepal Rental Inspection Tip</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              When visiting this property in <strong className="font-semibold">{property.neighborhood}, {property.city}</strong>, verify the <strong className="font-semibold">{property.waterSupply}</strong> and test the tap flow. Check if the sub-meter unit count matches the current reading before paying security advance in NPR.
            </p>
          </div>

          {/* GOOGLE MAPS INTEGRATION */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Location & Interactive Map</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {property.fullAddress}
                  {hasLocation && ` · (${mapLat.toFixed(4)}, ${mapLng.toFixed(4)})`}
                </p>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl inline-flex items-center gap-1.5 self-start sm:self-auto transition-colors shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Get Directions in Google Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>

            {/* Embedded Google Map Preview */}
            <div className="w-full h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative bg-slate-100">
              <iframe
                title={`Map of ${property.title}`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.google.com/maps?q=${mapLat},${mapLng}&hl=en&z=15&output=embed`}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Landlord & Inquire Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-24 bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-6">
            {/* Rent Header */}
            <div className="pb-4 border-b border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Monthly Rent</span>
                <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                  Rs. {formattedRent}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Security Deposit</span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  Rs. {formattedDeposit}
                </span>
              </div>
            </div>

            {/* Owner Info Card */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {property.ownerName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {property.ownerName}
                  </span>
                  {property.isVerified && !property.isSample && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block">Property Owner / Landlord</span>
                <span className="text-[11px] font-mono font-medium text-slate-900">
                  {property.ownerPhone}
                </span>
              </div>
            </div>

            {/* Direct Contact Buttons (Phone & WhatsApp) */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${property.ownerPhone}`}
                className="py-2.5 px-3 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Call Owner</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Schedule Visit Modal Button */}
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="w-full py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Schedule Inspection Visit</span>
            </button>

            {/* Quick Contact Form */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">
                Fast Message to {property.ownerName}
              </h4>
              <form onSubmit={handleInlineInquiry} className="space-y-2.5">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={inlineName}
                  onChange={(e) => setInlineName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
                />
                <input
                  type="tel"
                  required
                  placeholder="Your Mobile (e.g. 98xxxxxxxx)"
                  value={inlinePhone}
                  onChange={(e) => setInlinePhone(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none font-mono"
                />
                <textarea
                  rows={2}
                  value={inlineMessage}
                  onChange={(e) => setInlineMessage(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={inlineSubmitting}
                  className="w-full py-2 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                >
                  {inlineSubmitting ? 'Sending...' : 'Send Message Instantly'}
                </button>
              </form>
            </div>

            {/* Trust & Report Section */}
            <div className="pt-2 text-[11px] text-slate-500 space-y-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-slate-600">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero broker charge</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="text-rose-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Report Fraud</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Always inspect the room in person and verify water supply and sub-meter before paying security advance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related listings in the same city */}
      {relatedProperties.length > 0 && (
        <section className="pt-10 border-t border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            More Available Spaces in {property.city}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProperties.map((rel) => (
              <PropertyCard
                key={rel.id}
                property={rel}
                onSelect={(id) => onSelectProperty(id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Inquiry Modal */}
      <InquiryModal
        property={property}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />

      {/* Report Modal */}
      <ReportModal
        property={property}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      {/* Full Photo Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="w-full flex items-center justify-between text-white max-w-5xl">
            <div className="text-xs sm:text-sm font-semibold truncate max-w-md">
              {property.title} · Photo {activeImageIndex + 1} of {property.images.length}
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              ✕ Close
            </button>
          </div>

          <div
            className="relative max-w-5xl w-full max-h-[80vh] flex items-center justify-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={property.images[activeImageIndex] || property.images[0]}
              alt={property.title}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            {property.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : property.images.length - 1))}
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/60 hover:bg-black text-white text-lg transition-colors cursor-pointer"
                  title="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev < property.images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/60 hover:bg-black text-white text-lg transition-colors cursor-pointer"
                  title="Next photo"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {property.images.length > 1 && (
            <div
              className="flex items-center gap-2 overflow-x-auto p-2 bg-black/40 rounded-2xl max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    activeImageIndex === idx ? 'border-emerald-400 scale-105' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
