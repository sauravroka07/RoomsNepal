import React, { useState } from 'react';
import { X, AlertTriangle, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Property, ReportReason } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ReportModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ property, isOpen, onClose }) => {
  const { user, showToast } = useAuth();
  const [reason, setReason] = useState<ReportReason>('fraud_or_scam');
  const [details, setDetails] = useState('');
  const [reporterName, setReporterName] = useState(user?.name || '');
  const [reporterEmail, setReporterEmail] = useState(user?.email || '');
  const [reporterPhone, setReporterPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('Please provide specific details about the issue.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await api.submitReport({
        propertyId: property.id,
        reporterId: user?.id || 'guest',
        reporterName: reporterName.trim() || 'Anonymous User',
        reporterEmail: reporterEmail.trim(),
        reporterPhone: reporterPhone.trim(),
        reason,
        details: details.trim(),
      });

      setSubmitted(true);
      showToast('Report submitted. RoomsNepal admin staff will review this listing shortly.');
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900">Report Inappropriate Listing</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Thank You for Your Report</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your feedback helps keep RoomsNepal trustworthy. Our administration team has flagged this listing for immediate manual review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              Reporting: <span className="font-semibold text-slate-900">{property.title}</span> ({property.neighborhood}, {property.city})
            </div>

            {error && (
              <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for Report *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="fraud_or_scam">Fraud, Scam or Suspicious Advance Payment Demand</option>
                <option value="fake_or_misleading_photos">Fake, Stolen or Misleading Room Photos</option>
                <option value="incorrect_rent_or_terms">Incorrect Rent or Hidden Extra Costs</option>
                <option value="inaccurate_location">Inaccurate Address or Non-Existent Property</option>
                <option value="unresponsive_landlord">Fake Contact Number or Unresponsive</option>
                <option value="other">Other Violation</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Specific Details *</label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what was inaccurate, fraudulent, or suspicious about this property or landlord interaction..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Your Name</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Optional"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Contact Phone</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="Optional"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Send Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
