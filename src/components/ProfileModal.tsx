import React, { useState } from 'react';
import { UserProfile } from '../types';
import { saveProfile } from '../utils/storage';
import { audioEngine } from '../utils/audioEngine';
import { GoogleAuthModal } from './GoogleAuthModal';
import { X, Trophy, Flame, Coins, Gem, Sparkles, History, Shield, Check, Edit3, Wrench, RefreshCw, Mail } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenAdminPanel?: () => void;
}

const CREST_OPTIONS = ['🦁', '🐉', '🦅', '🐆', '🛡️', '🔥'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onOpenAdminPanel,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [teamNameInput, setTeamNameInput] = useState(user.teamName || `${user.username} FC`);
  const [selectedCrest, setSelectedCrest] = useState(user.crest);
  const [googleEmailInput, setGoogleEmailInput] = useState(user.email);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const totalMatches = user.wins + user.losses + user.draws;
  const winRate = totalMatches > 0 ? Math.round((user.wins / totalMatches) * 100) : 0;
  const expPercentage = Math.min(100, Math.round((user.exp / user.nextLevelExp) * 100));

  const iconsCount = user.deck.filter((c) => c.rarity === 'Cyber-Icon').length;
  const legCount = user.deck.filter((c) => c.rarity === 'Legendary').length;

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = usernameInput.trim().replace(/^@/, '') || user.username;
    const cleanTeam = teamNameInput.trim() || `${cleanUsername} FC`;
    const cleanEmail = googleEmailInput.trim() || user.email;

    const isAdmin = cleanEmail.toLowerCase() === 'farhanafsar786@gmail.com' || Boolean(user.isAdmin);

    const updated: UserProfile = {
      ...user,
      username: cleanUsername,
      teamName: cleanTeam,
      email: cleanEmail,
      crest: selectedCrest,
      isAdmin,
    };

    onUpdateUser(updated);
    saveProfile(updated);
    setIsEditing(false);
    setSavedNotice(true);
    audioEngine.playLevelUp();
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleGoogleSuccess = (account: { email: string; displayName: string }) => {
    setGoogleEmailInput(account.email);
    const derived = account.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
    setUsernameInput(derived || usernameInput);
    const cleanTeam = `${derived.toUpperCase()} FC`;
    setTeamNameInput(cleanTeam);

    const isAdmin = account.email.toLowerCase() === 'farhanafsar786@gmail.com' || Boolean(user.isAdmin);
    const updated: UserProfile = {
      ...user,
      email: account.email,
      username: derived || user.username,
      teamName: cleanTeam,
      isAdmin,
    };
    onUpdateUser(updated);
    saveProfile(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => {
            audioEngine.playClick(400);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-20 h-20 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            {user.crest}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="font-display text-2xl font-black text-white">@{user.username}</h2>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/40 tabular-nums">
                Level {user.level}
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all text-xs flex items-center gap-1"
                title="Edit Username & Team Name"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-sm font-semibold text-cyan-300 mt-0.5 flex items-center justify-center sm:justify-start gap-2">
              <span>{user.teamName || `${user.username} FC`}</span>
              {user.winStreak > 0 && (
                <span className="text-[10px] text-amber-400 font-mono bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-500/30">
                  🔥 {user.winStreak} Streak
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-0.5 font-mono">{user.email}</p>

            {/* EXP Bar */}
            <div className="mt-3 max-w-md">
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>XP Progress</span>
                <span className="text-cyan-400 tabular-nums">
                  {user.exp} / {user.nextLevelExp} EXP ({expPercentage}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${expPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Identity Edit Section */}
        {isEditing && (
          <form onSubmit={handleSaveIdentity} className="my-5 p-4 rounded-xl border border-cyan-500/40 bg-slate-950/90 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Update Manager & Club Info
              </span>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick(600);
                  setIsGoogleModalOpen(true);
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 cursor-pointer"
              >
                <Mail className="w-3 h-3" /> Link / Switch Google Account
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Manager Tag</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  maxLength={20}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Official Team Name</label>
                <input
                  type="text"
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  maxLength={28}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Club Crest</label>
              <div className="flex items-center gap-2">
                {CREST_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCrest(c)}
                    className={`w-9 h-9 rounded-lg border text-xl flex items-center justify-center transition-all ${
                      selectedCrest === c ? 'border-cyan-400 bg-cyan-950/60 ring-2 ring-cyan-400' : 'border-slate-800 bg-slate-900'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Save Identity
              </button>
            </div>
          </form>
        )}

        {savedNotice && (
          <div className="my-3 p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Profile and Team Name updated in real time!</span>
          </div>
        )}

        {/* Currency & Resource Strips */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-center gap-3">
            <Coins className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">Cyber Coins</div>
              <div className="text-lg font-black font-mono text-amber-400 tabular-nums">{user.coins.toLocaleString()}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex items-center gap-3">
            <Gem className="w-6 h-6 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Nano Gems</div>
              <div className="text-lg font-black font-mono text-cyan-400 tabular-nums">{user.gems.toLocaleString()}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-950/20 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider">Fusion Tokens</div>
              <div className="text-lg font-black font-mono text-purple-400 tabular-nums">{user.fusionTokens.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Career Record KPIs */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 mb-5">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-cyan-400" /> Career Duel Record
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Matches</span>
              <p className="text-xl font-black font-mono text-white tabular-nums">{totalMatches}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-emerald-400 uppercase">Victories</span>
              <p className="text-xl font-black font-mono text-emerald-400 tabular-nums">{user.wins}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-rose-400 uppercase">Defeats</span>
              <p className="text-xl font-black font-mono text-rose-400 tabular-nums">{user.losses}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-cyan-400 uppercase">Win Rate</span>
              <p className="text-xl font-black font-mono text-cyan-400 tabular-nums">{winRate}%</p>
            </div>
          </div>
        </div>

        {/* Admin Console Quick Trigger (Only shown if user is admin) */}
        {(user.isAdmin || user.email?.toLowerCase().trim() === 'farhanafsar786@gmail.com') && onOpenAdminPanel && (
          <div className="mb-5 p-3.5 rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Wrench className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="font-bold text-white text-xs">Executive Command Console</div>
                <div className="text-[10px] text-cyan-300">Unlimited coins, card spawning, and squad boosts</div>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAdminPanel();
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase font-mono shadow-md"
            >
              Open Console
            </button>
          </div>
        )}

        {/* Match History */}
        <div>
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <History className="w-4 h-4 text-cyan-400" /> Recent Stadium Duels
          </h3>
          {user.matchHistory.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
              No recorded matches yet. Head to the Match Arena to play your first duel!
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {user.matchHistory.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-black px-1.5 py-0.5 rounded text-[10px] ${
                        m.result === 'WIN'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : m.result === 'LOSS'
                          ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {m.result}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200">vs {m.opponentName}</div>
                      <div className="text-[10px] text-slate-500">{m.mode}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-display font-black text-base tabular-nums">
                      {m.userScore} - {m.opponentScore}
                    </span>
                    <span className="text-amber-400 font-mono text-[11px] tabular-nums">
                      +{m.coinsEarned} Coins
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
