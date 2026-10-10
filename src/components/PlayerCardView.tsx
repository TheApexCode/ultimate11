import React, { useState } from 'react';
import { PlayerCard } from '../types';
import { ClubEmblem } from './ClubEmblem';
import { Zap, Shield, Flame, Activity } from 'lucide-react';

interface PlayerCardViewProps {
  card: PlayerCard;
  size?: 'sm' | 'md' | 'lg' | 'mini';
  isSelected?: boolean;
  isFlipped?: boolean;
  onClick?: () => void;
  showBack?: boolean;
  disableHoverEffect?: boolean;
  highlightDuelStat?: 'att' | 'def' | 'ctr' | 'sta' | null;
}

export const PlayerCardView: React.FC<PlayerCardViewProps> = ({
  card,
  size = 'md',
  isSelected = false,
  onClick,
  showBack = false,
  disableHoverEffect = false,
  highlightDuelStat = null,
}) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Guard against undefined card
  if (!card) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableHoverEffect) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  // Color schemes by rarity
  const getRarityTheme = () => {
    switch (card.rarity) {
      case 'Cyber-Icon':
        return {
          border: 'border-cyan-400 shadow-[0_0_22px_rgba(6,182,212,0.6)]',
          badge: 'bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 text-slate-950 font-black',
          glow: 'from-cyan-500/20 via-fuchsia-500/20 to-amber-500/20',
          foilClass: 'holo-icon-foil',
          accent: 'text-cyan-400',
        };
      case 'Legendary':
        return {
          border: 'border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.5)]',
          badge: 'bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 font-bold',
          glow: 'from-amber-500/20 via-yellow-500/10 to-transparent',
          foilClass: 'holo-foil',
          accent: 'text-amber-400',
        };
      case 'Epic':
        return {
          border: 'border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.4)]',
          badge: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold',
          glow: 'from-purple-500/20 to-transparent',
          foilClass: 'holo-foil',
          accent: 'text-purple-400',
        };
      case 'Rare':
        return {
          border: 'border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.35)]',
          badge: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold',
          glow: 'from-blue-500/20 to-transparent',
          foilClass: '',
          accent: 'text-blue-400',
        };
      default:
        return {
          border: 'border-slate-600',
          badge: 'bg-slate-700 text-slate-200',
          glow: 'from-slate-700/20 to-transparent',
          foilClass: '',
          accent: 'text-slate-400',
        };
    }
  };

  const theme = getRarityTheme();

  // Dimensions
  const sizeClasses = {
    mini: 'w-24 h-36 text-[10px]',
    sm: 'w-36 min-h-[238px] text-xs',
    md: 'w-52 sm:w-60 min-h-[320px] sm:min-h-[350px] text-sm',
    lg: 'w-64 sm:w-68 min-h-[360px] sm:min-h-[390px] text-sm',
  }[size];

  // Card Back Rendering (Used in Deck / Draft Hidden)
  if (showBack) {
    return (
      <div
        onClick={onClick}
        className={`${sizeClasses} relative rounded-xl border-2 border-cyan-500/40 bg-slate-900 p-2 cursor-pointer shadow-xl transition-transform duration-300 overflow-hidden flex flex-col items-center justify-center select-none`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/80 via-slate-950 to-purple-950/80" />
        <div className="absolute inset-0 bg-scanlines opacity-30" />
        <div className="relative z-10 flex flex-col items-center text-center p-3">
          <div className="w-14 h-14 rounded-full border border-cyan-400/40 flex items-center justify-center bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.4)] mb-2">
            <span className="text-2xl font-black text-cyan-400 font-display">11</span>
          </div>
          <span className="font-display font-black tracking-widest text-xs text-cyan-300 uppercase">
            ULTIMATE ELEVEN
          </span>
          <span className="text-[10px] text-cyan-500/70 tracking-wider mt-1 font-mono">GLOBAL LEGENDS</span>
        </div>
      </div>
    );
  }

  // Card Level Holographic Border Boost
  const levelBorder =
    card.level >= 5
      ? 'ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)]'
      : '';

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform:
          isHovered && !disableHoverEffect
            ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(1.03)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
      }}
      className={`relative select-none rounded-xl border-2 ${theme.border} ${levelBorder} ${sizeClasses} ${
        isSelected ? 'ring-4 ring-cyan-400 -translate-y-2' : ''
      } bg-slate-950 cursor-pointer overflow-hidden transition-all duration-300 flex flex-col justify-between`}
    >
      {/* Background Foil & Atmosphere */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.glow}`} />
      {theme.foilClass && (
        <div className={`absolute inset-0 ${theme.foilClass} opacity-25 pointer-events-none`} />
      )}
      <div className="absolute inset-0 bg-scanlines opacity-15 pointer-events-none" />

      {/* Top Header Row: OVR, Position, Nation Flag, Club Emblem, Rarity */}
      <div className="relative z-10 p-2 flex items-center justify-between border-b border-white/10 bg-slate-950/75 backdrop-blur-xs">
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col items-center leading-none">
            <span className="font-display text-lg sm:text-xl font-black tracking-tighter text-white tabular-nums drop-shadow">
              {card.ovr}
            </span>
            <span className="text-[10px] font-black text-cyan-400 tracking-wider">
              {card.position}
            </span>
          </div>
          <span className="text-base" title={card.nation}>{card.nationFlag}</span>
        </div>

        {/* Club Emblem in Header */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-0.5 rounded-md border border-white/10 shadow-sm" title={card.club}>
          <ClubEmblem club={card.club} size={size === 'mini' ? 'xs' : 'sm'} />
          {size !== 'mini' && (
            <span className="text-[10px] font-bold text-slate-200 truncate max-w-[70px]">
              {card.club}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {card.level > 1 && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/40">
              Lv.{card.level}
            </span>
          )}
          <span className={`text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${theme.badge}`}>
            {card.rarity === 'Cyber-Icon' ? 'ICON' : card.rarity}
          </span>
        </div>
      </div>

      {/* Center Real Player Picture Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end overflow-hidden">
        {/* Real Player Image */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {!imgError && card.avatar ? (
            <img
              src={card.avatar}
              alt={card.name}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-top filter brightness-105 contrast-105 transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 text-cyan-400 p-2">
              <ClubEmblem club={card.club} size="lg" className="mb-2 opacity-60" />
              <span className="font-display font-black text-xl text-white">{card.name}</span>
              <span className="text-[10px] text-cyan-400 font-mono mt-0.5">{card.club}</span>
            </div>
          )}

          {/* Scrim Gradient for legibility over real player photos */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
        </div>

        {/* Player Name and Club Emblem Overlay Banner */}
        <div className="relative z-20 w-full px-2 pb-1 pt-4 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <ClubEmblem club={card.club} size="xs" />
            <h4 className="font-display font-black text-sm sm:text-base tracking-wide text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {card.name}
            </h4>
          </div>
          <div className="text-[10px] text-cyan-300 font-semibold tracking-wider uppercase drop-shadow flex items-center justify-center gap-1">
            <span>{card.club}</span>
            <span>·</span>
            <span>{card.nation}</span>
          </div>
        </div>
      </div>

      {/* Bottom Stats Grid */}
      <div className="relative z-20 p-2 pt-1 border-t border-white/10 bg-slate-950/90 backdrop-blur-xs">
        <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px] tabular-nums">
          <div
            className={`flex flex-col items-center p-1 rounded ${
              highlightDuelStat === 'att' ? 'bg-rose-500/30 ring-1 ring-rose-400' : 'bg-slate-900/70'
            }`}
          >
            <span className="text-[9px] text-rose-400 font-bold flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5" /> ATT
            </span>
            <span className="font-bold text-slate-100">{card.att}</span>
          </div>

          <div
            className={`flex flex-col items-center p-1 rounded ${
              highlightDuelStat === 'def' ? 'bg-emerald-500/30 ring-1 ring-emerald-400' : 'bg-slate-900/70'
            }`}
          >
            <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
              <Shield className="w-2.5 h-2.5" /> DEF
            </span>
            <span className="font-bold text-slate-100">{card.def}</span>
          </div>

          <div
            className={`flex flex-col items-center p-1 rounded ${
              highlightDuelStat === 'ctr' ? 'bg-cyan-500/30 ring-1 ring-cyan-400' : 'bg-slate-900/70'
            }`}
          >
            <span className="text-[9px] text-cyan-400 font-bold flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" /> CTR
            </span>
            <span className="font-bold text-slate-100">{card.ctr}</span>
          </div>

          <div
            className={`flex flex-col items-center p-1 rounded ${
              highlightDuelStat === 'sta' ? 'bg-amber-500/30 ring-1 ring-amber-400' : 'bg-slate-900/70'
            }`}
          >
            <span className="text-[9px] text-amber-400 font-bold flex items-center gap-0.5">
              <Activity className="w-2.5 h-2.5" /> STA
            </span>
            <span className="font-bold text-slate-100">{card.sta}</span>
          </div>
        </div>

        {/* Special Skill footer */}
        {size !== 'mini' && card.specialSkill && (
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            <span className="truncate font-semibold text-cyan-300">★ {card.specialSkill.name}</span>
            <span className="text-amber-400 font-mono font-bold">+{card.specialSkill.boostValue}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
