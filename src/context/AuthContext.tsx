import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminToken: string | null;
  savedPropertyIds: string[];
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  login: (email: string, password?: string, demoRole?: UserRole) => Promise<User>;
  loginAdmin: (password?: string, setupPassword?: string) => Promise<User>;
  register: (name: string, email: string, role: UserRole, phone?: string) => Promise<User>;
  quickLoginDemo: (role: UserRole) => Promise<User>;
  logout: () => void;
  toggleSave: (propertyId: string) => Promise<boolean>;
  isPropertySaved: (propertyId: string) => boolean;
  refreshSaved: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const init = async () => {
      const stored = api.getStoredUser();
      const token = api.getAdminToken();
      if (stored) {
        setUser(stored);
        if (stored.id) {
          loadSaved(stored.id);
        }
      }
      if (token) {
        const isValid = await api.verifyAdminSession();
        if (isValid) {
          setAdminToken(token);
        } else {
          setAdminToken(null);
          if (stored?.role === 'admin') {
            setUser(null);
            api.logout();
          }
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const loadSaved = async (userId: string) => {
    try {
      const data = await api.getSavedProperties(userId);
      setSavedPropertyIds(data.savedIds || []);
    } catch {
      // ignore
    }
  };

  const login = async (email: string, password?: string, demoRole?: UserRole) => {
    const loggedUser = await api.login(email, password, demoRole);
    setUser(loggedUser);
    await loadSaved(loggedUser.id);
    showToast(`Welcome back, ${loggedUser.name}!`);
    return loggedUser;
  };

  const loginAdmin = async (password?: string, setupPassword?: string) => {
    const res = await api.adminLogin('sauravroka450@gmail.com', password, setupPassword);
    setUser(res.user);
    setAdminToken(res.adminToken);
    showToast('Administrator session authenticated successfully!');
    return res.user;
  };

  const register = async (name: string, email: string, role: UserRole, phone?: string) => {
    const targetRole: 'tenant' | 'landlord' = role === 'landlord' ? 'landlord' : 'tenant';
    const newUser = await api.register(name, email, targetRole, phone);
    setUser(newUser);
    showToast(`Account created successfully as ${targetRole === 'landlord' ? 'Property Owner' : 'Tenant'}!`);
    return newUser;
  };

  const quickLoginDemo = async (role: UserRole) => {
    if (role === 'admin') {
      throw new Error('Administrator accounts require direct password authentication.');
    }
    return login(role === 'landlord' ? 'landlord@roomsnepal.com' : 'tenant@roomsnepal.com', undefined, role);
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setAdminToken(null);
    setSavedPropertyIds([]);
    showToast('Signed out successfully.', 'info');
  };

  const toggleSave = async (propertyId: string): Promise<boolean> => {
    if (!user) {
      showToast('Please log in to save properties to your favorites.', 'info');
      return false;
    }
    const currently = savedPropertyIds.includes(propertyId);
    const newSaved = await api.toggleSaveProperty(propertyId, user.id, currently);
    if (newSaved) {
      setSavedPropertyIds(prev => [...prev, propertyId]);
      showToast('Property added to saved favorites.');
    } else {
      setSavedPropertyIds(prev => prev.filter(id => id !== propertyId));
      showToast('Property removed from saved favorites.', 'info');
    }
    return newSaved;
  };

  const isPropertySaved = (propertyId: string) => {
    return savedPropertyIds.includes(propertyId);
  };

  const refreshSaved = async () => {
    if (user) {
      await loadSaved(user.id);
    }
  };

  const isAdmin = Boolean(user?.role === 'admin' && adminToken);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        adminToken,
        savedPropertyIds,
        toasts,
        showToast,
        login,
        loginAdmin,
        register,
        quickLoginDemo,
        logout,
        toggleSave,
        isPropertySaved,
        refreshSaved,
      }}
    >
      {children}
      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-slate-800 text-slate-100 border-slate-700'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
