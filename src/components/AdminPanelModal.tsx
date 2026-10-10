import React, { useState } from 'react';
import { UserProfile, PlayerCard } from '../types';
import { RAW_PLAYERS_POOL, instantiateCard } from '../data/cardData';
import { audioEngine } from '../utils/audioEngine';
import { particleEngine } from '../utils/particleEngine';
import { saveProfile } from '../utils/storage';
import { X, Wrench, Coins, Gem, Sparkles, Zap, Trophy, ShieldAlert, Plus, Check } from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    audioEngine.playLevelUp();
    particleEngine.triggerCardRevealSparkles(window.innerWidth / 2, window.innerHeight / 2, 'Cyber-Icon');
    setTimeout(() => setFeedback(null), 2500);
  };

  // Add Coins
  const handleAddCoins = (amount: number) => {
    const updated: UserProfile = {
      ...user,
      coins: user.coins + amount,
    };
    onUpdateUser(updated);
    saveProfile(updated);
    showFeedback(`+${amount.toLocaleString()} Coins Injected!`);
  };

  // Add Gems
  const handleAddGems = (amount: number) => {
    const updated: UserProfile = {
      ...user,
      gems: user.gems + amount,
    };
    onUpdateUser(updated);
    saveProfile(updated);
    showFeedback(`+${amount.toLocaleString()} Gems Injected!`);
  };

  // Add Fusion Tokens
  const handleAddTokens = (amount: number) => {
    const updated: UserProfile = {
      ...user,
      fusionTokens: user.fusionTokens + amount,
    };
    onUpdateUser(updated);
    saveProfile(updated);
    showFeedback(`+${amount} Fusion Tokens Injected!`);
  };

  // Max Out All Active Cards to Level 10
  const handleMaxOutSquad = () => {
    const maxedSquad = user.activeSquad.map((c) => {
      if (!c) return c;
      const boost = (10 - c.level) * 2;
      return {
        ...c,
        level: 10,
        ovr: Math.min(99, c.ovr + boost),
        att: Math.min(99, c.att + boost),
        def: Math.min(99, c.def + boost),
        ctr: Math.min(99, c.ctr + boost),
        sta: Math.min(99, c.sta + boost),
      };
    });

    const updatedDeck = user.deck.map((dc) => {
      const match = maxedSquad.find((ms) => ms.id === dc.id);
      return match || dc;
    });

    const updated: UserProfile = {
      ...user,
      activeSquad: maxedSquad,
      deck: updatedDeck,
    };
    onUpdateUser(updated);
    saveProfile(updated);
    showFeedback('Entire Starting XI upgraded to Level 10!');
  };

  // Spawn Specific Card
  const handleSpawnCard = (templateId: string) => {
    const newCard = instantiateCard(templateId, 5);
    const updated: UserProfile = {
      ...user,
      deck: [newCard, ...user.deck],
    };
    onUpdateUser(updated);
    saveProfile(updated);
    showFeedback(`Spawned ${newCard.name} (Lv. 5) into your deck!`);
  };

  // Increase Level & Win Record
  const handleBoostCareer = () => {
    const updated: UserProfile = {
      ...user,
      level: user.level + 5,
      wins: user.wins + 10,
      winStreak: (user.winStreak || 0) + 5,
    };
    onUpdateUser(updated);
    saveProfile(updated);
    showFeedback('+5 Manager Levels & +10 Wins Added!');
  };

  const iconicCards = [
    { id: 'messi-icon', name: 'Lionel Messi (96 OVR)' },
    { id: 'ronaldo-icon', name: 'Cristiano Ronaldo (95 OVR)' },
    { id: 'zidane-icon', name: 'Zinedine Zidane (96 OVR)' },
    { id: 'maldini-icon', name: 'Paolo Maldini (96 OVR)' },
    { id: 'yashin-icon', name: 'Lev Yashin (96 OVR)' },
    { id: 'mbappe-leg', name: 'Kylian Mbappé (94 OVR)' },
    { id: 'haaland-leg', name: 'Erling Haaland (93 OVR)' },
    { id: 'bellingham-leg', name: 'Jude Bellingham (92 OVR)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-cyan-400 bg-slate-900/95 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                Executive Command Console
              </h2>
              <span className="text-[10px] text-cyan-400 font-mono">
                System Administrator Privileges Active
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              audioEngine.playClick(400);
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mb-4 p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Section 1: Resource Injection */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
              <Coins className="w-4 h-4 text-amber-400" /> Instant Currency Grant
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleAddCoins(25000)}
                className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 text-xs font-bold font-mono transition-all"
              >
                +25,000 Coins
              </button>
              <button
                onClick={() => handleAddCoins(100000)}
                className="p-2.5 rounded-lg border border-amber-500/40 bg-amber-950/30 hover:bg-amber-950/50 text-amber-300 text-xs font-bold font-mono transition-all"
              >
                +100,000 Coins
              </button>
              <button
                onClick={() => handleAddGems(500)}
                className="p-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 text-xs font-bold font-mono transition-all"
              >
                +500 Gems
              </button>
              <button
                onClick={() => handleAddTokens(50)}
                className="p-2.5 rounded-lg border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 text-xs font-bold font-mono transition-all"
              >
                +50 Tokens
              </button>
            </div>
          </div>

          {/* Section 2: Squad God Mode */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 text-cyan-400" /> Squad Optimization & Career
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleMaxOutSquad}
                className="p-3 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-950 to-blue-950 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-all text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-white font-display font-bold">Max Out Starting XI</div>
                  <div className="text-[10px] text-cyan-400 font-mono">Elevate all 11 players to Lv. 10</div>
                </div>
                <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
              </button>

              <button
                onClick={handleBoostCareer}
                className="p-3 rounded-lg border border-emerald-500/40 bg-gradient-to-r from-emerald-950 to-teal-950 hover:border-emerald-400 text-emerald-300 text-xs font-bold transition-all text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-white font-display font-bold">+10 Wins & +5 Levels</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Instant career record elevation</div>
                </div>
                <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* Section 3: Instant Player Card Spawner */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-4 h-4 text-purple-400" /> Legendary Card Vault Spawner
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {iconicCards.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSpawnCard(c.id)}
                  className="p-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-cyan-500/50 hover:bg-slate-800 text-xs text-left transition-all flex items-center justify-between text-slate-200"
                >
                  <span className="font-semibold text-white">{c.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 flex items-center gap-0.5">
                    <Plus className="w-3 h-3" /> Spawn
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
