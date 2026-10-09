import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { BrowseRoomsPage } from './pages/BrowseRoomsPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { LandlordDashboard } from './pages/LandlordDashboard';
import { TenantDashboard } from './pages/TenantDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthModal } from './pages/AuthModal';
import { PropertyFormModal } from './components/PropertyFormModal';
import { SathiAiChat } from './components/SathiAiChat';
import { Property, FilterState, UserRole } from './types';
import { api } from './services/api';

function AppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'browse' | 'property' | 'landlord-dashboard' | 'tenant-dashboard' | 'admin-dashboard'>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [browseFilters, setBrowseFilters] = useState<Partial<FilterState>>({});
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'admin'>('login');
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('tenant');
  const [addListingModalOpen, setAddListingModalOpen] = useState(false);

  // Load featured listings for home page
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await api.getProperties({ limit: 6 });
        setFeaturedProperties(res.properties);
      } catch (err) {
        console.error('Failed to load featured properties', err);
      }
    };
    loadFeatured();
  }, []);

  // Listen to hash changes for deep linking (e.g. #/property/prop-ktm-01)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/property/')) {
        const id = hash.replace('#/property/', '');
        if (id) {
          setSelectedPropertyId(id);
          setCurrentView('property');
        }
      } else if (hash === '#/browse') {
        setCurrentView('browse');
      } else if (hash === '#/landlord') {
        setCurrentView('landlord-dashboard');
      } else if (hash === '#/tenant') {
        setCurrentView('tenant-dashboard');
      } else if (hash === '#/admin') {
        setCurrentView('admin-dashboard');
      } else if (hash === '#/' || hash === '') {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: string, params?: any) => {
    if (view === 'home') {
      window.location.hash = '#/';
      setCurrentView('home');
    } else if (view === 'browse') {
      if (params) setBrowseFilters(params);
      window.location.hash = '#/browse';
      setCurrentView('browse');
    } else if (view === 'property') {
      if (params?.id) {
        setSelectedPropertyId(params.id);
        window.location.hash = `#/property/${params.id}`;
        setCurrentView('property');
      }
    } else if (view === 'landlord-dashboard') {
      if (!user) {
        setAuthMode('login');
        setAuthInitialRole('landlord');
        setAuthModalOpen(true);
      } else {
        window.location.hash = '#/landlord';
        setCurrentView('landlord-dashboard');
      }
    } else if (view === 'tenant-dashboard') {
      if (!user) {
        setAuthMode('login');
        setAuthInitialRole('tenant');
        setAuthModalOpen(true);
      } else {
        window.location.hash = '#/tenant';
        setCurrentView('tenant-dashboard');
      }
    } else if (view === 'admin-dashboard') {
      window.location.hash = '#/admin';
      setCurrentView('admin-dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProperty = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    window.location.hash = `#/property/${propertyId}`;
    setCurrentView('property');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'admin' = 'login', initialRole: UserRole = 'tenant') => {
    setAuthMode(mode);
    setAuthInitialRole(initialRole);
    setAuthModalOpen(true);
  };

  const handleOpenAddListing = () => {
    if (!user) {
      setAuthMode('register');
      setAuthInitialRole('landlord');
      setAuthModalOpen(true);
    } else if (user.role !== 'landlord') {
      handleNavigate('landlord-dashboard');
    } else {
      setAddListingModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenAddListing={handleOpenAddListing}
      />

      {/* Main Page Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            featuredProperties={featuredProperties}
            onSelectProperty={handleSelectProperty}
            onNavigateBrowse={(filters) => {
              if (filters) setBrowseFilters(filters);
              handleNavigate('browse');
            }}
            onOpenAddListing={handleOpenAddListing}
          />
        )}

        {currentView === 'browse' && (
          <BrowseRoomsPage
            initialFilters={browseFilters}
            onSelectProperty={handleSelectProperty}
          />
        )}

        {currentView === 'property' && selectedPropertyId && (
          <PropertyDetailPage
            propertyId={selectedPropertyId}
            onBack={() => handleNavigate('browse')}
            onSelectProperty={handleSelectProperty}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'landlord-dashboard' && (
          <LandlordDashboard
            onSelectProperty={handleSelectProperty}
            onOpenAddModal={() => setAddListingModalOpen(true)}
          />
        )}

        {currentView === 'tenant-dashboard' && (
          <TenantDashboard
            onSelectProperty={handleSelectProperty}
            onNavigateBrowse={() => handleNavigate('browse')}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            onSelectProperty={handleSelectProperty}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenStaffAuth={() => handleOpenAuth('admin')}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        initialRole={authInitialRole}
        onSuccess={() => {
          if (authMode === 'admin') {
            handleNavigate('admin-dashboard');
          } else if (authInitialRole === 'landlord' && currentView === 'home') {
            setCurrentView('landlord-dashboard');
          }
        }}
      />

      {/* Add Listing Modal */}
      <PropertyFormModal
        isOpen={addListingModalOpen}
        onClose={() => setAddListingModalOpen(false)}
        onSuccess={(saved) => {
          setFeaturedProperties(prev => [saved, ...prev]);
          if (currentView === 'landlord-dashboard') {
            // refresh
          } else {
            handleNavigate('landlord-dashboard');
          }
        }}
      />

      {/* Sathi AI Assistant for Nepal Rentals */}
      <SathiAiChat
        currentPropertyId={currentView === 'property' && selectedPropertyId ? selectedPropertyId : undefined}
        onSelectProperty={handleSelectProperty}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
