import React, { useState } from 'react';
import { X, Send, Calendar, Phone, Mail, User as UserIcon, ShieldCheck } from 'lucide-react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface InquiryModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  property,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, showToast } = useAuth();
  const [tenantName, setTenantName] = useState(user?.name || '');
  const [tenantEmail, setTenantEmail] = useState(user?.email || '');
  const [tenantPhone, setTenantPhone] = useState(user?.phone || '');
  const [moveInDate, setMoveInDate] = useState('2026-10-25');
  const [message, setMessage] = useState(
    `Namaste, I am interested in renting this ${property.propertyType} in ${property.neighborhood}. Is it still available for a visit?`
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tenantName.trim()) {
      setError('Please provide your name');
      return;
    }
    if (!tenantPhone.trim()) {
      setError('Please provide a valid Nepali phone number (e.g. 98xxxxxxxx)');
      return;
    }
    if (!message.trim()) {
      setError('Please write a short inquiry message');
      return;
    }

    setSubmitting(true);
    try {
      await api.createInquiry({
        propertyId: property.id,
        tenantId: user?.id || `guest-${Date.now()}`,
        tenantName: tenantName.trim(),
        tenantEmail: tenantEmail.trim(),
        tenantPhone: tenantPhone.trim(),
        moveInDate,
        message: message.trim(),
      });

      showToast(`Inquiry sent directly to landlord ${property.ownerName}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Contact Landlord & Schedule Visit
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct connection with {property.ownerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Property snapshot */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 text-center">
                <span className="text-[9px] font-semibold text-slate-500">No Photo</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-900 truncate">{property.title}</h4>
              <p className="text-slate-500 truncate">{property.neighborhood}, {property.city}</p>
              <p className="text-slate-900 font-bold font-mono mt-0.5">
                Rs. {new Intl.NumberFormat('en-IN').format(property.monthlyRentNPR)} / month
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Your Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Nepali Phone / Mobile</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  placeholder="+977 98xxxxxxxx"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  placeholder="aarav@example.com"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Move-in Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Your Message to Landlord</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Mention your occupation, who will be staying, and your preferred visit timing..."
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>No middleman fee</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>{submitting ? 'Sending...' : 'Send Inquiry'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
