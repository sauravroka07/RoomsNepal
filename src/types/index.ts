export type UserRole = 'tenant' | 'landlord' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  status?: 'active' | 'suspended';
}

export type PropertyCity = 'Kathmandu' | 'Lalitpur' | 'Bhaktapur' | 'Pokhara' | string;

export type PropertyType =
  | 'Single Room'
  | 'Shared Room'
  | '1BHK Flat'
  | '2BHK Flat'
  | '3BHK+ Flat'
  | 'Studio'
  | 'Apartment';

export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';

export type PropertyApprovalStatus = 'pending' | 'approved' | 'rejected';

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
  city: PropertyCity;
  neighborhood: string;
  fullAddress: string;
  location?: PropertyLocation;
  propertyType: PropertyType;
  furnished: FurnishingStatus;
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
  approvalStatus: PropertyApprovalStatus;
  rejectionReason?: string;
  resubmitForApproval?: boolean;
  isVerified?: boolean;
  isSample: boolean;
  availableFrom: string;
  createdAt: string;
  updatedAt: string;
}

export type InquiryStatus = 'pending' | 'contacted' | 'rejected' | 'closed';

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
  status: InquiryStatus;
  createdAt: string;
}

export type ReportReason =
  | 'fraud_or_scam'
  | 'fake_or_misleading_photos'
  | 'incorrect_rent_or_terms'
  | 'unresponsive_landlord'
  | 'inaccurate_location'
  | 'other';

export interface PropertyReport {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  reason: ReportReason;
  details: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
}

export interface FilterState {
  search: string;
  city: string;
  neighborhood: string;
  propertyType: string;
  furnished: string;
  minRent: number | '';
  maxRent: number | '';
  bedrooms: string;
  availability: 'all' | 'available' | 'rented';
  sortBy: 'newest' | 'price_asc' | 'price_desc';
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
