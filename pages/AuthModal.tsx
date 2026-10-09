import React, { useState, useEffect } from 'react';
import { X, Loader as Loader2, Shield, UserPlus, LogIn, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register' | 'admin';
  initialRole: UserRole;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, initialMode, initialRole, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setError('');
      setPassword('');
      setSetupPassword('');
      setNeedsSetup(false);
    }
  }, [isOpen, initialMode, initialRole]);

  useEffect(() => {
    if (mode === 'admin') {
      api.adminSetupStatus().then((res) => setNeedsSetup(!res.isSetup)).catch(() => {});
    }
  }, [mode]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'admin') {
        const res = await api.adminLogin({ email, password, setupPassword: needsSetup ? setupPassword : undefined });
        localStorage.setItem('roomsnepal_admin_token', res.adminToken);
        onSuccess();
        onClose();
        return;
      }

      if (mode === 'register') {
        if (!name.trim() || !email.trim()) {
          setError('Name and email are required.');
          setLoading(false);
          return;
        }
        await register(name.trim(), email.trim(), role, phone.trim() || undefined);
      } else {
        if (!email.trim()) {
          setError('Email is required.');
          setLoading(false);
          return;
        }
        await login(email.trim());
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: string) => {
    setLoading(true);
    setError('');
    try {
      await login('', demoRole);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'admin' ? <Shield className="w-5 h-5 text-emerald-600" /> : mode === 'register' ? <UserPlus className="w-5 h-5 text-emerald-600" /> : <LogIn className="w-5 h-5 text-emerald-600" />}
            <h2 className="font-bold text-slate-900">
              {mode === 'admin' ? 'Staff Portal Login' : mode === 'register' ? 'Create Account' : 'Sign In'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

          {/* Mode tabs (non-admin) */}
          {mode !== 'admin' && (
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Sign In</button>
              <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Register</button>
            </div>
          )}

          {/* Admin mode */}
          {mode === 'admin' ? (
            <>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center gap-2 text-xs text-emerald-700">
                <Lock className="w-4 h-4 flex-shrink-0" />
                Authorized staff access only. Enter admin credentials.
              </div>
              {needsSetup && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
                  First-time setup: Please create an admin password (minimum 6 characters).
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Admin Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin email" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
              </div>
              {needsSetup ? (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Set Admin Password</label>
                  <input type="password" value={setupPassword} onChange={(e) => setSetupPassword(e.target.value)} placeholder="Min 6 characters" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
              )}
            </>
          ) : (
            <>
              {mode === 'register' && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">I am a...</label>
                    <div className="flex gap-2">
                      <button onClick={() => setRole('tenant')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${role === 'tenant' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>
                        Tenant (Looking for rooms)
                      </button>
                      <button onClick={() => setRole('landlord')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${role === 'landlord' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>
                        Landlord (Have rooms)
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
              </div>
              {mode === 'register' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Phone (optional)</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 9766602378" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
              )}
              {mode === 'login' && (
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleDemoLogin('tenant')} className="flex-1 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">Demo Tenant</button>
                  <button onClick={() => handleDemoLogin('landlord')} className="flex-1 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">Demo Landlord</button>
                </div>
              )}
            </>
          )}

          <button onClick={handleSubmit} disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'admin' ? 'Sign In to Admin' : mode === 'register' ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
