import { RefreshCw, Shuffle, Trophy } from 'lucide-react';
import type { TournamentMatch, TournamentSimulationResult } from '../types/game';

interface TournamentResultPanelProps {
  result: TournamentSimulationResult;
  onReplay: () => void;
  onNewDraw: () => void;
}

const roundLabels: Record<string, string> = {
  'group-1': 'Group Match 1',
  'group-2': 'Group Match 2',
  'group-3': 'Group Match 3',
  'round-of-16': 'Round of 16',
  'quarter-final': 'Quarter Final',
  'semi-final': 'Semi Final',
  final: 'Final',
};

const scoreFor = (match: TournamentMatch) =>
  match.result ? `${match.result.homeGoals}-${match.result.awayGoals}` : '-';

const winnerLabel = (match: TournamentMatch) => {
  if (!match.result?.winnerSide) {
    return match.result?.outcome === 'draw' ? 'Draw' : 'Pending';
  }

  return match.result.winnerSide === 'home' ? match.homeTeamId : match.awayTeamId;
};

const teamName = (result: TournamentSimulationResult, teamId: string) =>
  result.tournament.teams.find((team) => team.id === teamId)?.name ?? teamId;

// Keep the user-facing panel focused on the Dream XI; the full simulation still
// contains every group and knockout match for compact table/bracket rendering.
const userMatches = (result: TournamentSimulationResult) =>
  [...result.tournament.groupMatches, ...result.tournament.knockoutMatches].filter(
    (match) => match.homeTeamId === result.tournament.userTeamId || match.awayTeamId === result.tournament.userTeamId,
  );

// Goals are a display subset of the event timeline. xG/xA-style aggregation in
// the engine still uses all chances, including misses.
const goalEvents = (matches: TournamentMatch[]) =>
  matches.flatMap((match) =>
    (match.result?.events ?? [])
      .filter((event) => event.goal)
      .map((event) => ({
        ...event,
        match,
      })),
  );

const formatMetric = (value: number) => value.toFixed(2);

export default function TournamentResultPanel({ result, onReplay, onNewDraw }: TournamentResultPanelProps) {
  const userTeamId = result.tournament.userTeamId;
  const userStats = result.teamStats[userTeamId];
  const champion = teamName(result, result.championTeamId);
  const userRunMatches = userMatches(result);
  const userGoals = goalEvents(userRunMatches);
  const userGroup = result.tournament.groups.find((group) => group.teams.some((team) => team.id === userTeamId));

  return (
    <section className="tournament-panel" aria-label="Tournament result">
      <div className="tournament-panel__hero">
        <p className="eyebrow">World Cup demo complete</p>
        <h2>{userStats.stageReached === 'champion' ? 'Your Dream XI won the tournament.' : `Your Dream XI reached the ${userStats.stageReached}.`}</h2>
        <p>
          Champion: <strong>{champion}</strong>. Your run ended with {userStats.goalsFor} goals scored, {userStats.goalsAgainst} conceded,
          and {formatMetric(userStats.xgFor)} xG created.
        </p>
      </div>

      <div className="tournament-summary-grid">
        <div>
          <span>Record</span>
          <strong>
            {userStats.wins}-{userStats.draws}-{userStats.losses}
          </strong>
        </div>
        <div>
          <span>Goal Difference</span>
          <strong>{userStats.goalDifference >= 0 ? `+${userStats.goalDifference}` : userStats.goalDifference}</strong>
        </div>
        <div>
          <span>xG For</span>
          <strong>{formatMetric(userStats.xgFor)}</strong>
        </div>
        <div>
          <span>xG Against</span>
          <strong>{formatMetric(userStats.xgAgainst)}</strong>
        </div>
      </div>

      <div className="tournament-section">
        <div className="section-heading">
          <Trophy size={18} />
          <h3>Your Match Timeline</h3>
        </div>
        {userRunMatches.map((match) => (
          <article key={match.id} className="tournament-match-card">
            <header>
              <span>{roundLabels[match.roundId]}</span>
              <strong>
                {teamName(result, match.homeTeamId)} {scoreFor(match)} {teamName(result, match.awayTeamId)}
              </strong>
            </header>
            <div className="tournament-events">
              {/* Show the first tactical events as the readable match story; the
                  engine result keeps the full event list for later detailed views. */}
              {(match.result?.events ?? []).slice(0, 8).map((event) => (
                <p key={`${match.id}-${event.minute}-${event.teamId}-${event.chanceType}-${event.metrics.roll}`}>
                  <span>{event.minute}'</span>
                  {event.goal ? <strong>Goal</strong> : <strong>Chance</strong>} {event.teamName} · {event.chanceType} · xG {formatMetric(event.xg)}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="tournament-layout">
        <div className="tournament-section">
          <h3>{userGroup ? `Group ${userGroup.label}` : 'Group'}</h3>
          <div className="standings-table">
            {(userGroup ? result.groupStandings[userGroup.id] : []).map((standing) => (
              <div key={standing.teamId}>
                <span>{teamName(result, standing.teamId)}</span>
                <strong>{standing.points} pts</strong>
                <small>
                  {standing.goalsFor}-{standing.goalsAgainst} ({standing.goalDifference >= 0 ? '+' : ''}
                  {standing.goalDifference})
                </small>
              </div>
            ))}
          </div>
        </div>

        <div className="tournament-section">
          <h3>Scorers</h3>
          <div className="scorer-list">
            {userGoals.length ? (
              userGoals.map((event) => (
                <p key={`${event.match.id}-${event.minute}-${event.scorerId}`}>
                  <span>{event.minute}'</span>
                  <strong>{event.scorerName}</strong>
                  {event.assistName ? ` from ${event.assistName}` : ''} · {roundLabels[event.match.roundId]}
                </p>
              ))
            ) : (
              <p>No goals scored by your Dream XI in this run.</p>
            )}
          </div>
        </div>
      </div>

      <div className="tournament-section">
        <h3>Knockout Bracket</h3>
        <div className="bracket-grid">
          {result.tournament.knockoutMatches.map((match) => (
            <div key={match.id} className="bracket-match">
              <span>{roundLabels[match.roundId]}</span>
              <strong>
                {teamName(result, match.homeTeamId)} {scoreFor(match)} {teamName(result, match.awayTeamId)}
              </strong>
              <small>Winner: {teamName(result, winnerLabel(match))}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="result-actions">
        <button type="button" onClick={onReplay}>
          <RefreshCw size={17} />
          Replay Draw
        </button>
        <button type="button" onClick={onNewDraw}>
          <Shuffle size={17} />
          New Draw
        </button>
      </div>
    </section>
  );
}
