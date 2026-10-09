import React, { useState, useEffect } from 'react';
import { X, User, Hop as Home, Mail, Lock, Phone, ArrowRight, ShieldCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'admin';
  initialRole?: UserRole;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'tenant',
  onSuccess,
}) => {
  const { login, loginAdmin, register, quickLoginDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'admin'>('login');
  const [role, setRole] = useState<UserRole>(initialRole === 'admin' ? 'tenant' : initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminNeedsSetup, setAdminNeedsSetup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    if (initialMode === 'admin') {
      setMode('admin');
      setEmail('sauravroka450@gmail.com');
      api.getAdminSetupStatus().then(status => {
        setAdminNeedsSetup(!status.isSetup);
      }).catch(() => setAdminNeedsSetup(false));
    } else {
      setMode(initialMode);
      setRole(initialRole === 'admin' ? 'tenant' : initialRole);
    }
    setError('');
    setPassword('');
    setConfirmPassword('');
    setForgotSuccess(false);
  }, [initialMode, initialRole, isOpen]);

  const switchMode = (newMode: 'login' | 'register' | 'forgot' | 'admin') => {
    setMode(newMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
    if (newMode === 'admin') {
      setEmail('sauravroka450@gmail.com');
      api.getAdminSetupStatus().then(status => {
        setAdminNeedsSetup(!status.isSetup);
      }).catch(() => setAdminNeedsSetup(false));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'admin') {
        if (adminNeedsSetup) {
          if (password.length < 6) {
            throw new Error('Administrator password must be at least 6 characters.');
          }
          if (password !== confirmPassword) {
            throw new Error('Passwords do not match. Please re-enter.');
          }
          await loginAdmin(password, password);
        } else {
          await loginAdmin(password);
        }
      } else if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name');
        await register(name.trim(), email.trim(), role, phone.trim());
      } else if (mode === 'forgot') {
        setForgotSuccess(true);
        setSubmitting(false);
        return;
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoRole: UserRole) => {
    setError('');
    setSubmitting(true);
    try {
      await quickLoginDemo(demoRole);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                RN
              </div>
              <span className="text-sm font-bold text-slate-900">
                {mode === 'admin' ? 'RoomsNepal Staff Portal' : 'RoomsNepal Account'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'admin'
                ? adminNeedsSetup ? 'Administrator Initial Setup' : 'Administrator Sign In'
                : mode === 'login'
                ? 'Welcome Back'
                : mode === 'register'
                ? 'Join RoomsNepal'
                : 'Reset Password'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'admin'
                ? adminNeedsSetup
                  ? 'Set your initial secure admin password for Saurav Roka (sauravroka450@gmail.com)'
                  : 'Authorized access for Saurav Roka (sauravroka450@gmail.com)'
                : mode === 'login'
                ? 'Sign in to manage listings, save rooms, or track inquiries'
                : mode === 'register'
                ? 'Connect directly with verified rooms and tenants across Nepal'
                : 'Enter your email to receive recovery instructions'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Quick Logins (Only on normal login) */}
        {mode === 'login' && (
          <div className="px-6 pt-4 pb-2 bg-slate-50/70 border-b border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Instant 1-Click Test Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('tenant')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1.5 shadow-2xs transition-all"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demo Tenant</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('landlord')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1.5 shadow-2xs transition-all"
              >
                <Home className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demo Landlord</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {forgotSuccess && (
            <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
              Password reset link has been dispatched to your email address.
            </div>
          )}

          {/* Role selector on Register */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">I am joining as a:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('tenant')}
                  className={`p-3 text-left rounded-xl border flex items-center gap-2.5 transition-all ${
                    role === 'tenant'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <User className={`w-4 h-4 ${role === 'tenant' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold block leading-none">Tenant</span>
                    <span className="text-[10px] opacity-80 mt-0.5 block">Looking for a room/flat</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('landlord')}
                  className={`p-3 text-left rounded-xl border flex items-center gap-2.5 transition-all ${
                    role === 'landlord'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Home className={`w-4 h-4 ${role === 'landlord' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold block leading-none">Landlord</span>
                    <span className="text-[10px] opacity-80 mt-0.5 block">Listing property in Nepal</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Name (Registration only) */}
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bijay Thapa"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={mode === 'admin'}
                value={mode === 'admin' ? 'sauravroka450@gmail.com' : email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@nepalmail.np"
                className={`w-full text-xs border rounded-lg pl-8 pr-3 py-2.5 text-slate-900 focus:outline-none ${
                  mode === 'admin'
                    ? 'bg-slate-100 border-slate-300 font-medium'
                    : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-500'
                }`}
              />
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Phone (Registration only) */}
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Nepali Contact Mobile</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9766602378"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          )}

          {/* Password — only for admin portal; tenant/landlord login is email-only */}
          {mode === 'admin' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  {adminNeedsSetup ? 'Create Administrator Password (min 6 chars) *' : 'Staff Administrator Password *'}
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
              {!adminNeedsSetup && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Protected server authentication token will be granted upon verification.
                </p>
              )}
            </div>
          )}

          {/* Info notice for email-only login */}
          {(mode === 'login' || mode === 'register') && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-start gap-2">
              <span className="mt-0.5">&#9432;</span>
              <span>
                {mode === 'login'
                  ? 'RoomsNepal uses secure email-based sign-in. Enter your registered email to continue.'
                  : 'Registration is free and instant. Just your name and email to get started.'}
              </span>
            </div>
          )}

          {/* Confirm Password on Admin Initial Setup */}
          {mode === 'admin' && adminNeedsSetup && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Confirm Administrator Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
              <p className="text-[10px] text-purple-700 mt-1 font-medium">
                This password will be securely hashed on the server and used for future administrator access.
              </p>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2.5 text-xs font-bold text-white rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors mt-2 ${
              mode === 'admin'
                ? 'bg-purple-900 hover:bg-purple-800'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <span>
              {mode === 'admin'
                ? submitting
                  ? 'Authenticating Staff...'
                  : adminNeedsSetup
                  ? 'Initialize Admin Password & Sign In'
                  : 'Sign In as Staff / Administrator'
                : mode === 'login'
                ? submitting ? 'Signing In...' : 'Sign In'
                : mode === 'register'
                ? submitting ? 'Creating Account...' : `Register as ${role === 'landlord' ? 'Landlord' : 'Tenant'}`
                : submitting ? 'Sending...' : 'Send Reset Link'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Footer Modes Switcher */}
          <div className="pt-2 text-center text-xs text-slate-500 space-y-1.5">
            {mode === 'admin' ? (
              <p>
                Return to{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Standard Tenant / Landlord Login
                </button>
              </p>
            ) : mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  Create one free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
