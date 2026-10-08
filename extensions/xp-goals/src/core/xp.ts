import type {
  DayXp,
  GamificationStatus,
  WeekDay,
  XpEntry,
} from '../shared/types.ts';
import { addDays, dateKey, weekStartOf } from './dates.ts';

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
export const MAX_DAYS_KEPT = 120;
export const MAX_RECENT_KEPT = 20;
export const HISTORY_DAYS = 14;
export const STATUS_RECENT = 10;
const MINUTE_MS = 60_000;

export interface Settings {
  dailyGoal: number;
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
  recent: XpEntry[];
  session: Session | null;
  goalNotifiedDate: string | null;
}

export const initialState = (): State => ({
  v: 1,
  totalXp: 0,
  days: {},
  recent: [],
  session: null,
  goalNotifiedDate: null,
});

/**
 * The stored value as a state of this version, a fresh state if it is none.
 * Only the fields of the state are taken: what an older build stored besides
 * them (leagues, closed weeks, perfect sessions) is dropped.
 */
export const parseState = (raw: unknown): State => {
  if (typeof raw !== 'object' || raw === null) return initialState();
  const s = raw as Partial<State>;
  const ok =
    s.v === 1 &&
    typeof s.totalXp === 'number' &&
    typeof s.days === 'object' &&
    s.days !== null &&
    Array.isArray(s.recent);
  if (!ok) return initialState();
  return {
    v: 1,
    totalXp: s.totalXp as number,
    days: s.days as Record<string, number>,
    recent: s.recent as XpEntry[],
    session: s.session ?? null,
    goalNotifiedDate:
      typeof s.goalNotifiedDate === 'string' ? s.goalNotifiedDate : null,
  };
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
  }
  return next;
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
  const history: DayXp[] = [];
  for (let i = HISTORY_DAYS - 1; i >= 0; i -= 1) {
    const day = addDays(date, -i);
    const dayXp = state.days[day] ?? 0;
    history.push({ date: day, xp: dayXp, reached: dayXp >= goal });
  }
  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i += 1) {
    const day = addDays(start, i);
    const future = day > date;
    const dayXp = future ? 0 : (state.days[day] ?? 0);
    days.push({
      date: day,
      xp: dayXp,
      reached: dayXp >= goal,
      today: day === date,
      future,
    });
  }
  return {
    enabled: settings.enabled,
    today: { date, xp: todayXp, goal, reached: todayXp >= goal },
    week: { start, xp: days.reduce((sum, day) => sum + day.xp, 0), days },
    totalXp: state.totalXp,
    streak: { current: streak.current, longest: streak.longest },
    history,
    recent: state.recent.slice(0, STATUS_RECENT),
  };
};
