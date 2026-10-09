import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Static asset folders
const PUBLIC_DIR = path.join(__dirname, 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

[PUBLIC_DIR, IMAGES_DIR, UPLOADS_DIR, DATA_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/images', express.static(IMAGES_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// Admin Credentials & In-Memory Sessions
const ADMIN_EMAIL = 'sauravroka450@gmail.com';
const activeAdminSessions = new Map<string, { email: string; createdAt: number }>();

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tenant' | 'landlord' | 'admin';
  phone?: string;
  createdAt: string;
  status: 'active' | 'suspended';
  passwordHash?: string;
  passwordSalt?: string;
}

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

export interface DatabaseSchema {
  users: User[];
  properties: Property[];
  inquiries: Inquiry[];
  reports: PropertyReport[];
  savedProperties: { userId: string; propertyId: string; savedAt: string }[];
  adminSetupCompleted?: boolean;
}

// 6 Unique Sample Listings in Nepal (Distinct Photos & Coordinates)
const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-ktm-01',
    ownerId: 'landlord-ram-shrestha',
    ownerName: 'Ram Kumar Shrestha',
    ownerPhone: '9766602378',
    ownerEmail: 'sauravroka450@gmail.com',
    whatsappPhone: '9766602378',
    title: 'Sunny Studio Room with Private Balcony in New Baneshwor',
    description: 'Bright and airy furnished studio room located on the 3rd floor in a quiet residential alley near Baneshwor Chowk and Civil Hospital. Equipped with comfortable double bed, study table, fast fiber internet, and 24/7 Melamchi + boring water supply. Perfect for students or working professionals.',
    city: 'Kathmandu',
    neighborhood: 'New Baneshwor',
    fullAddress: 'Devkota Sadak, New Baneshwor, Kathmandu, Nepal',
    location: { lat: 27.6915, lng: 85.3420 },
    propertyType: 'Studio',
    furnished: 'Furnished',
    bedrooms: 1,
    bathrooms: 1,
    floor: '3rd Floor',
    monthlyRentNPR: 14000,
    securityDepositNPR: 14000,
    waterSupply: 'Melamchi + Groundwater (24/7 Supply)',
    electricity: 'Sub-meter installed (Rs. 14 / unit)',
    amenities: [
      '24/7 Water Supply',
      'High-Speed Wi-Fi',
      'Private Balcony',
      'Solar Hot Water',
      'Bike Parking',
      'Terrace Access',
      'Attached Bathroom',
      'Kitchen Slab & Sink'
    ],
    images: ['/images/listing_room_baneshwor.jpg'],
    coverPhotoIndex: 0,
    isAvailable: true,
    status: 'available',
    approvalStatus: 'approved',
    isVerified: false,
    isSample: true,
    availableFrom: '2026-10-15',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'prop-lal-02',
    ownerId: 'landlord-sita-adhikari',
    ownerName: 'Sita Adhikari',
    ownerPhone: '9766602378',
    ownerEmail: 'sauravroka450@gmail.com',
    whatsappPhone: '9766602378',
    title: 'Spacious 2BHK Modern Flat with Balcony in Jhamsikhel',
    description: 'Premium 2 bedroom flat in peaceful diplomatic enclave of Jhamsikhel, Lalitpur. High ceiling living room, modern modular kitchen with chimney, large double-glazed windows, and full sunlight throughout winter. Designated car & bike parking with security gate.',
    city: 'Lalitpur',
    neighborhood: 'Jhamsikhel',
    fullAddress: 'Jhamsikhel Road, Ward 3, Lalitpur, Nepal',
    location: { lat: 27.6740, lng: 85.3120 },
    propertyType: '2BHK Flat',
    furnished: 'Furnished',
    bedrooms: 2,
    bathrooms: 2,
    floor: '2nd Floor',
    monthlyRentNPR: 42000,
    securityDepositNPR: 80000,
    waterSupply: 'Deep boring + filter plant (Uninterrupted)',
    electricity: 'Dedicated Meter + Inverter Backup',
    amenities: [
      '24/7 Water Supply',
      'Car & Bike Parking',
      'Solar & Geyser Hot Water',
      'Modular Kitchen',
      'Inverter Power Backup',
      'High-Speed Wi-Fi',
      'Washing Machine Point',
      'Gated Community'
    ],
    images: ['/images/listing_flat_lalitpur.jpg'],
    coverPhotoIndex: 0,
    isAvailable: true,
    status: 'available',
    approvalStatus: 'approved',
    isVerified: false,
    isSample: true,
    availableFrom: 'Immediate',
    createdAt: '2026-10-03T09:00:00Z',
    updatedAt: '2026-10-03T09:00:00Z',
  },
  {
    id: 'prop-pkr-03',
    ownerId: 'landlord-kiran-gurung',
    ownerName: 'Kiran Gurung',
    ownerPhone: '9766602378',
    ownerEmail: 'sauravroka450@gmail.com',
    whatsappPhone: '9766602378',
    title: 'Scenic Mountain-View Room with Balcony in Lakeside Pokhara',
    description: 'Charming private room with wooden floor and private veranda overlooking tranquil gardens with direct sightline to Machhapuchhre and Annapurna range. Just 5 minutes walk to Phewa Lake. Peace, mountain breeze, attached clean modern bathroom.',
    city: 'Pokhara',
    neighborhood: 'Lakeside Center',
    fullAddress: 'Baidam, Lakeside Ward 6, Pokhara, Nepal',
    location: { lat: 28.2096, lng: 83.9585 },
    propertyType: 'Single Room',
    furnished: 'Furnished',
    bedrooms: 1,
    bathrooms: 1,
    floor: '1st Floor',
    monthlyRentNPR: 18500,
    securityDepositNPR: 18500,
    waterSupply: '24/7 Municipal & Spring Water',
    electricity: 'Sub-meter, Solar Inverter',
    amenities: [
      '24/7 Water Supply',
      'Private Veranda',
      'Mountain View',
      'High-Speed Wi-Fi',
      'Solar Hot Water',
      'Attached Bathroom',
      'Shared Garden',
      'Bike Parking'
    ],
    images: ['/images/listing_room_pokhara.jpg'],
    coverPhotoIndex: 0,
    isAvailable: true,
    status: 'available',
    approvalStatus: 'approved',
    isVerified: false,
    isSample: true,
    availableFrom: 'Immediate',
    createdAt: '2026-10-04T14:30:00Z',
    updatedAt: '2026-10-04T14:30:00Z',
  },
  {
    id: 'prop-ktm-04',
    ownerId: 'landlord-ram-shrestha',
    ownerName: 'Ram Kumar Shrestha',
    ownerPhone: '9766602378',
    ownerEmail: 'sauravroka450@gmail.com',
    whatsappPhone: '9766602378',
    title: 'Clean Student Single Room near Ring Road, Koteshwor',
    description: 'Affordable sunny single room with wooden bed, study table, and bookshelf. Quiet residential area near Koteshwor Chowk with excellent bus connectivity. Clean drinking water, rooftop access, and separate sub-meter electricity.',
    city: 'Kathmandu',
    neighborhood: 'Koteshwor',
    fullAddress: 'Subidhanagar, Koteshwor, Kathmandu, Nepal',
    location: { lat: 27.6755, lng: 85.3458 },
    propertyType: 'Single Room',
    furnished: 'Semi-Furnished',
    bedrooms: 1,
    bathrooms: 1,
    floor: '2nd Floor',
    monthlyRentNPR: 8500,
    securityDepositNPR: 8500,
    waterSupply: 'Well + City Water (Regular timing)',
    electricity: 'Sub-meter (Standard rate)',
    amenities: [
      '24/7 Water Supply',
      'Study Table & Chair',
      'Terrace Access',
      'Bike Parking',
      'Separate Sub-Meter'
    ],
    images: ['/images/listing_room_koteshwor.jpg'],
    coverPhotoIndex: 0,
    isAvailable: true,
    status: 'available',
    approvalStatus: 'approved',
    isVerified: false,
    isSample: true,
    availableFrom: 'Immediate',
    createdAt: '2026-10-05T11:00:00Z',
    updatedAt: '2026-10-05T11:00:00Z',
  },
  {
    id: 'prop-bkt-05',
    ownerId: 'landlord-bhim-tamang',
    ownerName: 'Bhim Tamang',
    ownerPhone: '9766602378',
    ownerEmail: 'sauravroka450@gmail.com',
    whatsappPhone: '9766602378',
    title: 'Peaceful 2BHK Upper Floor Flat in Suryabinayak Bhaktapur',
    description: 'Traditional Nepali residential flat with 2 sunny bedrooms, wooden ceiling beams, and a private terrace overlooking scenic Bhaktapur hills. Clean mountain air, quiet colony, 5 minutes to Arniko Highway.',
    city: 'Bhaktapur',
    neighborhood: 'Suryabinayak',
    fullAddress: 'Ward 5, Suryabinayak, Bhaktapur, Nepal',
    location: { lat: 27.6710, lng: 85.4280 },
    propertyType: '2BHK Flat',
    furnished: 'Semi-Furnished',
    bedrooms: 2,
    bathrooms: 1,
    floor: 'Top Floor (3rd)',
    monthlyRentNPR: 16000,
    securityDepositNPR: 16000,
    waterSupply: 'Natural spring boring + reserve tanks',
    electricity: 'Independent sub-meter',
    amenities: [
      'Rooftop Terrace',
      'Bike Parking',
      '24/7 Water Supply',
      'Mountain & Valley View',
      'Peaceful Environment'
    ],
    images: ['/images/listing_flat_bhaktapur.jpg'],
    coverPhotoIndex: 0,
    isAvailable: true,
    status: 'available',
    approvalStatus: 'approved',
    isVerified: false,
    isSample: true,
    availableFrom: 'Immediate',
    createdAt: '2026-10-06T08:15:00Z',
    updatedAt: '2026-10-06T08:15:00Z',
  },
  {
    id: 'prop-lal-06',
    ownerId: 'landlord-sita-adhikari',
    ownerName: 'Sita Adhikari',
    ownerPhone: '9766602378',
    ownerEmail: 'sauravroka450@gmail.com',
    whatsappPhone: '9766602378',
    title: 'Cozy Room for Student/Jobholder near Pulchowk, Kupondole',
    description: 'Neat single room close to Pulchowk Engineering Campus, Patan Dhoka, and UN House. Clean shared western bathroom, high-speed WiFi, solar water heater for winter, and bike parking inside locked compound.',
    city: 'Lalitpur',
    neighborhood: 'Kupondole',
    fullAddress: 'Kupondole Height, Lalitpur, Nepal',
    location: { lat: 27.6860, lng: 85.3175 },
    propertyType: 'Single Room',
    furnished: 'Furnished',
    bedrooms: 1,
    bathrooms: 1,
    floor: '1st Floor',
    monthlyRentNPR: 9500,
    securityDepositNPR: 9500,
    waterSupply: '24/7 Filtered Water',
    electricity: 'Sub-meter',
    amenities: [
      '24/7 Water Supply',
      'High-Speed Wi-Fi',
      'Solar Hot Water',
      'Bike Parking',
      'Near Pulchowk Campus'
    ],
    images: ['/images/listing_room_kupondole.jpg'],
    coverPhotoIndex: 0,
    isAvailable: true,
    status: 'available',
    approvalStatus: 'approved',
    isVerified: false,
    isSample: true,
    availableFrom: 'Immediate',
    createdAt: '2026-10-06T12:00:00Z',
    updatedAt: '2026-10-06T12:00:00Z',
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'admin-saurav-roka',
    name: 'Saurav Roka',
    email: ADMIN_EMAIL,
    role: 'admin',
    phone: '9766602378',
    status: 'active',
    createdAt: '2026-10-01T00:00:00Z'
  },
  {
    id: 'demo-tenant-aarav',
    name: 'Aarav Sharma',
    email: 'tenant@roomsnepal.com',
    role: 'tenant',
    phone: '9766602378',
    status: 'active',
    createdAt: '2026-10-02T10:00:00Z'
  },
  {
    id: 'demo-landlord-bikash',
    name: 'Bikash KC',
    email: 'landlord@roomsnepal.com',
    role: 'landlord',
    phone: '9766602378',
    status: 'active',
    createdAt: '2026-10-02T10:00:00Z'
  }
];

