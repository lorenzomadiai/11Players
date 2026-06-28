import type {
  ChanceType,
  Formation,
  LineupSelection,
  Player,
  RoleGroup,
  TacticalMatchEvent,
  TacticalMatchResult,
  TacticalTeamInput,
  TacticalTeamProfile,
  TacticalTeamSide,
  TeamStyle,
} from '../types/game';
import { clamp, round, type RandomSource } from '../utils/random';

interface PlayerSlotEntry {
  player: Player;
  slotId: string;
  slotLabel: string;
  roleGroup: RoleGroup;
  x: number;
  y: number;
}

interface SimulateTacticalMatchOptions {
  knockout?: boolean;
  rng?: RandomSource;
}

const average = (values: number[], fallback = 0) =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : fallback;

const weightedAverage = (values: number[], weights: number[], fallback = 0) => {
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  if (!values.length || totalWeight <= 0) {
    return fallback;
  }

  return values.reduce((total, value, index) => total + value * weights[index], 0) / totalWeight;
};

const styleTempo = (style: TeamStyle = 'balanced') => {
  if (style === 'attacking') return 5;
  if (style === 'defensive') return -4;
  return 0;
};

const styleRisk = (style: TeamStyle = 'balanced') => {
  if (style === 'attacking') return 4;
  if (style === 'defensive') return -3;
  return 0;
};

const lineupEntries = (formation: Formation, lineup: LineupSelection): PlayerSlotEntry[] =>
  formation.slots
    .map((slot) => {
      const player = lineup[slot.id];
      if (!player) {
        return null;
      }

      return {
        player,
        slotId: slot.id,
        slotLabel: slot.label,
        roleGroup: slot.roleGroup,
        x: slot.x,
        y: slot.y,
      };
    })
    .filter((entry): entry is PlayerSlotEntry => Boolean(entry));

const groupEntries = (entries: PlayerSlotEntry[], roleGroup: RoleGroup) =>
  entries.filter((entry) => entry.roleGroup === roleGroup);

const maxStat = (players: Player[], stat: keyof Player['stats'], fallback = 0) =>
  players.length ? Math.max(...players.map((player) => player.stats[stat])) : fallback;

