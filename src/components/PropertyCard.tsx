import React, { useState } from 'react';
import { Heart, MapPin, Bed, Bath, Camera } from 'lucide-react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';

interface PropertyCardProps {
  property: Property;
  onSelect: (propertyId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  const { isPropertySaved, toggleSave } = useAuth();
  const saved = isPropertySaved(property.id);
  const [imageFailed, setImageFailed] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(property.id);
  };

  const formattedPrice = new Intl.NumberFormat('en-IN').format(property.monthlyRentNPR);
  const coverPhoto = property.images && property.images.length > 0
    ? (property.images[property.coverPhotoIndex || 0] || property.images[0])
    : null;
  const hasValidPhoto = Boolean(coverPhoto && !imageFailed);

  return (
    <article
      onClick={() => onSelect(property.id)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
    >
      {/* Property Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {hasValidPhoto && coverPhoto ? (
          <img
            src={coverPhoto}
            alt={property.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 select-none">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-400 mb-2">
              <Camera className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-600">No Photos Uploaded</span>
            <span className="text-[10px] text-slate-400 mt-0.5">By Property Owner</span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            saved
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-black/30 hover:bg-black/50 text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>

        {/* Status indicator tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-md backdrop-blur-md shadow-xs ${
              property.status === 'available'
                ? 'bg-slate-900/85 text-emerald-300'
                : 'bg-rose-900/85 text-rose-200'
            }`}
          >
            {property.status === 'available' ? 'Available' : 'Rented'}
          </span>
          {property.isSample ? (
            <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-200 bg-amber-950/85 backdrop-blur-md rounded border border-amber-500/30">
              Sample Demonstration Data
            </span>
          ) : property.isVerified ? (
            <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-300 bg-emerald-950/85 backdrop-blur-md rounded border border-emerald-500/30">
              ✓ Verified
            </span>
          ) : null}
        </div>

        {/* Bottom subtle gradient with city badge */}
        <div className="absolute bottom-2 left-3 text-white text-xs font-medium drop-shadow-md flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="drop-shadow-sm">{property.neighborhood}</span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata line without pill badges */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
            <span className="text-slate-700 font-semibold">{property.city}</span>
            <span aria-hidden="true">·</span>
            <span>{property.propertyType}</span>
            <span aria-hidden="true">·</span>
            <span>{property.furnished}</span>
          </div>

          <h3 className="text-base font-semibold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {property.title}
          </h3>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Features & Price Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1" title={`${property.bedrooms} Bedroom(s)`}>
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.bedrooms} Bed</span>
            </div>
            <div className="flex items-center gap-1" title={`${property.bathrooms} Bathroom(s)`}>
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.bathrooms} Bath</span>
            </div>
          </div>

          {/* Tabular Price */}
          <div className="text-right">
            <div className="text-base font-bold text-slate-900 font-mono tabular-nums leading-none">
              Rs. {formattedPrice}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">per month</div>
          </div>
        </div>
      </div>
    </article>
  );
};