function readDb(): DatabaseSchema {
  if (!fs.existsSync(DB_PATH)) {
    const initial: DatabaseSchema = {
      users: INITIAL_USERS,
      properties: INITIAL_PROPERTIES,
      inquiries: [],
      reports: [],
      savedProperties: [
        { userId: 'demo-tenant-aarav', propertyId: 'prop-ktm-01', savedAt: '2026-10-06T12:00:00Z' }
      ],
      adminSetupCompleted: true
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed: DatabaseSchema = JSON.parse(raw);
    if (!parsed.reports) parsed.reports = [];
    if (!parsed.properties) parsed.properties = INITIAL_PROPERTIES;
    // Ensure admin user exists with admin role
    const adminExists = parsed.users.find(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    if (!adminExists) {
      parsed.users.unshift(INITIAL_USERS[0]);
      fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
    } else {
      adminExists.role = 'admin';
    }
    return parsed;
  } catch {
    return {
      users: INITIAL_USERS,
      properties: INITIAL_PROPERTIES,
      inquiries: [],
      reports: [],
      savedProperties: []
    };
  }
}

function writeDb(data: DatabaseSchema) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Authentication & Admin Authorization Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const session = activeAdminSessions.get(token);

  if (!session || session.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: 'Forbidden: Insufficient privileges for admin operations' });
  }

  // Token valid (expires in 24 hours)
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    activeAdminSessions.delete(token);
    return res.status(401).json({ error: 'Admin session expired. Please sign in again.' });
  }

  next();
}

