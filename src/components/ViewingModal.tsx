import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle, CheckCircle2, MapPin, Building2 } from 'lucide-react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ViewingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

const NEPAL_TIME_SLOTS = [
  'Morning (8:00 AM - 11:00 AM)',
  'Midday (11:00 AM - 2:00 PM)',
  'Afternoon (2:00 PM - 5:00 PM)',
  'Evening (5:00 PM - 7:00 PM)',
];

export const ViewingModal: React.FC<ViewingModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const { user, showToast } = useAuth();

  // Get tomorrow's date formatted as YYYY-MM-DD for Nepal date default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [tenantName, setTenantName] = useState(user?.name || '');
  const [tenantPhone, setTenantPhone] = useState(user?.phone || '');
  const [tenantEmail, setTenantEmail] = useState(user?.email || '');
  const [preferredDate, setPreferredDate] = useState(defaultDate);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState(NEPAL_TIME_SLOTS[0]);
  const [notes, setNotes] = useState('Namaste, I would like to visit in person to check the water supply, sub-meter, and room ventilation.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tenantName.trim() || !tenantPhone.trim() || !preferredDate) {
      setError('Please provide your name, contact phone number, and inspection date.');
      return;
    }

    setLoading(true);
    try {
      await api.createViewing({
        propertyId: property.id,
        tenantId: user?.id || `guest-${Date.now()}`,
        tenantName: tenantName.trim(),
        tenantEmail: tenantEmail.trim(),
        tenantPhone: tenantPhone.trim(),
        preferredDate,
        preferredTimeSlot,
        notes: notes.trim(),
      });

      setSubmitted(true);
      showToast('Inspection viewing request delivered to landlord!');
    } catch (err: any) {
      setError(err.message || 'Failed to submit inspection request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Schedule Room Inspection
              </h3>
              <p className="text-[11px] text-slate-500">
                Nepal Local Time (NPT) · Direct Owner Coordination
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Inspection Visit Requested!
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your visit request for <strong className="text-slate-900">{preferredDate} ({preferredTimeSlot})</strong> has been dispatched to homeowner <strong className="text-slate-900">{property.ownerName}</strong>. The landlord will confirm or reschedule in their hub.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Property Summary */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                {property.images && property.images[0] ? (
                  <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{property.title}</h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{property.neighborhood}, {property.city}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Proposed Inspection Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Preferred Time Slot (NPT) *
                </label>
                <select
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {NEPAL_TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="98xxxxxxxx"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={tenantEmail}
                onChange={(e) => setTenantEmail(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Notes for Landlord
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{loading ? 'Submitting...' : 'Request Inspection Visit'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
