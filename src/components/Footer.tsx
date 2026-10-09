import React from 'react';
import { Phone, Mail, ShieldCheck, MessageCircle, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenStaffAuth?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenStaffAuth }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                RN
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Rooms<span className="text-emerald-500">Nepal</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Nepal’s verified room, flat, and apartment rental network. Connecting tenants directly with verified homeowners across Kathmandu, Lalitpur, Bhaktapur, and Pokhara.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <div className="text-slate-300 font-semibold">
                Designed & Developed by Saurav Roka
              </div>
              <div className="text-slate-500 text-[11px]">
                Nepal Rental Platform · 100% Verified Listings in NPR (Rs.)
              </div>
            </div>
          </div>

          {/* Popular Cities */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Popular Cities
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('browse', { city: 'Kathmandu' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Rooms in Kathmandu
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('browse', { city: 'Lalitpur' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Flats in Lalitpur
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('browse', { city: 'Pokhara' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Rentals in Pokhara
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('browse', { city: 'Bhaktapur' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Houses in Bhaktapur
                </button>
              </li>
            </ul>
          </div>

          {/* Rental Types */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Property Types
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('browse', { type: 'Single Room' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Single Private Rooms
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('browse', { type: '1BHK Flat' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  1BHK Flats
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('browse', { type: '2BHK Flat' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  2BHK Family Flats
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('browse', { type: 'Studio' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Studio Rooms
                </button>
              </li>
            </ul>
          </div>

          {/* Genuine Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Support & Contact
            </h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="tel:9766602378" className="hover:text-white transition-colors font-mono">
                  9766602378
                </a>
              </div>

              {/* WhatsApp Option (Nepal Format) */}
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/9779766602378"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium flex items-center gap-1"
                >
                  <span>WhatsApp (+977 9766602378)</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="mailto:sauravroka450@gmail.com" className="hover:text-white transition-colors text-xs truncate">
                  sauravroka450@gmail.com
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenStaffAuth}
                  className="text-xs font-medium text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Staff / Admin Sign In</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar with Creator Credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} RoomsNepal · <span className="text-slate-300 font-medium">Designed & Developed by Saurav Roka</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Landlord Guidelines</span>
            <span className="hover:text-slate-400 cursor-pointer">Nepal Tenancy Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