// ---------------- REST API ENDPOINTS ---------------- //

// Public Creator & Platform Info
app.get('/api/platform/info', (_req: Request, res: Response) => {
  return res.json({
    appName: 'RoomsNepal',
    creator: 'Designed & Developed by Saurav Roka',
    supportEmail: 'sauravroka450@gmail.com',
    supportPhone: '9766602378',
    whatsappUrl: 'https://wa.me/9779766602378',
    country: 'Nepal'
  });
});

// Admin Setup Status Check
app.get('/api/admin/setup-status', (_req: Request, res: Response) => {
  const db = readDb();
  const admin = db.users.find(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  const isSetup = Boolean(admin && admin.passwordHash && admin.passwordSalt);
  return res.json({
    adminEmail: ADMIN_EMAIL,
    isSetup
  });
});

// Verify Admin Token
app.get('/api/admin/verify-token', requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  const admin = db.users.find(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  return res.json({
    valid: true,
    user: {
      id: admin?.id || 'admin-saurav-roka',
      name: admin?.name || 'Saurav Roka',
      email: ADMIN_EMAIL,
      role: 'admin',
      phone: admin?.phone || '9766602378'
    }
  });
});

// Secure Staff / Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password, setupPassword } = req.body;

  if (!email || email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(401).json({ error: 'Unauthorized: Invalid administrator credentials.' });
  }

  const db = readDb();
  let admin = db.users.find(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  if (!admin) {
    admin = {
      id: 'admin-saurav-roka',
      name: 'Saurav Roka',
      email: ADMIN_EMAIL,
      role: 'admin',
      phone: '9766602378',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    db.users.unshift(admin);
  }

  // If setting admin password through first-time protected setup
  if (setupPassword && !admin.passwordHash) {
    if (setupPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    const salt = crypto.randomBytes(16).toString('hex');
    admin.passwordSalt = salt;
    admin.passwordHash = hashPassword(setupPassword.trim(), salt);
    writeDb(db);
  }

  // Check password if set
  if (admin.passwordHash && admin.passwordSalt) {
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    const computed = hashPassword(password.trim(), admin.passwordSalt);
    if (computed !== admin.passwordHash) {
      return res.status(401).json({ error: 'Incorrect administrator password.' });
    }
  } else {
    // If first-time initialization without password set yet, set the provided password
    if (password && password.length >= 6) {
      const salt = crypto.randomBytes(16).toString('hex');
      admin.passwordSalt = salt;
      admin.passwordHash = hashPassword(password.trim(), salt);
      writeDb(db);
    } else {
      return res.status(400).json({
        error: 'Please set an administrator password (minimum 6 characters) on initial login.',
        needsPasswordSetup: true
      });
    }
  }

  // Generate secure admin token
  const adminToken = `admin_tok_${crypto.randomBytes(24).toString('hex')}`;
  activeAdminSessions.set(adminToken, {
    email: ADMIN_EMAIL,
    createdAt: Date.now()
  });

  return res.json({
    adminToken,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
      phone: admin.phone
    }
  });
});

// Admin Stats
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const db = readDb();
  const stats = {
    totalUsers: db.users.length,
    landlordsCount: db.users.filter(u => u.role === 'landlord').length,
    tenantsCount: db.users.filter(u => u.role === 'tenant').length,
    totalProperties: db.properties.length,
    pendingProperties: db.properties.filter(p => p.approvalStatus === 'pending').length,
    approvedProperties: db.properties.filter(p => p.approvalStatus === 'approved').length,
    rejectedProperties: db.properties.filter(p => p.approvalStatus === 'rejected').length,
    totalInquiries: db.inquiries.length,
    totalReports: db.reports.length,
    pendingReports: db.reports.filter(r => r.status === 'pending').length,
  };
  return res.json({ stats });
});

