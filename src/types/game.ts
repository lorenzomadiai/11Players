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

export type TeamStyle = 'defensive' | 'balanced' | 'attacking';

export type Confederation = 'AFC' | 'CAF' | 'CONCACAF' | 'CONMEBOL' | 'OFC' | 'UEFA';

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  defense: number;
  physical: number;
  technique: number;
  finishing: number;
  chanceCreation: number;
  setPieces: number;
  aerial: number;
  goalkeeping: number;
  workRate: number;
}

export type BasePlayerStats = Pick<PlayerStats, 'pace' | 'shooting' | 'passing' | 'defense' | 'physical' | 'technique'>;

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
  confederation: Confederation;
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

/** Each slot stores a full player snapshot, since every pick comes from a different drawn squad. */
export type LineupSelection = Record<string, Player | null>;

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
  phase: 'landing' | 'setup' | 'selection' | 'result';
  draw: GameDraw | null;
  lineup: LineupSelection;
  /** Slot holding the provisional pick from the current draw; removable until Continue Draft locks it. */
  pendingSlotId: string | null;
  difficultyId: DifficultyId;
  teamStyle: TeamStyle;
  rerollsLeft: number;
  exactScoreMode: boolean;
  theme: 'dark' | 'light';
  result: MatchResult | null;
}

export type TournamentTeamKind = 'historical' | 'dream-xi';

export interface TournamentTeam {
  id: string;
  kind: TournamentTeamKind;
  name: string;
  countryCode: string;
  confederation: Confederation;
  year?: number;
  squadId?: string;
  replacedSquadId?: string;
  seedStrength: number;
  pot: number;
}

export interface TournamentGroup {
  id: string;
  label: string;
  teams: TournamentTeam[];
}

export interface GroupStanding {
  teamId: string;
  played: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export type TournamentRoundId = 'group-1' | 'group-2' | 'group-3' | 'round-of-16' | 'quarter-final' | 'semi-final' | 'final';

export interface TournamentMatch {
  id: string;
  roundId: TournamentRoundId;
  groupId?: string;
  homeTeamId: string;
  awayTeamId: string;
  result?: MatchResult;
}

export interface TournamentState {
  id: string;
  seed: string;
  teams: TournamentTeam[];
  groups: TournamentGroup[];
  groupMatches: TournamentMatch[];
  knockoutMatches: TournamentMatch[];
  userTeamId: string;
  replacedSquadId: string;
}

export interface OpponentXI {
  squad: Squad;
  formation: Formation;
  lineup: LineupSelection;
  evaluation: TeamEvaluation;
}
