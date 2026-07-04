import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, SkipForward, Trophy } from 'lucide-react';
import type { TacticalMatchEvent, TournamentMatch, TournamentSimulationResult } from '../types/game';
import TournamentResultPanel from './TournamentResultPanel';

interface LiveTournamentFlowProps {
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

const formatMetric = (value: number) => value.toFixed(2);

const teamName = (result: TournamentSimulationResult, teamId: string) =>
  result.tournament.teams.find((team) => team.id === teamId)?.name ?? teamId;

const userMatches = (result: TournamentSimulationResult) =>
  [...result.tournament.groupMatches, ...result.tournament.knockoutMatches].filter(
    (match) => match.homeTeamId === result.tournament.userTeamId || match.awayTeamId === result.tournament.userTeamId,
  );

// Match results are precomputed by the engine; live score only counts the
// events the UI has revealed, so goals do not appear before their minute.
const visibleScore = (match: TournamentMatch, revealedEvents: TacticalMatchEvent[]) => ({
  home: revealedEvents.filter((event) => event.side === 'home' && event.goal).length,
  away: revealedEvents.filter((event) => event.side === 'away' && event.goal).length,
  finalHome: match.result?.homeGoals ?? 0,
  finalAway: match.result?.awayGoals ?? 0,
});

const formatMinute = (minute: number) => (minute > 90 ? `${minute}' ET` : `${minute}'`);

const resolutionText = (match: TournamentMatch, result: TournamentSimulationResult) => {
  if (!match.result) {
    return 'Pending simulation.';
  }

  if (match.result.resolution === 'penalties' && match.result.penalties) {
    return `Penalties: ${teamName(result, match.homeTeamId)} ${match.result.penalties.home}-${match.result.penalties.away} ${teamName(result, match.awayTeamId)}.`;
  }

  if (match.result.resolution === 'extra-time') {
    return 'Decided after extra time.';
  }

  if (match.result.resolution === 'draw') {
    return 'Group-stage draw. No extra time.';
  }

  return 'Decided in regulation time.';
};

export default function LiveTournamentFlow({ result, onReplay, onNewDraw }: LiveTournamentFlowProps) {
  const matches = useMemo(() => userMatches(result), [result]);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [startedMatchIds, setStartedMatchIds] = useState<Record<string, boolean>>({});
  const [revealedEventsByMatch, setRevealedEventsByMatch] = useState<Record<string, number>>({});
  const [showSummary, setShowSummary] = useState(false);
  const eventFeedRef = useRef<HTMLDivElement>(null);

  const activeMatch = matches[activeMatchIndex];
  const activeEvents = activeMatch?.result?.events ?? [];
  const revealedCount = activeMatch ? (revealedEventsByMatch[activeMatch.id] ?? 0) : 0;
  const revealedEvents = activeEvents.slice(0, revealedCount);
  const score = activeMatch ? visibleScore(activeMatch, revealedEvents) : { home: 0, away: 0, finalHome: 0, finalAway: 0 };
  const isStarted = activeMatch ? Boolean(startedMatchIds[activeMatch.id]) : false;
  const isComplete = isStarted && revealedCount >= activeEvents.length;
  const hasNextMatch = activeMatchIndex < matches.length - 1;
  const latestMinute = revealedEvents.length ? revealedEvents[revealedEvents.length - 1].minute : 0;

  useEffect(() => {
    if (showSummary || !activeMatch) {
      return;
    }

    // Long matches should keep the newest event in view without forcing the
    // whole page to jump after every chance.
    eventFeedRef.current?.scrollTo?.({ top: eventFeedRef.current.scrollHeight, behavior: 'smooth' });
  }, [activeMatch, revealedCount, showSummary]);

  if (showSummary || !activeMatch) {
    return <TournamentResultPanel result={result} onReplay={onReplay} onNewDraw={onNewDraw} />;
  }

  const startMatch = () => {
    setStartedMatchIds((current) => ({ ...current, [activeMatch.id]: true }));
    setRevealedEventsByMatch((current) => ({ ...current, [activeMatch.id]: 0 }));
  };

  const revealNextEvent = () => {
    setRevealedEventsByMatch((current) => ({
      ...current,
      [activeMatch.id]: Math.min((current[activeMatch.id] ?? 0) + 1, activeEvents.length),
    }));
  };

  const continueTournament = () => {
    if (hasNextMatch) {
      setActiveMatchIndex((current) => current + 1);
      return;
    }

    setShowSummary(true);
  };

  return (
    <section className="live-tournament" aria-label="Live tournament match flow">
      <div className="live-tournament__hero">
        <p className="eyebrow">Tournament run</p>
        <h2>
          {roundLabels[activeMatch.roundId]}: {teamName(result, activeMatch.homeTeamId)} vs {teamName(result, activeMatch.awayTeamId)}
        </h2>
        <p>
          {isStarted
            ? isComplete
              ? 'Final whistle. Review the match, then continue the tournament.'
              : latestMinute > 0
                ? `Live at ${formatMinute(latestMinute)}.`
                : 'Kickoff ready. Reveal the first important event.'
            : 'Opponent revealed. Start the match when ready.'}
        </p>
      </div>

      <div className="live-tournament__track">
        {matches.slice(0, activeMatchIndex).map((match) => (
          <article key={match.id} className="live-match-card live-match-card--complete">
            <span>{roundLabels[match.roundId]}</span>
            <strong>
              {teamName(result, match.homeTeamId)} {match.result?.homeGoals ?? 0}-{match.result?.awayGoals ?? 0}{' '}
              {teamName(result, match.awayTeamId)}
            </strong>
            <small>{resolutionText(match, result)}</small>
          </article>
        ))}

        <article className={`live-match-card live-match-card--active${isStarted ? ' is-running' : ''}`}>
          <header>
            <span>{roundLabels[activeMatch.roundId]}</span>
            <strong>
              {teamName(result, activeMatch.homeTeamId)} {score.home}-{score.away} {teamName(result, activeMatch.awayTeamId)}
            </strong>
          </header>

          {!isStarted ? (
            <div className="live-match-card__start">
              <p>
                {teamName(result, activeMatch.homeTeamId)} and {teamName(result, activeMatch.awayTeamId)} are in the tunnel.
              </p>
              <button type="button" onClick={startMatch}>
                <Play size={17} />
                Start Match
              </button>
            </div>
          ) : (
            <>
              <div className="live-scoreboard">
                <div>
                  <span>{teamName(result, activeMatch.homeTeamId)}</span>
                  <strong>{score.home}</strong>
                </div>
                <div>
                  <span>{teamName(result, activeMatch.awayTeamId)}</span>
                  <strong>{score.away}</strong>
                </div>
              </div>

              <div className="live-event-feed" aria-live="polite" ref={eventFeedRef}>
                {revealedEvents.length ? (
                  revealedEvents.map((event) => (
                    <p
                      key={`${activeMatch.id}-${event.minute}-${event.teamId}-${event.chanceType}-${event.metrics.roll}`}
                      className={event.goal ? 'live-event live-event--goal' : 'live-event'}
                    >
                      <span>{formatMinute(event.minute)}</span>
                      {event.goal ? <strong>Goal</strong> : <strong>Chance</strong>}
                      {event.goal && event.scorerName ? ` ${event.scorerName}` : ` ${event.shooterName}`} | {event.teamName} |{' '}
                      {event.chanceType} | xG {formatMetric(event.xg)}
                    </p>
                  ))
                ) : (
                  <p className="live-event-feed__empty">The match clock is running. No important event has happened yet.</p>
                )}
              </div>

              {isComplete ? (
                <div className="live-match-summary">
                  <div>
                    <Trophy size={17} />
                    <strong>
                      Full time: {teamName(result, activeMatch.homeTeamId)} {score.finalHome}-{score.finalAway}{' '}
                      {teamName(result, activeMatch.awayTeamId)}
                    </strong>
                  </div>
                  <p>
                    xG: {formatMetric(activeMatch.result?.homeXg ?? 0)} - {formatMetric(activeMatch.result?.awayXg ?? 0)}.{' '}
                    {resolutionText(activeMatch, result)}
                  </p>
                  <button type="button" onClick={continueTournament}>
                    <SkipForward size={17} />
                    {hasNextMatch ? 'Continue Tournament' : 'Show Tournament Summary'}
                  </button>
                </div>
              ) : (
                <button className="live-next-event" type="button" onClick={revealNextEvent}>
                  <SkipForward size={17} />
                  Next Event
                </button>
              )}
            </>
          )}
        </article>
      </div>
    </section>
  );
}
