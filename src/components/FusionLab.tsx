import React, { useState } from 'react';
import { PlayerCard, UserProfile } from '../types';
import { PlayerCardView } from './PlayerCardView';
import { ClubEmblem } from './ClubEmblem';
import { audioEngine } from '../utils/audioEngine';
import { particleEngine } from '../utils/particleEngine';
import { saveProfile } from '../utils/storage';
import { Sparkles, Coins, ArrowUpCircle, Shield, Flame, Zap, Activity } from 'lucide-react';

interface FusionLabProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

export const FusionLab: React.FC<FusionLabProps> = ({ user, onUpdateUser }) => {
  const [selectedCard, setSelectedCard] = useState<PlayerCard | null>(user.deck[0] || null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Upgrade calculation
  const currentLevel = selectedCard?.level || 1;
  const isMaxLevel = currentLevel >= 10;
  const coinCost = currentLevel * 300;
  const tokenCost = Math.max(1, Math.floor(currentLevel / 2));

  const canAfford =
    user.coins >= coinCost && user.fusionTokens >= tokenCost && !isMaxLevel;

  const handlePerformUpgrade = () => {
    if (!selectedCard || !canAfford) return;

    setIsUpgrading(true);
    audioEngine.playLevelUp();
    particleEngine.triggerCardRevealSparkles(
      window.innerWidth / 2,
      window.innerHeight / 2,
      selectedCard.rarity
    );

    setTimeout(() => {
      const nextLevel = selectedCard.level + 1;
      const boostedCard: PlayerCard = {
        ...selectedCard,
        level: nextLevel,
        ovr: Math.min(99, selectedCard.ovr + 2),
        att: Math.min(99, selectedCard.att + 2),
        def: Math.min(99, selectedCard.def + 2),
        ctr: Math.min(99, selectedCard.ctr + 2),
        sta: Math.min(99, selectedCard.sta + 2),
      };

      // Update in deck and in activeSquad
      const updatedDeck = user.deck.map((c) => (c.id === selectedCard.id ? boostedCard : c));
      const updatedSquad = user.activeSquad.map((c) => (c.id === selectedCard.id ? boostedCard : c));

      const updatedUser: UserProfile = {
        ...user,
        coins: user.coins - coinCost,
        fusionTokens: user.fusionTokens - tokenCost,
        deck: updatedDeck,
        activeSquad: updatedSquad,
      };

      setSelectedCard(boostedCard);
      setIsUpgrading(false);
      onUpdateUser(updatedUser);
      saveProfile(updatedUser);
    }, 800);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4 mb-6">
        <h2 className="font-display text-2xl font-black uppercase text-white flex items-center gap-2">
          Holographic Fusion & Upgrade Lab
        </h2>
        <p className="text-xs text-slate-400">
          Infuse Fusion Tokens into player cards to elevate level (Lv. 1 → Lv. 10) and unlock prismatic glowing borders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Deck Cards List (5 Cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Select Card to Upgrade
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">
              {user.deck.length} In Collection
            </span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {user.deck.map((card) => {
              const isSelected = selectedCard?.id === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    audioEngine.playClick(600);
                    setSelectedCard(card);
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400 shadow-md'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ClubEmblem club={card.club} size="sm" />
                    <span className="font-mono font-bold text-cyan-400 w-6">{card.position}</span>
                    <div>
                      <div className="font-semibold text-white">{card.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {card.club} · {card.rarity}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                      Lv.{card.level}
                    </span>
                    <span className="font-mono font-black text-white tabular-nums">
                      {card.ovr} OVR
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Upgrade Chamber (7 Cols) */}
        {selectedCard && (
          <div className="lg:col-span-7 p-6 rounded-2xl border border-cyan-500/30 bg-slate-900/90 shadow-2xl flex flex-col items-center">
            <div className="text-center mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Level Matrix Chamber
              </span>
              <h3 className="font-display text-xl font-bold text-white mt-0.5">
                {selectedCard.name}
              </h3>
            </div>

            {/* Central Card Display */}
            <div className="my-2">
              <PlayerCardView card={selectedCard} size="md" />
            </div>

            {/* Level Boost Stat Differential Preview */}
            <div className="w-full max-w-md my-4 p-4 rounded-xl border border-white/10 bg-slate-950/80">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Stat Projection</span>
                <span className="text-cyan-400 font-mono text-xs">
                  {isMaxLevel ? 'MAX LEVEL REACHED' : `Level ${currentLevel} → Level ${currentLevel + 1}`}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-rose-400 block font-bold">ATT</span>
                  <span className="text-white font-bold">{selectedCard.att}</span>
                  {!isMaxLevel && <span className="text-emerald-400 text-[10px] block font-bold">+2</span>}
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-emerald-400 block font-bold">DEF</span>
                  <span className="text-white font-bold">{selectedCard.def}</span>
                  {!isMaxLevel && <span className="text-emerald-400 text-[10px] block font-bold">+2</span>}
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-cyan-400 block font-bold">CTR</span>
                  <span className="text-white font-bold">{selectedCard.ctr}</span>
                  {!isMaxLevel && <span className="text-emerald-400 text-[10px] block font-bold">+2</span>}
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-amber-400 block font-bold">STA</span>
                  <span className="text-white font-bold">{selectedCard.sta}</span>
                  {!isMaxLevel && <span className="text-emerald-400 text-[10px] block font-bold">+2</span>}
                </div>
              </div>
            </div>

            {/* Cost and Upgrade CTA */}
            <div className="w-full max-w-md">
              {!isMaxLevel ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Upgrade Cost:</span>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" /> {coinCost} Coins
                      </span>
                      <span className="text-purple-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> {tokenCost} Tokens
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handlePerformUpgrade}
                    disabled={!canAfford || isUpgrading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isUpgrading ? (
                      <span className="animate-pulse">Synthesizing Holographic Boost...</span>
                    ) : !canAfford ? (
                      'Insufficient Resources'
                    ) : (
                      <>
                        <ArrowUpCircle className="w-4 h-4" /> Fuse & Level Up Card
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-3 text-center text-xs font-bold text-amber-400 bg-amber-950/30 rounded-xl border border-amber-500/30">
                  ★ Transcendent Status: Card has achieved maximum Level 10 power!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
