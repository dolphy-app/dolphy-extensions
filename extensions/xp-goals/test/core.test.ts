import { describe, expect, it } from 'vitest';
import {
  applyAttempt,
  effortMinutes,
  finishSession,
  initialState,
  parseState,
  startSession,
  statusOf,
  xpOf,
} from '../src/core/xp.ts';
import type { AttemptEvent, Settings, State } from '../src/core/xp.ts';

const settings: Settings = {
  dailyGoal: 30,
  notify: true,
  enabled: true,
};
const streak = { current: 0, longest: 0 };
const MIN = 60_000;

/** Local time; month is 1-based. */
const at = (y: number, m: number, d: number, h = 12, min = 0): number =>
  new Date(y, m - 1, d, h, min).getTime();

const attempt = (over: Partial<AttemptEvent> = {}): AttemptEvent => ({
  exerciseId: 'e1',
  grade: 5,
  outcome: 'passed',
  source: 'runner',
  at: at(2026, 10, 7),
  ...over,
});

const withDays = (days: Record<string, number>): State => ({
  ...initialState(),
  days,
});

describe('xp of an attempt', () => {
  it('scales the effort minutes by the grade', () => {
    const session = { id: 's', lastAt: 0, attempts: 0, xp: 0, perfect: true };
    const xp = (grade: number, minutes: number, over = {}) =>
      xpOf(attempt({ grade, at: minutes * MIN, ...over }), session);
    expect(xp(5, 4)).toBe(4);
    expect(xp(4, 4)).toBe(4);
    expect(xp(3, 4)).toBe(3);
    expect(xp(2, 5)).toBe(2);
    expect(xp(1, 5)).toBe(1);
    expect(xp(0, 5)).toBe(0);
    expect(xp(5, 4, { outcome: 'gave-up' })).toBe(0);
    expect(xp(5, 4, { source: 'trane-import' })).toBe(0);
  });

  it('rounds the gap to whole minutes within 1..5, one without a session', () => {
    const session = { id: 's', lastAt: 0, attempts: 0, xp: 0, perfect: true };
    expect(effortMinutes(null, 10 * MIN)).toBe(1);
    expect(effortMinutes(session, 0)).toBe(1);
    expect(effortMinutes(session, 1.4 * MIN)).toBe(1);
    expect(effortMinutes(session, 2.6 * MIN)).toBe(3);
    expect(effortMinutes(session, 9 * MIN)).toBe(5);
  });

  it('records the entry in the day, the total and the recent list', () => {
    const state = applyAttempt(initialState(), attempt());
    expect(state.totalXp).toBe(1);
    expect(state.days['2026-10-07']).toBe(1);
    expect(state.recent[0]).toMatchObject({ kind: 'attempt', xp: 1, grade: 5 });
    expect(applyAttempt(state, attempt({ grade: 0 })).recent).toHaveLength(1);
  });

  it('keeps at most 120 days', () => {
    const start = at(2026, 1, 1);
    let state = initialState();
    for (let i = 0; i < 130; i += 1) {
      state = applyAttempt(state, attempt({ at: start + i * 86_400_000 }));
    }
    expect(Object.keys(state.days)).toHaveLength(120);
    expect(state.totalXp).toBe(130);
  });
});

describe('perfect session', () => {
  const run = (grades: number[], over: Partial<AttemptEvent> = {}) => {
    let state = startSession(initialState(), { sessionId: 's', at: 0 });
    grades.forEach((grade, i) => {
      state = applyAttempt(
        state,
        attempt({ grade, at: (i + 1) * 3 * MIN, ...over }),
      );
    });
    return finishSession(state, { sessionId: 's', at: 20 * MIN });
  };

  it('adds a 20% bonus for three clean attempts', () => {
    const state = run([5, 4, 5]);
    expect(state.totalXp).toBe(9 + 2);
    expect(state.recent[0]).toMatchObject({ kind: 'perfect-bonus', xp: 2 });
    expect(state.session).toBeNull();
  });

  it('gives nothing for two attempts, a grade below 4 or a give-up', () => {
    const bonus = (state: State) =>
      state.recent.some((entry) => entry.kind === 'perfect-bonus');
    expect(bonus(run([5, 5]))).toBe(false);
    expect(bonus(run([5, 3, 5]))).toBe(false);
    expect(bonus(run([5, 5, 5], { outcome: 'gave-up' }))).toBe(false);
  });

  it('ignores a session it does not know', () => {
    const state = applyAttempt(initialState(), attempt());
    expect(finishSession(state, { sessionId: 'x', at: 1 })).toBe(state);
  });
});