export const buildTacticalTeamProfile = ({
  id,
  name,
  formation,
  lineup,
  evaluation,
  style = 'balanced',
}: TacticalTeamInput): TacticalTeamProfile => {
  const entries = lineupEntries(formation, lineup);
  const players = entries.map((entry) => entry.player);
  const attackers = groupEntries(entries, 'attack');
  const midfielders = groupEntries(entries, 'midfield');
  const defenders = groupEntries(entries, 'defense');
  const keepers = groupEntries(entries, 'goalkeeper');
  const wideEntries = entries.filter((entry) => entry.x < 30 || entry.x > 70);
  const centralEntries = entries.filter((entry) => entry.x >= 35 && entry.x <= 65);

  const keeper = average(
    keepers.map((entry) => entry.player.stats.goalkeeping * 0.68 + entry.player.stats.defense * 0.16 + entry.player.rating * 0.16),
    evaluation.defense,
  );
  const finishing = weightedAverage(
    entries.map((entry) => entry.player.stats.finishing),
    entries.map((entry) => (entry.roleGroup === 'attack' ? 3 : entry.roleGroup === 'midfield' ? 1.35 : 0.35)),
    evaluation.attack,
  );
  const chanceCreation = weightedAverage(
    entries.map((entry) => entry.player.stats.chanceCreation),
    entries.map((entry) => (entry.roleGroup === 'midfield' ? 2.6 : entry.roleGroup === 'attack' ? 1.8 : 0.6)),
    evaluation.midfield,
  );
  const aerial = weightedAverage(
    entries.map((entry) => entry.player.stats.aerial),
    entries.map((entry) => (entry.roleGroup === 'attack' || entry.roleGroup === 'defense' ? 1.6 : 0.8)),
    average(players.map((player) => player.stats.aerial), 0),
  );
  const workRate = average(players.map((player) => player.stats.workRate), evaluation.midfield);
  const wideThreat = average(
    wideEntries.map((entry) => entry.player.stats.pace * 0.32 + entry.player.stats.chanceCreation * 0.28 + entry.player.stats.workRate * 0.2 + entry.player.rating * 0.2),
    evaluation.attack,
  );
  const centralThreat = average(
    centralEntries.map((entry) => entry.player.stats.technique * 0.24 + entry.player.stats.chanceCreation * 0.3 + entry.player.stats.finishing * 0.2 + entry.player.rating * 0.26),
    evaluation.midfield,
  );
  const counterThreat = average(
    attackers.concat(midfielders).map((entry) => entry.player.stats.pace * 0.36 + entry.player.stats.finishing * 0.26 + entry.player.stats.workRate * 0.18 + entry.player.rating * 0.2),
    evaluation.attack,
  );
  const pressure = average(
    defenders.concat(midfielders).map((entry) => entry.player.stats.defense * 0.34 + entry.player.stats.workRate * 0.28 + entry.player.stats.physical * 0.18 + entry.player.rating * 0.2),
    evaluation.defense,
  );

  return {
    id,
    name,
    formationId: formation.id,
    attack: evaluation.attack,
    midfield: evaluation.midfield,
    defense: evaluation.defense,
    keeper: round(clamp(keeper), 1),
    chemistry: evaluation.chemistry,
    tacticalFit: evaluation.tacticalFit,
    finishing: round(clamp(finishing), 1),
    chanceCreation: round(clamp(chanceCreation), 1),
    setPieces: round(clamp(maxStat(players, 'setPieces', evaluation.midfield)), 1),
    aerial: round(clamp(aerial), 1),
    workRate: round(clamp(workRate), 1),
    wideThreat: round(clamp(wideThreat), 1),
    centralThreat: round(clamp(centralThreat), 1),
    counterThreat: round(clamp(counterThreat + styleRisk(style) * 0.5), 1),
    pressure: round(clamp(pressure - Math.max(0, styleRisk(style)) * 0.6), 1),
    tempo: round(clamp(evaluation.midfield * 0.44 + workRate * 0.24 + evaluation.chemistry * 0.18 + evaluation.tacticalFit * 0.14 + styleTempo(style)), 1),
  };
};

const chooseWeighted = <T>(items: T[], weightFor: (item: T) => number, rng: RandomSource) => {
  const weighted = items.map((item) => ({ item, weight: Math.max(0.1, weightFor(item)) }));
  const totalWeight = weighted.reduce((total, item) => total + item.weight, 0);
  let roll = rng() * totalWeight;

  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.item;
    }
  }

  return weighted[weighted.length - 1].item;
};

const chanceTypeWeights = (attack: TacticalTeamProfile, defense: TacticalTeamProfile): Record<ChanceType, number> => ({
  central: 10 + (attack.centralThreat - defense.pressure) * 0.12 + (attack.midfield - defense.midfield) * 0.08,
  wide: 8 + (attack.wideThreat - defense.defense) * 0.1,
  counter: 6 + (attack.counterThreat - defense.pressure) * 0.11 + Math.max(0, defense.tempo - attack.tempo) * 0.08,
  'set-piece': 5 + (attack.setPieces - defense.aerial) * 0.08,
  'long-shot': 4 + (attack.chanceCreation - defense.pressure) * 0.06,
  aerial: 4 + (attack.aerial - defense.aerial) * 0.1,
  penalty: 1.3 + Math.max(0, attack.centralThreat - defense.defense) * 0.015,
});

const chooseChanceType = (attack: TacticalTeamProfile, defense: TacticalTeamProfile, rng: RandomSource): ChanceType =>
  chooseWeighted(Object.entries(chanceTypeWeights(attack, defense)), ([, weight]) => weight, rng)[0] as ChanceType;

