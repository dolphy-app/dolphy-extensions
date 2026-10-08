import { LEAGUE_TIERS } from '../shared/types.ts';
import type {
  DayXp,
  GamificationStatus,
  LeagueTier,
  WeekSummary,
  XpEntry,
} from '../shared/types.ts';
import { addDays, dateKey, daysLeftInWeek, weekStartOf } from './dates.ts';

export const MIN_EFFORT_MINUTES = 1;
export const MAX_EFFORT_MINUTES = 5;
/** Quality multiplier by grade 0..5. */
export const GRADE_QUALITY: readonly number[] = [0, 0.2, 0.4, 0.75, 1, 1];
/** Attempts a session needs for the perfect bonus. */
export const PERFECT_MIN_ATTEMPTS = 3;
/** Bonus share of the session XP. */
export const PERFECT_BONUS_RATIO = 0.2;
export const PERFECT_MIN_GRADE = 4;
export const DEFAULT_DAILY_GOAL = 30;
/** Weekly XP for a promotion, in daily goals. */
export const PROMOTE_DAYS = 5;
/** Weekly XP below which the league drops, in daily goals. */
export const KEEP_DAYS = 2;
export const MAX_DAYS_KEPT = 120;
export const MAX_WEEKS_KEPT = 12;
export const MAX_RECENT_KEPT = 20;
export const MAX_WEEKS_PER_ROLL = 8;
export const HISTORY_DAYS = 14;
export const STATUS_WEEKS = 8;
export const STATUS_RECENT = 10;
const MINUTE_MS = 60_000;

export interface Settings {
  dailyGoal: number;
  leagues: boolean;
  notify: boolean;
  enabled: boolean;
}

export interface AttemptEvent {
  exerciseId: string;
  grade: number;
  outcome: 'passed' | 'failed' | 'gave-up' | 'self-assessed';
  source: 'self' | 'runner' | 'placement' | 'trane-import';
  at: number;
}

export interface Session {
  id: string;
  lastAt: number;
  attempts: number;
  xp: number;
  perfect: boolean;
}

export interface State {
  v: 1;
  totalXp: number;
  days: Record<string, number>;
  weeks: WeekSummary[];
  league: { tier: LeagueTier; processedUntil: string | null };
  recent: XpEntry[];
  session: Session | null;
  goalNotifiedDate: string | null;
  perfectSessions: number;
}

export const initialState = (): State => ({
  v: 1,
  totalXp: 0,
  days: {},
  weeks: [],
  league: { tier: 'bronze', processedUntil: null },
  recent: [],
  session: null,
  goalNotifiedDate: null,
  perfectSessions: 0,
});

/** The stored value if it is a state of this version, a fresh state otherwise. */
export const parseState = (raw: unknown): State => {
  if (typeof raw !== 'object' || raw === null) return initialState();
  const s = raw as Partial<State>;
  const ok =
    s.v === 1 &&
    typeof s.totalXp === 'number' &&
    typeof s.days === 'object' &&
    s.days !== null &&
    Array.isArray(s.weeks) &&
    Array.isArray(s.recent) &&
    typeof s.league === 'object' &&
    s.league !== null &&
    LEAGUE_TIERS.includes(s.league.tier);
  return ok ? (raw as State) : initialState();
};

export const qualityOf = (event: AttemptEvent): number => {
  if (event.outcome === 'gave-up' || event.source === 'trane-import') return 0;
  return GRADE_QUALITY[event.grade] ?? 0;
};

/** Whole minutes (1..5) since the session's previous timestamp. */
export const effortMinutes = (session: Session | null, at: number): number => {
  if (session === null) return MIN_EFFORT_MINUTES;
  const minutes = Math.round((at - session.lastAt) / MINUTE_MS);
  return Math.min(MAX_EFFORT_MINUTES, Math.max(MIN_EFFORT_MINUTES, minutes));
};

export const xpOf = (event: AttemptEvent, session: Session | null): number => {
  const quality = qualityOf(event);
  if (quality === 0) return 0;
  return Math.max(1, Math.round(effortMinutes(session, event.at) * quality));
};

const record = (state: State, entry: XpEntry): State => {
  const date = dateKey(entry.at);
  const cutoff = addDays(date, -(MAX_DAYS_KEPT - 1));
  const days: Record<string, number> = {
    ...state.days,
    [date]: (state.days[date] ?? 0) + entry.xp,
  };
  for (const key of Object.keys(days)) if (key < cutoff) delete days[key];
  return {
    ...state,
    totalXp: state.totalXp + entry.xp,
    days,
    recent: [entry, ...state.recent].slice(0, MAX_RECENT_KEPT),
  };
};

export const startSession = (
  state: State,
  event: { sessionId: string; at: number },
): State => ({
  ...state,
  session: {
    id: event.sessionId,
    lastAt: event.at,
    attempts: 0,
    xp: 0,
    perfect: true,
  },
});

export const applyAttempt = (state: State, event: AttemptEvent): State => {
  const xp = xpOf(event, state.session);
  let next = state;
  if (xp > 0) {
    next = record(next, {
      at: event.at,
      xp,
      kind: 'attempt',
      grade: event.grade,
      exerciseId: event.exerciseId,
    });
  }
  if (state.session !== null) {
    const { session } = state;
    next = {
      ...next,
      session: {
        ...session,
        lastAt: event.at,
        attempts: session.attempts + 1,
        xp: session.xp + xp,
        perfect:
          session.perfect &&
          event.outcome !== 'gave-up' &&
          event.grade >= PERFECT_MIN_GRADE,
      },
    };
  }
  return next;
};

