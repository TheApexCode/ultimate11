import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from './types';
import { getStoredProfile, saveProfile, createDefaultProfile } from './utils/storage';
import { Navbar } from './components/Navbar';
import { OnboardingModal } from './components/OnboardingModal';
import { ProfileModal } from './components/ProfileModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { MatchArena } from './components/MatchArena';
import { PackDraftModal } from './components/PackDraftModal';
import { PitchSquadView } from './components/PitchSquadView';
import { FusionLab } from './components/FusionLab';
import { LeaderboardView } from './components/LeaderboardView';
import { audioEngine } from './utils/audioEngine';
import { particleEngine } from './utils/particleEngine';
import stadiumBg from './assets/images/stadium_cyberpunk_arena_1791558930675.jpg';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('match');
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load User Profile on mount
  useEffect(() => {
    const existing = getStoredProfile();
    if (existing) {
      setUser(existing);
      if (existing.theme) {
        setTheme(existing.theme);
      }
      checkDailyLoginReward(existing);
    } else {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Listen for storage events (real-time sync across browser tabs and same-window events)
  useEffect(() => {
    const handleStorageChange = () => {
      const refreshed = getStoredProfile();
      if (refreshed) {
        setUser(refreshed);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ultimate_eleven_save', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ultimate_eleven_save', handleStorageChange);
    };
  }, []);

  // Initialize Canvas Particle Engine
  useEffect(() => {
    if (canvasRef.current) {
      particleEngine.init(canvasRef.current);
    }
    return () => {
      particleEngine.stop();
    };
  }, []);

  // Daily Login Reward Check (Pro-Gamer Feature)
  const checkDailyLoginReward = (profile: UserProfile) => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (!profile.lastDailyClaim || now - profile.lastDailyClaim > oneDayMs) {
      const day = ((profile.dailyRewardDay || 1) % 7) + 1;
      const coinReward = day * 400;
      const gemReward = day * 10;

      const updated: UserProfile = {
        ...profile,
        coins: profile.coins + coinReward,
        gems: profile.gems + gemReward,
        dailyRewardDay: day,
        lastDailyClaim: now,
      };
      setUser(updated);
      saveProfile(updated);

      setTimeout(() => {
        audioEngine.playLevelUp();
        particleEngine.triggerVictoryConfetti();
      }, 1000);
    }
  };

  // Handle Audio Mute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setMuted(nextMute);
  };

  // Handle Music Toggle
  const handleToggleMusic = () => {
    const playing = audioEngine.toggleMusic();
    setIsMusicPlaying(playing);
  };

  // Handle Theme Toggle
  const handleToggleTheme = () => {
    const nextTheme: 'dark' | 'light' = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (user) {
      const updated: UserProfile = { ...user, theme: nextTheme };
      setUser(updated);
      saveProfile(updated);
    }
  };

  // Complete Onboarding
  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    setIsOnboardingOpen(false);
    audioEngine.startAmbientCrowd();
    // Auto-start passionate stadium anthem music
    setTimeout(() => {
      audioEngine.startMusic();
      setIsMusicPlaying(true);
    }, 500);
  };

  // Real-time Update User state
  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
    saveProfile(updated);
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`relative min-h-screen ${
        isLight ? 'bg-slate-900 text-slate-100' : 'bg-slate-950 text-slate-100'
      } flex flex-col font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-300`}
    >
      {/* Dynamic Background: Futuristic Stadium Arena Asset */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url(${stadiumBg})`,
        }}
      />
      <div
        className={`fixed inset-0 pointer-events-none z-0 ${
          isLight
            ? 'bg-gradient-to-b from-slate-900/75 via-slate-950/85 to-slate-950'
            : 'bg-gradient-to-b from-slate-950/85 via-slate-950/90 to-slate-950'
        }`}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-scanlines opacity-10" />

      {/* Global Interactive Canvas for Particles, Fireworks, Clashes, Confetti */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-30 w-full h-full"
      />

      {/* Navbar adhering to Top Bar contract */}
      {user && (
        <Navbar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          user={user}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={handleToggleMusic}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        />
      )}

      {/* Main Content View Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto pb-16">
        {user ? (
          <>
            {currentTab === 'match' && (
              <MatchArena
                user={user}
                onUpdateUser={handleUpdateUser}
                onOpenDraft={() => setCurrentTab('draft')}
              />
            )}
            {currentTab === 'draft' && (
              <PackDraftModal
                user={user}
                onUpdateUser={handleUpdateUser}
                onOpenSquadPitch={() => setCurrentTab('squad')}
              />
            )}
            {currentTab === 'squad' && (
              <PitchSquadView user={user} onUpdateUser={handleUpdateUser} />
            )}
            {currentTab === 'fusion' && (
              <FusionLab user={user} onUpdateUser={handleUpdateUser} />
            )}
            {currentTab === 'leaderboard' && <LeaderboardView user={user} />}
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center font-display text-cyan-400 font-bold animate-pulse text-lg">
              Initializing Holographic Stadium Arena...
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />

      {user && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onUpdateUser={handleUpdateUser}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        />
      )}

      {user && (
        <AdminPanelModal
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          user={user}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {/* Clean quiet footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Ultimate Eleven: Global Legends</span>
          <span>Tactical Holographic Football Card Game</span>
        </div>
      </footer>
    </div>
  );
}
