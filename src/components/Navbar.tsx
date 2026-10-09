import React, { useState } from 'react';
import { Home, Bookmark, PlusCircle, User, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (initialMode?: 'login' | 'register', initialRole?: 'tenant' | 'landlord') => void;
  onOpenAddListing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenAddListing,
}) => {
  const { user, logout, savedPropertyIds, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleListPropertyClick = () => {
    if (!user) {
      onOpenAuth('register', 'landlord');
    } else if (user.role === 'landlord') {
      onOpenAddListing();
    } else {
      // Tenant trying to list
      onNavigate('landlord-dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-left group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-emerald-600 transition-colors">
              <span className="text-base tracking-tighter">RN</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                Rooms<span className="text-emerald-600">Nepal</span>
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'home' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('browse')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'browse' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              Browse Rooms
            </button>
            <button
              onClick={() => {
                if (currentView === 'home') {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onNavigate('home');
                  setTimeout(() => {
                    const el = document.getElementById('how-it-works');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </button>
            {user?.role === 'tenant' && (
              <button
                onClick={() => onNavigate('tenant-dashboard')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  currentView === 'tenant-dashboard' ? 'text-emerald-700 font-semibold' : ''
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved ({savedPropertyIds.length})</span>
              </button>
            )}
            {user?.role === 'landlord' && (
              <button
                onClick={() => onNavigate('landlord-dashboard')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'landlord-dashboard' ? 'text-emerald-700 font-semibold' : ''
                }`}
              >
                Landlord Hub
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`hover:text-purple-700 transition-colors whitespace-nowrap shrink-0 font-semibold flex items-center gap-1 text-purple-700 ${
                  currentView === 'admin-dashboard' ? 'underline' : ''
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin Portal</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {user.role}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-semibold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    {user.role === 'landlord' ? (
                      <button
                        onClick={() => {
                          onNavigate('landlord-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Home className="w-3.5 h-3.5 text-slate-500" />
                        <span>Landlord Dashboard</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onNavigate('tenant-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tenant Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  Join Free
                </button>
              </div>
            )}

            <button
              onClick={handleListPropertyClick}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>List Property</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={handleListPropertyClick}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg"
            >
              List Room
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 text-sm font-medium text-slate-800 hover:text-emerald-700"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('browse');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 text-sm font-medium text-slate-800 hover:text-emerald-700"
            >
              Browse Rooms & Flats
            </button>
            {user ? (
              <>
                {user.role === 'landlord' ? (
                  <button
                    onClick={() => {
                      onNavigate('landlord-dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-2 text-sm font-medium text-slate-800 hover:text-emerald-700"
                  >
                    Landlord Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onNavigate('tenant-dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-2 text-sm font-medium text-slate-800 hover:text-emerald-700"
                  >
                    Tenant Dashboard ({savedPropertyIds.length} Saved)
                  </button>
                )}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    Signed in as <span className="font-semibold text-slate-900">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-semibold text-rose-600"
                  >
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center text-xs font-semibold text-white bg-emerald-700 rounded-lg"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
