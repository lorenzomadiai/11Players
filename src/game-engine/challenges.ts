import type { ChallengeReport, Player, Squad } from '../types/game';
import { isDefensiveProfile } from './positions';

interface ChallengeDefinition {
  id: string;
  label: string;
  description: string;
  isAvailable: (squad: Squad) => boolean;
  evaluate: (players: Player[]) => ChallengeReport;
}

const names = (players: Player[]) => players.map((player) => player.name).join(', ');

export const challengeDefinitions: ChallengeDefinition[] = [
  {
    id: 'no-ballon-dor',
    label: "No Ballon d'Or Winners",
    description: 'Build the XI without any player who has won the Ballon d Or.',
    isAvailable: (squad) => squad.players.filter((player) => !player.ballonDorWinner).length >= 11,
    evaluate: (players) => {
      const offenders = players.filter((player) => player.ballonDorWinner);
      return {
        id: 'no-ballon-dor',
        label: "No Ballon d'Or Winners",
        passed: offenders.length === 0 && players.length === 11,
        penalty: offenders.length * 6,
        notes:
          offenders.length === 0
            ? ['No golden-ball royalty sneaked into the XI. Very democratic.']
            : [`Ballon d Or winners used: ${names(offenders)}.`],
      };
    },
  },
  {
    id: 'one-player-per-club',
    label: 'One Player Per Club',
    description: 'No two starters can represent the same club in the selected tournament season.',
    isAvailable: (squad) => new Set(squad.players.map((player) => player.club)).size >= 11,
    evaluate: (players) => {
      const clubCounts = players.reduce<Record<string, number>>((counts, player) => {
        counts[player.club] = (counts[player.club] ?? 0) + 1;
        return counts;
      }, {});
      const repeated = Object.entries(clubCounts).filter(([, count]) => count > 1);

      return {
        id: 'one-player-per-club',
        label: 'One Player Per Club',
        passed: repeated.length === 0 && players.length === 11,
        penalty: repeated.reduce((total, [, count]) => total + (count - 1) * 5, 0),
        notes:
          repeated.length === 0
            ? ['Every club gets exactly one voice in the dressing room.']
            : repeated.map(([club, count]) => `${club} has ${count} starters.`),
      };
    },
  },
  {
    id: 'defensive-core',
    label: 'Defense-First XI',
    description: 'Use at least seven players who can play goalkeeper, defender, wing-back, or defensive midfield.',
    isAvailable: (squad) => squad.players.filter((player) => isDefensiveProfile(player.positions)).length >= 7,
    evaluate: (players) => {
      const defensivePlayers = players.filter((player) => isDefensiveProfile(player.positions));

      return {
        id: 'defensive-core',
        label: 'Defense-First XI',
        passed: defensivePlayers.length >= 7 && players.length === 11,
        penalty: Math.max(0, 7 - defensivePlayers.length) * 5,
        notes:
          defensivePlayers.length >= 7
            ? [`${defensivePlayers.length} defensive profiles. The low block has paperwork.`]
            : [`Only ${defensivePlayers.length} defensive profiles. The back line wants a committee meeting.`],
      };
    },
  },
  {
    id: 'no-superstars',
    label: 'No 90+ Ratings',
    description: 'Win without selecting any player rated 90 or higher.',
    isAvailable: (squad) => squad.players.filter((player) => player.rating < 90).length >= 11,
    evaluate: (players) => {
      const superstars = players.filter((player) => player.rating >= 90);

      return {
        id: 'no-superstars',
        label: 'No 90+ Ratings',
        passed: superstars.length === 0 && players.length === 11,
        penalty: superstars.length * 5,
        notes:
          superstars.length === 0
            ? ['No mega-rating safety blanket. Proper spreadsheet courage.']
            : [`90+ rated players used: ${names(superstars)}.`],
      };
    },
  },
];

export const getChallengeById = (id: string) =>
  challengeDefinitions.find((challenge) => challenge.id === id) ?? challengeDefinitions[0];

export const getAvailableChallenges = (squad: Squad) =>
  challengeDefinitions.filter((challenge) => challenge.isAvailable(squad));