const scorerWeight = (entry: PlayerSlotEntry, chanceType: ChanceType) => {
  const { player, roleGroup } = entry;
  const roleWeight = roleGroup === 'attack' ? 1.9 : roleGroup === 'midfield' ? 1.05 : roleGroup === 'defense' ? 0.45 : 0.05;

  if (chanceType === 'aerial') {
    return (player.stats.aerial * 0.42 + player.stats.finishing * 0.2 + player.stats.physical * 0.18 + player.rating * 0.2) * roleWeight;
  }

  if (chanceType === 'set-piece') {
    return (player.stats.finishing * 0.28 + player.stats.aerial * 0.24 + player.stats.shooting * 0.18 + player.rating * 0.3) * roleWeight;
  }

  if (chanceType === 'long-shot') {
    return (player.stats.shooting * 0.38 + player.stats.technique * 0.25 + player.stats.finishing * 0.17 + player.rating * 0.2) * roleWeight;
  }

  if (chanceType === 'counter') {
    return (player.stats.pace * 0.34 + player.stats.finishing * 0.34 + player.stats.shooting * 0.14 + player.rating * 0.18) * roleWeight;
  }

  if (chanceType === 'penalty') {
    return player.stats.finishing * 0.42 + player.stats.setPieces * 0.26 + player.stats.technique * 0.14 + player.rating * 0.18;
  }

  return (player.stats.finishing * 0.36 + player.stats.shooting * 0.22 + player.stats.technique * 0.18 + player.rating * 0.24) * roleWeight;
};

const assistWeight = (entry: PlayerSlotEntry, chanceType: ChanceType) => {
  const { player, roleGroup, x } = entry;
  const roleWeight = roleGroup === 'midfield' ? 1.7 : roleGroup === 'attack' ? 1.25 : roleGroup === 'defense' ? 0.65 : 0.05;
  const wideBonus = chanceType === 'wide' && (x < 30 || x > 70) ? 18 : 0;
  const setPieceBonus = chanceType === 'set-piece' ? player.stats.setPieces * 0.35 : 0;

  return (
    player.stats.chanceCreation * 0.34 +
    player.stats.passing * 0.24 +
    player.stats.technique * 0.18 +
    player.stats.workRate * 0.08 +
    player.rating * 0.16 +
    wideBonus +
    setPieceBonus
  ) * roleWeight;
};

const chanceBaseXg: Record<ChanceType, number> = {
  central: 0.13,
  wide: 0.1,
  counter: 0.16,
  'set-piece': 0.08,
  'long-shot': 0.045,
  aerial: 0.11,
  penalty: 0.76,
};

const buildGoalReason = (
  scorer: Player,
  assist: Player | null,
  chanceType: ChanceType,
  xg: number,
  defense: TacticalTeamProfile,
) => {
  const creatorText = assist ? `${assist.name}'s creation` : 'A direct break';
  const chanceLabel = chanceType.replace('-', ' ');

  return `${creatorText} produced a ${chanceLabel} worth ${round(xg, 2)} xG, and ${scorer.name}'s finishing challenged ${defense.name}'s keeper resistance.`;
};

const eventMinute = (rng: RandomSource, extraTime: boolean) =>
  extraTime ? 91 + Math.floor(rng() * 30) : 4 + Math.floor(rng() * 87);

