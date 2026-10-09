import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface StaffLoginPageProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const StaffLoginPage: React.FC<StaffLoginPageProps> = ({
  onSuccess,
  onNavigateHome,
}) => {
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('sauravroka450@gmail.com');
  const [password, setPassword] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [confirmSetupPassword, setConfirmSetupPassword] = useState('');
  const [isInitialSetup, setIsInitialSetup] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const status = await api.getAdminSetupStatus();
        setIsInitialSetup(!status.isSetup);
      } catch (err) {
        console.error('Failed to check admin setup status', err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkSetup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');

    if (isInitialSetup) {
      if (!setupPassword || setupPassword.length < 6) {
        setError('Administrator password must be at least 6 characters long.');
        return;
      }
      if (setupPassword !== confirmSetupPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
    } else {
      if (!password) {
        setError('Please enter your administrator password.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isInitialSetup) {
        await loginAdmin(undefined, setupPassword.trim());
        setSuccessNotice('Administrator credentials established successfully!');
      } else {
        await loginAdmin(password.trim());
      }
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err: any) {
      // Generic secure login failure message
      setError(err.message || 'Authentication failed: Invalid credentials or insufficient privileges.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl space-y-6">
        {/* Top return link */}
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to RoomsNepal</span>
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-900 text-purple-200 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            RoomsNepal Staff Portal
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Authorized administrative access for listing moderation, reports, and landlord verification.
          </p>
        </div>

        {checkingStatus ? (
          <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span>Verifying portal security...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Email (Protected) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Administrator Email ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* If initial setup, prompt to set master password */}
            {isInitialSetup ? (
              <>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-purple-950">
                    <KeyRound className="w-4 h-4 text-purple-700" />
                    <span>Initial Master Setup</span>
                  </div>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    Set a secure administrator master password (minimum 6 characters) to protect administrative APIs.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Create Master Password *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Confirm Master Password *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmSetupPassword}
                      onChange={(e) => setConfirmSetupPassword(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-white bg-slate-950 hover:bg-slate-900 disabled:opacity-50 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>{isInitialSetup ? 'Complete Setup & Sign In' : 'Sign In as Administrator'}</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100">
          This portal is strictly reserved for authorized RoomsNepal personnel. All login attempts and administrative actions are logged with audit timestamps.
        </div>
      </div>
    </div>
  );
};
