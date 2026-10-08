import { describe, expect, it } from 'vitest';
import { weekDays } from '../src/core/week.ts';
import {
  applyAttempt,
  effortMinutes,
  finishSession,
  initialState,
  rollWeeks,
  startSession,
  statusOf,
  xpOf,
} from '../src/core/xp.ts';
import type { AttemptEvent, Settings, State } from '../src/core/xp.ts';

const settings: Settings = {
  dailyGoal: 30,
  leagues: true,
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

const withDays = (days: Record<string, number>, tier = 'bronze'): State => ({
  ...initialState(),
  days,
  league: { tier: tier as State['league']['tier'], processedUntil: null },
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
    expect(state.perfectSessions).toBe(1);
    expect(state.recent[0]).toMatchObject({ kind: 'perfect-bonus', xp: 2 });
    expect(state.session).toBeNull();
  });

  it('gives nothing for two attempts, a grade below 4 or a give-up', () => {
    expect(run([5, 5]).perfectSessions).toBe(0);
    expect(run([5, 3, 5]).perfectSessions).toBe(0);
    expect(run([5, 5, 5], { outcome: 'gave-up' }).perfectSessions).toBe(0);
  });

  it('ignores a session it does not know', () => {
    const state = applyAttempt(initialState(), attempt());
    expect(finishSession(state, { sessionId: 'x', at: 1 })).toBe(state);
  });
});

describe('weeks and leagues', () => {
  // 2026-10-05 is a Monday
  const now = at(2026, 10, 12, 9);

  it('promotes at 5 daily goals, keeps in between, demotes under 2', () => {
    const promoted = rollWeeks(withDays({ '2026-10-05': 150 }), now, settings);
    expect(promoted.league.tier).toBe('silver');
    expect(promoted.weeks[0]).toEqual({
      start: '2026-10-05',
      xp: 150,
      tier: 'bronze',
      result: 'promoted',
    });
    const kept = rollWeeks(withDays({ '2026-10-05': 60 }), now, settings);
    expect(kept.weeks[0]).toMatchObject({ tier: 'bronze', result: 'kept' });
    const demoted = rollWeeks(
      withDays({ '2026-10-05': 59 }, 'gold'),
      now,
      settings,
    );
    expect(demoted.league.tier).toBe('silver');
    expect(demoted.weeks[0].result).toBe('demoted');
  });

  it('stops at the top, at the bottom and with leagues off', () => {
    const top = rollWeeks(
      withDays({ '2026-10-05': 500 }, 'diamond'),
      now,
      settings,
    );
    expect(top.league.tier).toBe('diamond');
    const bottom = rollWeeks(withDays({ '2026-10-05': 5 }), now, settings);
    expect(bottom.league.tier).toBe('bronze');
    const off = rollWeeks(withDays({ '2026-10-05': 500 }), now, {
      ...settings,
      leagues: false,
    });
    expect(off.league.tier).toBe('bronze');
    expect(off.weeks[0].result).toBe('kept');
  });

  it('closes the week on Monday, not on Sunday, also over New Year', () => {
    const state = withDays({ '2026-10-05': 150 });
    expect(rollWeeks(state, at(2026, 10, 11, 23, 59), settings).weeks).toEqual(
      [],
    );
    expect(
      rollWeeks(state, at(2026, 10, 12, 0, 1), settings).weeks,
    ).toHaveLength(1);
    // week of Mon 2026-12-28 .. Sun 2027-01-03
    const year = rollWeeks(
      withDays({ '2026-12-30': 80, '2027-01-02': 80 }),
      at(2027, 1, 4),
      settings,
    );
    expect(year.weeks[0]).toMatchObject({ start: '2026-12-28', xp: 160 });
  });

  it('walks several skipped weeks one by one and spares a newcomer', () => {
    const state = withDays({ '2026-09-14': 150 });
    const rolled = rollWeeks(state, now, settings);
    expect(rolled.weeks.map((w) => w.result)).toEqual([
      'kept',
      'kept',
      'demoted',
      'promoted',
    ]);
    expect(rolled.league.tier).toBe('bronze');
    expect(
      rollWeeks(initialState(), now, settings).league.processedUntil,
    ).toBeNull();
  });

  it('judges each week by the goal of the moment', () => {
    const state = withDays({ '2026-10-05': 100, '2026-10-12': 100 });
    const first = rollWeeks(state, now, { ...settings, dailyGoal: 20 });
    expect(first.weeks[0].result).toBe('promoted');
    const second = rollWeeks(first, at(2026, 10, 19), {
      ...settings,
      dailyGoal: 40,
    });
    expect(second.weeks[0].result).toBe('kept');
  });
});

describe('status', () => {
  it('summarises today, the week, the league and 14 days of history', () => {
    // Saturday 2026-10-10
    const nowMs = at(2026, 10, 10);
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
    expect(status.week).toEqual({
      start: '2026-10-05',
      xp: 40,
      promoteAt: 150,
      keepAt: 60,
      daysLeft: 2,
    });
    expect(status.league).toMatchObject({
      tier: 'bronze',
      next: 'silver',
      previous: null,
      toPromote: 110,
      atRisk: true,
    });
    expect(status.history).toHaveLength(14);
    expect(status.history[0].date).toBe('2026-09-27');
    expect(status.history[13]).toEqual({
      date: '2026-10-10',
      xp: 30,
      reached: true,
    });
    expect(status.streak).toEqual({ current: 2, longest: 5 });
  });

  it('is not at risk early in the week or with leagues off', () => {
    const state = withDays({});
    expect(
      statusOf(state, at(2026, 10, 6), settings, streak).league.atRisk,
    ).toBe(false);
    expect(
      statusOf(state, at(2026, 10, 11), { ...settings, leagues: false }, streak)
        .league.atRisk,
    ).toBe(false);
  });
});

describe('week strip', () => {
  const stateWith = (days: Record<string, number>) =>
    statusOf(withDays(days), at(2026, 10, 7), settings, streak);

  it('lists Monday to Sunday: reached and missed days, today, days ahead', () => {
    // Wednesday 2026-10-07: Monday reached, Tuesday missed, today in progress
    const week = weekDays(stateWith({ '2026-10-05': 31, '2026-10-07': 5 }));
    expect(week.map((day) => day.date)).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ]);
    expect(week.map((day) => day.state)).toEqual([
      'reached',
      'missed',
      'today',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
    ]);
    expect(week.map((day) => day.xp)).toEqual([31, 0, 5, 0, 0, 0, 0]);
    expect(week.filter((day) => day.isToday)).toHaveLength(1);
  });

  it('counts today as reached once its goal is done', () => {
    const week = weekDays(stateWith({ '2026-10-07': 30 }));
    expect(week[2]).toMatchObject({ state: 'reached', isToday: true });
  });

  it('starts on Monday also when today is Monday or Sunday', () => {
    const monday = statusOf(withDays({}), at(2026, 10, 5), settings, streak);
    expect(weekDays(monday).map((day) => day.state)).toEqual([
      'today',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
    ]);
    const sunday = statusOf(
      withDays({ '2026-10-10': 40 }),
      at(2026, 10, 11),
      settings,
      streak,
    );
    const states = weekDays(sunday).map((day) => day.state);
    expect(states[5]).toBe('reached');
    expect(states[6]).toBe('today');
  });
});
