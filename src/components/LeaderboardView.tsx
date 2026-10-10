import React from 'react';
import { UserProfile } from '../types';
import { Trophy, Medal, Shield, Sparkles } from 'lucide-react';

interface LeaderboardViewProps {
  user: UserProfile;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  crest: string;
  division: string;
  wins: number;
  losses: number;
  winRate: number;
  points: number;
  isCurrentUser?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ user }) => {
  const userMatches = user.wins + user.losses + user.draws;
  const userWinRate = userMatches > 0 ? Math.round((user.wins / userMatches) * 100) : 0;
  const userPoints = user.wins * 3 + user.draws;

  const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, username: 'ViperPrime_99', crest: '🐉', division: 'Apex Cyber League', wins: 48, losses: 5, winRate: 91, points: 147 },
    { rank: 2, username: 'KaiserTitan', crest: '🦁', division: 'Apex Cyber League', wins: 44, losses: 8, winRate: 85, points: 135 },
    { rank: 3, username: 'SolarMatrix_FC', crest: '🦅', division: 'Apex Cyber League', wins: 41, losses: 9, winRate: 82, points: 127 },
    { rank: 4, username: 'CyberGaucho', crest: '🔥', division: 'Diamond Matrix', wins: 38, losses: 12, winRate: 76, points: 118 },
    { rank: 5, username: 'IronBastion_11', crest: '🛡️', division: 'Diamond Matrix', wins: 35, losses: 14, winRate: 71, points: 109 },
    { rank: 6, username: 'NeonStriker_Z', crest: '🐆', division: 'Diamond Matrix', wins: 33, losses: 16, winRate: 67, points: 103 },
    { rank: 7, username: 'QuantumKeeper', crest: '🦁', division: 'Gold Circuit', wins: 30, losses: 18, winRate: 63, points: 94 },
    { rank: 8, username: 'GlitchTactics', crest: '🐉', division: 'Gold Circuit', wins: 28, losses: 19, winRate: 60, points: 88 },
  ];

  // Insert or locate user
  const userEntry: LeaderboardEntry = {
    rank: 9,
    username: user.username,
    crest: user.crest,
    division: user.level >= 5 ? 'Diamond Matrix' : 'Gold Circuit',
    wins: user.wins,
    losses: user.losses,
    winRate: userWinRate,
    points: userPoints,
    isCurrentUser: true,
  };

  const fullList = [...mockLeaderboard, userEntry].sort((a, b) => b.points - a.points).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="border-b border-slate-800 pb-4 mb-6">
        <h2 className="font-display text-2xl font-black uppercase text-white flex items-center gap-2">
          Global Cyber Rankings
        </h2>
        <p className="text-xs text-slate-400">
          Seasonal leaderboard tracking managers across the worldwide holographic football league.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-mono uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Manager</th>
                <th className="py-3 px-4">Division</th>
                <th className="py-3 px-4 text-center">W / L</th>
                <th className="py-3 px-4 text-center">Win Rate</th>
                <th className="py-3 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {fullList.map((entry) => {
                const isUser = entry.isCurrentUser;
                return (
                  <tr
                    key={entry.username}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-cyan-950/40 text-cyan-300 font-bold'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="py-3.5 px-4 tabular-nums">
                      {entry.rank === 1 ? (
                        <span className="text-amber-400 font-black">#1 🏆</span>
                      ) : entry.rank === 2 ? (
                        <span className="text-slate-300 font-black">#2 🥈</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-amber-600 font-black">#3 🥉</span>
                      ) : (
                        <span>#{entry.rank}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-sans font-semibold flex items-center gap-2">
                      <span className="text-base">{entry.crest}</span>
                      <span className="text-white">@{entry.username}</span>
                      {isUser && (
                        <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1 py-0.5 rounded border border-cyan-500/40">
                          YOU
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-400 text-[11px]">
                      {entry.division}
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums">
                      <span className="text-emerald-400">{entry.wins}W</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-rose-400">{entry.losses}L</span>
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums">
                      {entry.winRate}%
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-amber-400 text-sm tabular-nums">
                      {entry.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