const createEvent = (
  side: TacticalTeamSide,
  team: TacticalTeamInput,
  opponent: TacticalTeamInput,
  profile: TacticalTeamProfile,
  opponentProfile: TacticalTeamProfile,
  rng: RandomSource,
  extraTime = false,
): TacticalMatchEvent => {
  const entries = lineupEntries(team.formation, team.lineup);
  const chanceType = chooseChanceType(profile, opponentProfile, rng);
  const scorerEntry = chooseWeighted(entries, (entry) => scorerWeight(entry, chanceType), rng);
  const assistEntries = entries.filter((entry) => entry.player.id !== scorerEntry.player.id && entry.roleGroup !== 'goalkeeper');
  const assistEntry =
    chanceType === 'penalty' || assistEntries.length === 0
      ? null
      : chooseWeighted(assistEntries, (entry) => assistWeight(entry, chanceType), rng);
  const creatorScore = assistEntry ? assistWeight(assistEntry, chanceType) / 1.7 : profile.counterThreat;
  const finisherScore = scorerWeight(scorerEntry, chanceType) / (scorerEntry.roleGroup === 'attack' ? 1.9 : 1.05);
  const defensivePressure = opponentProfile.pressure * 0.6 + opponentProfile.defense * 0.4;
  const keeperResistance = opponentProfile.keeper;
  const chanceAdvantage =
    (creatorScore - defensivePressure) * 0.0015 +
    (finisherScore - keeperResistance) * 0.0018 +
    (profile.chemistry - opponentProfile.tacticalFit) * 0.0009;
  const xg = round(clamp(chanceBaseXg[chanceType] + chanceAdvantage, 0.02, chanceType === 'penalty' ? 0.84 : 0.48), 2);
  const roll = round(rng(), 3);
  const goal = roll < xg;

  return {
    minute: eventMinute(rng, extraTime),
    side,
    teamId: team.id,
    teamName: team.name,
    chanceType,
    xg,
    goal,
    shooterId: scorerEntry.player.id,
    shooterName: scorerEntry.player.name,
    creatorId: assistEntry?.player.id,
    creatorName: assistEntry?.player.name,
    scorerId: goal ? scorerEntry.player.id : undefined,
    scorerName: goal ? scorerEntry.player.name : undefined,
    assistId: goal ? assistEntry?.player.id : undefined,
    assistName: goal ? assistEntry?.player.name : undefined,
    reason: buildGoalReason(scorerEntry.player, assistEntry?.player ?? null, chanceType, xg, opponentProfile),
    metrics: {
      creatorScore: round(creatorScore, 1),
      finisherScore: round(finisherScore, 1),
      defensivePressure: round(defensivePressure, 1),
      keeperResistance: round(keeperResistance, 1),
      roll,
    },
  };
};

const chanceCount = (profile: TacticalTeamProfile, opponent: TacticalTeamProfile, rng: RandomSource) =>
  Math.round(clamp(5.5 + (profile.tempo - opponent.pressure) / 18 + (profile.midfield - opponent.midfield) / 24 + rng() * 3, 3, 12));

const buildEvents = (
  home: TacticalTeamInput,
  away: TacticalTeamInput,
  homeProfile: TacticalTeamProfile,
  awayProfile: TacticalTeamProfile,
  rng: RandomSource,
) => {
  const homeCount = chanceCount(homeProfile, awayProfile, rng);
  const awayCount = chanceCount(awayProfile, homeProfile, rng);
  const events = [
    ...Array.from({ length: homeCount }, () => createEvent('home', home, away, homeProfile, awayProfile, rng)),
    ...Array.from({ length: awayCount }, () => createEvent('away', away, home, awayProfile, homeProfile, rng)),
  ];

  return events.sort((left, right) => left.minute - right.minute || left.teamId.localeCompare(right.teamId));
};

const outcomeFor = (homeGoals: number, awayGoals: number): TacticalMatchResult['outcome'] => {
  if (homeGoals > awayGoals) return 'home-win';
  if (awayGoals > homeGoals) return 'away-win';
  return 'draw';
};

const buildReasons = (
  homeProfile: TacticalTeamProfile,
  awayProfile: TacticalTeamProfile,
  homeXg: number,
  awayXg: number,
  homeGoals: number,
  awayGoals: number,
) => {
  const reasons: string[] = [];
  const midfieldDelta = round(homeProfile.midfield - awayProfile.midfield, 1);
  const xgDelta = round(homeXg - awayXg, 2);
  const finishingDelta = round(homeProfile.finishing - awayProfile.keeper, 1);
  const awayFinishingDelta = round(awayProfile.finishing - homeProfile.keeper, 1);

  reasons.push(`${homeProfile.name} midfield control was ${midfieldDelta >= 0 ? '+' : ''}${midfieldDelta} against ${awayProfile.name}.`);
  reasons.push(`Expected goals finished ${homeProfile.name} ${round(homeXg, 2)} - ${round(awayXg, 2)} ${awayProfile.name}.`);

  if (Math.abs(finishingDelta) >= Math.abs(awayFinishingDelta)) {
    reasons.push(`${homeProfile.name}'s finishing vs keeper gap was ${finishingDelta >= 0 ? '+' : ''}${finishingDelta}.`);
  } else {
    reasons.push(`${awayProfile.name}'s finishing vs keeper gap was ${awayFinishingDelta >= 0 ? '+' : ''}${awayFinishingDelta}.`);
  }

  if (Math.abs(homeGoals - awayGoals) >= 3) {
    reasons.push(`The margin opened because the xG gap was ${xgDelta >= 0 ? '+' : ''}${xgDelta} and the trailing side failed to convert pressure.`);
  } else if (homeGoals === awayGoals) {
    reasons.push('The draw came from similar chance quality and neither side creating enough separation.');
  } else {
    reasons.push('The match stayed close because the weaker side still generated enough chance quality to threaten.');
  }

  return reasons;
};

