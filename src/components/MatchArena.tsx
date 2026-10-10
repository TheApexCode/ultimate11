import React, { useState, useEffect } from 'react';
import { PlayerCard, UserProfile, DuelRoundResult, DuelType, AIDifficulty } from '../types';
import { generateAISquad } from '../data/cardData';
import { PlayerCardView } from './PlayerCardView';
import { ClubEmblem } from './ClubEmblem';
import { audioEngine } from '../utils/audioEngine';
import { particleEngine } from '../utils/particleEngine';
import { addMatchResultToProfile } from '../utils/storage';
import {
  Flame,
  Shield,
  Zap,
  Swords,
  RotateCcw,
  Users,
  Bot,
  CheckCircle2,
  AlertTriangle,
  FastForward,
  Trophy,
  Sparkles,
  Info,
  LayoutGrid,
  ListFilter,
  Activity,
  X,
  Eye,
} from 'lucide-react';

interface MatchArenaProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenDraft: () => void;
}

export const MatchArena: React.FC<MatchArenaProps> = ({ user, onUpdateUser, onOpenDraft }) => {
  // Game Setup
  const [matchMode, setMatchMode] = useState<'AI' | 'PVP'>('AI');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('World Class');
  const [isMatchActive, setIsMatchActive] = useState(false);
  const [matchmakingSearching, setMatchmakingSearching] = useState(false);
  const [squadErrorNotice, setSquadErrorNotice] = useState<string | null>(null);
  const [matchSpeed, setMatchSpeed] = useState<1 | 2>(1);

  // Active Match State
  const [currentRound, setCurrentRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [playerHand, setPlayerHand] = useState<PlayerCard[]>([]);
  const [opponentHand, setOpponentHand] = useState<PlayerCard[]>([]);
  const [selectedPlayerCard, setSelectedPlayerCard] = useState<PlayerCard | null>(null);
  const [selectedDuelType, setSelectedDuelType] = useState<DuelType>('attack');
  const [selectedOpponentCard, setSelectedOpponentCard] = useState<PlayerCard | null>(null);
  const [duelPhase, setDuelPhase] = useState<'SELECTION' | 'CLASHING' | 'RESULT' | 'MATCH_OVER'>('SELECTION');
  const [lastRoundResult, setLastRoundResult] = useState<DuelRoundResult | null>(null);
  const [roundHistory, setRoundHistory] = useState<DuelRoundResult[]>([]);
  const [opponentName, setOpponentName] = useState('Cyber Dynamos Prime');
  const [opponentCrest, setOpponentCrest] = useState('🦁');

  // Pro-Gamer Tactical View Controls
  const [handViewMode, setHandViewMode] = useState<'cards' | 'matrix'>('cards');
  const [inspectedCard, setInspectedCard] = useState<PlayerCard | null>(null);

  // Start Ambient crowd on mount
  useEffect(() => {
    audioEngine.startAmbientCrowd();
    return () => {
      audioEngine.stopAmbientCrowd();
    };
  }, []);

  // Initialize Match
  const handleStartMatch = () => {
    const validCards = (user.activeSquad || []).filter((c): c is PlayerCard => Boolean(c && c.id));
    if (validCards.length < 11) {
      setSquadErrorNotice('Incomplete Starting Lineup: You need a full 11-player squad to enter the arena.');
      return;
    }

    setSquadErrorNotice(null);

    if (matchMode === 'PVP') {
      setMatchmakingSearching(true);
      audioEngine.playClick(700);
      setTimeout(() => {
        setMatchmakingSearching(false);
        const pvpNames = ['NeoViper_99', 'CyberKaiser_FC', 'SolarStriker_X', 'TitanWall_07'];
        const chosenOpponent = pvpNames[Math.floor(Math.random() * pvpNames.length)];
        const oppData = generateAISquad('World Class');
        setupMatchState(validCards, oppData.cards, `@${chosenOpponent}`, '🐉');
      }, 1200);
    } else {
      audioEngine.playWhistle();
      const oppData = generateAISquad(difficulty);
      setupMatchState(validCards, oppData.cards, oppData.name, oppData.crest);
    }
  };

  const setupMatchState = (playerCards: PlayerCard[], oppCards: PlayerCard[], oppName: string, oppCrestStr: string) => {
    setPlayerHand([...playerCards]);
    setOpponentHand([...oppCards]);
    setCurrentRound(1);
    setPlayerScore(0);
    setOpponentScore(0);
    setSelectedPlayerCard(playerCards[0] || null);
    setSelectedOpponentCard(null);
    setLastRoundResult(null);
    setRoundHistory([]);
    setOpponentName(oppName);
    setOpponentCrest(oppCrestStr);
    setDuelPhase('SELECTION');
    setIsMatchActive(true);
    audioEngine.playWhistle();
  };

  // AI logic to pick its card safely
  const chooseOpponentCard = (hand: PlayerCard[], duel: DuelType): PlayerCard => {
    if (!hand || hand.length === 0) {
      return playerHand[0] || (user.activeSquad[0] as PlayerCard);
    }
    if (hand.length === 1) return hand[0];

    if (duel === 'attack') {
      const sorted = [...hand].sort((a, b) => (b.def || 0) - (a.def || 0));
      return sorted[0];
    } else if (duel === 'defense') {
      const sorted = [...hand].sort((a, b) => (b.att || 0) - (a.att || 0));
      return sorted[0];
    } else {
      const sorted = [...hand].sort((a, b) => (b.ctr || 0) - (a.ctr || 0));
      return sorted[0];
    }
  };

  // Execute Round Duel
  const handleExecuteDuel = () => {
    if (!selectedPlayerCard) return;

    const oppCard = chooseOpponentCard(opponentHand, selectedDuelType);
    if (!oppCard) return;

    setSelectedOpponentCard(oppCard);
    setDuelPhase('CLASHING');

    audioEngine.playClash();
    particleEngine.triggerClashImpact();

    const delay = matchSpeed === 2 ? 650 : 1200;

    setTimeout(() => {
      let pBase = 0;
      let oppBase = 0;

      if (selectedDuelType === 'attack') {
        pBase = selectedPlayerCard.att || 80;
        oppBase = oppCard.def || 80;
      } else if (selectedDuelType === 'defense') {
        pBase = selectedPlayerCard.def || 80;
        oppBase = oppCard.att || 80;
      } else {
        pBase = selectedPlayerCard.ctr || 80;
        oppBase = oppCard.ctr || 80;
      }

      const pSkillActive = selectedPlayerCard.specialSkill?.favoredDuel === selectedDuelType;
      const oppSkillActive = oppCard.specialSkill?.favoredDuel === selectedDuelType;

      const pSkillBoost = pSkillActive ? (selectedPlayerCard.specialSkill?.boostValue || 0) : 0;
      const oppSkillBoost = oppSkillActive ? (oppCard.specialSkill?.boostValue || 0) : 0;

      const pTactical = 1 + (Math.random() * 0.14 - 0.04);
      const oppTactical = 1 + (Math.random() * 0.14 - 0.04);

      const pTotal = Math.round((pBase + pSkillBoost) * pTactical);
      const oppTotal = Math.round((oppBase + oppSkillBoost) * oppTactical);

      let winner: 'player' | 'opponent' | 'draw' = 'draw';
      let commentary = '';

      if (pTotal > oppTotal) {
        winner = 'player';
        setPlayerScore((prev) => prev + 1);
        audioEngine.playGoalExplosion();
        particleEngine.triggerGoalExplosion();
        commentary = `GOAL! ${selectedPlayerCard.name} (${selectedPlayerCard.club}) overpowers ${oppCard.name} in a thrilling ${selectedDuelType} duel (${pTotal} vs ${oppTotal})!`;
      } else if (oppTotal > pTotal) {
        winner = 'opponent';
        setOpponentScore((prev) => prev + 1);
        commentary = `OPPONENT SCORES! ${oppCard.name} (${oppCard.club}) outmaneuvers ${selectedPlayerCard.name} to fire past the keeper (${oppTotal} vs ${pTotal}).`;
      } else {
        winner = 'draw';
        commentary = `BLOCKED! Heroic save denies both ${selectedPlayerCard.name} and ${oppCard.name}! Stalemate in Round ${currentRound}!`;
      }

      const result: DuelRoundResult = {
        roundNumber: currentRound,
        playerCard: selectedPlayerCard,
        aiCard: oppCard,
        duelType: selectedDuelType,
        playerBaseStat: pBase,
        aiBaseStat: oppBase,
        playerMultiplier: Number(pTactical.toFixed(2)),
        aiMultiplier: Number(oppTactical.toFixed(2)),
        playerTotal: pTotal,
        aiTotal: oppTotal,
        playerSkillActive: pSkillActive,
        aiSkillActive: oppSkillActive,
        winner,
        commentary,
      };

      setLastRoundResult(result);
      setRoundHistory((prev) => [...prev, result]);
      setDuelPhase('RESULT');

      const nextPHand = playerHand.filter((c) => c.id !== selectedPlayerCard.id);
      const nextOppHand = opponentHand.filter((c) => c.id !== oppCard.id);
      setPlayerHand(nextPHand);
      setOpponentHand(nextOppHand);
    }, delay);
  };

  const handleProceedNextRound = () => {
    audioEngine.playClick(600);
    if (currentRound >= 11) {
      setDuelPhase('MATCH_OVER');
      audioEngine.playWhistle();

      let finalResult: 'WIN' | 'LOSS' | 'DRAW' = 'DRAW';
      let coinsEarned = 150;
      let expEarned = 60;

      if (playerScore > opponentScore) {
        finalResult = 'WIN';
        coinsEarned = 350;
        expEarned = 120;
        particleEngine.triggerVictoryConfetti();
      } else if (playerScore < opponentScore) {
        finalResult = 'LOSS';
        coinsEarned = 80;
        expEarned = 35;
      }

      const updatedUser = addMatchResultToProfile(user, {
        opponentName,
        userScore: playerScore,
        opponentScore,
        result: finalResult,
        mode: matchMode === 'PVP' ? 'PvP Cyber League' : `AI: ${difficulty}`,
        coinsEarned,
        expEarned,
      });
      onUpdateUser(updatedUser);
    } else {
      setCurrentRound((prev) => prev + 1);
      const nextRemaining = playerHand;
      setSelectedPlayerCard(nextRemaining[0] || null);
      setSelectedOpponentCard(null);
      setLastRoundResult(null);
      setDuelPhase('SELECTION');
    }
  };

  // Check if selected player skill matches active duel
  const isSkillActiveForSelected =
    selectedPlayerCard && selectedPlayerCard.specialSkill?.favoredDuel === selectedDuelType;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6">
      {!isMatchActive ? (
        /* MATCH LOBBY */
        <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-cyan-500/30 bg-slate-900/95 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Stadium Arena 11
            </span>
            <h2 className="font-display text-3xl font-black uppercase text-white mt-1">
              Football Duel Matchmaking
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              11-Round turn-based tactical card battle. Select your cards wisely!
            </p>
          </div>

          {squadErrorNotice && (
            <div className="p-3 mb-5 rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{squadErrorNotice}</span>
              </div>
              <button
                onClick={onOpenDraft}
                className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-[11px] shrink-0"
              >
                Go to Draft
              </button>
            </div>
          )}

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => {
                audioEngine.playClick(600);
                setMatchMode('AI');
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                matchMode === 'AI'
                  ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400 shadow-md'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              <Bot className="w-6 h-6 text-cyan-400 mb-2" />
              <div className="font-bold text-white text-sm">Human vs Game Master AI</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Scalable difficulty neural simulation</div>
            </button>

            <button
              onClick={() => {
                audioEngine.playClick(600);
                setMatchMode('PVP');
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                matchMode === 'PVP'
                  ? 'border-purple-400 bg-purple-950/40 ring-1 ring-purple-400 shadow-md'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              <Users className="w-6 h-6 text-purple-400 mb-2" />
              <div className="font-bold text-white text-sm">Human vs Human (PvP)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Online ranked cyber league duel</div>
            </button>
          </div>

          {/* AI Difficulty Selector */}
          {matchMode === 'AI' && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Game Master AI Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Amateur', 'World Class', 'AI Overlord'] as AIDifficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      audioEngine.playClick(500);
                      setDifficulty(d);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      difficulty === d
                        ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs">{d}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                      {d === 'Amateur' ? 'Lv. 1 Bot' : d === 'World Class' ? 'Lv. 3 All-Stars' : 'Lv. 5 Icons'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Squad Readiness */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 mb-6 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{user.crest}</span>
              <div>
                <span className="font-bold text-white">{user.teamName || `@${user.username}`}</span>
                <div className="text-[10px] text-slate-400 font-mono">
                  {user.activeSquad.filter(Boolean).length}/11 Active Cards Loaded
                </div>
              </div>
            </div>
            <span className="text-emerald-400 font-bold font-mono flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Ready
            </span>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleStartMatch}
            disabled={matchmakingSearching}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {matchmakingSearching ? (
              <span className="animate-pulse">Finding Rival Manager in Cyber League...</span>
            ) : (
              <>
                <Swords className="w-5 h-5" /> Kickoff Match Arena
              </>
            )}
          </button>
        </div>
      ) : (
        /* ACTIVE MATCH ARENA */
        <div className="space-y-4 sm:space-y-6">
          {/* Top Scoreboard HUD */}
          <div className="p-3 sm:p-4 rounded-2xl border border-cyan-500/40 bg-slate-950/95 shadow-xl flex items-center justify-between gap-2">
            {/* Player Info */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                {user.crest}
              </div>
              <div>
                <span className="text-[9px] font-mono text-cyan-400 font-bold block">HOME</span>
                <div className="font-bold text-white text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[180px]">
                  {user.teamName || `@${user.username}`}
                </div>
              </div>
            </div>

            {/* Score & Round Tracker */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 font-display font-black text-2xl sm:text-3xl tabular-nums">
                <span className="text-cyan-400">{playerScore}</span>
                <span className="text-slate-600 text-lg">-</span>
                <span className="text-rose-400">{opponentScore}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Round {currentRound} / 11
                </span>
                {/* Speed Toggle */}
                <button
                  onClick={() => setMatchSpeed(matchSpeed === 1 ? 2 : 1)}
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition-all ${
                    matchSpeed === 2
                      ? 'border-amber-500/60 bg-amber-950/50 text-amber-300'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                  title="Toggle Match Clash Speed"
                >
                  {matchSpeed}x SPEED
                </button>
              </div>
            </div>

            {/* Opponent Info */}
            <div className="flex items-center gap-2 sm:gap-3 text-right">
              <div>
                <span className="text-[9px] font-mono text-rose-400 font-bold block">AWAY</span>
                <div className="font-bold text-white text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[180px]">
                  {opponentName}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-400 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                {opponentCrest}
              </div>
            </div>
          </div>

          {/* DUEL CENTER ARENA */}
          {duelPhase === 'MATCH_OVER' ? (
            /* Final Results Screen */
            <div className="p-6 sm:p-8 rounded-2xl border-2 border-cyan-400 bg-slate-900/95 text-center max-w-xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-3xl mx-auto mb-3 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                {playerScore > opponentScore ? '🏆' : playerScore < opponentScore ? '💀' : '🤝'}
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                {playerScore > opponentScore
                  ? 'VICTORY IN THE ARENA!'
                  : playerScore < opponentScore
                  ? 'MATCH DEFEAT'
                  : 'HONORABLE DRAW'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                Final Score: {playerScore} - {opponentScore} across 11 Duel Rounds
              </p>

              {user.winStreak > 1 && playerScore > opponentScore && (
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold font-mono">
                  🔥 {user.winStreak} Match Win Streak! Bonus Rewards Multiplied!
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 my-6 max-w-md mx-auto text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-amber-400 font-mono font-bold block">
                    +{playerScore > opponentScore ? 350 : 80} Coins
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-cyan-400 font-mono font-bold block">
                    +{playerScore > opponentScore ? 120 : 35} EXP
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-purple-400 font-mono font-bold block">
                    +{playerScore > opponentScore ? 2 : 1} Tokens
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleStartMatch}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <RotateCcw className="w-4 h-4" /> Rematch Duel
                </button>
                <button
                  onClick={() => setIsMatchActive(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Exit To Lobby
                </button>
              </div>
            </div>
          ) : duelPhase === 'CLASHING' || duelPhase === 'RESULT' ? (
            /* CLASHING & RESULT VIEW - FULL CARD & PROPERTY VISIBILITY */
            <div className="p-4 sm:p-6 rounded-2xl border border-cyan-500/30 bg-slate-900/95 shadow-2xl text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider px-2.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40">
                  Round {currentRound} · {selectedDuelType.toUpperCase()} DUEL
                </span>
              </div>

              {/* Both cards fully displayed with real pictures and all attributes */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 my-4">
                {/* Player Card Container */}
                {selectedPlayerCard && (
                  <div className="flex flex-col items-center w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-cyan-300 font-bold uppercase tracking-wider">
                        Your Duelist
                      </span>
                      <button
                        onClick={() => setInspectedCard(selectedPlayerCard)}
                        className="text-[10px] text-cyan-400 hover:text-white underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Dossier
                      </button>
                    </div>

                    <PlayerCardView
                      card={selectedPlayerCard}
                      size="md"
                      highlightDuelStat={
                        selectedDuelType === 'attack'
                          ? 'att'
                          : selectedDuelType === 'defense'
                          ? 'def'
                          : 'ctr'
                      }
                    />

                    {/* Detailed Stat Breakdown Pill */}
                    {lastRoundResult && (
                      <div className="mt-3 w-full max-w-xs p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono shadow-md text-left">
                        <div className="flex justify-between items-center text-slate-300 border-b border-cyan-500/20 pb-1 mb-1">
                          <span>
                            Base {selectedDuelType === 'attack' ? 'ATT' : selectedDuelType === 'defense' ? 'DEF' : 'CTR'}:
                          </span>
                          <span className="font-bold text-white">{lastRoundResult.playerBaseStat}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 text-[11px] mb-1">
                          <span>Tactical Roll:</span>
                          <span className="text-cyan-300">{lastRoundResult.playerMultiplier}x</span>
                        </div>
                        {lastRoundResult.playerSkillActive && (
                          <div className="flex justify-between items-center text-amber-400 text-[11px] font-semibold mb-1">
                            <span>★ {selectedPlayerCard.specialSkill?.name}:</span>
                            <span>+{selectedPlayerCard.specialSkill?.boostValue}%</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-cyan-400 font-black text-sm pt-1 border-t border-cyan-500/20">
                          <span>Total Duel Power:</span>
                          <span className="text-lg tabular-nums">{lastRoundResult.playerTotal}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Center VS Indicator */}
                <div className="flex flex-col items-center justify-center my-2 sm:my-0">
                  <div className="w-14 h-14 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center text-xl font-black font-display text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                    VS
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1 uppercase font-bold">
                    {selectedDuelType} clash
                  </div>
                  {lastRoundResult && (
                    <div className="mt-2 text-center">
                      {lastRoundResult.winner === 'player' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider animate-bounce">
                          ⚽ GOAL!
                        </span>
                      ) : lastRoundResult.winner === 'opponent' ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-wider animate-pulse">
                          🛡️ BLOCKED!
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                          ⚖️ DRAW
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Opponent Card Container */}
                {selectedOpponentCard && (
                  <div className="flex flex-col items-center w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-rose-300 font-bold uppercase tracking-wider">
                        Rival Card
                      </span>
                      <button
                        onClick={() => setInspectedCard(selectedOpponentCard)}
                        className="text-[10px] text-rose-400 hover:text-white underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Dossier
                      </button>
                    </div>

                    <PlayerCardView
                      card={selectedOpponentCard}
                      size="md"
                      highlightDuelStat={
                        selectedDuelType === 'attack'
                          ? 'def'
                          : selectedDuelType === 'defense'
                          ? 'att'
                          : 'ctr'
                      }
                    />

                    {/* Detailed Opponent Stat Breakdown Pill */}
                    {lastRoundResult && (
                      <div className="mt-3 w-full max-w-xs p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs font-mono shadow-md text-left">
                        <div className="flex justify-between items-center text-slate-300 border-b border-rose-500/20 pb-1 mb-1">
                          <span>
                            Counter {selectedDuelType === 'attack' ? 'DEF' : selectedDuelType === 'defense' ? 'ATT' : 'CTR'}:
                          </span>
                          <span className="font-bold text-white">{lastRoundResult.aiBaseStat}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 text-[11px] mb-1">
                          <span>Tactical Roll:</span>
                          <span className="text-rose-300">{lastRoundResult.aiMultiplier}x</span>
                        </div>
                        {lastRoundResult.aiSkillActive && (
                          <div className="flex justify-between items-center text-amber-400 text-[11px] font-semibold mb-1">
                            <span>★ {selectedOpponentCard.specialSkill?.name}:</span>
                            <span>+{selectedOpponentCard.specialSkill?.boostValue}%</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-rose-400 font-black text-sm pt-1 border-t border-rose-500/20">
                          <span>Total Counter Power:</span>
                          <span className="text-lg tabular-nums">{lastRoundResult.aiTotal}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Commentary */}
              {lastRoundResult && (
                <div className="max-w-xl mx-auto p-3.5 rounded-xl border border-white/10 bg-slate-950/80 my-4">
                  <p className="text-xs sm:text-sm font-semibold text-white drop-shadow">
                    {lastRoundResult.commentary}
                  </p>
                </div>
              )}

              {/* Next Round Button */}
              {duelPhase === 'RESULT' && (
                <button
                  onClick={handleProceedNextRound}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 cursor-pointer transition-all"
                >
                  {currentRound >= 11 ? 'View Final Results' : 'Proceed to Next Round'}
                </button>
              )}
            </div>
          ) : (
            /* SELECTION PHASE - FULL CHARACTERISTICS VISIBILITY */
            <div>
              {/* Tactical Choice Banner */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-slate-900/90 mb-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-white uppercase">
                      Select Duel Confrontation For Round {currentRound}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Target your card's greatest strength against the opponent.
                    </p>
                  </div>

                  {selectedPlayerCard && (
                    <button
                      onClick={handleExecuteDuel}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Swords className="w-4 h-4" /> EXECUTE DUEL
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      audioEngine.playClick(600);
                      setSelectedDuelType('attack');
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                      selectedDuelType === 'attack'
                        ? 'border-rose-400 bg-rose-950/40 text-rose-300 ring-1 ring-rose-400 shadow-md'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Flame className="w-4 h-4 text-rose-400" /> Attack Duel
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 hidden sm:block">ATT vs DEF</div>
                  </button>

                  <button
                    onClick={() => {
                      audioEngine.playClick(600);
                      setSelectedDuelType('defense');
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                      selectedDuelType === 'defense'
                        ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-400 shadow-md'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Shield className="w-4 h-4 text-emerald-400" /> Defense Duel
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 hidden sm:block">DEF vs ATT</div>
                  </button>

                  <button
                    onClick={() => {
                      audioEngine.playClick(600);
                      setSelectedDuelType('skill');
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                      selectedDuelType === 'skill'
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-400 shadow-md'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Zap className="w-4 h-4 text-cyan-400" /> Skill Duel
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 hidden sm:block">CTR vs CTR</div>
                  </button>
                </div>
              </div>

              {/* Prominent Active Duelist Inspector Card */}
              {selectedPlayerCard && (
                <div className="mb-5 p-4 rounded-xl border border-cyan-500/30 bg-slate-900/80 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-400 overflow-hidden bg-slate-950 shrink-0">
                      <img
                        src={selectedPlayerCard.avatar}
                        alt={selectedPlayerCard.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <ClubEmblem club={selectedPlayerCard.club} size="xs" />
                        <span className="font-display font-black text-base text-white">
                          {selectedPlayerCard.name}
                        </span>
                        <span className="text-xs text-amber-400 font-mono font-bold">
                          {selectedPlayerCard.ovr} OVR
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {selectedPlayerCard.position} · {selectedPlayerCard.club} · {selectedPlayerCard.nation}
                      </div>
                      {/* Skill Bonus Status */}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                        <span className="text-cyan-300 font-bold">★ {selectedPlayerCard.specialSkill?.name}</span>
                        {isSkillActiveForSelected ? (
                          <span className="text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/40 animate-pulse">
                            ACTIVE (+{selectedPlayerCard.specialSkill?.boostValue}%)
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            (Favors {selectedPlayerCard.specialSkill?.favoredDuel})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Stats Pill */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="p-2 rounded bg-slate-950 border border-slate-800 text-rose-400">
                      ATT: <b>{selectedPlayerCard.att}</b>
                    </span>
                    <span className="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-400">
                      DEF: <b>{selectedPlayerCard.def}</b>
                    </span>
                    <span className="p-2 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                      CTR: <b>{selectedPlayerCard.ctr}</b>
                    </span>
                    <span className="p-2 rounded bg-slate-950 border border-slate-800 text-amber-400">
                      STA: <b>{selectedPlayerCard.sta}</b>
                    </span>
                  </div>
                </div>
              )}

              {/* Hand of Remaining Cards with Pro-Gamer View Controls */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <span>Remaining Squad ({playerHand.length}/11 Cards)</span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        · Tap any card to select for Round {currentRound}
                      </span>
                    </h4>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <button
                      onClick={() => setHandViewMode('cards')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                        handViewMode === 'cards'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" /> 3D Cards
                    </button>
                    <button
                      onClick={() => setHandViewMode('matrix')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                        handViewMode === 'matrix'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ListFilter className="w-3.5 h-3.5" /> Characteristics Matrix
                    </button>
                  </div>
                </div>

                {handViewMode === 'cards' ? (
                  /* Cards Grid View */
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-h-[460px] overflow-y-auto p-1">
                    {playerHand.map((card) => {
                      const isSelected = selectedPlayerCard?.id === card.id;
                      const hasFavoredSkill = card.specialSkill?.favoredDuel === selectedDuelType;

                      return (
                        <div key={card.id} className="relative group">
                          {/* Skill Ready Indicator */}
                          {hasFavoredSkill && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-md animate-pulse whitespace-nowrap">
                              ★ SKILL READY (+{card.specialSkill?.boostValue}%)
                            </div>
                          )}

                          <div
                            onClick={() => {
                              audioEngine.playClick(650);
                              setSelectedPlayerCard(card);
                            }}
                            className="transition-transform duration-200"
                          >
                            <PlayerCardView
                              card={card}
                              size="sm"
                              isSelected={isSelected}
                              highlightDuelStat={
                                selectedDuelType === 'attack'
                                  ? 'att'
                                  : selectedDuelType === 'defense'
                                  ? 'def'
                                  : 'ctr'
                              }
                            />
                          </div>

                          {/* Quick Inspect Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedCard(card);
                            }}
                            title="Inspect Full Characteristics Dossier"
                            className="absolute bottom-2 right-2 z-30 p-1.5 rounded-md bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400 text-[10px] shadow transition-colors"
                          >
                            <Info className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Pro-Gamer Tactical Matrix Table */
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 shadow-lg max-h-[440px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-[10px] font-mono text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                        <tr>
                          <th className="p-3">Player</th>
                          <th className="p-3 text-center">POS</th>
                          <th className="p-3 text-center">OVR</th>
                          <th className="p-3 text-center text-rose-400">ATT</th>
                          <th className="p-3 text-center text-emerald-400">DEF</th>
                          <th className="p-3 text-center text-cyan-400">CTR</th>
                          <th className="p-3 text-center text-amber-400">STA</th>
                          <th className="p-3">Special Skill</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono">
                        {playerHand.map((card) => {
                          const isSelected = selectedPlayerCard?.id === card.id;
                          const hasFavoredSkill = card.specialSkill?.favoredDuel === selectedDuelType;

                          return (
                            <tr
                              key={card.id}
                              onClick={() => {
                                audioEngine.playClick(650);
                                setSelectedPlayerCard(card);
                              }}
                              className={`transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-cyan-950/50 text-white'
                                  : 'hover:bg-slate-900/60 text-slate-300'
                              }`}
                            >
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full border border-slate-700 overflow-hidden bg-slate-900 shrink-0">
                                    <img
                                      src={card.avatar}
                                      alt={card.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover object-top"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-bold text-white flex items-center gap-1.5 font-sans">
                                      <span>{card.name}</span>
                                      <ClubEmblem club={card.club} size="xs" />
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-sans">
                                      {card.club} · {card.nation}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3 text-center font-bold text-cyan-400">
                                {card.position}
                              </td>

                              <td className="p-3 text-center font-bold text-white text-sm tabular-nums">
                                {card.ovr}
                              </td>

                              <td className="p-3 text-center font-bold text-rose-400 tabular-nums">
                                {card.att}
                              </td>

                              <td className="p-3 text-center font-bold text-emerald-400 tabular-nums">
                                {card.def}
                              </td>

                              <td className="p-3 text-center font-bold text-cyan-400 tabular-nums">
                                {card.ctr}
                              </td>

                              <td className="p-3 text-center font-bold text-amber-400 tabular-nums">
                                {card.sta}
                              </td>

                              <td className="p-3">
                                <div className="flex flex-col font-sans">
                                  <span className="font-semibold text-cyan-300 text-[11px] flex items-center gap-1">
                                    ★ {card.specialSkill?.name}
                                    {hasFavoredSkill && (
                                      <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded font-mono">
                                        ACTIVE
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    +{card.specialSkill?.boostValue}% in {card.specialSkill?.favoredDuel} duels
                                  </span>
                                </div>
                              </td>

                              <td className="p-3 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPlayerCard(card);
                                  }}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                    isSelected
                                      ? 'bg-cyan-500 text-slate-950'
                                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                  }`}
                                >
                                  {isSelected ? 'Selected' : 'Pick'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Past Rounds Timeline Ticker */}
          {roundHistory.length > 0 && (
            <div className="p-3 sm:p-4 rounded-xl border border-slate-800 bg-slate-950/80">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Match Timeline ({roundHistory.length}/11 Rounds Played)
              </div>
              <div className="flex flex-wrap gap-2">
                {roundHistory.map((r) => (
                  <div
                    key={r.roundNumber}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${
                      r.winner === 'player'
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400'
                        : r.winner === 'opponent'
                        ? 'border-rose-500/40 bg-rose-950/30 text-rose-400'
                        : 'border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span>R{r.roundNumber}:</span>
                    <span className="font-bold">
                      {r.winner === 'player' ? 'GOAL' : r.winner === 'opponent' ? 'CONCEDED' : 'BLOCK'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({r.playerTotal} - {r.aiTotal})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Full Characteristics Dossier Modal */}
      {inspectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border-2 border-cyan-400 bg-slate-900/95 p-6 shadow-2xl">
            <button
              onClick={() => setInspectedCard(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Tactical Player Dossier
              </span>
              <h3 className="font-display text-2xl font-black text-white mt-0.5">
                {inspectedCard.name}
              </h3>
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-1">
                <ClubEmblem club={inspectedCard.club} size="xs" />
                <span>{inspectedCard.club}</span>
                <span>·</span>
                <span>{inspectedCard.nation}</span>
                <span>·</span>
                <span className="text-cyan-400 font-bold">{inspectedCard.position}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="shrink-0">
                <PlayerCardView card={inspectedCard} size="md" />
              </div>

              {/* Stat Characteristic Breakdown */}
              <div className="flex-1 w-full space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <Flame className="w-3.5 h-3.5" /> Attack (ATT)
                    </span>
                    <span className="font-bold">{inspectedCard.att} / 99</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${(inspectedCard.att / 99) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Shield className="w-3.5 h-3.5" /> Defense (DEF)
                    </span>
                    <span className="font-bold">{inspectedCard.def} / 99</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(inspectedCard.def / 99) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1 text-cyan-400 font-bold">
                      <Zap className="w-3.5 h-3.5" /> Control (CTR)
                    </span>
                    <span className="font-bold">{inspectedCard.ctr} / 99</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${(inspectedCard.ctr / 99) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Activity className="w-3.5 h-3.5" /> Stamina (STA)
                    </span>
                    <span className="font-bold">{inspectedCard.sta} / 99</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(inspectedCard.sta / 99) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Special Skill Dossier Card */}
                <div className="p-3 rounded-xl border border-cyan-500/30 bg-slate-950/80 font-sans mt-3">
                  <div className="text-xs font-bold text-cyan-300 flex items-center justify-between">
                    <span>★ {inspectedCard.specialSkill?.name}</span>
                    <span className="font-mono text-amber-400">
                      +{inspectedCard.specialSkill?.boostValue}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {inspectedCard.specialSkill?.description}
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Optimal Trigger: {inspectedCard.specialSkill?.favoredDuel?.toUpperCase()} DUEL
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedPlayerCard(inspectedCard);
                  setInspectedCard(null);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Select {inspectedCard.shortName} For Current Duel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
