import React, { useState } from 'react';
import { Hop as Home, Search, Building2, Heart, Shield, Menu, X, Plus, CircleUser as UserCircle } from 'lucide-react';
import type { UserRole } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  onOpenAuth: (mode: 'login' | 'register' | 'admin', initialRole?: UserRole) => void;
  onOpenAddListing: () => void;
}

export function Navbar({ currentView, onNavigate, onOpenAuth, onOpenAddListing }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Home', view: 'home', icon: Home },
    { label: 'Browse Rooms', view: 'browse', icon: Search },
  ];

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Rooms<span className="text-emerald-600">Nepal</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = currentView === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => handleNav(link.view)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => handleNav('landlord-dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'landlord-dashboard'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Landlord
            </button>
            <button
              onClick={() => handleNav('tenant-dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'tenant-dashboard'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Heart className="w-4 h-4" />
              Tenant
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenAddListing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Post Listing
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-emerald-600 rounded-lg text-sm font-semibold transition-colors"
            >
              <UserCircle className="w-5 h-5" />
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('admin')}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-slate-600 rounded-lg text-xs font-medium transition-colors"
              title="Staff / Admin Portal"
            >
              <Shield className="w-4 h-4" />
              Staff
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.view}
                  onClick={() => handleNav(link.view)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => handleNav('landlord-dashboard')}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Building2 className="w-5 h-5" />
              Landlord Dashboard
            </button>
            <button
              onClick={() => handleNav('tenant-dashboard')}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Heart className="w-5 h-5" />
              Tenant Dashboard
            </button>
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <button
                onClick={() => { onOpenAddListing(); setMobileOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Post Listing
              </button>
              <button
                onClick={() => { onOpenAuth('login'); setMobileOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-slate-700 rounded-lg text-sm font-semibold"
              >
                <UserCircle className="w-5 h-5" />
                Sign In
              </button>
              <button
                onClick={() => { onOpenAuth('admin'); setMobileOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-slate-400 rounded-lg text-xs font-medium"
              >
                <Shield className="w-4 h-4" />
                Staff Portal
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
