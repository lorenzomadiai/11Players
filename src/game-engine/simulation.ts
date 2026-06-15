import type { Achievement, Difficulty, Formation, MatchResult, TeamEvaluation } from '../types/game';
import { clamp, round, type RandomSource } from '../utils/random';

const opponentNames = [
  'a tournament superteam',
  'the All-Time Underdogs',
  'a suspiciously organized semifinal wall',
  'the Rest of the Bracket XI',
  'a team that somehow has three left backs',
];

const pickOpponent = (rng: RandomSource) => opponentNames[Math.floor(rng() * opponentNames.length)];

const goalsFromExpected = (expected: number, maxGoals: number, rng: RandomSource) => {
  const noise = rng() * 1.15 - 0.32;
  const raw = expected + noise;
  return Math.round(clamp(raw, 0, maxGoals));
};

const resultAchievements = (result: Omit<MatchResult, 'achievements'>, exactScoreMode: boolean): Achievement[] => [
  {
    id: 'clean-sheet',
    label: 'Clean Sheet',
    description: 'The XI allowed zero goals.',
    earned: result.opponentGoals === 0,
  },
  {
    id: 'target-7-0',
    label: 'The 7-0 Prophecy',
    description: 'Score target mode was completed exactly: 7-0.',
    earned: exactScoreMode && result.teamGoals === 7 && result.opponentGoals === 0,
  },
  {
    id: 'statement-win',
    label: 'Statement Win',
    description: 'Win by at least three goals.',
    earned: result.teamGoals - result.opponentGoals >= 3,
  },
  {
    id: 'chaos-theory',
    label: 'Chaos Theory',
    description: 'Win despite a negative randomness swing.',
    earned: result.outcome === 'win' && result.stats.randomSwing < -4,
  },
];

const buildReasons = (evaluation: TeamEvaluation, difficulty: Difficulty, exactScoreMode: boolean) => {
  const reasons: string[] = [];

  if (evaluation.attack >= 85) {
    reasons.push('The attack generated premium chances instead of polite suggestions.');
  } else if (evaluation.attack < 72) {
    reasons.push('The forward line lacked enough punch to turn territory into goals.');
  }

  if (evaluation.chemistry >= 78) {
    reasons.push('Chemistry bonuses made the ball move as if everyone had read the same secret manual.');
  } else if (evaluation.chemistry < 62) {
    reasons.push('Chemistry dragged the tempo down and a few passes arrived with an apology note.');
  }

  if (exactScoreMode) {
    reasons.push('Score target mode encouraged extra risk while chasing the exact 7-0 finish.');
  }

  if (evaluation.tacticalFit < 65) {
    reasons.push('Tactical mismatch penalties opened gaps between the formation and the players selected.');
  } else if (evaluation.tacticalFit >= 82) {
    reasons.push('The formation fit was clean, so role familiarity amplified the ratings.');
  }

  if (evaluation.starPower >= 82) {
    reasons.push('Legend boost added decisive moments when the match got tight.');
  }

  if (!evaluation.challenge.passed) {
    reasons.push(`The "${evaluation.challenge.label}" challenge was missed, adding a ${evaluation.challenge.penalty}-point tax.`);
  }

  if (difficulty.id === 'expert') {
    reasons.push('Expert difficulty raised the opponent floor and punished awkward role choices.');
  }

  return reasons.slice(0, 5);
};

const buildCommentary = (teamGoals: number, opponentGoals: number, exactScoreMode: boolean) => {
  if (exactScoreMode && teamGoals === 7 && opponentGoals === 0) {
    return 'Seven. Nil. Someone frame the tactics board before the marker ink dries.';
  }

  if (teamGoals > opponentGoals) {
    return teamGoals - opponentGoals >= 3
      ? 'The post-match analyst just drew a smiley face where the heat map should be.'
      : 'Nervy, stylish, and just about legal under the laws of tournament drama.';
  }

  if (teamGoals === opponentGoals) {
    return 'A draw with enough tension to make every replay look like courtroom evidence.';
  }

  return 'The idea was brave. The execution occasionally wore its boots on the wrong feet.';
};

export const simulateMatch = (
  formation: Formation,
  evaluation: TeamEvaluation,
  difficulty: Difficulty,
  exactScoreMode: boolean,
  rng: RandomSource = Math.random,
): MatchResult => {
  const opponentStrength = clamp(
    difficulty.opponentStrength +
      (100 - evaluation.starPower) * 0.12 +
      (formation.shapeBias === 'front-foot' ? 1.5 : 0),
    68,
    95,
  );
  const randomSwing = round((rng() * 2 - 1) * difficulty.randomness, 1);
  const targetRisk = exactScoreMode ? 0.55 : 0;
  const teamPower =
    evaluation.overall +
    evaluation.attack * 0.08 +
    evaluation.chemistry * 0.05 +
    evaluation.starPower * 0.04 +
    randomSwing -
    (evaluation.challenge.passed ? 0 : evaluation.challenge.penalty * 0.32);
  const opponentPower =
    opponentStrength +
    (100 - evaluation.defense) * 0.12 +
    (75 - evaluation.tacticalFit) * 0.04 +
    targetRisk * 4 -
    randomSwing * 0.32;

  const teamExpected = clamp(1.15 + (teamPower - 70) / 14 + (evaluation.attack - 75) / 28 + targetRisk, 0.2, 7.8);
  const opponentExpected = clamp(0.75 + (opponentPower - evaluation.defense) / 18 + targetRisk * 0.6, 0.1, 5.5);
  const teamGoals = goalsFromExpected(teamExpected, exactScoreMode ? 8 : 6, rng);
  const opponentGoals = goalsFromExpected(opponentExpected, 5, rng);
  const outcome = teamGoals > opponentGoals ? 'win' : teamGoals === opponentGoals ? 'draw' : 'loss';
  const reasons = buildReasons(evaluation, difficulty, exactScoreMode);

  const resultWithoutAchievements: Omit<MatchResult, 'achievements'> = {
    teamGoals,
    opponentGoals,
    outcome,
    opponentName: pickOpponent(rng),
    stats: {
      attack: evaluation.attack,
      midfield: evaluation.midfield,
      defense: evaluation.defense,
      chemistry: evaluation.chemistry,
      tacticalFit: evaluation.tacticalFit,
      starPower: evaluation.starPower,
      randomSwing,
      opponentStrength: round(opponentStrength, 1),
    },
    summary:
      outcome === 'win'
        ? 'Your Dream XI wins the simulation.'
        : outcome === 'draw'
          ? 'Your Dream XI is held after a chaotic tactical argument.'
          : 'Your Dream XI loses the simulation.',
    reasons,
    commentary: buildCommentary(teamGoals, opponentGoals, exactScoreMode),
  };

  return {
    ...resultWithoutAchievements,
    achievements: resultAchievements(resultWithoutAchievements, exactScoreMode),
  };
};
