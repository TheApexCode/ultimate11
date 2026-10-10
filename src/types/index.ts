export type PositionCategory = 'GK' | 'DEF' | 'MID' | 'ATT';

export type SpecificPosition = 
  | 'GK' 
  | 'CB' | 'LB' | 'RB' 
  | 'CDM' | 'CM' | 'CAM' 
  | 'RW' | 'LW' | 'ST';

export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Cyber-Icon';

export type DuelType = 'attack' | 'defense' | 'skill';

export interface SpecialSkill {
  name: string;
  description: string;
  boostValue: number;
  favoredDuel: DuelType;
}

export interface PlayerCard {
  id: string;
  templateId: string;
  name: string;
  shortName: string;
  nation: string;
  nationFlag: string;
  club: string;
  position: SpecificPosition;
  posCategory: PositionCategory;
  ovr: number;
  att: number;
  def: number;
  ctr: number;
  sta: number;
  rarity: CardRarity;
  specialSkill: SpecialSkill;
  level: number;
  exp: number;
  duplicates: number;
  avatar: string;
  isCustom?: boolean;
}

export interface MatchRecord {
  id: string;
  timestamp: number;
  opponentName: string;
  userScore: number;
  opponentScore: number;
  result: 'WIN' | 'LOSS' | 'DRAW';
  mode: string;
  coinsEarned: number;
  expEarned: number;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  teamName: string;
  email: string;
  photoURL?: string;
  crest: string;
  level: number;
  exp: number;
  nextLevelExp: number;
  coins: number;
  gems: number;
  fusionTokens: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  bestWinStreak: number;
  dailyRewardDay: number;
  lastDailyClaim: number;
  deck: PlayerCard[];
  activeSquad: PlayerCard[];
  formation: '4-3-3' | '4-4-2' | '3-5-2';
  matchHistory: MatchRecord[];
  isAdmin?: boolean;
  theme?: 'dark' | 'light';
}

export interface DuelRoundResult {
  roundNumber: number;
  playerCard: PlayerCard;
  aiCard: PlayerCard;
  duelType: DuelType;
  playerBaseStat: number;
  aiBaseStat: number;
  playerMultiplier: number;
  aiMultiplier: number;
  playerTotal: number;
  aiTotal: number;
  playerSkillActive: boolean;
  aiSkillActive: boolean;
  winner: 'player' | 'opponent' | 'draw';
  commentary: string;
}

export type AIDifficulty = 'Amateur' | 'World Class' | 'AI Overlord';

export interface MatchState {
  currentRound: number;
  playerScore: number;
  opponentScore: number;
  playerRemainingCards: PlayerCard[];
  opponentRemainingCards: PlayerCard[];
  selectedPlayerCard: PlayerCard | null;
  selectedDuelType: DuelType;
  lastRoundResult: DuelRoundResult | null;
  status: 'PREPARING' | 'PLAYER_CHOICE' | 'CLASHING' | 'ROUND_SUMMARY' | 'MATCH_SUMMARY';
  difficulty: AIDifficulty;
  isPvP: boolean;
  opponentName: string;
  opponentCrest: string;
  roundHistory: DuelRoundResult[];
  matchSpeed: 1 | 2;
}
