import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Building2, Users, CircleAlert as AlertCircle, Check, X, Clock, Trash2, Hop as Home, MapPin, Search } from 'lucide-react';
import { api } from '../services/api';
import type { Property, User, PropertyReport, AdminStats } from '../types';

interface AdminDashboardProps {
  onSelectProperty: (propertyId: string) => void;
  onNavigateHome: () => void;
}

export function AdminDashboard({ onSelectProperty }: AdminDashboardProps) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('roomsnepal_admin_token'));
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<(User & { propertiesCount: number })[]>([]);
  const [reports, setReports] = useState<PropertyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'overview' | 'properties' | 'users' | 'reports'>('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [statsRes, propRes, usersRes, reportsRes] = await Promise.all([
        api.adminGetStats(token),
        api.adminGetProperties(token),
        api.adminGetUsers(token),
        api.adminGetReports(token),
      ]);
      setStats(statsRes.stats);
      setProperties(propRes.properties);
      setUsers(usersRes.users);
      setReports(reportsRes.reports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data.');
      setToken(null);
      localStorage.removeItem('roomsnepal_admin_token');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      api.adminVerifyToken(token).then((res) => setAdminUser(res.user)).catch(() => {
        setToken(null);
        localStorage.removeItem('roomsnepal_admin_token');
      });
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    try {
      await api.adminApproveProperty(id, token);
      setProperties((prev) => prev.map((p) => p.id === id ? { ...p, approvalStatus: 'approved', isVerified: true } : p));
    } catch (err) {
      alert('Failed to approve property.');
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.adminRejectProperty(id, token, reason);
      setProperties((prev) => prev.map((p) => p.id === id ? { ...p, approvalStatus: 'rejected', rejectionReason: reason } : p));
    } catch (err) {
      alert('Failed to reject property.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this property permanently?')) return;
    try {
      await api.adminDeleteProperty(id, token);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete property.');
    }
  };

  const handleUserStatus = async (id: string, status: string) => {
    if (!token) return;
    try {
      await api.adminUpdateUserStatus(id, status, token);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: status as 'active' | 'suspended' } : u));
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  const handleReportStatus = async (id: string, status: string) => {
    if (!token) return;
    try {
      await api.adminUpdateReport(id, token, { status });
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: status as PropertyReport['status'] } : r));
    } catch (err) {
      alert('Failed to update report.');
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
        <p className="text-slate-500 text-sm">Please use the Staff Portal login to access the admin dashboard.</p>
      </div>
    );
  }

  const filteredProperties = properties.filter((p) => {
    if (filterStatus !== 'all' && p.approvalStatus !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.neighborhood.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q);
    }
    return true;
  });

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-600" /> Admin Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {adminUser ? `Signed in as ${adminUser.name} (${adminUser.email})` : 'Loading admin session...'}
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {(['overview', 'properties', 'users', 'reports'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize flex-shrink-0 ${tab === t ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <>
          {tab === 'overview' && stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <AdminStat icon={Users} label="Total Users" value={stats.totalUsers} />
              <AdminStat icon={Building2} label="Total Properties" value={stats.totalProperties} />
              <AdminStat icon={Clock} label="Pending Approval" value={stats.pendingProperties} />
              <AdminStat icon={Check} label="Approved" value={stats.approvedProperties} />
              <AdminStat icon={X} label="Rejected" value={stats.rejectedProperties} />
              <AdminStat icon={AlertCircle} label="Total Inquiries" value={stats.totalInquiries} />
              <AdminStat icon={AlertCircle} label="Total Reports" value={stats.totalReports} />
              <AdminStat icon={Clock} label="Pending Reports" value={stats.pendingReports} />
            </div>
          )}

          {tab === 'properties' && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, neighborhood, or owner..." className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              {filteredProperties.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl"><Home className="w-10 h-10 text-slate-300 mx-auto mb-2" /><p className="text-slate-500 text-sm">No properties found.</p></div>
              ) : (
                <div className="space-y-3">
                  {filteredProperties.map((property) => (
                    <div key={property.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-28 h-28 sm:h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {property.images.length > 0 ? (
                          <img src={property.images[property.coverPhotoIndex || 0]} alt={property.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Home className="w-8 h-8 text-slate-300" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{property.title}</h3>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${statusBadge(property.approvalStatus)}`}>{property.approvalStatus}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-1">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {property.neighborhood}, {property.city}</span>
                          <span>Rs. {property.monthlyRentNPR.toLocaleString()}/mo</span>
                        </div>
                        <p className="text-xs text-slate-400">By {property.ownerName} · {property.ownerPhone}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => onSelectProperty(property.id)} className="text-xs font-semibold text-slate-500 hover:text-emerald-600">View</button>
                          {property.approvalStatus !== 'approved' && (
                            <button onClick={() => handleApprove(property.id)} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Approve</button>
                          )}
                          {property.approvalStatus !== 'rejected' && (
                            <button onClick={() => handleReject(property.id)} className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"><X className="w-3.5 h-3.5" /> Reject</button>
                          )}
                          <button onClick={() => handleDelete(property.id)} className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-200">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Listings</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{u.name}</td>
                      <td className="py-3 px-4 text-slate-600">{u.email}</td>
                      <td className="py-3 px-4"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{u.role}</span></td>
                      <td className="py-3 px-4 text-slate-600">{u.propertiesCount}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{u.status}</span>
                      </td>
                      <td className="py-3 px-4">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleUserStatus(u.id, u.status === 'active' ? 'suspended' : 'active')} className="text-xs font-semibold text-slate-500 hover:text-slate-700">
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'reports' && (
            reports.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl"><AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" /><p className="text-slate-500 text-sm">No reports filed.</p></div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{report.propertyTitle}</h3>
                        <p className="text-xs text-slate-500">Reported by {report.reporterName} · {report.reason.replace(/_/g, ' ')}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                        report.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        report.status === 'investigating' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        report.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>{report.status}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{report.details}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleReportStatus(report.id, 'investigating')} className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100">Investigate</button>
                      <button onClick={() => handleReportStatus(report.id, 'resolved')} className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">Resolve</button>
                      <button onClick={() => handleReportStatus(report.id, 'dismissed')} className="text-xs font-semibold px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100">Dismiss</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

function AdminStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <Icon className="w-5 h-5 text-slate-400 mb-2" />
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
