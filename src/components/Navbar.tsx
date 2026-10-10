import React from 'react';
import { Volume2, VolumeX, Music, Sun, Moon, Wrench } from 'lucide-react';
import { UserProfile } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  user: UserProfile;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenProfile: () => void;
  onOpenAdminPanel?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  user,
  isMuted,
  onToggleMute,
  isMusicPlaying,
  onToggleMusic,
  theme,
  onToggleTheme,
  onOpenProfile,
  onOpenAdminPanel,
}) => {
  const navItems = [
    { id: 'match', label: 'Match Arena' },
    { id: 'draft', label: 'Packs & Draft' },
    { id: 'squad', label: 'Squad Pitch' },
    { id: 'fusion', label: 'Fusion Lab' },
    { id: 'leaderboard', label: 'Rankings' },
  ];

  const isAdmin = user.isAdmin || user.email?.toLowerCase().trim() === 'farhanafsar786@gmail.com';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-slate-950/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6 sm:gap-8">
        {/* Zone 1: Single text wordmark */}
        <div
          onClick={() => {
            audioEngine.playClick(600);
            onTabChange('match');
          }}
          className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-400 font-black shadow-[0_0_12px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
            11
          </div>
          <span className="text-base sm:text-lg font-black tracking-wider text-white font-display uppercase">
            ULTIMATE <span className="text-cyan-400">ELEVEN</span>
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  audioEngine.playClick(500);
                  onTabChange(item.id);
                }}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive
                    ? 'text-cyan-400 border-cyan-400 shadow-[0_4px_12px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Passionate Stadium Music Toggle */}
          <button
            onClick={() => {
              onToggleMusic();
              audioEngine.playClick(600);
            }}
            title={isMusicPlaying ? 'Pause Stadium Anthem Music' : 'Play Passionate Stadium Anthem'}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              isMusicPlaying
                ? 'border-cyan-400 bg-cyan-950 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Sound FX Mute Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              audioEngine.playClick(450);
            }}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Light / Dark Theme Toggle */}
          <button
            onClick={() => {
              onToggleTheme();
              audioEngine.playClick(500);
            }}
            title={theme === 'dark' ? 'Switch to Stadium Light Theme' : 'Switch to Cyber Dark Theme'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Admin Executive Console Button (Only visible to admin) */}
          {isAdmin && onOpenAdminPanel && (
            <button
              onClick={() => {
                audioEngine.playClick(750);
                onOpenAdminPanel();
              }}
              title="Open Executive Console"
              className="p-2 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-400 hover:bg-cyan-900 transition-all shadow-[0_0_8px_rgba(6,182,212,0.4)]"
            >
              <Wrench className="w-4 h-4" />
            </button>
          )}

          {/* User Profile Button */}
          <button
            onClick={() => {
              audioEngine.playClick(550);
              onOpenProfile();
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-800 transition-all text-xs font-medium text-slate-200 whitespace-nowrap shrink-0 shadow-sm"
          >
            <span className="text-base leading-none">{user.crest}</span>
            <span className="font-bold text-white max-w-[80px] sm:max-w-[110px] truncate">
              {user.teamName || `@${user.username}`}
            </span>
            <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1 py-0.5 rounded border border-cyan-500/40 tabular-nums">
              Lv.{user.level}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/95 py-2 px-1 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              audioEngine.playClick(500);
              onTabChange(item.id);
            }}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
              currentTab === item.id ? 'text-cyan-400 font-bold bg-cyan-950/50' : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