// Admin Properties Management
app.get('/api/admin/properties', requireAdmin, (req: Request, res: Response) => {
  const { approvalStatus, city, search } = req.query;
  const db = readDb();
  let list = [...db.properties];

  if (approvalStatus && approvalStatus !== 'all') {
    list = list.filter(p => p.approvalStatus === approvalStatus);
  }

  if (city && city !== 'all') {
    list = list.filter(p => p.city.toLowerCase() === String(city).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      p.ownerPhone.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ properties: list });
});

// Admin Approve Property
app.patch('/api/admin/properties/:id/approve', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const property = db.properties.find(p => p.id === id);

  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  property.approvalStatus = 'approved';
  property.isVerified = true;
  property.rejectionReason = undefined;
  property.updatedAt = new Date().toISOString();

  writeDb(db);
  return res.json({ success: true, property });
});

// Admin Reject Property
app.patch('/api/admin/properties/:id/reject', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason || !rejectionReason.trim()) {
    return res.status(400).json({ error: 'A specific reason for rejection is required.' });
  }

  const db = readDb();
  const property = db.properties.find(p => p.id === id);

  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  property.approvalStatus = 'rejected';
  property.isVerified = false;
  property.rejectionReason = rejectionReason.trim();
  property.updatedAt = new Date().toISOString();

  writeDb(db);
  return res.json({ success: true, property });
});

// Admin Delete / Remove Inappropriate Property
app.delete('/api/admin/properties/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.properties.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Property not found' });
  }

  const removed = db.properties.splice(index, 1)[0];
  writeDb(db);
  return res.json({ success: true, removedProperty: removed });
});

// Admin Users List & Status Management
app.get('/api/admin/users', requireAdmin, (_req: Request, res: Response) => {
  const db = readDb();
  const safeUsers = db.users.map(({ passwordHash, passwordSalt, ...u }) => ({
    ...u,
    propertiesCount: db.properties.filter(p => p.ownerId === u.id).length
  }));
  return res.json({ users: safeUsers });
});

app.patch('/api/admin/users/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const db = readDb();
  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.role === 'admin') {
    return res.status(400).json({ error: 'Cannot modify primary administrator account status.' });
  }

  user.status = status === 'suspended' ? 'suspended' : 'active';
  writeDb(db);
  return res.json({ success: true, user });
});

// Admin Reports Management
app.get('/api/admin/reports', requireAdmin, (_req: Request, res: Response) => {
  const db = readDb();
  const reports = db.reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ reports });
});

app.patch('/api/admin/reports/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  const db = readDb();
  const report = db.reports.find(r => r.id === id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report.status = status;
  if (adminNotes !== undefined) report.adminNotes = adminNotes;
  writeDb(db);

  return res.json({ success: true, report });
});

