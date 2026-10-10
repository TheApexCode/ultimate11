import React, { useState } from 'react';
import { PlayerCard, UserProfile, PositionCategory } from '../types';
import { PlayerCardView } from './PlayerCardView';
import { ClubEmblem } from './ClubEmblem';
import { audioEngine } from '../utils/audioEngine';
import { particleEngine } from '../utils/particleEngine';
import { saveProfile } from '../utils/storage';
import { Shield, Flame, Zap, ArrowLeftRight, Sparkles, Wand2, Check } from 'lucide-react';

interface PitchSquadViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

export const PitchSquadView: React.FC<PitchSquadViewProps> = ({ user, onUpdateUser }) => {
  const [formation, setFormation] = useState<'4-3-3' | '4-4-2' | '3-5-2'>(user.formation || '4-3-3');
  const [selectedPitchIndex, setSelectedPitchIndex] = useState<number | null>(null);
  const [inspectedCard, setInspectedCard] = useState<PlayerCard | null>(null);
  const [optimizationNotice, setOptimizationNotice] = useState<string | null>(null);

  // Compute Squad Ratings safely
  const activeCards = (user.activeSquad || []).filter((c): c is PlayerCard => Boolean(c && c.id));
  const teamOvr =
    activeCards.length > 0
      ? Math.round(activeCards.reduce((acc, c) => acc + (c.ovr || 0), 0) / activeCards.length)
      : 0;

  const teamAtt =
    activeCards.length > 0
      ? Math.round(activeCards.reduce((acc, c) => acc + (c.att || 0), 0) / activeCards.length)
      : 0;

  const teamDef =
    activeCards.length > 0
      ? Math.round(activeCards.reduce((acc, c) => acc + (c.def || 0), 0) / activeCards.length)
      : 0;

  // Chemistry calculation
  let chemistryPoints = 70;
  const nationsCount: Record<string, number> = {};
  const clubsCount: Record<string, number> = {};
  activeCards.forEach((c) => {
    if (c.nation) nationsCount[c.nation] = (nationsCount[c.nation] || 0) + 1;
    if (c.club) clubsCount[c.club] = (clubsCount[c.club] || 0) + 1;
  });
  Object.values(nationsCount).forEach((cnt) => {
    if (cnt >= 2) chemistryPoints += (cnt - 1) * 6;
  });
  Object.values(clubsCount).forEach((cnt) => {
    if (cnt >= 2) chemistryPoints += (cnt - 1) * 8;
  });
  const teamChemistry = Math.min(100, chemistryPoints);

  // Formation coordinates on pitch (percentages: top %, left %)
  const getFormationLayout = (form: '4-3-3' | '4-4-2' | '3-5-2') => {
    if (form === '4-3-3') {
      return [
        { label: 'GK', cat: 'GK', top: 88, left: 50 },
        { label: 'LB', cat: 'DEF', top: 70, left: 16 },
        { label: 'CB', cat: 'DEF', top: 72, left: 38 },
        { label: 'CB', cat: 'DEF', top: 72, left: 62 },
        { label: 'RB', cat: 'DEF', top: 70, left: 84 },
        { label: 'CM', cat: 'MID', top: 48, left: 24 },
        { label: 'CDM', cat: 'MID', top: 52, left: 50 },
        { label: 'CM', cat: 'MID', top: 48, left: 76 },
        { label: 'LW', cat: 'ATT', top: 22, left: 20 },
        { label: 'ST', cat: 'ATT', top: 16, left: 50 },
        { label: 'RW', cat: 'ATT', top: 22, left: 80 },
      ];
    } else if (form === '4-4-2') {
      return [
        { label: 'GK', cat: 'GK', top: 88, left: 50 },
        { label: 'LB', cat: 'DEF', top: 70, left: 16 },
        { label: 'CB', cat: 'DEF', top: 72, left: 38 },
        { label: 'CB', cat: 'DEF', top: 72, left: 62 },
        { label: 'RB', cat: 'DEF', top: 70, left: 84 },
        { label: 'LM', cat: 'MID', top: 48, left: 16 },
        { label: 'CM', cat: 'MID', top: 50, left: 38 },
        { label: 'CM', cat: 'MID', top: 50, left: 62 },
        { label: 'RM', cat: 'MID', top: 48, left: 84 },
        { label: 'ST', cat: 'ATT', top: 20, left: 36 },
        { label: 'ST', cat: 'ATT', top: 20, left: 64 },
      ];
    } else {
      // 3-5-2
      return [
        { label: 'GK', cat: 'GK', top: 88, left: 50 },
        { label: 'CB', cat: 'DEF', top: 72, left: 26 },
        { label: 'CB', cat: 'DEF', top: 74, left: 50 },
        { label: 'CB', cat: 'DEF', top: 72, left: 74 },
        { label: 'LWB', cat: 'MID', top: 50, left: 14 },
        { label: 'CM', cat: 'MID', top: 48, left: 34 },
        { label: 'CAM', cat: 'MID', top: 40, left: 50 },
        { label: 'CM', cat: 'MID', top: 48, left: 66 },
        { label: 'RWB', cat: 'MID', top: 50, left: 86 },
        { label: 'ST', cat: 'ATT', top: 18, left: 36 },
        { label: 'ST', cat: 'ATT', top: 18, left: 64 },
      ];
    }
  };

  const layout = getFormationLayout(formation);

  const handleFormationChange = (f: '4-3-3' | '4-4-2' | '3-5-2') => {
    audioEngine.playClick(500);
    setFormation(f);
    const updated = { ...user, formation: f };
    onUpdateUser(updated);
    saveProfile(updated);
  };

  // Feature: Auto-Pick Best Available Bench Players to Squad on Pitch
  const handleAutoOptimizeSquad = () => {
    audioEngine.playCardWoosh();
    const allCards = [...user.deck];

    // Find best cards for each positional quota based on highest OVR
    const gks = allCards.filter((c) => c.posCategory === 'GK').sort((a, b) => b.ovr - a.ovr);
    const defs = allCards.filter((c) => c.posCategory === 'DEF').sort((a, b) => b.ovr - a.ovr);
    const mids = allCards.filter((c) => c.posCategory === 'MID').sort((a, b) => b.ovr - a.ovr);
    const atts = allCards.filter((c) => c.posCategory === 'ATT').sort((a, b) => b.ovr - a.ovr);

    const pickedIds = new Set<string>();
    const optimizedSquad: PlayerCard[] = [];

    layout.forEach((slot) => {
      let pool: PlayerCard[] = [];
      if (slot.cat === 'GK') pool = gks;
      else if (slot.cat === 'DEF') pool = defs;
      else if (slot.cat === 'MID') pool = mids;
      else if (slot.cat === 'ATT') pool = atts;

      // Find highest OVR card not already picked
      const best = pool.find((c) => !pickedIds.has(c.id));
      if (best) {
        pickedIds.add(best.id);
        optimizedSquad.push(best);
      } else {
        // Fallback if positional depth depleted
        const anyBest = allCards.find((c) => !pickedIds.has(c.id));
        if (anyBest) {
          pickedIds.add(anyBest.id);
          optimizedSquad.push(anyBest);
        } else if (pool[0]) {
          optimizedSquad.push(pool[0]);
        }
      }
    });

    if (optimizedSquad.length === 11) {
      const oldOvr = teamOvr;
      const newOvr = Math.round(optimizedSquad.reduce((a, b) => a + b.ovr, 0) / 11);
      const diff = newOvr - oldOvr;

      const updated: UserProfile = {
        ...user,
        activeSquad: optimizedSquad,
      };

      onUpdateUser(updated);
      saveProfile(updated);

      audioEngine.playLevelUp();
      particleEngine.triggerCardRevealSparkles(window.innerWidth / 2, window.innerHeight / 2, 'Cyber-Icon');

      setOptimizationNotice(
        diff > 0
          ? `Best XI Equipped! Squad OVR increased from ${oldOvr} to ${newOvr} (+${diff})!`
          : `Best XI Configured! Maximum optimal lineup equipped (${newOvr} OVR).`
      );
      setTimeout(() => setOptimizationNotice(null), 3500);
    }
  };

  // Substitute or place bench card into selected pitch slot
  const handleSwapCard = (benchCard: PlayerCard) => {
    if (selectedPitchIndex === null) return;
    audioEngine.playCardWoosh();

    const newActiveSquad = [...user.activeSquad];
    const existingIndex = newActiveSquad.findIndex((c) => c?.id === benchCard.id);
    if (existingIndex !== -1 && existingIndex !== selectedPitchIndex) {
      const temp = newActiveSquad[selectedPitchIndex];
      newActiveSquad[selectedPitchIndex] = benchCard;
      newActiveSquad[existingIndex] = temp;
    } else {
      newActiveSquad[selectedPitchIndex] = benchCard;
    }

    const updated = { ...user, activeSquad: newActiveSquad };
    onUpdateUser(updated);
    saveProfile(updated);
    setSelectedPitchIndex(null);
  };

  // Feature: Add Best Available Bench Player to Selected Pitch Slot
  const handleSubBestBenchForSelectedSlot = () => {
    if (selectedPitchIndex === null) return;
    const targetSlot = layout[selectedPitchIndex];
    if (!targetSlot) return;

    const activeIds = new Set((user.activeSquad || []).filter(Boolean).map((c) => c.id));
    const matchingReserves = user.deck
      .filter((c) => !activeIds.has(c.id) && c.posCategory === targetSlot.cat)
      .sort((a, b) => b.ovr - a.ovr);

    const bestBench = matchingReserves[0] || user.deck.filter((c) => !activeIds.has(c.id)).sort((a, b) => b.ovr - a.ovr)[0];
    if (bestBench) {
      handleSwapCard(bestBench);
      setOptimizationNotice(`Substituted best bench player ${bestBench.name} (${bestBench.ovr} OVR) into ${targetSlot.label}!`);
      setTimeout(() => setOptimizationNotice(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Header and Tactical Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{user.crest}</span>
            <h2 className="font-display text-2xl font-black uppercase text-white">
              {user.teamName || 'Tactical Pitch & Starting XI'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Arrange your 11-player squad, calibrate tactical formation, or auto-equip best available bench players.
          </p>
        </div>

        {/* Tactical Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-Pick Best XI Button */}
          <button
            onClick={handleAutoOptimizeSquad}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <Wand2 className="w-4 h-4" /> Auto-Equip Best XI
          </button>

          {/* Formation Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {(['4-3-3', '4-4-2', '3-5-2'] as const).map((f) => (
              <button
                key={f}
                onClick={() => handleFormationChange(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  formation === f
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-Optimization Success Notice */}
      {optimizationNotice && (
        <div className="mb-5 p-3 rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-400" />
            <span>{optimizationNotice}</span>
          </div>
        </div>
      )}

      {/* Squad KPI Dashboard Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl border border-cyan-500/30 bg-slate-900/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Squad OVR</span>
            <div className="text-2xl font-black font-display text-white tabular-nums">{teamOvr}</div>
          </div>
          <Sparkles className="w-6 h-6 text-cyan-400/50" />
        </div>

        <div className="p-3 rounded-xl border border-rose-500/30 bg-slate-900/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Attack Rating</span>
            <div className="text-2xl font-black font-display text-white tabular-nums">{teamAtt}</div>
          </div>
          <Flame className="w-6 h-6 text-rose-400/50" />
        </div>

        <div className="p-3 rounded-xl border border-emerald-500/30 bg-slate-900/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Defense Rating</span>
            <div className="text-2xl font-black font-display text-white tabular-nums">{teamDef}</div>
          </div>
          <Shield className="w-6 h-6 text-emerald-400/50" />
        </div>

        <div className="p-3 rounded-xl border border-amber-500/30 bg-slate-900/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Synergy Chemistry</span>
            <div className="text-2xl font-black font-display text-amber-400 tabular-nums">{teamChemistry}%</div>
          </div>
          <Zap className="w-6 h-6 text-amber-400/50" />
        </div>
      </div>

      {/* Main Pitch & Bench Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tactical Pitch Canvas (8 Cols) */}
        <div className="lg:col-span-8 relative aspect-[3/4] max-h-[660px] w-full rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-950 overflow-hidden shadow-2xl p-4">
          <div className="absolute inset-0 bg-pitch-grid opacity-30" />
          <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />

          {/* Holographic pitch markings */}
          <div className="absolute inset-6 border-2 border-emerald-400/30 rounded-lg pointer-events-none" />
          <div className="absolute top-1/2 inset-x-6 h-0.5 bg-emerald-400/30 -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-emerald-400/30 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-emerald-400/50 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-emerald-400/30 border-t-0 pointer-events-none" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-emerald-400/30 border-b-0 pointer-events-none" />

          {/* 11 Player Pins on Pitch */}
          {layout.map((pos, idx) => {
            const playerCard = user.activeSquad ? user.activeSquad[idx] : null;
            const isSelected = selectedPitchIndex === idx;

            return (
              <div
                key={idx}
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                onClick={() => {
                  audioEngine.playClick(650);
                  setSelectedPitchIndex(idx);
                  if (playerCard) setInspectedCard(playerCard);
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 z-10 ${
                  isSelected ? 'scale-110 z-20' : 'hover:scale-105'
                }`}
              >
                {playerCard ? (
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 ${
                        isSelected
                          ? 'border-cyan-400 ring-4 ring-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                          : 'border-white/50 shadow-lg'
                      } bg-slate-900 overflow-hidden flex items-center justify-center`}
                    >
                      <img
                        src={playerCard.avatar}
                        alt={playerCard.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute top-0 right-0 p-0.5 bg-slate-950/80 rounded-full">
                        <ClubEmblem club={playerCard.club} size="xs" />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-[8px] font-mono text-cyan-400 font-bold text-center">
                        {playerCard.ovr}
                      </div>
                    </div>
                    <div className="mt-1 px-1.5 py-0.2 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-semibold text-white truncate max-w-[85px] text-center drop-shadow flex items-center justify-center gap-1">
                      <span>{playerCard.shortName}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-11 h-11 rounded-full border-2 border-dashed ${
                      isSelected ? 'border-cyan-400 bg-cyan-950/60' : 'border-slate-600 bg-slate-900/50'
                    } flex flex-col items-center justify-center text-slate-400 text-[10px] font-mono font-bold`}
                  >
                    <span>{pos.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bench & Card Inspector Sidepanel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {inspectedCard && (
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-slate-900/90 flex flex-col items-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-2 font-bold">
                Card Inspection
              </span>
              <PlayerCardView card={inspectedCard} size="sm" />
            </div>
          )}

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4 text-cyan-400" /> Club Reserve Bench
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {user.deck.length} in Deck
              </span>
            </div>

            {selectedPitchIndex !== null ? (
              <div className="mb-3 space-y-2">
                <p className="text-[11px] text-cyan-400 bg-cyan-950/30 p-2 rounded border border-cyan-500/20">
                  Select a reserve player below to substitute into slot #{selectedPitchIndex + 1} ({layout[selectedPitchIndex]?.label})
                </p>
                <button
                  onClick={handleSubBestBenchForSelectedSlot}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Sub Best Available Bench For {layout[selectedPitchIndex]?.label}
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mb-3">
                Click a player pin on the pitch, or click Auto-Equip Best XI above to maximize your squad!
              </p>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {user.deck.map((card) => {
                const isCurrentlyActive = (user.activeSquad || []).some((c) => c?.id === card.id);
                return (
                  <div
                    key={card.id}
                    onClick={() => handleSwapCard(card)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      isCurrentlyActive
                        ? 'border-slate-800 bg-slate-950 opacity-60'
                        : 'border-slate-700 bg-slate-900 hover:border-cyan-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ClubEmblem club={card.club} size="sm" />
                      <span className="font-mono font-bold text-cyan-400 w-6">{card.position}</span>
                      <div>
                        <div className="font-semibold text-white">{card.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {card.club} · {card.nation}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-400 tabular-nums">
                        {card.ovr}
                      </span>
                      {isCurrentlyActive && (
                        <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1 py-0.5 rounded border border-emerald-500/30">
                          In XI
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
