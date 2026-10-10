import React, { useState } from 'react';
import { PlayerCard, UserProfile, CardRarity, PositionCategory } from '../types';
import { drawRandomCard, RAW_PLAYERS_POOL, instantiateCard } from '../data/cardData';
import { PlayerCardView } from './PlayerCardView';
import { ClubEmblem } from './ClubEmblem';
import { audioEngine } from '../utils/audioEngine';
import { particleEngine } from '../utils/particleEngine';
import { saveProfile } from '../utils/storage';
import { Sparkles, Coins, Gem, CheckCircle, RefreshCw, Trophy, ArrowRight, Shield } from 'lucide-react';

interface PackDraftModalProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenSquadPitch: () => void;
}

export const PackDraftModal: React.FC<PackDraftModalProps> = ({
  user,
  onUpdateUser,
  onOpenSquadPitch,
}) => {
  // Mode: 'PACK_STORE' or 'SQUAD_DRAFT'
  const [subMode, setSubMode] = useState<'PACK_STORE' | 'SQUAD_DRAFT'>('SQUAD_DRAFT');

  // Pack Store State
  const [revealedCards, setRevealedCards] = useState<{ card: PlayerCard; isFlipped: boolean }[]>([]);
  const [isOpeningPack, setIsOpeningPack] = useState(false);

  // 11-Player Draft State
  const [draftStep, setDraftStep] = useState(1); // 1 to 11
  const [draftedSquad, setDraftedSquad] = useState<PlayerCard[]>([]);
  const [draftChoices, setDraftChoices] = useState<PlayerCard[]>([]);
  const [flippedChoiceIdx, setFlippedChoiceIdx] = useState<number | null>(null);
  const [isDraftFinished, setIsDraftFinished] = useState(false);

  // Calculate current drafted positional counts
  const draftCounts = {
    GK: draftedSquad.filter((c) => c.posCategory === 'GK').length,
    DEF: draftedSquad.filter((c) => c.posCategory === 'DEF').length,
    MID: draftedSquad.filter((c) => c.posCategory === 'MID').length,
    ATT: draftedSquad.filter((c) => c.posCategory === 'ATT').length,
  };

  // Determine what position category is needed next
  const getRequiredCategoryForStep = (step: number): PositionCategory => {
    // 11 total slots:
    // Slot 1: GK (Must have 1 GK)
    if (step === 1) return 'GK';
    // Slots 2-5: DEF (4 DEF)
    if (step >= 2 && step <= 5) return 'DEF';
    // Slots 6-8: MID (3 MID)
    if (step >= 6 && step <= 8) return 'MID';
    // Slots 9-11: ATT (3 ATT)
    return 'ATT';
  };

  // Start new 11-Player Draft
  const startNewDraft = () => {
    audioEngine.playWhistle();
    setDraftStep(1);
    setDraftedSquad([]);
    setFlippedChoiceIdx(null);
    setIsDraftFinished(false);
    generateChoicesForStep(1);
  };

  // Generate 3 random cards for the required position
  const generateChoicesForStep = (step: number) => {
    const targetCat = getRequiredCategoryForStep(step);
    const pool = RAW_PLAYERS_POOL.filter((p) => p.posCategory === targetCat);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const candidates = shuffled.slice(0, 3).map((t) => instantiateCard(t.templateId, 1));
    setDraftChoices(candidates);
    setFlippedChoiceIdx(null);
  };

  // Select & Flip Card during Draft
  const handleSelectDraftChoice = (index: number) => {
    if (flippedChoiceIdx !== null) return; // already picked this step
    const card = draftChoices[index];
    setFlippedChoiceIdx(index);

    audioEngine.playCardFlip();
    if (card.rarity === 'Cyber-Icon' || card.rarity === 'Legendary') {
      audioEngine.playRarityFanfare(card.rarity);
    }
    particleEngine.triggerCardRevealSparkles(window.innerWidth / 2, window.innerHeight / 2, card.rarity);

    setTimeout(() => {
      const nextSquad = [...draftedSquad, card];
      setDraftedSquad(nextSquad);

      if (draftStep >= 11) {
        // Completed Draft!
        setIsDraftFinished(true);
        audioEngine.playGoalExplosion();
        particleEngine.triggerVictoryConfetti();

        // Add cards to collection & set active squad
        const updatedDeck = [...user.deck];
        nextSquad.forEach((c) => {
          if (!updatedDeck.some((d) => d.templateId === c.templateId)) {
            updatedDeck.push(c);
          }
        });

        const updatedUser: UserProfile = {
          ...user,
          deck: updatedDeck,
          activeSquad: nextSquad,
          coins: user.coins + 500, // Draft completion reward
          exp: user.exp + 100,
        };
        onUpdateUser(updatedUser);
        saveProfile(updatedUser);
      } else {
        const nextStep = draftStep + 1;
        setDraftStep(nextStep);
        generateChoicesForStep(nextStep);
      }
    }, 1200);
  };

  // Open Standard Pack (Cost: 500 Coins)
  const handleOpenStandardPack = () => {
    if (user.coins < 500) return;
    setIsOpeningPack(true);
    audioEngine.playCardWoosh();

    const drawn: PlayerCard[] = [
      drawRandomCard('standard'),
      drawRandomCard('standard'),
      drawRandomCard('standard'),
    ];

    const updatedUser: UserProfile = {
      ...user,
      coins: user.coins - 500,
      deck: [...user.deck, ...drawn],
    };
    onUpdateUser(updatedUser);
    saveProfile(updatedUser);

    setTimeout(() => {
      setRevealedCards(drawn.map((c) => ({ card: c, isFlipped: true })));
      setIsOpeningPack(false);
      audioEngine.playRarityFanfare(drawn[0].rarity);
      particleEngine.triggerCardRevealSparkles(window.innerWidth / 2, window.innerHeight / 2, drawn[0].rarity);
    }, 800);
  };

  // Open Cyber-Icon Pack (Cost: 40 Gems)
  const handleOpenIconPack = () => {
    if (user.gems < 40) return;
    setIsOpeningPack(true);
    audioEngine.playCardWoosh();

    const drawn: PlayerCard[] = [
      drawRandomCard('icon'),
      drawRandomCard('icon'),
    ];

    const updatedUser: UserProfile = {
      ...user,
      gems: user.gems - 40,
      deck: [...user.deck, ...drawn],
    };
    onUpdateUser(updatedUser);
    saveProfile(updatedUser);

    setTimeout(() => {
      setRevealedCards(drawn.map((c) => ({ card: c, isFlipped: true })));
      setIsOpeningPack(false);
      audioEngine.playRarityFanfare('Cyber-Icon');
      particleEngine.triggerCardRevealSparkles(window.innerWidth / 2, window.innerHeight / 2, 'Cyber-Icon');
    }, 800);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Submode Switcher Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-black uppercase text-white flex items-center gap-2">
            The Infinite Deck & Draft
          </h2>
          <p className="text-xs text-slate-400">
            Draft an 11-player squad with tactical positional balance or unlock global icon packs.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => {
              audioEngine.playClick(600);
              setSubMode('SQUAD_DRAFT');
              if (draftChoices.length === 0) startNewDraft();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subMode === 'SQUAD_DRAFT'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            11-Player Draft
          </button>
          <button
            onClick={() => {
              audioEngine.playClick(600);
              setSubMode('PACK_STORE');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subMode === 'PACK_STORE'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pack Store
          </button>
        </div>
      </div>

      {/* --- SQUAD DRAFT MODE --- */}
      {subMode === 'SQUAD_DRAFT' && (
        <div>
          {/* Tactical Draft Status Bar */}
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-slate-900/80 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold">
                Pick {draftStep} of 11 · Next Target: {getRequiredCategoryForStep(draftStep)}
              </span>
              <div className="text-base font-bold text-white flex items-center gap-2">
                Drafting Active XI Squad
              </div>
            </div>

            {/* Positional quotas */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className={`px-2 py-1 rounded ${draftCounts.GK === 1 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-300'}`}>
                GK: {draftCounts.GK}/1
              </span>
              <span className={`px-2 py-1 rounded ${draftCounts.DEF >= 3 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-300'}`}>
                DEF: {draftCounts.DEF}/4
              </span>
              <span className={`px-2 py-1 rounded ${draftCounts.MID >= 3 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-300'}`}>
                MID: {draftCounts.MID}/3
              </span>
              <span className={`px-2 py-1 rounded ${draftCounts.ATT >= 1 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-300'}`}>
                ATT: {draftCounts.ATT}/3
              </span>
            </div>

            <button
              onClick={startNewDraft}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Restart Draft
            </button>
          </div>

          {!isDraftFinished ? (
            <div>
              {/* Central Glowing 3D Deck Presentation */}
              <div className="text-center mb-4">
                <span className="text-xs text-slate-400">
                  Select 1 card to flip and recruit to your active starting lineup:
                </span>
              </div>

              {/* 3 Choice Cards */}
              <div className="flex flex-wrap items-center justify-center gap-6 my-6 min-h-[350px]">
                {draftChoices.map((card, idx) => {
                  const isFlipped = flippedChoiceIdx === idx;
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleSelectDraftChoice(idx)}
                      className="transition-transform duration-300 hover:scale-105"
                    >
                      <PlayerCardView
                        card={card}
                        size="md"
                        showBack={!isFlipped}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Current drafted lineup preview chips */}
              <div className="mt-8 border-t border-slate-800 pt-4">
                <div className="text-xs text-slate-400 font-semibold mb-2">
                  Drafted Roster ({draftedSquad.length}/11)
                </div>
                <div className="flex flex-wrap gap-2">
                  {draftedSquad.map((c, i) => (
                    <div
                      key={c.id}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs flex items-center gap-1.5"
                    >
                      <ClubEmblem club={c.club} size="xs" />
                      <span className="text-cyan-400 font-mono font-bold">{c.position}</span>
                      <span className="text-white font-medium">{c.shortName}</span>
                      <span className="text-amber-400 font-mono text-[10px] tabular-nums">
                        {c.ovr}
                      </span>
                    </div>
                  ))}
                  {Array.from({ length: 11 - draftedSquad.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="px-3 py-1 rounded-lg border border-dashed border-slate-800 text-slate-600 text-xs font-mono"
                    >
                      Slot {draftedSquad.length + i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Draft Complete Celebration */
            <div className="p-8 rounded-2xl border-2 border-cyan-400 bg-slate-900/90 text-center max-w-xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-3xl mx-auto mb-4 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                🏆
              </div>
              <h3 className="font-display text-2xl font-black text-white uppercase">
                11-Player Squad Complete!
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                Your tactical lineup is finalized and synchronized. You earned +500 Cyber Coins and +100 EXP!
              </p>

              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={onOpenSquadPitch}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  Inspect Squad on Pitch <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={startNewDraft}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800 text-white font-bold text-xs"
                >
                  Draft Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- PACK STORE MODE --- */}
      {subMode === 'PACK_STORE' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Standard Prime Pack */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                    Standard Pack
                  </span>
                  <span className="text-xs text-amber-400 font-mono font-bold flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> 500 Coins
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-white">Global Prime Booster</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Draws 3 football players with guaranteed Rare or Epic card potential.
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleOpenStandardPack}
                  disabled={isOpeningPack || user.coins < 500}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition-all"
                >
                  {user.coins < 500 ? 'Insufficient Coins' : 'Open Pack (500 Coins)'}
                </button>
              </div>
            </div>

            {/* Cyber-Icon Elite Pack */}
            <div className="p-6 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-950 hover:border-amber-400 transition-all flex flex-col justify-between shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                    Elite Icon Pack
                  </span>
                  <span className="text-xs text-cyan-400 font-mono font-bold flex items-center gap-1">
                    <Gem className="w-3.5 h-3.5" /> 40 Gems
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-amber-300">Cyber-Icon Sovereign</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Draws 2 top-tier superstars with ultra-high probability for Legendary & Cyber-Icons.
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleOpenIconPack}
                  disabled={isOpeningPack || user.gems < 40}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-40 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
                >
                  {user.gems < 40 ? 'Insufficient Gems' : 'Open Pack (40 Gems)'}
                </button>
              </div>
            </div>
          </div>

          {/* Pack Opened Results Grid */}
          {revealedCards.length > 0 && (
            <div className="mt-8 border-t border-slate-800 pt-6 text-center">
              <h4 className="font-display text-lg font-black uppercase text-white mb-4">
                Cards Recruited to Deck!
              </h4>
              <div className="flex flex-wrap items-center justify-center gap-6">
                {revealedCards.map(({ card }) => (
                  <PlayerCardView key={card.id} card={card} size="md" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
