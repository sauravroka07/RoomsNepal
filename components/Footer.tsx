import React from 'react';
import { Hop as Home, Mail, Phone, MessageCircle, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenStaffAuth: () => void;
}

export function Footer({ onNavigate, onOpenStaffAuth }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Rooms<span className="text-emerald-400">Nepal</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Find and rent verified rooms, flats, and apartments across Kathmandu, Pokhara, Lalitpur, and Bhaktapur. Zero broker commissions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate('browse')} className="hover:text-emerald-400 transition-colors">Browse Rooms</button></li>
              <li><button onClick={() => onNavigate('landlord-dashboard')} className="hover:text-emerald-400 transition-colors">Landlord Dashboard</button></li>
              <li><button onClick={() => onNavigate('tenant-dashboard')} className="hover:text-emerald-400 transition-colors">Tenant Dashboard</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <a href="mailto:sauravroka450@gmail.com" className="hover:text-emerald-400 transition-colors">sauravroka450@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <a href="tel:+9779766602378" className="hover:text-emerald-400 transition-colors">+977 9766602378</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <a href="https://wa.me/9779766602378" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">WhatsApp</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">About</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-3">
              Designed &amp; Developed by Saurav Roka.
            </p>
            <button
              onClick={onOpenStaffAuth}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Staff Portal
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} RoomsNepal. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Connecting tenants and landlords across Nepal.
          </p>
        </div>
      </div>
    </footer>
  );
}