describe('stored state', () => {
  it('keeps a state of this version as it is', () => {
    const state = applyAttempt(initialState(), attempt());
    expect(parseState(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });

  it('drops what the build with leagues stored and does not write it back', () => {
    const old = {
      v: 1,
      totalXp: 43,
      days: { '2026-10-07': 43 },
      weeks: [{ start: '2026-09-28', xp: 150, tier: 'bronze', result: 'kept' }],
      league: { tier: 'gold', processedUntil: '2026-10-05' },
      recent: [],
      session: null,
      goalNotifiedDate: '2026-10-07',
      perfectSessions: 3,
    };
    const state = parseState(old);
    expect(state).toEqual({
      v: 1,
      totalXp: 43,
      days: { '2026-10-07': 43 },
      recent: [],
      session: null,
      goalNotifiedDate: '2026-10-07',
    });
    const next = applyAttempt(state, attempt());
    expect(Object.keys(next).sort()).toEqual([
      'days',
      'goalNotifiedDate',
      'recent',
      'session',
      'totalXp',
      'v',
    ]);
  });

  it('starts fresh from anything that is not a state', () => {
    for (const raw of [
      null,
      'x',
      7,
      {},
      { v: 2, totalXp: 1, days: {}, recent: [] },
    ]) {
      expect(parseState(raw)).toEqual(initialState());
    }
  });
});

describe('status', () => {
  // Saturday 2026-10-10; 2026-10-05 is a Monday
  const nowMs = at(2026, 10, 10);

  it('summarises today, the week and 14 days of history', () => {
    const state: State = {
      ...withDays({ '2026-10-10': 30, '2026-10-07': 10, '2026-09-20': 3 }),
      totalXp: 43,
    };
    const status = statusOf(state, nowMs, settings, { current: 2, longest: 5 });
    expect(status.today).toEqual({
      date: '2026-10-10',
      xp: 30,
      goal: 30,
      reached: true,
    });
    expect(status.week.start).toBe('2026-10-05');
    expect(status.week.xp).toBe(40);
    expect(status.history).toHaveLength(14);
    expect(status.history[0].date).toBe('2026-09-27');
    expect(status.history[13]).toEqual({
      date: '2026-10-10',
      xp: 30,
      reached: true,
    });
    expect(status.streak).toEqual({ current: 2, longest: 5 });
    expect(status.totalXp).toBe(43);
  });

  it('lists Monday to Sunday: reached and missed days, today, days ahead', () => {
    // Wednesday: Monday reached, Tuesday missed, today in progress
    const status = statusOf(
      withDays({ '2026-10-05': 31, '2026-10-07': 5 }),
      at(2026, 10, 7),
      settings,
      streak,
    );
    expect(status.week.days.map((day) => day.date)).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ]);
    expect(status.week.days.map((day) => day.xp)).toEqual([
      31, 0, 5, 0, 0, 0, 0,
    ]);
    expect(status.week.days.map((day) => day.reached)).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(status.week.days.map((day) => day.today)).toEqual([
      false,
      false,
      true,
      false,
      false,
      false,
      false,
    ]);
    expect(status.week.days.map((day) => day.future)).toEqual([
      false,
      false,
      false,
      true,
      true,
      true,
      true,
    ]);
    expect(status.week.xp).toBe(36);
  });

  it('starts on Monday also when today is Monday or Sunday, also over New Year', () => {
    const monday = statusOf(withDays({}), at(2026, 10, 5), settings, streak);
    expect(monday.week.days.map((day) => day.today)).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
    const sunday = statusOf(
      withDays({ '2026-10-10': 40 }),
      at(2026, 10, 11),
      settings,
      streak,
    );
    expect(sunday.week.days[5]).toMatchObject({ reached: true, today: false });
    expect(sunday.week.days[6]).toMatchObject({ today: true, future: false });
    // week of Mon 2026-12-28 .. Sun 2027-01-03
    const year = statusOf(
      withDays({ '2026-12-30': 80, '2027-01-02': 80 }),
      at(2027, 1, 4),
      settings,
      streak,
    );
    expect(year.week.start).toBe('2027-01-04');
    const before = statusOf(
      withDays({ '2026-12-30': 80, '2027-01-02': 80 }),
      at(2027, 1, 3),
      settings,
      streak,
    );
    expect(before.week.start).toBe('2026-12-28');
    expect(before.week.xp).toBe(160);
  });

  it('counts a week of the new week from zero', () => {
    const status = statusOf(
      withDays({ '2026-10-05': 150 }),
      at(2026, 10, 12),
      settings,
      streak,
    );
    expect(status.week.xp).toBe(0);
  });
});
