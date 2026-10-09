export type UserRole = 'tenant' | 'landlord' | 'admin';

export interface PropertyLocation {
  lat: number;
  lng: number;
}

export interface Property {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  whatsappPhone?: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  fullAddress: string;
  location?: PropertyLocation;
  propertyType: string;
  furnished: string;
  bedrooms: number;
  bathrooms: number;
  floor: string;
  monthlyRentNPR: number;
  securityDepositNPR: number;
  waterSupply: string;
  electricity: string;
  amenities: string[];
  images: string[];
  coverPhotoIndex?: number;
  isAvailable: boolean;
  status: 'available' | 'rented';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  isVerified: boolean;
  isSample: boolean;
  availableFrom: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  status: 'active' | 'suspended';
  passwordHash?: string;
  passwordSalt?: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  propertyRent: number;
  landlordId: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  moveInDate: string;
  message: string;
  status: 'pending' | 'contacted' | 'rejected' | 'closed';
  createdAt: string;
}

export interface PropertyReport {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  reason: 'fraud_or_scam' | 'fake_or_misleading_photos' | 'incorrect_rent_or_terms' | 'unresponsive_landlord' | 'inaccurate_location' | 'other';
  details: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
}

export interface FilterState {
  city: string;
  neighborhood: string;
  search: string;
  type: string;
  furnished: string;
  minRent: string;
  maxRent: string;
  bedrooms: string;
  availability: string;
  sortBy: string;
  page: number;
  limit: number;
}

export interface SavedProperty {
  userId: string;
  propertyId: string;
  savedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  landlordsCount: number;
  tenantsCount: number;
  totalProperties: number;
  pendingProperties: number;
  approvedProperties: number;
  rejectedProperties: number;
  totalInquiries: number;
  totalReports: number;
  pendingReports: number;
}

export interface PlatformInfo {
  appName: string;
  creator: string;
  supportEmail: string;
  supportPhone: string;
  whatsappUrl: string;
  country: string;
}

export interface AIChatResponse {
  reply: string;
  suggestedQueries: string[];
}

export interface AIEnhanceListingResponse {
  enhancedTitle: string;
  enhancedDescription: string;
  suggestedRentNPR: number;
  rentRationale: string;
  recommendedAmenities: string[];
}
