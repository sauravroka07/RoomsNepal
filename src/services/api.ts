import { Property, Inquiry, User, FilterState, PropertyReport, AdminStats } from '../types';

const STORAGE_KEYS = {
  USER: 'roomsnepal_current_user',
  ADMIN_TOKEN: 'roomsnepal_admin_token',
  SAVED: 'roomsnepal_saved_ids',
};

function getAdminAuthHeader(): Record<string, string> {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Authentication
  async register(name: string, email: string, role: 'tenant' | 'landlord', phone?: string): Promise<User> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role, phone })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    const data = await res.json();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    return data.user;
  },

  async login(email: string, _password?: string, demoRole?: 'tenant' | 'landlord' | 'admin'): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, demoRole })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to sign in');
    }
    const data = await res.json();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    return data.user;
  },

  // Staff / Admin Login
  async getAdminSetupStatus(): Promise<{ adminEmail: string; isSetup: boolean }> {
    const res = await fetch('/api/admin/setup-status');
    if (res.ok) {
      return res.json();
    }
    return { adminEmail: 'sauravroka450@gmail.com', isSetup: true };
  },

  async verifyAdminSession(): Promise<boolean> {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    if (!token) return false;
    try {
      const res = await fetch('/api/admin/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async adminLogin(email: string, password?: string, setupPassword?: string): Promise<{ user: User; adminToken: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, setupPassword })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Admin authentication failed');
    }
    const data = await res.json();
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, data.adminToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    return data;
  },

  getAdminToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
  },

  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Properties (Public & Landlord)
  async getProperties(params: Partial<FilterState> & { ownerId?: string; page?: number; limit?: number } = {}): Promise<{ properties: Property[]; total: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params.city && params.city !== 'all') query.set('city', params.city);
    if (params.neighborhood) query.set('neighborhood', params.neighborhood);
    if (params.search) query.set('search', params.search);
    if (params.propertyType && params.propertyType !== 'all') query.set('type', params.propertyType);
    if (params.furnished && params.furnished !== 'all') query.set('furnished', params.furnished);
    if (params.minRent) query.set('minRent', String(params.minRent));
    if (params.maxRent) query.set('maxRent', String(params.maxRent));
    if (params.bedrooms && params.bedrooms !== 'all') query.set('bedrooms', params.bedrooms);
    if (params.availability && params.availability !== 'all') query.set('availability', params.availability);
    if (params.ownerId) query.set('ownerId', params.ownerId);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const res = await fetch(`/api/properties?${query.toString()}`);
    if (res.ok) {
      return res.json();
    }
    throw new Error('Failed to load listings');
  },

  async getPropertyById(id: string, requestUserId?: string): Promise<Property | null> {
    const query = requestUserId ? `?requestUserId=${encodeURIComponent(requestUserId)}` : '';
    const res = await fetch(`/api/properties/${id}${query}`);
    if (res.ok) {
      const data = await res.json();
      return data.property;
    }
    return null;
  },

  async createProperty(propertyData: Partial<Property>): Promise<Property> {
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to list property');
    }
    const data = await res.json();
    return data.property;
  },

  async updateProperty(id: string, updates: Partial<Property>, requestUserId: string): Promise<Property> {
    const res = await fetch(`/api/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, requestUserId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update property');
    }
    const data = await res.json();
    return data.property;
  },

  async deleteProperty(id: string, requestUserId: string): Promise<boolean> {
    const res = await fetch(`/api/properties/${id}?requestUserId=${encodeURIComponent(requestUserId)}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete listing');
    }
    return true;
  },

  // Image Upload to Persistent Server Storage
  async uploadImage(dataUrl: string, filename?: string): Promise<{ url: string; filename: string }> {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload image');
    }
    return res.json();
  },

  // Inquiries
  async getInquiries(userId: string, role: 'tenant' | 'landlord'): Promise<Inquiry[]> {
    const res = await fetch(`/api/inquiries?userId=${encodeURIComponent(userId)}&role=${role}`);
    if (res.ok) {
      const data = await res.json();
      return data.inquiries || [];
    }
    return [];
  },

  async createInquiry(inquiryData: {
    propertyId: string;
    tenantId: string;
    tenantName: string;
    tenantEmail: string;
    tenantPhone: string;
    moveInDate: string;
    message: string;
  }): Promise<Inquiry> {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send inquiry');
    }
    const data = await res.json();
    return data.inquiry;
  },

  async updateInquiryStatus(id: string, status: Inquiry['status'], requestUserId: string): Promise<Inquiry> {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, requestUserId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update inquiry status');
    }
    const data = await res.json();
    return data.inquiry;
  },

  // Saved Properties
  async getSavedProperties(userId: string): Promise<{ properties: Property[]; savedIds: string[] }> {
    const res = await fetch(`/api/saved?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      return res.json();
    }
    return { properties: [], savedIds: [] };
  },

  async toggleSaveProperty(propertyId: string, userId: string, currentlySaved: boolean): Promise<boolean> {
    if (currentlySaved) {
      await fetch(`/api/saved/${propertyId}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
    } else {
      await fetch(`/api/saved/${propertyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    }
    return !currentlySaved;
  },

  // Reporting
  async submitReport(reportData: {
    propertyId: string;
    reporterId?: string;
    reporterName?: string;
    reporterEmail?: string;
    reporterPhone?: string;
    reason: string;
    details: string;
  }): Promise<PropertyReport> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit report');
    }
    const data = await res.json();
    return data.report;
  },

  // ---------------- ADMIN API ---------------- //

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch('/api/admin/stats', {
      headers: { ...getAdminAuthHeader() }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Unauthorized: Admin access required');
    }
    const data = await res.json();
    return data.stats;
  },

  async getAdminProperties(filters: { approvalStatus?: string; city?: string; search?: string } = {}): Promise<Property[]> {
    const query = new URLSearchParams();
    if (filters.approvalStatus && filters.approvalStatus !== 'all') query.set('approvalStatus', filters.approvalStatus);
    if (filters.city && filters.city !== 'all') query.set('city', filters.city);
    if (filters.search) query.set('search', filters.search);

    const res = await fetch(`/api/admin/properties?${query.toString()}`, {
      headers: { ...getAdminAuthHeader() }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Unauthorized: Admin access required');
    }
    const data = await res.json();
    return data.properties;
  },

  async approveProperty(propertyId: string): Promise<Property> {
    const res = await fetch(`/api/admin/properties/${propertyId}/approve`, {
      method: 'PATCH',
      headers: { ...getAdminAuthHeader(), 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to approve listing');
    }
    const data = await res.json();
    return data.property;
  },

  async rejectProperty(propertyId: string, rejectionReason: string): Promise<Property> {
    const res = await fetch(`/api/admin/properties/${propertyId}/reject`, {
      method: 'PATCH',
      headers: { ...getAdminAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectionReason })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reject listing');
    }
    const data = await res.json();
    return data.property;
  },

  async deletePropertyAsAdmin(propertyId: string): Promise<boolean> {
    const res = await fetch(`/api/admin/properties/${propertyId}`, {
      method: 'DELETE',
      headers: { ...getAdminAuthHeader() }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete listing');
    }
    return true;
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch('/api/admin/users', {
      headers: { ...getAdminAuthHeader() }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to load users');
    }
    const data = await res.json();
    return data.users;
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<User> {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { ...getAdminAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update user status');
    }
    const data = await res.json();
    return data.user;
  },

  async getAdminReports(): Promise<PropertyReport[]> {
    const res = await fetch('/api/admin/reports', {
      headers: { ...getAdminAuthHeader() }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to load reports');
    }
    const data = await res.json();
    return data.reports;
  },

  async updateReportStatus(reportId: string, status: PropertyReport['status'], adminNotes?: string): Promise<PropertyReport> {
    const res = await fetch(`/api/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: { ...getAdminAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update report');
    }
    const data = await res.json();
    return data.report;
  },

  // AI Assistant & Tools (Powered by Gemini)
  async chatWithAI(params: {
    message: string;
    history?: Array<{ role: 'user' | 'model'; text: string }>;
    currentPropertyId?: string;
    userRole?: string;
  }): Promise<{ reply: string; suggestedQueries?: string[] }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to consult AI Assistant');
    }
    return res.json();
  },

  async enhanceListingWithAI(params: {
    title: string;
    neighborhood: string;
    city: string;
    propertyType: string;
    furnished: string;
    bedrooms: number;
    bathrooms: number;
    currentDescription: string;
    monthlyRentNPR: number | '';
    amenities: string[];
  }): Promise<{
    enhancedTitle: string;
    enhancedDescription: string;
    suggestedRentNPR: number;
    rentRationale: string;
    recommendedAmenities: string[];
  }> {
    const res = await fetch('/api/ai/enhance-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate AI listing enhancement');
    }
    return res.json();
  }
};