// Public Submit Property Report
app.post('/api/reports', (req: Request, res: Response) => {
  const { propertyId, reporterName, reporterEmail, reporterPhone, reason, details } = req.body;

  if (!propertyId || !reason || !details) {
    return res.status(400).json({ error: 'Property ID, reason, and description are required.' });
  }

  const db = readDb();
  const property = db.properties.find(p => p.id === propertyId);
  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  const newReport: PropertyReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    propertyId,
    propertyTitle: property.title,
    reporterId: req.body.reporterId || 'guest',
    reporterName: reporterName?.trim() || 'Anonymous Tenant',
    reporterEmail: reporterEmail?.trim() || '',
    reporterPhone: reporterPhone?.trim() || '',
    reason,
    details: details.trim(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.reports.unshift(newReport);
  writeDb(db);

  return res.status(201).json({ success: true, report: newReport });
});

// File Upload to Server Persistent Storage (/public/uploads)
app.post('/api/upload', (req: Request, res: Response) => {
  const { dataUrl, filename } = req.body;

  if (!dataUrl || typeof dataUrl !== 'string') {
    return res.status(400).json({ error: 'Image data URL is required' });
  }

  // Handle base64
  const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return res.status(400).json({ error: 'Invalid base64 image format' });
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Max 5MB
  if (buffer.length > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image file size exceeds the 5MB limit.' });
  }

  let ext = 'jpg';
  if (mimeType.includes('png')) ext = 'png';
  else if (mimeType.includes('webp')) ext = 'webp';

  const uniqueName = `room_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  try {
    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${uniqueName}`;
    return res.json({
      url: publicUrl,
      filename: uniqueName,
      size: buffer.length
    });
  } catch (err) {
    console.error('File write error:', err);
    return res.status(500).json({ error: 'Failed to write image to server storage' });
  }
});

// Normal Auth Register (FORBIDS Admin Role)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, role, phone } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  // Explicitly prevent role escalation to admin through registration
  if (role === 'admin' || email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({
      error: 'Administrator accounts cannot be registered through public signup. Use Admin Sign In.'
    });
  }

  const db = readDb();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role === 'landlord' ? 'landlord' : 'tenant',
    phone: phone?.trim() || '',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  return res.status(201).json({ user: newUser });
});

// Normal Auth Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, demoRole } = req.body;
  const db = readDb();

  if (demoRole) {
    const demoUser = db.users.find(u => u.role === demoRole);
    if (demoUser) {
      return res.json({ user: demoUser });
    }
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Prevent logging in as admin through normal tenant/landlord login
  if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({
      error: 'This email is reserved for Staff/Administrator. Please use Admin Portal login.'
    });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'No account found with this email. Please sign up.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
  }

  return res.json({ user });
});

