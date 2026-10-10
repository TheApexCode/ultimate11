import React, { useState } from 'react';
import { X, Check, ShieldCheck, Mail, User, ArrowRight } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInSuccess: (account: { email: string; displayName: string; photoURL?: string }) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSignInSuccess,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = (email: string, name: string) => {
    audioEngine.playLevelUp();
    onSignInSuccess({
      email,
      displayName: name,
    });
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customEmail.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Please enter a valid Google Account email address.');
      return;
    }
    const derivedName = displayName.trim() || trimmed.split('@')[0];
    audioEngine.playLevelUp();
    onSignInSuccess({
      email: trimmed,
      displayName: derivedName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          onClick={() => {
            audioEngine.playClick(400);
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-white shadow-md mx-auto flex items-center justify-center mb-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">Sign in with Google</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            to continue to <span className="text-cyan-400 font-semibold">Ultimate Eleven: Global Legends</span>
          </p>
        </div>

        {!showCustomInput ? (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300 mb-1">
              Choose a Google account:
            </div>

            {/* Quick One-Tap Account Options */}
            <button
              onClick={() => handleSelectAccount('tactical.manager@gmail.com', 'Alex Striker')}
              className="w-full p-3 rounded-xl border border-slate-800 bg-slate-800/80 hover:bg-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  A
                </div>
                <div>
                  <div className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors">
                    Alex Striker
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">tactical.manager@gmail.com</div>
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={() => handleSelectAccount('fut.legend@gmail.com', 'Kaiser Football')}
              className="w-full p-3 rounded-xl border border-slate-800 bg-slate-800/80 hover:bg-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  K
                </div>
                <div>
                  <div className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors">
                    Kaiser Football
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">fut.legend@gmail.com</div>
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Switch / Custom Account Button */}
            <button
              onClick={() => {
                setShowCustomInput(true);
                setError(null);
              }}
              className="w-full p-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-400 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-cyan-400" /> Use another Google Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="text-xs font-semibold text-slate-300">
              Enter your Google Account email:
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Google Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Display Name (Optional)</label>
              <input
                type="text"
                placeholder="Manager Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {error && (
              <div className="text-rose-400 text-[11px] font-medium bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Back to accounts
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 cursor-pointer transition-all"
              >
                Sign In <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Security Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>OAuth 2.0 Secure Authentication · Real-Time Cloud Sync</span>
        </div>
      </div>
    </div>
  );
};
