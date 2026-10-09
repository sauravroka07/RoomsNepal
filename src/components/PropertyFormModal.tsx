import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Check, AlertCircle, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { Property, PropertyCity, PropertyType, FurnishingStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyToEdit?: Property | null;
  onSuccess: (savedProp: Property) => void;
}

const COMMON_AMENITIES = [
  '24/7 Water Supply',
  'Solar Hot Water',
  'High-Speed Wi-Fi',
  'Private Balcony',
  'Terrace Access',
  'Attached Bathroom',
  'Bike Parking',
  'Car Parking',
  'Inverter Backup',
  'Kitchen Slab & Sink',
  'Washing Machine Space',
  'Gated Community / CCTV'
];

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  propertyToEdit,
  onSuccess,
}) => {
  const { user, showToast } = useAuth();
  const isEditing = Boolean(propertyToEdit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState<PropertyCity>('Kathmandu');
  const [neighborhood, setNeighborhood] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Single Room');
  const [furnished, setFurnished] = useState<FurnishingStatus>('Furnished');
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [floor, setFloor] = useState('2nd Floor');
  const [monthlyRentNPR, setMonthlyRentNPR] = useState<number | ''>(12000);
  const [securityDepositNPR, setSecurityDepositNPR] = useState<number | ''>(12000);
  const [waterSupply, setWaterSupply] = useState('24/7 Melamchi + Boring Water');
  const [electricity, setElectricity] = useState('Separate Sub-meter installed');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    '24/7 Water Supply',
    'High-Speed Wi-Fi',
    'Terrace Access'
  ]);
  const [images, setImages] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [availableFrom, setAvailableFrom] = useState('Immediate');
  const [resubmitForApproval, setResubmitForApproval] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [enhancingWithAi, setEnhancingWithAi] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);

  const handleAiEnhance = async () => {
    if (!neighborhood.trim()) {
      setError('Please provide at least the City and Neighborhood/Tole so AI can analyze the local market.');
      return;
    }
    setError('');
    setEnhancingWithAi(true);
    setAiRationale(null);
    try {
      const enhanced = await api.enhanceListingWithAI({
        title,
        neighborhood,
        city,
        propertyType,
        furnished,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        currentDescription: description,
        monthlyRentNPR: monthlyRentNPR || '',
        amenities: selectedAmenities,
      });

      if (enhanced.enhancedTitle) setTitle(enhanced.enhancedTitle);
      if (enhanced.enhancedDescription) setDescription(enhanced.enhancedDescription);
      if (enhanced.suggestedRentNPR && (!monthlyRentNPR || monthlyRentNPR === 12000)) {
        setMonthlyRentNPR(enhanced.suggestedRentNPR);
        setSecurityDepositNPR(enhanced.suggestedRentNPR);
      }
      if (enhanced.rentRationale) {
        setAiRationale(enhanced.rentRationale);
      }
      if (Array.isArray(enhanced.recommendedAmenities)) {
        setSelectedAmenities(prev => Array.from(new Set([...prev, ...enhanced.recommendedAmenities])));
      }
      showToast('Listing enhanced by AI with optimized description and market rent!');
    } catch (err: any) {
      setError(err.message || 'AI Enhancement failed. Please try again.');
    } finally {
      setEnhancingWithAi(false);
    }
  };

  useEffect(() => {
    if (propertyToEdit) {
      setTitle(propertyToEdit.title);
      setDescription(propertyToEdit.description);
      setCity(propertyToEdit.city);
      setNeighborhood(propertyToEdit.neighborhood);
      setFullAddress(propertyToEdit.fullAddress);
      setPropertyType(propertyToEdit.propertyType);
      setFurnished(propertyToEdit.furnished);
      setBedrooms(propertyToEdit.bedrooms);
      setBathrooms(propertyToEdit.bathrooms);
      setFloor(propertyToEdit.floor);
      setMonthlyRentNPR(propertyToEdit.monthlyRentNPR);
      setSecurityDepositNPR(propertyToEdit.securityDepositNPR);
      setWaterSupply(propertyToEdit.waterSupply);
      setElectricity(propertyToEdit.electricity);
      setSelectedAmenities(propertyToEdit.amenities);
      setImages(propertyToEdit.images || []);
      setIsAvailable(propertyToEdit.isAvailable);
      setAvailableFrom(propertyToEdit.availableFrom);
      setResubmitForApproval(propertyToEdit.approvalStatus === 'rejected');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setCity('Kathmandu');
      setNeighborhood('');
      setFullAddress('');
      setPropertyType('Single Room');
      setFurnished('Furnished');
      setBedrooms(1);
      setBathrooms(1);
      setFloor('2nd Floor');
      setMonthlyRentNPR(12000);
      setSecurityDepositNPR(12000);
      setWaterSupply('24/7 Melamchi + Boring Water');
      setElectricity('Separate Sub-meter installed');
      setSelectedAmenities(['24/7 Water Supply', 'High-Speed Wi-Fi', 'Terrace Access']);
      setImages([]);
      setIsAvailable(true);
      setAvailableFrom('Immediate');
      setResubmitForApproval(false);
    }
  }, [propertyToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setSelectedAmenities(prev => [...prev, amenity]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    try {
      for (const file of Array.from(files)) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const uploaded = await api.uploadImage(dataUrl, file.name);
        setImages(prev => [...prev, uploaded.url]);
      }
      showToast('Photos uploaded and attached to listing!');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload image file', 'error');
    } finally {
      setUploadingPhotos(false);
      if (e.target) e.target.value = '';
    }
  };

  const setCoverPhoto = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
    showToast('Cover photo updated! This photo will appear first on search cards.');
  };

  const removePhoto = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !neighborhood.trim() || !monthlyRentNPR) {
      setError('Please provide property title, neighborhood, and monthly rent');
      return;
    }

    if (!user) {
      setError('You must be logged in as a landlord to list a property');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && propertyToEdit) {
        const updated = await api.updateProperty(
          propertyToEdit.id,
          {
            title: title.trim(),
            description: description.trim(),
            city,
            neighborhood: neighborhood.trim(),
            fullAddress: fullAddress.trim() || `${neighborhood}, ${city}`,
            propertyType,
            furnished,
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            floor,
            monthlyRentNPR: Number(monthlyRentNPR),
            securityDepositNPR: Number(securityDepositNPR) || Number(monthlyRentNPR),
            waterSupply,
            electricity,
            amenities: selectedAmenities,
            images,
            isAvailable,
            status: isAvailable ? 'available' : 'rented',
            availableFrom,
            resubmitForApproval: resubmitForApproval || propertyToEdit.approvalStatus === 'rejected',
          },
          user.id
        );
        showToast(
          propertyToEdit.approvalStatus === 'rejected'
            ? 'Property updated and resubmitted for admin approval!'
            : 'Property listing updated successfully!'
        );
        onSuccess(updated);
        onClose();
      } else {
        const newListing = await api.createProperty({
          ownerId: user.id,
          ownerName: user.name,
          ownerPhone: user.phone || '9766602378',
          ownerEmail: user.email || 'sauravroka450@gmail.com',
          whatsappPhone: user.phone || '9766602378',
          title: title.trim(),
          description: description.trim(),
          city,
          neighborhood: neighborhood.trim(),
          fullAddress: fullAddress.trim() || `${neighborhood}, ${city}`,
          propertyType,
          furnished,
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          floor,
          monthlyRentNPR: Number(monthlyRentNPR),
          securityDepositNPR: Number(securityDepositNPR) || Number(monthlyRentNPR),
          waterSupply,
          electricity,
          amenities: selectedAmenities,
          images,
          isAvailable,
          status: isAvailable ? 'available' : 'rented',
          isSample: false,
          availableFrom,
        });
        showToast('Property submitted! Your listing is pending admin verification and will appear live once approved.', 'info');
        onSuccess(newListing);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save property listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl my-8 overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? 'Edit Property Listing' : 'List Your Room / Flat in Nepal'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter verified details to reach thousands of tenants in Kathmandu, Lalitpur, Pokhara
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Property Headline / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunny Studio Room with Balcony near New Baneshwor Chowk"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">City *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as PropertyCity)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Kathmandu">Kathmandu</option>
                <option value="Lalitpur">Lalitpur (Patan)</option>
                <option value="Bhaktapur">Bhaktapur</option>
                <option value="Pokhara">Pokhara</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Neighborhood / Tole *
              </label>
              <input
                type="text"
                required
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g. New Baneshwor, Kupondole, Lakeside..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Full Address / Landmarks
            </label>
            <input
              type="text"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="e.g. Devkota Sadak, Near Civil Hospital Gate, Kathmandu"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Property Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Single Room">Single Room</option>
                <option value="Shared Room">Shared Room</option>
                <option value="Studio">Studio</option>
                <option value="1BHK Flat">1BHK Flat</option>
                <option value="2BHK Flat">2BHK Flat</option>
                <option value="3BHK+ Flat">3BHK+ Flat</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Furnishing</label>
              <select
                value={furnished}
                onChange={(e) => setFurnished(e.target.value as FurnishingStatus)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Floor Level</label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. 2nd Floor, Top Floor"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Bedrooms / Bathrooms */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Bedrooms</label>
              <input
                type="number"
                min="1"
                max="10"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Bathrooms</label>
              <input
                type="number"
                min="1"
                max="10"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Monthly Rent (Rs.) *</label>
              <input
                type="number"
                required
                value={monthlyRentNPR}
                onChange={(e) => setMonthlyRentNPR(e.target.value ? Number(e.target.value) : '')}
                placeholder="15000"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Security Deposit (Rs.)</label>
              <input
                type="number"
                value={securityDepositNPR}
                onChange={(e) => setSecurityDepositNPR(e.target.value ? Number(e.target.value) : '')}
                placeholder="15000"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Nepal-Specific Utilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Water Supply Arrangement</label>
              <input
                type="text"
                value={waterSupply}
                onChange={(e) => setWaterSupply(e.target.value)}
                placeholder="e.g. 24/7 Melamchi + Deep Boring"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Electricity Meter / Billing</label>
              <input
                type="text"
                value={electricity}
                onChange={(e) => setElectricity(e.target.value)}
                placeholder="e.g. Sub-meter (Rs. 14 / unit), or Inverter backup"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Detailed Description</label>
              <button
                type="button"
                onClick={handleAiEnhance}
                disabled={enhancingWithAi}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 rounded-lg transition-all cursor-pointer shadow-2xs"
                title="Use Gemini AI to polish your listing title, description & estimate Nepal fair rent"
              >
                {enhancingWithAi ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                    <span>Analyzing Market...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Auto-Polish with AI</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe sunlight exposure, quietness, house rules, nearby grocery/bus stops, kitchen details... or click 'Auto-Polish with AI' above!"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {aiRationale && (
              <div className="mt-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-2 text-[11px] text-emerald-900">
                <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-emerald-950">AI Rent Valuation Advice:</span>
                  <span>{aiRationale}</span>
                </div>
              </div>
            )}
          </div>

          {/* Amenities selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Amenities Included</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_AMENITIES.map((amenity) => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-2.5 py-1.5 text-xs text-left rounded-lg border flex items-center justify-between transition-colors ${
                      checked
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{amenity}</span>
                    {checked && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photos Management */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-800 block">
                  Property Photos ({images.length})
                </label>
                <p className="text-[11px] text-slate-500">
                  Upload your real room/flat photos from your phone or computer. The first photo is the main cover.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Custom Uploads Supported
              </span>
            </div>

            {/* Current photo previews */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                    <img
                      src={imgUrl}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setCoverPhoto(idx)}
                          className="px-2 py-1 bg-white/90 hover:bg-white text-slate-900 text-[10px] font-bold rounded shadow-xs"
                          title="Make this photo the main cover"
                        >
                          Set Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
                        title="Delete this photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Cover Tag */}
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-slate-900/90 text-[10px] font-bold text-emerald-400 rounded shadow-xs">
                        Main Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 mb-3">
                No photos uploaded yet. When published without photos, a clean "No Photos Uploaded" notice will be displayed to preserve transparency.
              </div>
            )}

            {/* Upload from device */}
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-2 shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{uploadingPhotos ? 'Uploading Photos...' : 'Upload Photos from Phone / Device'}</span>
                  <input
                    type="file"
                    multiple
                    disabled={uploadingPhotos}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-500">
                Supported formats: JPG, PNG, WebP. Landlords can select multiple real room photos. Each photo is saved directly to persistent storage.
              </p>
            </div>
          </div>

          {/* If previously rejected, show resubmit toggle */}
          {propertyToEdit?.approvalStatus === 'rejected' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <label className="flex items-center gap-2 text-xs font-semibold text-rose-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resubmitForApproval}
                  onChange={(e) => setResubmitForApproval(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Request Re-evaluation & Resubmit for Admin Moderation</span>
              </label>
              <p className="text-[11px] text-rose-600 mt-1 pl-5">
                Previous feedback: "{propertyToEdit.rejectionReason}". Resubmitting will reset the status to pending moderation.
              </p>
            </div>
          )}

          {/* Availability Status */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Listing Status</span>
              <span className="text-[11px] text-slate-500">
                {isAvailable ? 'Listing is open for tenant inquiries' : 'Marked as Rented'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAvailable(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                  isAvailable
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Available
              </button>
              <button
                type="button"
                onClick={() => setIsAvailable(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                  !isAvailable
                    ? 'bg-rose-900 text-white border-rose-900'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Rented
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