// Public Properties Listing (Only Approved Properties for Public)
app.get('/api/properties', (req: Request, res: Response) => {
  const {
    city,
    neighborhood,
    search,
    type,
    furnished,
    minRent,
    maxRent,
    bedrooms,
    availability,
    ownerId,
    sortBy,
    page = '1',
    limit = '9'
  } = req.query;

  const db = readDb();
  let results = [...db.properties];

  // If landlord queries their own properties, allow them to view pending/rejected too
  if (ownerId) {
    results = results.filter(p => p.ownerId === ownerId);
  } else {
    // PUBLIC VIEW: Strictly approved properties only!
    results = results.filter(p => p.approvalStatus === 'approved');
  }

  if (city && city !== 'all') {
    results = results.filter(p => p.city.toLowerCase() === String(city).toLowerCase());
  }

  if (neighborhood) {
    results = results.filter(p => p.neighborhood.toLowerCase().includes(String(neighborhood).toLowerCase()));
  }

  if (type && type !== 'all') {
    results = results.filter(p => p.propertyType === type);
  }

  if (furnished && furnished !== 'all') {
    results = results.filter(p => p.furnished === furnished);
  }

  if (minRent) {
    const min = Number(minRent);
    if (!isNaN(min)) results = results.filter(p => p.monthlyRentNPR >= min);
  }

  if (maxRent) {
    const max = Number(maxRent);
    if (!isNaN(max)) results = results.filter(p => p.monthlyRentNPR <= max);
  }

  if (bedrooms && bedrooms !== 'all') {
    const b = Number(bedrooms);
    if (!isNaN(b)) {
      if (b >= 3) {
        results = results.filter(p => p.bedrooms >= 3);
      } else {
        results = results.filter(p => p.bedrooms === b);
      }
    }
  }

  if (availability === 'available') {
    results = results.filter(p => p.isAvailable);
  } else if (availability === 'rented') {
    results = results.filter(p => !p.isAvailable);
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.propertyType.toLowerCase().includes(q) ||
      p.amenities.some(a => a.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sortBy === 'price_asc') {
    results.sort((a, b) => a.monthlyRentNPR - b.monthlyRentNPR);
  } else if (sortBy === 'price_desc') {
    results.sort((a, b) => b.monthlyRentNPR - a.monthlyRentNPR);
  } else {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const total = results.length;
  const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({
    properties: paginated,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum)
  });
});

// Single Property Details
app.get('/api/properties/:id', (req: Request, res: Response) => {
  const { requestUserId } = req.query;
  const db = readDb();
  const property = db.properties.find(p => p.id === req.params.id);

  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  // If not approved, only the owner can view
  if (property.approvalStatus !== 'approved' && property.ownerId !== requestUserId) {
    return res.status(403).json({ error: 'This property listing is currently under review by administrators.' });
  }

  return res.json({ property });
});

// Create Property (Landlords) - Starts with PENDING status
app.post('/api/properties', (req: Request, res: Response) => {
  const data = req.body;
  if (!data.title || !data.city || !data.monthlyRentNPR || !data.ownerId) {
    return res.status(400).json({ error: 'Title, city, monthly rent, and owner ID are required.' });
  }

  const db = readDb();
  const user = db.users.find(u => u.id === data.ownerId);
  if (user && user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account is suspended. You cannot create new listings.' });
  }

  const newProperty: Property = {
    id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ownerId: data.ownerId,
    ownerName: data.ownerName || 'Property Owner',
    ownerPhone: data.ownerPhone || '9766602378',
    ownerEmail: data.ownerEmail || 'sauravroka450@gmail.com',
    whatsappPhone: data.whatsappPhone || '9766602378',
    title: data.title.trim(),
    description: data.description?.trim() || '',
    city: data.city,
    neighborhood: data.neighborhood?.trim() || data.city,
    fullAddress: data.fullAddress?.trim() || `${data.neighborhood || ''}, ${data.city}, Nepal`,
    location: data.location || { lat: 27.7172, lng: 85.3240 },
    propertyType: data.propertyType || 'Single Room',
    furnished: data.furnished || 'Furnished',
    bedrooms: Number(data.bedrooms) || 1,
    bathrooms: Number(data.bathrooms) || 1,
    floor: data.floor || '1st Floor',
    monthlyRentNPR: Number(data.monthlyRentNPR),
    securityDepositNPR: Number(data.securityDepositNPR) || Number(data.monthlyRentNPR),
    waterSupply: data.waterSupply || '24/7 Supply Available',
    electricity: data.electricity || 'Sub-meter installed',
    amenities: Array.isArray(data.amenities) ? data.amenities : [],
    images: Array.isArray(data.images) ? data.images.filter((img: any) => typeof img === 'string' && img.trim()) : [],
    coverPhotoIndex: 0,
    isAvailable: true,
    status: 'available',
    approvalStatus: 'pending', // Starts with pending moderation!
    isVerified: false,
    isSample: false,
    availableFrom: data.availableFrom || 'Immediate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.properties.unshift(newProperty);
  writeDb(db);
  return res.status(201).json({ property: newProperty });
});

// Update Property (Landlord) - If previously rejected, resubmission resets to pending
app.put('/api/properties/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const db = readDb();
  const index = db.properties.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Property not found' });
  }

  // Authorization check: Only the owner can edit
  if (updates.requestUserId && db.properties[index].ownerId !== updates.requestUserId) {
    return res.status(403).json({ error: 'Unauthorized: Only the property owner can edit this listing' });
  }

  const existing = db.properties[index];
  const isAvailable = updates.status ? updates.status === 'available' : (updates.isAvailable ?? existing.isAvailable);

  // If was rejected and landlord is resubmitting, put back in pending review
  let approvalStatus = existing.approvalStatus;
  let rejectionReason = existing.rejectionReason;
  if (existing.approvalStatus === 'rejected' && updates.resubmitForApproval) {
    approvalStatus = 'pending';
    rejectionReason = undefined;
  }

  db.properties[index] = {
    ...existing,
    ...updates,
    isAvailable,
    status: isAvailable ? 'available' : 'rented',
    approvalStatus,
    rejectionReason,
    updatedAt: new Date().toISOString()
  };

  writeDb(db);
  return res.json({ property: db.properties[index] });
});

// Delete Property (Landlord)
app.delete('/api/properties/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { requestUserId } = req.query;
  const db = readDb();
  const index = db.properties.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Property not found' });
  }

  if (requestUserId && db.properties[index].ownerId !== String(requestUserId)) {
    return res.status(403).json({ error: 'Unauthorized: Only the property owner can delete this listing' });
  }

  const deleted = db.properties.splice(index, 1)[0];
  writeDb(db);
  return res.json({ success: true, deletedProperty: deleted });
});

// Inquiries Endpoints
app.get('/api/inquiries', (req: Request, res: Response) => {
  const { userId, role } = req.query;
  const db = readDb();

  if (!userId) {
    return res.json({ inquiries: [] });
  }

  let userInquiries: Inquiry[] = [];
  if (role === 'landlord') {
    userInquiries = db.inquiries.filter(inq => inq.landlordId === userId);
  } else {
    userInquiries = db.inquiries.filter(inq => inq.tenantId === userId);
  }

  userInquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ inquiries: userInquiries });
});

