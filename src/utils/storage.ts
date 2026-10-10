import { UserProfile, PlayerCard, MatchRecord } from '../types';
import { generateStarterSquad, RAW_PLAYERS_POOL } from '../data/cardData';

const STORAGE_KEY = 'ultimate_eleven_user_profile_v3';

// Helper to refresh card avatars from the latest real photo pool
function refreshCardData(card: PlayerCard): PlayerCard {
  if (!card) return card;
  const poolItem = RAW_PLAYERS_POOL.find((p) => p.templateId === card.templateId);
  if (poolItem) {
    return {
      ...card,
      avatar: poolItem.avatar,
      club: poolItem.club,
      nation: poolItem.nation,
      nationFlag: poolItem.nationFlag,
      specialSkill: poolItem.specialSkill,
    };
  }
  return card;
}

export function getStoredProfile(): UserProfile | null {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem('ultimate_eleven_user_profile_v2') || localStorage.getItem('ultimate_eleven_user_profile_v1');
    }

    if (raw) {
      const parsed: UserProfile = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const validSquad = Array.isArray(parsed.activeSquad)
          ? parsed.activeSquad.filter((c): c is PlayerCard => Boolean(c && c.id))
          : [];

        let finalSquad = validSquad.map(refreshCardData);
        if (finalSquad.length < 11) {
          const freshStarter = generateStarterSquad();
          finalSquad = freshStarter;
        }

        const validDeck = Array.isArray(parsed.deck)
          ? parsed.deck.filter((c): c is PlayerCard => Boolean(c && c.id)).map(refreshCardData)
          : [...finalSquad];

        const userEmail = parsed.email || 'manager@ultimate11.io';
        // Auto-assign admin if email matches admin address without mentioning it anywhere
        const isAdmin = userEmail.toLowerCase().trim() === 'farhanafsar786@gmail.com' || Boolean(parsed.isAdmin);

        const healedProfile: UserProfile = {
          ...parsed,
          username: parsed.username || 'CyberStriker',
          teamName: parsed.teamName || 'Neo All-Stars FC',
          email: userEmail,
          crest: parsed.crest || '🦁',
          coins: typeof parsed.coins === 'number' ? parsed.coins : 1500,
          gems: typeof parsed.gems === 'number' ? parsed.gems : 75,
          fusionTokens: typeof parsed.fusionTokens === 'number' ? parsed.fusionTokens : 10,
          wins: typeof parsed.wins === 'number' ? parsed.wins : 0,
          losses: typeof parsed.losses === 'number' ? parsed.losses : 0,
          draws: typeof parsed.draws === 'number' ? parsed.draws : 0,
          winStreak: typeof parsed.winStreak === 'number' ? parsed.winStreak : 0,
          bestWinStreak: typeof parsed.bestWinStreak === 'number' ? parsed.bestWinStreak : 0,
          dailyRewardDay: typeof parsed.dailyRewardDay === 'number' ? parsed.dailyRewardDay : 1,
          lastDailyClaim: typeof parsed.lastDailyClaim === 'number' ? parsed.lastDailyClaim : 0,
          activeSquad: finalSquad,
          deck: validDeck,
          formation: parsed.formation || '4-3-3',
          matchHistory: Array.isArray(parsed.matchHistory) ? parsed.matchHistory : [],
          isAdmin,
          theme: parsed.theme || 'dark',
        };

        saveProfile(healedProfile);
        return healedProfile;
      }
    }
  } catch (err) {
    console.error('Failed reading user profile from localStorage:', err);
  }
  return null;
}

export function saveProfile(profile: UserProfile): void {
  try {
    // Check admin rule silently
    if (profile.email && profile.email.toLowerCase().trim() === 'farhanafsar786@gmail.com') {
      profile.isAdmin = true;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('ultimate_eleven_save', { detail: profile }));
  } catch (err) {
    console.error('Failed saving user profile to localStorage:', err);
  }
}

export function createDefaultProfile(
  username = 'CyberStriker',
  crest = '🦁',
  email = 'manager@ultimate11.io',
  displayName = 'CyberStriker'
): UserProfile {
  const starterSquad = generateStarterSquad();
  const isAdmin = email.toLowerCase().trim() === 'farhanafsar786@gmail.com';
  const profile: UserProfile = {
    id: `user-${Date.now()}`,
    username: username.replace(/^@/, ''),
    teamName: `${username} FC`,
    displayName: displayName || username,
    email,
    crest,
    level: 1,
    exp: 0,
    nextLevelExp: 200,
    coins: 1500,
    gems: 75,
    fusionTokens: 10,
    wins: 0,
    losses: 0,
    draws: 0,
    winStreak: 0,
    bestWinStreak: 0,
    dailyRewardDay: 1,
    lastDailyClaim: 0,
    deck: [...starterSquad],
    activeSquad: [...starterSquad],
    formation: '4-3-3',
    matchHistory: [],
    isAdmin,
    theme: 'dark',
  };
  saveProfile(profile);
  return profile;
}

export function addMatchResultToProfile(
  profile: UserProfile,
  match: Omit<MatchRecord, 'id' | 'timestamp'>
): UserProfile {
  const isWin = match.result === 'WIN';
  const newWinStreak = isWin ? (profile.winStreak || 0) + 1 : 0;
  const bestStreak = Math.max(profile.bestWinStreak || 0, newWinStreak);

  // Win Streak Coin Multiplier (Pro-Gamer bonus)
  const streakBonusMultiplier = newWinStreak >= 5 ? 2.0 : newWinStreak >= 3 ? 1.5 : 1.0;
  const coinsEarned = Math.round(match.coinsEarned * streakBonusMultiplier);
  const expEarned = match.expEarned;

  let newExp = profile.exp + expEarned;
  let newLevel = profile.level;
  let newNextExp = profile.nextLevelExp;
  let newGems = profile.gems + (isWin && newWinStreak % 3 === 0 ? 15 : 0);
  let newTokens = profile.fusionTokens + (isWin ? 2 : 1);

  // Level Up Check
  while (newExp >= newNextExp) {
    newExp -= newNextExp;
    newLevel += 1;
    newNextExp = Math.floor(newNextExp * 1.35);
    newGems += 25; // Level up reward
  }

  const record: MatchRecord = {
    ...match,
    coinsEarned,
    id: `match-${Date.now()}`,
    timestamp: Date.now(),
  };

  const updated: UserProfile = {
    ...profile,
    level: newLevel,
    exp: newExp,
    nextLevelExp: newNextExp,
    coins: profile.coins + coinsEarned,
    gems: newGems,
    fusionTokens: newTokens,
    wins: profile.wins + (isWin ? 1 : 0),
    losses: profile.losses + (match.result === 'LOSS' ? 1 : 0),
    draws: profile.draws + (match.result === 'DRAW' ? 1 : 0),
    winStreak: newWinStreak,
    bestWinStreak: bestStreak,
    matchHistory: [record, ...profile.matchHistory].slice(0, 25),
  };

  saveProfile(updated);
  return updated;
}
