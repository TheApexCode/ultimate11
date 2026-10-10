import React, { useState } from 'react';
import { UserProfile } from '../types';
import { createDefaultProfile, saveProfile } from '../utils/storage';
import { audioEngine } from '../utils/audioEngine';
import { GoogleAuthModal } from './GoogleAuthModal';
import { ArrowRight, CheckCircle, Sparkles, Shield, User, Globe } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
}

const CREST_OPTIONS = [
  { id: 'lion', icon: '🦁', name: 'Cyber Lions', defaultTeam: 'Neo Lions FC' },
  { id: 'dragon', icon: '🐉', name: 'Neo Dragons', defaultTeam: 'Cyber Dragons' },
  { id: 'falcon', icon: '🦅', name: 'Solar Falcons', defaultTeam: 'Solar Falcons FC' },
  { id: 'panther', icon: '🐆', name: 'Shadow Panthers', defaultTeam: 'Shadow Panthers' },
  { id: 'shield', icon: '🛡️', name: 'Iron Titans', defaultTeam: 'Iron Titans FC' },
  { id: 'flame', icon: '🔥', name: 'Solar Phoenix', defaultTeam: 'Phoenix Cyber FC' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [username, setUsername] = useState('CyberStriker');
  const [teamName, setTeamName] = useState('Neo All-Stars FC');
  const [selectedCrest, setSelectedCrest] = useState(CREST_OPTIONS[0]);
  const [googleEmail, setGoogleEmail] = useState('');
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle Google Sign In modal opening
  const handleOpenGoogleSignIn = () => {
    audioEngine.playClick(650);
    setIsGoogleModalOpen(true);
  };

  const handleGoogleSuccess = (account: { email: string; displayName: string }) => {
    setGoogleEmail(account.email);
    setIsGoogleSignedIn(true);
    const derivedUsername = account.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(derivedUsername || 'Manager');
    setTeamName(`${derivedUsername.toUpperCase()} FC`);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    const cleanTeam = teamName.trim() || `${cleanUsername} FC`;
    const finalEmail = googleEmail || `${cleanUsername.toLowerCase()}@ultimate11.io`;

    audioEngine.playLevelUp();
    const profile = createDefaultProfile(cleanUsername, selectedCrest.icon, finalEmail, cleanUsername);
    profile.teamName = cleanTeam;
    saveProfile(profile);
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-6 shadow-2xl">
        {/* Glow behind */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-400 font-display font-black text-xl mb-3 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            11
          </div>
          <h2 className="font-display text-2xl font-black uppercase tracking-wider text-white">
            Enter <span className="text-cyan-400">Ultimate Eleven</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in with Google to establish your club identity and save progress in real time.
          </p>
        </div>

        {/* Google Authentication Block */}
        <div className="mb-6">
          {!isGoogleSignedIn ? (
            <button
              type="button"
              onClick={handleOpenGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-800 text-white text-xs font-semibold transition-all hover:border-cyan-400 shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Sign In with Google Account</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-bold text-white">Google Account Linked</span>
                  <div className="text-[10px] text-emerald-300 font-mono">{googleEmail}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenGoogleSignIn}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Switch
              </button>
            </div>
          )}

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-slate-800" />
            <span className="px-3 text-[10px] text-slate-500 font-mono uppercase">Club Registration</span>
            <div className="flex-1 border-t border-slate-800" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Manager Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cyan-400 font-mono text-sm">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                maxLength={20}
                placeholder="ManagerName"
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs sm:text-sm focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-medium"
              />
            </div>
            {error && <p className="text-rose-400 text-[11px] mt-1">{error}</p>}
          </div>

          {/* Team Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Club / Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              maxLength={28}
              placeholder="Your Team Name FC"
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs sm:text-sm focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-medium"
            />
          </div>

          {/* Crest Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Official Club Crest
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CREST_OPTIONS.map((c) => {
                const isSelected = selectedCrest.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      audioEngine.playClick(700);
                      setSelectedCrest(c);
                    }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-2xl mb-0.5">{c.icon}</div>
                    <div className="text-[10px] font-bold text-slate-200 truncate">{c.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starter Perks */}
          <div className="p-3 rounded-xl border border-cyan-500/20 bg-cyan-950/20 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Starting XI Squad + 1,500 Coins + 75 Gems Included</span>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            Launch Club & Enter Arena <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Google Authentication Dialog */}
        <GoogleAuthModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          onSignInSuccess={handleGoogleSuccess}
        />
      </div>
    </div>
  );
};
