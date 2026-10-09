import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader as Loader2, Sparkles, Image as ImageIcon, Check, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Property } from '../types';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (saved: Property) => void;
}

const CITIES = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara'];
const PROPERTY_TYPES = ['Single Room', 'Studio', '1BHK Flat', '2BHK Flat', '3BHK Flat', 'Shared Room'];
const FURNISH_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const AMENITY_OPTIONS = [
  '24/7 Water Supply', 'High-Speed Wi-Fi', 'Private Balcony', 'Solar Hot Water',
  'Bike Parking', 'Car Parking', 'Terrace Access', 'Attached Bathroom',
  'Kitchen Slab & Sink', 'Separate Sub-Meter', 'Washing Machine Point',
  'Gated Community', 'Inverter Power Backup', 'Mountain View', 'Garden Access',
];

export function PropertyFormModal({ isOpen, onClose, onSuccess }: PropertyFormModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    city: 'Kathmandu',
    neighborhood: '',
    fullAddress: '',
    propertyType: 'Single Room',
    furnished: 'Semi-Furnished',
    bedrooms: '1',
    bathrooms: '1',
    floor: '1st Floor',
    monthlyRentNPR: '',
    securityDepositNPR: '',
    waterSupply: '',
    electricity: '',
    availableFrom: 'Immediate',
    whatsappPhone: '',
  });

  useEffect(() => {
    if (isOpen && user) {
      setForm((prev) => ({ ...prev, whatsappPhone: user.phone || '' }));
    }
    if (!isOpen) {
      setImages([]);
      setAmenities([]);
      setError('');
      setForm({
        title: '', description: '', city: 'Kathmandu', neighborhood: '', fullAddress: '',
        propertyType: 'Single Room', furnished: 'Semi-Furnished', bedrooms: '1', bathrooms: '1',
        floor: '1st Floor', monthlyRentNPR: '', securityDepositNPR: '', waterSupply: '',
        electricity: '', availableFrom: 'Immediate', whatsappPhone: user?.phone || '',
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          setError(`Image "${file.name}" exceeds 5MB limit.`);
          continue;
        }
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const res = await api.uploadImage(dataUrl);
        setImages((prev) => [...prev, res.url]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEnhance = async () => {
    setEnhancing(true);
    setError('');
    try {
      const res = await api.aiEnhanceListing({
        title: form.title,
        neighborhood: form.neighborhood,
        city: form.city,
        propertyType: form.propertyType,
        furnished: form.furnished,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        currentDescription: form.description,
        monthlyRentNPR: Number(form.monthlyRentNPR) || undefined,
        amenities,
      });
      setForm((prev) => ({
        ...prev,
        title: res.enhancedTitle || prev.title,
        description: res.enhancedDescription || prev.description,
        monthlyRentNPR: res.suggestedRentNPR ? String(res.suggestedRentNPR) : prev.monthlyRentNPR,
        securityDepositNPR: res.suggestedRentNPR ? String(res.suggestedRentNPR) : prev.securityDepositNPR,
      }));
      if (res.recommendedAmenities) {
        const newAmenities = res.recommendedAmenities.filter((a) => !amenities.includes(a));
        if (newAmenities.length > 0) {
          setAmenities((prev) => [...prev, ...newAmenities]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI enhancement failed.');
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Please sign in as a landlord to post a listing.');
      return;
    }
    if (!form.title.trim() || !form.city || !form.monthlyRentNPR) {
      setError('Title, city, and monthly rent are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.createProperty({
        ownerId: user.id,
        ownerName: user.name,
        ownerPhone: user.phone || '9766602378',
        ownerEmail: user.email,
        whatsappPhone: form.whatsappPhone || user.phone || '9766602378',
        title: form.title,
        description: form.description,
        city: form.city,
        neighborhood: form.neighborhood || form.city,
        fullAddress: form.fullAddress || `${form.neighborhood}, ${form.city}, Nepal`,
        propertyType: form.propertyType,
        furnished: form.furnished,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        floor: form.floor,
        monthlyRentNPR: Number(form.monthlyRentNPR),
        securityDepositNPR: Number(form.securityDepositNPR) || Number(form.monthlyRentNPR),
        waterSupply: form.waterSupply || '24/7 Supply Available',
        electricity: form.electricity || 'Sub-meter installed',
        amenities,
        images,
        availableFrom: form.availableFrom,
      });
      onSuccess(res.property);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900">Post a New Listing</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Title + Enhance */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Listing Title *</label>
              <button
                onClick={handleEnhance}
                disabled={enhancing}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
              >
                {enhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                AI Enhance
              </button>
            </div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Sunny Studio Room with Balcony in New Baneshwor"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Describe the room, surroundings, water supply, sunlight, transport access..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Grid: City + Neighborhood */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">City *</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              >
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Neighborhood</label>
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                placeholder="e.g., New Baneshwor"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Full Address</label>
            <input
              type="text"
              value={form.fullAddress}
              onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
              placeholder="Street, Ward, City, Nepal"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Grid: Type + Furnished */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Property Type</label>
              <select
                value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              >
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Furnished</label>
              <select
                value={form.furnished}
                onChange={(e) => setForm({ ...form, furnished: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              >
                {FURNISH_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Grid: Bedrooms + Bathrooms + Floor */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Bedrooms</label>
              <input
                type="number" min="0"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Bathrooms</label>
              <input
                type="number" min="0"
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Floor</label>
              <input
                type="text"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Grid: Rent + Deposit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Monthly Rent (NPR) *</label>
              <input
                type="number" min="0"
                value={form.monthlyRentNPR}
                onChange={(e) => setForm({ ...form, monthlyRentNPR: e.target.value })}
                placeholder="e.g., 12000"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Security Deposit (NPR)</label>
              <input
                type="number" min="0"
                value={form.securityDepositNPR}
                onChange={(e) => setForm({ ...form, securityDepositNPR: e.target.value })}
                placeholder="e.g., 12000"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Grid: Water + Electricity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Water Supply</label>
              <input
                type="text"
                value={form.waterSupply}
                onChange={(e) => setForm({ ...form, waterSupply: e.target.value })}
                placeholder="e.g., Melamchi + Boring 24/7"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Electricity</label>
              <input
                type="text"
                value={form.electricity}
                onChange={(e) => setForm({ ...form, electricity: e.target.value })}
                placeholder="e.g., Sub-meter Rs.14/unit"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* WhatsApp Phone */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">WhatsApp / Contact Phone</label>
            <input
              type="text"
              value={form.whatsappPhone}
              onChange={(e) => setForm({ ...form, whatsappPhone: e.target.value })}
              placeholder="e.g., 9766602378"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Images */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Property Photos</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                  <img src={img} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg px-1.5 py-0.5 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length === 0 && (
                <div className="flex items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 text-slate-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload Photos
            </button>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((amenity) => {
                const selected = amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Listing
          </button>
        </div>
      </div>
    </div>
  );
}
