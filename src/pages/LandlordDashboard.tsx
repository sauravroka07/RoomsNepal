import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Home,
  MessageSquare,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Building2,
  ExternalLink
} from 'lucide-react';
import { Property, Inquiry } from '../types';
import { useAuth } from '../context/AuthContext';
import { PropertyFormModal } from '../components/PropertyFormModal';
import { api } from '../services/api';

interface LandlordDashboardProps {
  onSelectProperty: (id: string) => void;
  onOpenAddModal: () => void;
}

export const LandlordDashboard: React.FC<LandlordDashboardProps> = ({
  onSelectProperty,
  onOpenAddModal,
}) => {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'inquiries' | 'viewings'>('listings');
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [viewings, setViewings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resubmittingApp, setResubmittingApp] = useState(false);
  const [rescheduleNotes, setRescheduleNotes] = useState<Record<string, string>>({});

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Landlords see their own properties
      const propData = await api.getProperties({ ownerId: user.id });
      setProperties(propData.properties);

      // Inquiries for this landlord's listings
      const inqData = await api.getInquiries(user.id, 'landlord');
      setInquiries(inqData);

      // Viewings for this landlord's listings
      const viewData = await api.getViewings(user.id, 'landlord');
      setViewings(viewData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleResubmitLandlord = async () => {
    if (!user) return;
    setResubmittingApp(true);
    try {
      const updated = await api.resubmitLandlordApplication(user.id);
      localStorage.setItem('roomsnepal_current_user', JSON.stringify(updated));
      showToast('Landlord application resubmitted! RoomsNepal administrators will re-evaluate your account.', 'info');
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || 'Failed to resubmit application', 'error');
    } finally {
      setResubmittingApp(false);
    }
  };

  const handleViewingStatusChange = async (viewingId: string, status: string, notes?: string) => {
    if (!user) return;
    try {
      const updated = await api.updateViewingStatus(viewingId, status, notes, user.id);
      setViewings(prev => prev.map(v => (v.id === viewingId ? updated : v)));
      showToast(`Inspection visit marked as ${status}!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update inspection visit status', 'error');
    }
  };

  const handleToggleStatus = async (prop: Property) => {
    if (!user) return;
    const newStatus = prop.status === 'available' ? 'rented' : 'available';
    try {
      const updated = await api.updateProperty(
        prop.id,
        {
          status: newStatus,
          isAvailable: newStatus === 'available',
        },
        user.id
      );
      setProperties(prev => prev.map(p => (p.id === prop.id ? updated : p)));
      showToast(
        `Listing marked as ${newStatus === 'available' ? 'Available' : 'Rented'}.`
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update listing status', 'error');
    }
  };

  const handleDeleteListing = async (propId: string) => {
    if (!user) return;
    try {
      await api.deleteProperty(propId, user.id);
      setProperties(prev => prev.filter(p => p.id !== propId));
      setDeleteConfirmId(null);
      showToast('Property listing permanently deleted.');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete listing', 'error');
    }
  };

  const handleInquiryStatusChange = async (inqId: string, status: Inquiry['status']) => {
    if (!user) return;
    try {
      const updated = await api.updateInquiryStatus(inqId, status, user.id);
      setInquiries(prev => prev.map(inq => (inq.id === inqId ? updated : inq)));
      showToast(`Inquiry status updated to "${status}".`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update inquiry status', 'error');
    }
  };

  const availableCount = properties.filter(p => p.status === 'available').length;
  const rentedCount = properties.filter(p => p.status === 'rented').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <span>Landlord Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your rental listings, toggle availability, and connect directly with tenants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>List New Property</span>
          </button>
        </div>
      </div>

      {/* Landlord Application Status Banner */}
      {user?.role === 'landlord' && user.landlordStatus === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-bold text-amber-900">
              Landlord Application Under Review by RoomsNepal Staff
            </h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              Your homeowner account application is currently pending administrator verification. RoomsNepal verifies homeowners to maintain zero-fraud standards. Once approved, your listings will be published immediately to public search.
            </p>
          </div>
        </div>
      )}

      {user?.role === 'landlord' && user.landlordStatus === 'rejected' && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-900">
                Landlord Application Requires Information Update
              </h4>
              <p className="text-xs text-rose-700 leading-relaxed">
                Feedback from staff: <span className="font-semibold">"{user.landlordRejectionReason || 'Please verify your phone number and listing details.'}"</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleResubmitLandlord}
            disabled={resubmittingApp}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            {resubmittingApp ? 'Submitting...' : 'Resubmit Application'}
          </button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Total Properties</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {properties.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {availableCount} Available · {rentedCount} Rented
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Tenant Inquiries</span>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            {inquiries.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {inquiries.filter(i => i.status === 'pending').length} Pending Review
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Inspection Visits</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {viewings.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {viewings.filter(v => v.status === 'pending').length} Awaiting Confirmation
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'listings'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>My Listings ({properties.length})</span>
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
          <span>Tenant Inquiries ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('viewings')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'viewings'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Inspection Visits ({viewings.length})</span>
        </button>
      </div>

      {/* Tab 1: Listings Content */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading your properties...</div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No properties listed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven’t published any room or flat listings yet. Click the button below to add your first property in Kathmandu Valley or Pokhara.
              </p>
              <button
                onClick={onOpenAddModal}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-xl inline-flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>List Your First Property</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {prop.images && prop.images.length > 0 ? (
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 cursor-pointer border border-slate-200"
                        onClick={() => onSelectProperty(prop.id)}
                      />
                    ) : (
                      <div
                        onClick={() => onSelectProperty(prop.id)}
                        className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 cursor-pointer p-1 text-center"
                      >
                        <Building2 className="w-5 h-5 text-slate-400 mb-0.5" />
                        <span className="text-[9px] font-semibold text-slate-500">No Photos</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            prop.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {prop.status === 'available' ? 'AVAILABLE' : 'RENTED'}
                        </span>

                        {/* Moderation Approval Status Badge */}
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            prop.approvalStatus === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prop.approvalStatus === 'pending'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {prop.approvalStatus === 'approved'
                            ? '✓ Live & Approved'
                            : prop.approvalStatus === 'pending'
                            ? '⏳ Pending Admin Review'
                            : '✕ Action Required: Rejected'}
                        </span>

                        <span className="text-xs text-slate-500">
                          {prop.city} · {prop.propertyType}
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectProperty(prop.id)}
                        className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                      >
                        {prop.title}
                      </h3>

                      <p className="text-xs text-slate-500 truncate max-w-md">
                        {prop.neighborhood} · {prop.bedrooms} Bed · {prop.bathrooms} Bath
                      </p>

                      <div className="text-xs font-bold font-mono text-slate-900 pt-0.5">
                        Rs. {new Intl.NumberFormat('en-IN').format(prop.monthlyRentNPR)} / month
                      </div>

                      {/* Display Rejection Reason if Rejected */}
                      {prop.approvalStatus === 'rejected' && prop.rejectionReason && (
                        <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                          <strong>Admin Feedback:</strong> {prop.rejectionReason}
                          <p className="text-[11px] text-rose-600 mt-0.5">
                            Click "Edit & Resubmit" to update your listing and request review.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                    {/* Resubmit button if rejected */}
                    {prop.approvalStatus === 'rejected' ? (
                      <button
                        onClick={() => {
                          setPropertyToEdit(prop);
                          setEditModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs"
                      >
                        Edit & Resubmit
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(prop)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          prop.status === 'available'
                            ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {prop.status === 'available' ? 'Mark Rented' : 'Mark Available'}
                      </button>
                    )}

                    {/* View */}
                    <button
                      onClick={() => onSelectProperty(prop.id)}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                      title="View public listing page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setPropertyToEdit(prop);
                        setEditModalOpen(true);
                      }}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                      title="Edit listing details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteConfirmId(prop.id)}
                      className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 cursor-pointer"
                      title="Delete listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Inquiries Content */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No tenant inquiries yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When interested tenants submit inquiries for your listings, they will appear here with their contact phone and requested visit message.
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{inq.tenantName}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            inq.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : inq.status === 'contacted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inq.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Inquiring on: <span className="font-semibold text-slate-700">{inq.propertyTitle}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Status:</span>
                      <select
                        value={inq.status}
                        onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="rejected">Rejected</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 italic">
                    "{inq.message}"
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1.5 font-mono font-medium text-slate-900">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <a href={`tel:${inq.tenantPhone}`} className="hover:underline">
                          {inq.tenantPhone}
                        </a>
                      </div>
                      {inq.tenantEmail && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${inq.tenantEmail}`} className="hover:underline">
                            {inq.tenantEmail}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Move-in: {inq.moveInDate}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Received {new Date(inq.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Inspection Visits Content */}
      {activeTab === 'viewings' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading inspection requests...</div>
          ) : viewings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Inspection Visits Requested Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When prospective tenants schedule physical in-person visits to view your room or flat in Nepal, their appointment times will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {viewings.map((vw) => (
                <div
                  key={vw.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{vw.tenantName}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                            vw.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : vw.status === 'declined'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : vw.status === 'completed'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {vw.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Property: <span className="font-semibold text-slate-700">{vw.propertyTitle}</span> ({vw.propertyCity})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {vw.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleViewingStatusChange(vw.id, 'confirmed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            Confirm Visit
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt('Optional note / reschedule suggestion for tenant:');
                              handleViewingStatusChange(vw.id, 'declined', note || undefined);
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {vw.status === 'confirmed' && (
                        <button
                          onClick={() => handleViewingStatusChange(vw.id, 'completed')}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visit Appointment Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                        Requested Date
                      </span>
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        {vw.preferredDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                        Time Window (Nepal Time / NPT)
                      </span>
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        {vw.preferredTimeSlot}
                      </span>
                    </div>
                  </div>

                  {vw.notes && (
                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                      Tenant note: "{vw.notes}"
                    </div>
                  )}

                  {vw.landlordNotes && (
                    <div className="text-xs text-emerald-900 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      Landlord note: "{vw.landlordNotes}"
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1.5 font-mono font-medium text-slate-900">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <a href={`tel:${vw.tenantPhone}`} className="hover:underline">
                          {vw.tenantPhone}
                        </a>
                      </div>
                      {vw.tenantEmail && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${vw.tenantEmail}`} className="hover:underline">
                            {vw.tenantEmail}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Requested {new Date(vw.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete this listing? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteListing(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      <PropertyFormModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setPropertyToEdit(null);
        }}
        propertyToEdit={propertyToEdit}
        onSuccess={(saved) => {
          setProperties(prev => prev.map(p => (p.id === saved.id ? saved : p)));
        }}
      />
    </div>
  );
};
