export type Position =
  | 'GK'
  | 'LB'
  | 'CB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'DM'
  | 'CM'
  | 'AM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'ST';

export type RoleGroup = 'goalkeeper' | 'defense' | 'midfield' | 'attack';

export type DifficultyId = 'casual' | 'classic' | 'expert';

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  defense: number;
  physical: number;
  technique: number;
}

export interface Player {
  id: string;
  name: string;
  countryCode: string;
  worldCupYear: number;
  shirtNumber: number;
  positions: Position[];
  role: string;
  club: string;
  eraGroup: string;
  rating: number;
  stats: PlayerStats;
  isLegend?: boolean;
  ballonDorWinner?: boolean;
  traits: string[];
}

export interface Squad {
  id: string;
  countryCode: string;
  country: string;
  flag: string;
  year: number;
  editionName: string;
  finish: string;
  manager: string;
  style: string;
  baseStrength: number;
  players: Player[];
}

export interface FormationSlot {
  id: string;
  label: string;
  acceptedPositions: Position[];
  roleGroup: RoleGroup;
  x: number;
  y: number;
}

export interface Formation {
  id: string;
  name: string;
  nickname: string;
  description: string;
  shapeBias: 'balanced' | 'wide' | 'compact' | 'front-foot';
  slots: FormationSlot[];
}

export interface GameDraw {
  squadId: string;
  formationId: string;
  challengeId: string;
}

export interface Difficulty {
  id: DifficultyId;
  label: string;
  description: string;
  opponentStrength: number;
  randomness: number;
  mismatchMultiplier: number;
}

export type LineupSelection = Record<string, string | null>;

export interface SlotReport {
  slotId: string;
  slotLabel: string;
  playerId?: string;
  playerName?: string;
  compatibility: number;
  message: string;
}

export interface ChallengeReport {
  id: string;
  label: string;
  passed: boolean;
  penalty: number;
  notes: string[];
}

export interface Achievement {
  id: string;
  label: string;
  description: string;
  earned: boolean;
}

export interface TeamEvaluation {
  filledSlots: number;
  isComplete: boolean;
  duplicatePlayerIds: string[];
  slotReports: SlotReport[];
  chemistry: number;
  tacticalFit: number;
  attack: number;
  midfield: number;
  defense: number;
  starPower: number;
  overall: number;
  challenge: ChallengeReport;
  warnings: string[];
  achievements: Achievement[];
}

export interface MatchResult {
  teamGoals: number;
  opponentGoals: number;
  outcome: 'win' | 'draw' | 'loss';
  opponentName: string;
  stats: {
    attack: number;
    midfield: number;
    defense: number;
    chemistry: number;
    tacticalFit: number;
    starPower: number;
    randomSwing: number;
    opponentStrength: number;
  };
  summary: string;
  reasons: string[];
  commentary: string;
  achievements: Achievement[];
}

export interface PersistedGameState {
  phase: 'landing' | 'selection' | 'result';
  draw: GameDraw | null;
  lineup: LineupSelection;
  difficultyId: DifficultyId;
  exactScoreMode: boolean;
  theme: 'dark' | 'light';
  result: MatchResult | null;
}