export const finishSession = (
  state: State,
  event: { sessionId: string; at: number },
): State => {
  const { session } = state;
  if (session === null || session.id !== event.sessionId) return state;
  let next: State = { ...state, session: null };
  if (session.perfect && session.attempts >= PERFECT_MIN_ATTEMPTS) {
    const xp = Math.max(1, Math.round(session.xp * PERFECT_BONUS_RATIO));
    next = record(next, {
      at: event.at,
      xp,
      kind: 'perfect-bonus',
      grade: null,
      exerciseId: null,
    });
    next.perfectSessions += 1;
  }
  return next;
};

export const promoteAt = (settings: Settings): number =>
  settings.dailyGoal * PROMOTE_DAYS;
export const keepAt = (settings: Settings): number =>
  settings.dailyGoal * KEEP_DAYS;

const weekXp = (state: State, start: string): number => {
  let sum = 0;
  for (let i = 0; i < 7; i += 1) sum += state.days[addDays(start, i)] ?? 0;
  return sum;
};

const shift = (tier: LeagueTier, by: number): LeagueTier =>
  LEAGUE_TIERS[
    Math.min(
      LEAGUE_TIERS.length - 1,
      Math.max(0, LEAGUE_TIERS.indexOf(tier) + by),
    )
  ];

/**
 * Closes the completed weeks (at most `MAX_WEEKS_PER_ROLL` per call). Weeks
 * before the first recorded XP are skipped.
 */
export const rollWeeks = (
  state: State,
  nowMs: number,
  settings: Settings,
): State => {
  const current = weekStartOf(dateKey(nowMs));
  let { processedUntil } = state.league;
  if (processedUntil === null) {
    const first = Object.keys(state.days)
      .filter((key) => state.days[key] > 0)
      .sort()[0];
    if (first === undefined) return state;
    processedUntil = weekStartOf(first);
  }
  let tier = state.league.tier;
  let weeks = state.weeks;
  for (let n = 0; n < MAX_WEEKS_PER_ROLL && processedUntil < current; n += 1) {
    const xp = weekXp(state, processedUntil);
    let result: WeekSummary['result'] = 'kept';
    let after = tier;
    if (settings.leagues) {
      if (xp >= promoteAt(settings)) after = shift(tier, 1);
      else if (xp < keepAt(settings)) after = shift(tier, -1);
      if (after !== tier) {
        result =
          LEAGUE_TIERS.indexOf(after) > LEAGUE_TIERS.indexOf(tier)
            ? 'promoted'
            : 'demoted';
      }
    }
    weeks = [{ start: processedUntil, xp, tier, result }, ...weeks].slice(
      0,
      MAX_WEEKS_KEPT,
    );
    tier = after;
    processedUntil = addDays(processedUntil, 7);
  }
  if (
    tier === state.league.tier &&
    processedUntil === state.league.processedUntil
  ) {
    return state;
  }
  return { ...state, weeks, league: { tier, processedUntil } };
};

/** The date to announce when today's goal was just reached, or null. */
export const goalReachedDate = (
  state: State,
  nowMs: number,
  settings: Settings,
): string | null => {
  const date = dateKey(nowMs);
  return (state.days[date] ?? 0) >= settings.dailyGoal &&
    state.goalNotifiedDate !== date
    ? date
    : null;
};

export const statusOf = (
  state: State,
  nowMs: number,
  settings: Settings,
  streak: { current: number; longest: number },
): GamificationStatus => {
  const date = dateKey(nowMs);
  const goal = settings.dailyGoal;
  const todayXp = state.days[date] ?? 0;
  const start = weekStartOf(date);
  const xp = weekXp(state, start);
  const daysLeft = daysLeftInWeek(date);
  const { tier } = state.league;
  const index = LEAGUE_TIERS.indexOf(tier);
  const history: DayXp[] = [];
  for (let i = HISTORY_DAYS - 1; i >= 0; i -= 1) {
    const day = addDays(date, -i);
    const dayXp = state.days[day] ?? 0;
    history.push({ date: day, xp: dayXp, reached: dayXp >= goal });
  }
  return {
    enabled: settings.enabled,
    leaguesEnabled: settings.leagues,
    today: { date, xp: todayXp, goal, reached: todayXp >= goal },
    week: {
      start,
      xp,
      promoteAt: promoteAt(settings),
      keepAt: keepAt(settings),
      daysLeft,
    },
    league: {
      tier,
      index,
      next: LEAGUE_TIERS[index + 1] ?? null,
      previous: LEAGUE_TIERS[index - 1] ?? null,
      toPromote: Math.max(0, promoteAt(settings) - xp),
      atRisk: settings.leagues && xp < keepAt(settings) && daysLeft <= 2,
    },
    totalXp: state.totalXp,
    streak: { current: streak.current, longest: streak.longest },
    history,
    weeks: state.weeks.slice(0, STATUS_WEEKS),
    recent: state.recent.slice(0, STATUS_RECENT),
    perfectSessions: state.perfectSessions,
  };
};