const penaltyShootout = (homeProfile: TacticalTeamProfile, awayProfile: TacticalTeamProfile, rng: RandomSource) => {
  let home = 0;
  let away = 0;

  for (let kick = 0; kick < 5; kick += 1) {
    if (rng() < clamp(0.73 + (homeProfile.finishing + homeProfile.setPieces - awayProfile.keeper * 2) / 500, 0.55, 0.86)) home += 1;
    if (rng() < clamp(0.73 + (awayProfile.finishing + awayProfile.setPieces - homeProfile.keeper * 2) / 500, 0.55, 0.86)) away += 1;
  }

  while (home === away) {
    if (rng() < clamp(0.73 + (homeProfile.finishing - awayProfile.keeper) / 450, 0.55, 0.86)) home += 1;
    if (rng() < clamp(0.73 + (awayProfile.finishing - homeProfile.keeper) / 450, 0.55, 0.86)) away += 1;
  }

  return { home, away };
};

export const simulateTacticalMatch = (
  home: TacticalTeamInput,
  away: TacticalTeamInput,
  { knockout = false, rng = Math.random }: SimulateTacticalMatchOptions = {},
): TacticalMatchResult => {
  const homeTeam = buildTacticalTeamProfile(home);
  const awayTeam = buildTacticalTeamProfile(away);
  const regularEvents = buildEvents(home, away, homeTeam, awayTeam, rng);
  let events = regularEvents;
  let homeGoals = events.filter((event) => event.side === 'home' && event.goal).length;
  let awayGoals = events.filter((event) => event.side === 'away' && event.goal).length;
  let resolution: TacticalMatchResult['resolution'] = homeGoals === awayGoals ? 'draw' : 'regular';
  let penalties: TacticalMatchResult['penalties'];

  if (knockout && homeGoals === awayGoals) {
    const extraTimeEvents = [
      createEvent('home', home, away, homeTeam, awayTeam, rng, true),
      createEvent('away', away, home, awayTeam, homeTeam, rng, true),
    ];
    events = [...events, ...extraTimeEvents].sort((left, right) => left.minute - right.minute || left.teamId.localeCompare(right.teamId));
    homeGoals = events.filter((event) => event.side === 'home' && event.goal).length;
    awayGoals = events.filter((event) => event.side === 'away' && event.goal).length;
    resolution = homeGoals === awayGoals ? 'penalties' : 'extra-time';

    if (resolution === 'penalties') {
      penalties = penaltyShootout(homeTeam, awayTeam, rng);
    }
  }

  const homeXg = round(events.filter((event) => event.side === 'home').reduce((total, event) => total + event.xg, 0), 2);
  const awayXg = round(events.filter((event) => event.side === 'away').reduce((total, event) => total + event.xg, 0), 2);
  const outcome = outcomeFor(homeGoals, awayGoals);
  const winnerSide =
    outcome === 'home-win' || (outcome === 'draw' && penalties && penalties.home > penalties.away)
      ? 'home'
      : outcome === 'away-win' || (outcome === 'draw' && penalties && penalties.away > penalties.home)
        ? 'away'
        : undefined;

  return {
    homeTeam,
    awayTeam,
    homeGoals,
    awayGoals,
    outcome,
    winnerSide,
    resolution,
    penalties,
    homeXg,
    awayXg,
    events,
    reasons: buildReasons(homeTeam, awayTeam, homeXg, awayXg, homeGoals, awayGoals),
  };
};
