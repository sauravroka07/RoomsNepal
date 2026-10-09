import type { Property, User, Inquiry, PropertyReport, AdminStats, PlatformInfo, AIChatResponse, AIEnhanceListingResponse, FilterState } from '../types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'Request failed');
  }
  return data as T;
}

export const api = {
  // Platform Info
  getPlatformInfo: (): Promise<PlatformInfo> => request('/platform/info'),

  // Properties
  getProperties: (params: Partial<FilterState> & { ownerId?: string } = {}): Promise<{ properties: Property[]; total: number; page: number; totalPages: number }> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        query.append(key, String(value));
      }
    });
    return request(`/properties?${query.toString()}`);
  },

  getProperty: (id: string, requestUserId?: string): Promise<{ property: Property }> => {
    const query = requestUserId ? `?requestUserId=${requestUserId}` : '';
    return request(`/properties/${id}${query}`);
  },

  createProperty: (data: Partial<Property>): Promise<{ property: Property }> =>
    request('/properties', { method: 'POST', body: JSON.stringify(data) }),

  updateProperty: (id: string, data: Record<string, unknown>): Promise<{ property: Property }> =>
    request(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteProperty: (id: string, requestUserId: string): Promise<{ success: boolean; deletedProperty: Property }> =>
    request(`/properties/${id}?requestUserId=${requestUserId}`, { method: 'DELETE' }),

  // Auth
  register: (data: { name: string; email: string; role: string; phone?: string }): Promise<{ user: User }> =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; demoRole?: string }): Promise<{ user: User }> =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  adminLogin: (data: { email: string; password?: string; setupPassword?: string }): Promise<{ adminToken: string; user: User }> =>
    request('/admin/login', { method: 'POST', body: JSON.stringify(data) }),

  adminVerifyToken: (token: string): Promise<{ valid: boolean; user: User }> =>
    request('/admin/verify-token', { headers: { Authorization: `Bearer ${token}` } }),

  adminSetupStatus: (): Promise<{ adminEmail: string; isSetup: boolean }> =>
    request('/admin/setup-status'),

  // Admin
  adminGetStats: (token: string): Promise<{ stats: AdminStats }> =>
    request('/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),

  adminGetProperties: (token: string, params?: { approvalStatus?: string; city?: string; search?: string }): Promise<{ properties: Property[] }> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, String(value));
      });
    }
    return request(`/admin/properties?${query.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
  },

  adminApproveProperty: (id: string, token: string): Promise<{ success: boolean; property: Property }> =>
    request(`/admin/properties/${id}/approve`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }),

  adminRejectProperty: (id: string, token: string, rejectionReason: string): Promise<{ success: boolean; property: Property }> =>
    request(`/admin/properties/${id}/reject`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ rejectionReason }) }),

  adminDeleteProperty: (id: string, token: string): Promise<{ success: boolean; removedProperty: Property }> =>
    request(`/admin/properties/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

  adminGetUsers: (token: string): Promise<{ users: (User & { propertiesCount: number })[] }> =>
    request('/admin/users', { headers: { Authorization: `Bearer ${token}` } }),

  adminUpdateUserStatus: (id: string, status: string, token: string): Promise<{ success: boolean; user: User }> =>
    request(`/admin/users/${id}/status`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) }),

  adminGetReports: (token: string): Promise<{ reports: PropertyReport[] }> =>
    request('/admin/reports', { headers: { Authorization: `Bearer ${token}` } }),

  adminUpdateReport: (id: string, token: string, data: { status: string; adminNotes?: string }): Promise<{ success: boolean; report: PropertyReport }> =>
    request(`/admin/reports/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),

  // Reports
  submitReport: (data: { propertyId: string; reporterName: string; reporterEmail: string; reporterPhone?: string; reason: string; details: string; reporterId?: string }): Promise<{ success: boolean; report: PropertyReport }> =>
    request('/reports', { method: 'POST', body: JSON.stringify(data) }),

  // Inquiries
  getInquiries: (userId: string, role: string): Promise<{ inquiries: Inquiry[] }> => {
    const query = new URLSearchParams({ userId, role });
    return request(`/inquiries?${query.toString()}`);
  },

  createInquiry: (data: { propertyId: string; tenantId: string; tenantName: string; tenantEmail: string; tenantPhone: string; moveInDate: string; message: string }): Promise<{ inquiry: Inquiry }> =>
    request('/inquiries', { method: 'POST', body: JSON.stringify(data) }),

  updateInquiry: (id: string, data: { status: string; requestUserId: string }): Promise<{ inquiry: Inquiry }> =>
    request(`/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Saved Properties
  getSaved: (userId: string): Promise<{ properties: Property[]; savedIds: string[] }> => {
    const query = new URLSearchParams({ userId });
    return request(`/saved?${query.toString()}`);
  },

  saveProperty: (propertyId: string, userId: string): Promise<{ success: boolean; isSaved: boolean }> =>
    request(`/saved/${propertyId}`, { method: 'POST', body: JSON.stringify({ userId }) }),

  unsaveProperty: (propertyId: string, userId: string): Promise<{ success: boolean; isSaved: boolean }> => {
    const query = new URLSearchParams({ userId });
    return request(`/saved/${propertyId}?${query.toString()}`, { method: 'DELETE' });
  },

  // Upload
  uploadImage: (dataUrl: string): Promise<{ url: string; filename: string; size: number }> =>
    request('/upload', { method: 'POST', body: JSON.stringify({ dataUrl }) }),

  // AI
  aiChat: (data: { message: string; history?: Array<{ role: string; text: string }>; currentPropertyId?: string; userRole?: string }): Promise<AIChatResponse> =>
    request('/ai/chat', { method: 'POST', body: JSON.stringify(data) }),

  aiEnhanceListing: (data: Record<string, unknown>): Promise<AIEnhanceListingResponse> =>
    request('/ai/enhance-listing', { method: 'POST', body: JSON.stringify(data) }),
};
