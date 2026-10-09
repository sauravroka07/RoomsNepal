import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Users,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Phone,
  Mail,
  UserX,
  UserCheck,
  FileText,
  SlidersHorizontal,
  MapPin,
  Clock
} from 'lucide-react';
import { Property, User, PropertyReport, AdminStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AdminDashboardProps {
  onSelectProperty: (id: string) => void;
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectProperty,
  onNavigateHome,
}) => {
  const { user, isAdmin, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'properties' | 'reports' | 'users'>('pending');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reports, setReports] = useState<PropertyReport[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCity, setFilterCity] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection modal
  const [rejectingProp, setRejectingProp] = useState<Property | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Photos do not clearly show the room interior');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, props, rep, usr] = await Promise.all([
        api.getAdminStats(),
        api.getAdminProperties(),
        api.getAdminReports(),
        api.getAdminUsers(),
      ]);
      setStats(s);
      setProperties(props);
      setReports(rep);
      setUsers(usr);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAll();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Staff Access Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The Admin Portal is protected by server-side authorization. You must log in using authorized administrator credentials.
        </p>
        <button
          onClick={onNavigateHome}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-xl"
        >
          Return to RoomsNepal Home
        </button>
      </div>
    );
  }

  const handleApprove = async (propId: string) => {
    try {
      const updated = await api.approveProperty(propId);
      setProperties(prev => prev.map(p => (p.id === propId ? updated : p)));
      if (stats) {
        setStats({
          ...stats,
          pendingProperties: Math.max(0, stats.pendingProperties - 1),
          approvedProperties: stats.approvedProperties + 1,
        });
      }
      showToast('Property listing approved and published live with Verified badge!');
    } catch (err: any) {
      showToast(err.message || 'Failed to approve listing', 'error');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingProp) return;
    try {
      const updated = await api.rejectProperty(rejectingProp.id, rejectionReason);
      setProperties(prev => prev.map(p => (p.id === rejectingProp.id ? updated : p)));
      if (stats) {
        setStats({
          ...stats,
          pendingProperties: Math.max(0, stats.pendingProperties - 1),
          rejectedProperties: stats.rejectedProperties + 1,
        });
      }
      setRejectingProp(null);
      showToast('Property listing rejected. Reason sent to landlord.');
    } catch (err: any) {
      showToast(err.message || 'Failed to reject listing', 'error');
    }
  };

  const handleDeleteListing = async (propId: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await api.deletePropertyAsAdmin(propId);
      setProperties(prev => prev.filter(p => p.id !== propId));
      showToast('Property permanently removed by administrator.');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete listing', 'error');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      const updated = await api.updateUserStatus(userId, nextStatus);
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: updated.status } : u)));
      showToast(`User account status updated to ${nextStatus}.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: PropertyReport['status']) => {
    try {
      const updated = await api.updateReportStatus(reportId, status);
      setReports(prev => prev.map(r => (r.id === reportId ? updated : r)));
      showToast(`Report marked as ${status}.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update report', 'error');
    }
  };

  const pendingListings = properties.filter(p => p.approvalStatus === 'pending');

  const filteredProperties = properties.filter(p => {
    if (filterStatus !== 'all' && p.approvalStatus !== filterStatus) return false;
    if (filterCity !== 'all' && p.city.toLowerCase() !== filterCity.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        p.ownerPhone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>RoomsNepal Administration & Moderation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Staff Portal Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Operator: <span className="text-white font-medium">Saurav Roka (sauravroka450@gmail.com)</span> · Tel: 9766602378
          </p>
        </div>

        <button
          onClick={loadAll}
          className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh All Data</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Pending Moderation</span>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {stats?.pendingProperties ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Requires manual review</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Live Approved</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {stats?.approvedProperties ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Public search catalog</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Rejected Listings</span>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {stats?.rejectedProperties ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">With feedback to owner</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Users</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {stats?.totalUsers ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">
            {stats?.landlordsCount ?? 0} Landlords · {stats?.tenantsCount ?? 0} Tenants
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Fraud Reports</span>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
            {stats?.totalReports ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">
            {stats?.pendingReports ?? 0} Unresolved
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'pending'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Pending Approvals ({pendingListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'properties'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>All Properties ({properties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'reports'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Property Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING APPROVALS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingListings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero Pending Submissions</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All submitted room and flat listings in Nepal have been reviewed. New landlord listings will appear here before appearing publicly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingListings.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    {prop.images && prop.images[0] ? (
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="w-24 h-24 rounded-2xl object-cover shrink-0 cursor-pointer border border-slate-200"
                        onClick={() => onSelectProperty(prop.id)}
                      />
                    ) : (
                      <div
                        onClick={() => onSelectProperty(prop.id)}
                        className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 cursor-pointer p-2 text-center"
                      >
                        <Building2 className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-[10px] font-semibold text-slate-500">No Photos</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-md">
                          PENDING MODERATION
                        </span>
                        <span className="text-xs text-slate-500">
                          {prop.city} · {prop.propertyType} · {prop.furnished}
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectProperty(prop.id)}
                        className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer"
                      >
                        {prop.title}
                      </h3>

                      <p className="text-xs text-slate-500">{prop.fullAddress}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-700">
                        <span className="font-mono font-bold text-slate-900">
                          Rs. {new Intl.NumberFormat('en-IN').format(prop.monthlyRentNPR)} / mo
                        </span>
                        <span>·</span>
                        <span>Owner: <strong className="text-slate-900">{prop.ownerName}</strong> ({prop.ownerPhone})</span>
                        <span>·</span>
                        <span className="text-slate-400">Submitted: {new Date(prop.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0">
                    <button
                      onClick={() => onSelectProperty(prop.id)}
                      className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                    >
                      Preview Listing
                    </button>
                    <button
                      onClick={() => {
                        setRejectingProp(prop);
                        setRejectionReason('Please upload clear real photos showing the room interior and kitchen.');
                      }}
                      className="px-3.5 py-2 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl"
                    >
                      Reject with Reason
                    </button>
                    <button
                      onClick={() => handleApprove(prop.id)}
                      className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Verify</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL PROPERTIES */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
              >
                <option value="all">All Nepal Cities</option>
                <option value="Kathmandu">Kathmandu</option>
                <option value="Lalitpur">Lalitpur</option>
                <option value="Bhaktapur">Bhaktapur</option>
                <option value="Pokhara">Pokhara</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search title, neighborhood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-1.5 text-slate-900"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  {prop.images && prop.images[0] ? (
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 cursor-pointer border border-slate-200"
                      onClick={() => onSelectProperty(prop.id)}
                    />
                  ) : (
                    <div
                      onClick={() => onSelectProperty(prop.id)}
                      className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 cursor-pointer p-1 text-center"
                    >
                      <Building2 className="w-4 h-4 text-slate-400 mb-0.5" />
                      <span className="text-[8px] font-semibold text-slate-500">No Photo</span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          prop.approvalStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prop.approvalStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {prop.approvalStatus}
                      </span>
                      {prop.isSample && (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Sample Demo
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        {prop.city} · {prop.propertyType}
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectProperty(prop.id)}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer mt-0.5"
                    >
                      {prop.title}
                    </h4>

                    <div className="text-xs text-slate-500">
                      Owner: {prop.ownerName} ({prop.ownerPhone}) · Rs. {new Intl.NumberFormat('en-IN').format(prop.monthlyRentNPR)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {prop.approvalStatus !== 'approved' && (
                    <button
                      onClick={() => handleApprove(prop.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg"
                    >
                      Approve
                    </button>
                  )}
                  {prop.approvalStatus !== 'rejected' && (
                    <button
                      onClick={() => {
                        setRejectingProp(prop);
                        setRejectionReason('Inaccurate rent or description');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => onSelectProperty(prop.id)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-50 rounded-lg"
                    title="View"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteListing(prop.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Zero Reported Properties</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No fraudulent or suspicious listings have been reported by users.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">
                        Report Reason: {rep.reason.replace(/_/g, ' ')}
                      </span>
                      <h4
                        onClick={() => onSelectProperty(rep.propertyId)}
                        className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer mt-0.5 flex items-center gap-1.5"
                      >
                        <span>{rep.propertyTitle}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Status:</span>
                      <select
                        value={rep.status}
                        onChange={(e) => handleUpdateReportStatus(rep.id, e.target.value as any)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                      >
                        <option value="pending">Pending</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong>Report Details:</strong> "{rep.details}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                    <div>
                      Reporter: <strong className="text-slate-800">{rep.reporterName}</strong>
                      {rep.reporterPhone && ` (${rep.reporterPhone})`}
                      {rep.reporterEmail && ` · ${rep.reporterEmail}`}
                    </div>
                    <div>Date: {new Date(rep.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">User Accounts Directory</h3>
            <p className="text-xs text-slate-500">Monitor tenant and landlord registrations across Nepal</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3">Name & Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Properties</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-900'
                            : u.role === 'landlord'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono">{u.phone || '—'}</td>
                    <td className="px-5 py-3 font-mono">{(u as any).propertiesCount ?? 0}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'suspended' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            u.status === 'suspended'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {u.status === 'suspended' ? 'Re-activate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal with Custom Reason */}
      {rejectingProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reject Listing: {rejectingProp.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Provide a clear reason so landlord <strong>{rejectingProp.ownerName}</strong> can correct and resubmit.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Reason for Rejection *
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingProp(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