app.post('/api/inquiries', (req: Request, res: Response) => {
  const {
    propertyId,
    tenantId,
    tenantName,
    tenantEmail,
    tenantPhone,
    moveInDate,
    message
  } = req.body;

  if (!propertyId || !tenantName || !tenantPhone || !message) {
    return res.status(400).json({ error: 'Property ID, tenant name, phone, and message are required' });
  }

  const db = readDb();
  const property = db.properties.find(p => p.id === propertyId);
  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  const newInquiry: Inquiry = {
    id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    propertyId,
    propertyTitle: property.title,
    propertyCity: property.city,
    propertyRent: property.monthlyRentNPR,
    landlordId: property.ownerId,
    tenantId: tenantId || 'guest-tenant',
    tenantName: tenantName.trim(),
    tenantEmail: tenantEmail?.trim() || '',
    tenantPhone: tenantPhone.trim(),
    moveInDate: moveInDate || 'Flexible',
    message: message.trim(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.inquiries.unshift(newInquiry);
  writeDb(db);

  return res.status(201).json({ inquiry: newInquiry });
});

app.patch('/api/inquiries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, requestUserId } = req.body;
  const db = readDb();
  const inquiry = db.inquiries.find(inq => inq.id === id);

  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  if (requestUserId && inquiry.landlordId !== requestUserId) {
    return res.status(403).json({ error: 'Unauthorized: Only the property owner can update inquiry status' });
  }

  inquiry.status = status;
  writeDb(db);

  return res.json({ inquiry });
});

// Saved Properties
app.get('/api/saved', (req: Request, res: Response) => {
  const { userId } = req.query;
  const db = readDb();
  if (!userId) {
    return res.json({ properties: [], savedIds: [] });
  }

  const savedIds = db.savedProperties
    .filter(s => s.userId === userId)
    .map(s => s.propertyId);

  const properties = db.properties.filter(p => savedIds.includes(p.id));
  return res.json({ properties, savedIds });
});

app.post('/api/saved/:propertyId', (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  const db = readDb();
  const alreadySaved = db.savedProperties.some(s => s.userId === userId && s.propertyId === propertyId);
  if (!alreadySaved) {
    db.savedProperties.push({
      userId,
      propertyId,
      savedAt: new Date().toISOString()
    });
    writeDb(db);
  }

  return res.json({ success: true, isSaved: true });
});

app.delete('/api/saved/:propertyId', (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  const db = readDb();
  db.savedProperties = db.savedProperties.filter(
    s => !(s.userId === String(userId) && s.propertyId === propertyId)
  );
  writeDb(db);

  return res.json({ success: true, isSaved: false });
});

// ---------------- AI ASSISTANT & LANDLORD ENHANCER (Gemini 3.8 Flash) ---------------- //

// AI Chatbot & Rental Advisor for Nepal
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, currentPropertyId, userRole } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const db = readDb();
    const approvedListings = db.properties.filter(p => p.approvalStatus === 'approved' && p.isAvailable);

    // Provide context summary of current marketplace
    const samplePropertiesContext = approvedListings.slice(0, 10).map(p => ({
      id: p.id,
      title: p.title,
      city: p.city,
      neighborhood: p.neighborhood,
      monthlyRentNPR: p.monthlyRentNPR,
      propertyType: p.propertyType,
      furnished: p.furnished,
      waterSupply: p.waterSupply,
      electricity: p.electricity,
      bedrooms: p.bedrooms,
    }));

    let currentPropertyContext = null;
    if (currentPropertyId) {
      currentPropertyContext = db.properties.find(p => p.id === currentPropertyId);
    }

    const systemInstruction = `You are "Sathi AI" (नेपाल कोठा साथी), the dedicated, knowledgeable, and polite AI Rental Assistant for RoomsNepal (https://roomsnepal.com).
The platform connects tenants directly with verified homeowners and landlords across Nepal (Kathmandu, Lalitpur/Patan, Bhaktapur, Pokhara, etc.) with ZERO broker commissions.

Key Platform & Rental Facts for Nepal:
1. Currency: Nepali Rupees (NPR / Rs.).
2. Creator: Designed & Developed by Saurav Roka. Support: sauravroka450@gmail.com, Mobile/WhatsApp: 9766602378 (+977 9766602378).
3. Common Nepal rental utilities:
   - Water supply: 24/7 Melamchi pipeline, deep boring, jar water, or tanker water.
   - Electricity: Separate sub-meters (sub-meter reading, typically Rs. 12 - 16 per unit in Kathmandu valley) vs shared bill.
   - Waste management: Local municipality / tole ward waste pickup fees (typically Rs. 300 - 500/month).
   - Advance/Deposit: Usually 1 month rent or 2 months security deposit.
4. Top Locations & Average Price Benchmarks in Kathmandu Valley:
   - Single Room: Rs. 4,000 - 10,000/month depending on area (Kirtipur/Balkumari vs Baneshwor/Jhamsikhel).
   - 1BHK Flat: Rs. 12,000 - 22,000/month.
   - 2BHK Flat: Rs. 20,000 - 40,000/month.
   - 3BHK+ / Luxury: Rs. 35,000 - 80,000+/month.
   - Student/Job hub locations: New Baneshwor, Koteshwor, Maitighar, Putalisadak, Tinkune, Thapathali, Sankhamul.
   - Expat/Cafe lifestyle hubs: Jhamsikhel, Sanepa, Kupondole, Lazimpat.
   - Peaceful tourist/scenic: Lakeside Pokhara, Bhaktapur Sallaghari, Bungamati.

Current Live Properties Snapshot on RoomsNepal:
${JSON.stringify(samplePropertiesContext, null, 2)}
${currentPropertyContext ? `\nThe user is currently viewing this property detail:\n${JSON.stringify(currentPropertyContext, null, 2)}` : ''}

User Role: ${userRole || 'tenant / visitor'}

Guidelines:
- Answer in warm, polite, and helpful English (feel free to sprinkle customary Nepali terms like "Namaste", "dhanyabad", "tole", "bato", "sub-meter", "BHK" where helpful).
- If the user asks for recommendations, match them with relevant live properties from the snapshot (mention the property title, rent in Rs., neighborhood, and offer advice).
- If tenant asks for inspection advice, advise checking water supply, bathroom plumbing, natural sunlight/ventilation, motorcycle/car parking, and sub-meter condition before paying advance.
- Keep responses concise, organized with bullet points, and directly actionable.
- NEVER make up fake contact numbers; always reference Saurav Roka / support 9766602378 if asking for support.`;

    // Construct conversation contents
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h.role === 'user' || h.role === 'model') {
          contents.push({
            role: h.role,
            parts: [{ text: String(h.text || h.content || '') }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const reply = response.text || "Namaste! I'm here to help you find the best room, flat, or apartment in Nepal. What location or budget are you looking for?";

    return res.json({
      reply,
      suggestedQueries: [
        'Rooms near New Baneshwor under Rs. 15,000',
        'Things to check before paying advance in Kathmandu',
        'Average 1BHK rent in Lalitpur vs Kathmandu',
        'How does sub-meter electricity work in Nepal?'
      ]
    });
  } catch (error: any) {
    console.error('[AI Chat Error]:', error);
    return res.status(500).json({
      error: 'Failed to consult AI Assistant. Please ensure GEMINI_API_KEY is configured.',
      details: error.message
    });
  }
});

// AI Landlord Listing Enhancer & Pricing Estimator
app.post('/api/ai/enhance-listing', async (req: Request, res: Response) => {
  try {
    const { title, neighborhood, city, propertyType, furnished, bedrooms, bathrooms, currentDescription, monthlyRentNPR, amenities } = req.body;

    const prompt = `You are a real estate listing specialist in Nepal. A landlord is posting a room or flat on RoomsNepal.
Input Details:
- Title: ${title || 'Rental Room/Flat'}
- City: ${city || 'Kathmandu'}
- Neighborhood: ${neighborhood || 'Kathmandu Valley'}
- Property Type: ${propertyType || 'Single Room'}
- Furnishing: ${furnished || 'Semi-Furnished'}
- Bedrooms: ${bedrooms || 1}, Bathrooms: ${bathrooms || 1}
- Current Draft Rent: Rs. ${monthlyRentNPR || 'Not set'}
- Selected Amenities: ${(amenities || []).join(', ') || 'Standard room'}
- Landlord's Draft Notes: ${currentDescription || 'None'}

Please generate a JSON response with:
1. "enhancedTitle": An eye-catching, trustworthy title (under 75 characters) mentioning location and top feature (e.g., "Bright & Sunny 1BHK Flat near Pulchowk Campus, Lalitpur").
2. "enhancedDescription": A compelling, well-formatted 2-3 paragraph description highlighting natural light, nearby conveniences (bato, tole, groceries, public transport), water supply, peaceful environment, and respectful rental conditions.
3. "suggestedRentNPR": Realistic fair market monthly rent in NPR (number only) based on current 2026 rental rates in ${city} (${neighborhood}).
4. "rentRationale": A 1-2 sentence explanation of why this rent is competitive in this neighborhood.
5. "recommendedAmenities": An array of 3-5 additional amenities the landlord should mention if available (e.g., "Separate Sub-meter", "Motorbike Parking", "Terrace Access", "Waste Disposal").

Return strictly valid JSON with no markdown backticks or commentary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const rawText = response.text || '{}';
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = {
        enhancedTitle: `${propertyType || 'Room'} in ${neighborhood || city}, ${city}`,
        enhancedDescription: currentDescription || `Spacious and well-ventilated ${propertyType} located in the quiet neighborhood of ${neighborhood}, ${city}. Close to local markets, grocery stores, and convenient public transportation. Equipped with reliable water supply and separate electrical sub-meter.`,
        suggestedRentNPR: monthlyRentNPR || 12000,
        rentRationale: `Standard competitive rate for a ${propertyType} in ${neighborhood}, ${city}.`,
        recommendedAmenities: ['Motorbike Parking', 'Separate Sub-meter', '24/7 Water Supply', 'Terrace Access']
      };
    }

    return res.json(data);
  } catch (error: any) {
    console.error('[AI Enhance Error]:', error);
    return res.status(500).json({
      error: 'Failed to enhance listing via AI',
      details: error.message
    });
  }
});

// In Dev, mount Vite middleware; in production, serve dist
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RoomsNepal] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
