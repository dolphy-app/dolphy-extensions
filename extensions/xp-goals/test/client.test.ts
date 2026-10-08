// @vitest-environment happy-dom
import {
  APP_KEY,
  ENGINE_KEY,
  EXTENSION_ID_KEY,
} from '@dolphy-app/extension-api';
import type { AppApi } from '@dolphy-app/extension-sdk';
import { createTestClient } from '@dolphy-app/extension-sdk/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, reactive } from 'vue';
import type { App, Component } from 'vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import { client } from '../src/index.ts';
import PlanCard from '../src/PlanCard.vue';
import StatsPanel from '../src/StatsPanel.vue';
import type { GamificationStatus } from '../src/shared/types.ts';

const ID = 'xp-goals';
const DAY = 24 * 60 * 60 * 1000;

const NOW = new Date(2026, 2, 11, 12, 0, 0).getTime();

const dayKey = (offset: number) => {
  const d = new Date(NOW + offset * DAY);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const status = (
  patch: Partial<GamificationStatus> = {},
): GamificationStatus => ({
  enabled: true,
  leaguesEnabled: true,
  today: { date: dayKey(0), xp: 12, goal: 30, reached: false },
  week: { start: dayKey(-2), xp: 80, promoteAt: 150, keepAt: 60, daysLeft: 5 },
  league: {
    tier: 'silver',
    index: 1,
    next: 'gold',
    previous: 'bronze',
    toPromote: 70,
    atRisk: false,
  },
  totalXp: 412,
  streak: { current: 4, longest: 9 },
  history: Array.from({ length: 14 }, (_, i) => {
    const xp = (i * 7) % 41;
    return { date: dayKey(i - 13), xp, reached: xp >= 30 };
  }),
  weeks: [
    { start: dayKey(-9), xp: 160, tier: 'bronze', result: 'promoted' },
    { start: dayKey(-16), xp: 20, tier: 'silver', result: 'demoted' },
    { start: dayKey(-23), xp: 90, tier: 'silver', result: 'kept' },
  ],
  recent: [
    { at: NOW - 1000, xp: 3, kind: 'attempt', grade: 5, exerciseId: 'e1' },
    {
      at: NOW - 2000,
      xp: 4,
      kind: 'perfect-bonus',
      grade: null,
      exerciseId: null,
    },
  ],
  perfectSessions: 2,
  ...patch,
});

const EMPTY: Partial<GamificationStatus> = {
  totalXp: 0,
  recent: [],
  weeks: [],
  today: { date: dayKey(0), xp: 0, goal: 30, reached: false },
  history: Array.from({ length: 14 }, (_, i) => ({
    date: dayKey(i - 13),
    xp: 0,
    reached: false,
  })),
  streak: { current: 0, longest: 0 },
  perfectSessions: 0,
};

interface Harness {
  host: HTMLElement;
  opened: unknown[][];
  settingsOpened: unknown[][];
  app: { locale: 'en' | 'ru' };
  calls: { count: number };
  emit(event: unknown): void;
  listeners: Set<(event: unknown) => void>;
  rpc: { answer: () => unknown };
}

const disposables: (() => void)[] = [];
afterEach(() => {
  for (const dispose of disposables.splice(0)) dispose();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});

/** Draws a component the way the app does: Vuetify, the window API and the engine are provided. */
const mount = (
  component: Component,
  answer: () => unknown,
  locale: 'en' | 'ru' = 'en',
): Harness => {
  const listeners = new Set<(event: unknown) => void>();
  const opened: unknown[][] = [];
  const settingsOpened: unknown[][] = [];
  const calls = { count: 0 };
  const appApi = reactive({
    locale,
    theme: { id: 'light', dark: false },
    openPanel: (...args: unknown[]) => void opened.push(args),
    openSettings: (...args: unknown[]) => void settingsOpened.push(args),
  });
  const engine = {
    subscribe: (listener: (event: unknown) => void) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    extensions: {
      invokeRpc: async () => {
        calls.count += 1;
        return answer();
      },
    },
  };
  const host = document.createElement('div');
  document.body.append(host);
  const app: App = createApp({ render: () => h(component) });
  app.use(createVuetify({ components }));
  app.provide(APP_KEY, appApi as unknown as AppApi);
  app.provide(ENGINE_KEY, engine);
  app.provide(EXTENSION_ID_KEY, ID);
  app.mount(host);
  disposables.push(() => {
    app.unmount();
    host.remove();
  });
  return {
    host,
    opened,
    settingsOpened,
    app: appApi,
    calls,
    emit: (event) => listeners.forEach((listener) => listener(event)),
    listeners,
    rpc: { answer },
  };
};

const settled = () => vi.waitFor(() => expect(true).toBe(true)).then(nextTick);
const text = (host: HTMLElement, testId: string) =>
  host
    .querySelector(`[data-testid="${testId}"]`)
    ?.textContent?.replace(/\s+/g, ' ')
    .trim();
const has = (host: HTMLElement, testId: string) =>
  host.querySelector(`[data-testid="${testId}"]`) !== null;

describe(`${ID}: client entry`, () => {
  it('registers the panel and the plan card', async () => {
    const running = await createTestClient(client, { extensionId: ID });
    disposables.push(() => void running.dispose());
    expect(running.panels).toMatchObject([
      {
        id: `${ID}.main`,
        title: { en: 'XP goals', ru: 'XP и цели' },
        component: StatsPanel,
      },
    ]);
    expect(running.injections).toMatchObject([
      {
        id: `${ID}.plan-card`,
        target: '[data-ext-anchor="dailyPlan"]',
        component: PlanCard,
      },
    ]);
  });
});

describe(`${ID}: panel`, () => {
  it('shows the ring, the league, the streak, the total and the recent entries', async () => {
    const { host } = mount(StatsPanel, () => status());
    await vi.waitFor(() => expect(has(host, 'xp-today')).toBe(true));
    expect(text(host, 'xp-today-xp')).toBe('12');
    expect(text(host, 'xp-today')).toContain('/ 30 XP');
    expect(text(host, 'xp-today')).toContain('18 XP to the daily goal');
    expect(text(host, 'xp-league-name')).toBe('Silver league');
    expect(text(host, 'xp-week-xp')).toBe('80 / 150');
    expect(text(host, 'xp-promote')).toBe(
      '70 XP more to be promoted to Gold league',
    );
    expect(text(host, 'xp-streak')).toBe('4 days');
    expect(text(host, 'xp-total')).toBe('412 XP');
    const entries = [...host.querySelectorAll('[data-testid="xp-entry"]')];
    expect(
      entries.map((e) => e.querySelector('.xp__row-main')?.textContent),
    ).toEqual(['+3 XP — grade 5', '+4 XP — perfect session bonus']);
    expect(
      host
        .querySelector('[data-testid="xp-today"] .v-progress-circular')
        ?.getAttribute('aria-label'),
    ).toBe('12 of 30 XP today');
  });

  it('marks the reached goal with a check and text, not only with a color', async () => {
    const { host } = mount(StatsPanel, () =>
      status({ today: { date: dayKey(0), xp: 35, goal: 30, reached: true } }),
    );
    await vi.waitFor(() => expect(has(host, 'xp-goal-reached')).toBe(true));
    expect(text(host, 'xp-goal-reached')).toBe('Daily goal reached');
    expect(
      host.querySelector('[data-testid="xp-goal-reached"] .mdi-check-circle'),
    ).not.toBeNull();
  });

  it('lists 14 days with a text label for each and marks the days that reached the goal', async () => {
    const { host } = mount(StatsPanel, () => status());
    await vi.waitFor(() => expect(has(host, 'xp-history')).toBe(true));
    const list = host.querySelector('ul[aria-label="Last 14 days"]');
    const days = [...(list?.querySelectorAll('[data-testid="xp-day"]') ?? [])];
    expect(days).toHaveLength(14);
    const reached = days.filter(
      (day) => day.getAttribute('data-reached') === 'true',
    );
    expect(reached.length).toBeGreaterThan(0);
    for (const day of reached) {
      expect(day.getAttribute('title')).toContain('goal reached');
      expect(day.querySelector('.mdi-check-circle')).not.toBeNull();
    }
    expect(
      days.every((day) => /: \d+ XP/.test(day.getAttribute('title') ?? '')),
    ).toBe(true);
  });

  it('shows the completed weeks with the result as an icon and as text', async () => {
    const { host } = mount(StatsPanel, () => status());
    await vi.waitFor(() => expect(has(host, 'xp-weeks')).toBe(true));
    const rows = [...host.querySelectorAll('[data-testid="xp-week"]')];
    expect(
      rows.map((row) => row.querySelector('.xp__result')?.textContent?.trim()),
    ).toEqual(['Promoted', 'Demoted', 'No change']);
    expect(rows[0]?.textContent).toContain('160 XP');
    expect(rows[0]?.querySelector('.mdi-arrow-up-bold-circle')).not.toBeNull();
    expect(
      rows[1]?.querySelector('.mdi-arrow-down-bold-circle'),
    ).not.toBeNull();
  });

  it('warns when the league is at risk and says what is missing', async () => {
    const { host } = mount(StatsPanel, () =>
      status({
        week: {
          start: dayKey(-5),
          xp: 40,
          promoteAt: 150,
          keepAt: 60,
          daysLeft: 2,
        },
        league: {
          tier: 'silver',
          index: 1,
          next: 'gold',
          previous: 'bronze',
          toPromote: 110,
          atRisk: true,
        },
      }),
    );
    await vi.waitFor(() => expect(has(host, 'xp-at-risk')).toBe(true));
    expect(text(host, 'xp-at-risk')).toContain(
      'earn 20 XP more to stay in Silver league',
    );
    expect(host.textContent).toContain('2 days left in the week');
  });

  it('says the league is the top one and when the week already earned the promotion', async () => {
    const top = mount(StatsPanel, () =>
      status({
        league: {
          tier: 'diamond',
          index: 6,
          next: null,
          previous: 'emerald',
          toPromote: 0,
          atRisk: false,
        },
      }),
    );
    await vi.waitFor(() => expect(has(top.host, 'xp-promote')).toBe(true));
    expect(text(top.host, 'xp-promote')).toBe('You are in the top league');

    const ready = mount(StatsPanel, () =>
      status({
        week: {
          start: dayKey(-2),
          xp: 160,
          promoteAt: 150,
          keepAt: 60,
          daysLeft: 5,
        },
        league: {
          tier: 'silver',
          index: 1,
          next: 'gold',
          previous: 'bronze',
          toPromote: 0,
          atRisk: false,
        },
      }),
    );
    await vi.waitFor(() => expect(has(ready.host, 'xp-promote')).toBe(true));
    expect(text(ready.host, 'xp-promote')).toBe(
      'Enough XP to be promoted this week',
    );
  });

  it('tells that leagues are off and hides the league progress', async () => {
    const { host } = mount(StatsPanel, () => status({ leaguesEnabled: false }));
    await vi.waitFor(() => expect(has(host, 'xp-league')).toBe(true));
    expect(text(host, 'xp-league')).toContain(
      'Leagues are switched off in the settings.',
    );
    expect(has(host, 'xp-league-name')).toBe(false);
    expect(has(host, 'xp-week-xp')).toBe(false);
  });

  it('invites to practice when there is no XP yet', async () => {
    const { host } = mount(StatsPanel, () => status(EMPTY));
    await vi.waitFor(() => expect(has(host, 'xp-empty')).toBe(true));
    expect(text(host, 'xp-empty')).toBe(
      'Finish a practice session to earn your first XP.',
    );
    expect(text(host, 'xp-today-xp')).toBe('0');
  });

  it('says the extension is off and still shows what was earned', async () => {
    const { host, settingsOpened } = mount(StatsPanel, () =>
      status({ enabled: false }),
    );
    await vi.waitFor(() => expect(has(host, 'xp-disabled')).toBe(true));
    expect(text(host, 'xp-disabled')).toContain('switched off in the settings');
    expect(has(host, 'xp-empty')).toBe(false);
    expect(text(host, 'xp-total')).toBe('412 XP');
    host
      .querySelector<HTMLButtonElement>('[data-testid="xp-disabled"] button')
      ?.click();
    expect(settingsOpened).toEqual([[ID]]);
  });

  it('shows the error of the call and loads again on "Refresh"', async () => {
    let fail = true;
    const { host, calls } = mount(StatsPanel, () => {
      if (fail) throw new Error('host-down');
      return status();
    });
    await vi.waitFor(() => expect(has(host, 'xp-error')).toBe(true));
    expect(text(host, 'xp-error')).toContain(
      'The XP status could not be loaded. host-down',
    );
    expect(has(host, 'xp-today')).toBe(false);

    fail = false;
    host
      .querySelector<HTMLButtonElement>('[data-testid="xp-refresh"]')
      ?.click();
    await vi.waitFor(() => expect(has(host, 'xp-today')).toBe(true));
    expect(has(host, 'xp-error')).toBe(false);
    expect(calls.count).toBe(2);
  });

  it('shows the indeterminate progress bar while the first answer is awaited', async () => {
    let release: (value: GamificationStatus) => void = () => undefined;
    const pending = new Promise<GamificationStatus>((resolve) => {
      release = resolve;
    });
    const { host } = mount(StatsPanel, () => pending);
    await nextTick();
    expect(
      host.querySelector('[role="progressbar"][aria-label="Loading"]'),
    ).not.toBeNull();
    release(status());
    await vi.waitFor(() => expect(has(host, 'xp-today')).toBe(true));
    expect(
      host.querySelector('[role="progressbar"][aria-label="Loading"]'),
    ).toBeNull();
  });

  it('speaks Russian and follows a change of the language', async () => {
    const { host, app } = mount(StatsPanel, () => status(), 'ru');
    await vi.waitFor(() => expect(has(host, 'xp-today')).toBe(true));
    expect(text(host, 'xp-today')).toContain('XP сегодня');
    expect(text(host, 'xp-today')).toContain('Ещё 18 XP до цели дня');
    expect(text(host, 'xp-league-name')).toBe('Серебряная лига');
    expect(text(host, 'xp-promote')).toBe(
      'Ещё 70 XP до повышения: Золотая лига',
    );
    expect(text(host, 'xp-streak')).toBe('4 дня');
    expect(host.textContent).toContain('До конца недели 5 дней');
    const entries = [
      ...host.querySelectorAll('[data-testid="xp-entry"] .xp__row-main'),
    ];
    expect(entries.map((e) => e.textContent)).toEqual([
      '+3 XP — оценка 5',
      '+4 XP — бонус за идеальную сессию',
    ]);
    expect(
      host.querySelector('ul[aria-label="Последние 14 дней"]'),
    ).not.toBeNull();

    app.locale = 'en';
    await nextTick();
    expect(text(host, 'xp-league-name')).toBe('Silver league');
  });

  it('formats numbers for the language', async () => {
    const { host } = mount(
      StatsPanel,
      () => status({ totalXp: 1234567 }),
      'ru',
    );
    await vi.waitFor(() => expect(has(host, 'xp-total')).toBe(true));
    expect(text(host, 'xp-total')).toBe(
      `${new Intl.NumberFormat('ru').format(1234567)} XP`.replace(/\s+/g, ' '),
    );
  });

  it('reloads when the window becomes visible, on progress and on its own settings, not on others', async () => {
    let xp = 12;
    const { host, emit, calls } = mount(StatsPanel, () =>
      status({ today: { date: dayKey(0), xp, goal: 30, reached: false } }),
    );
    await vi.waitFor(() => expect(text(host, 'xp-today-xp')).toBe('12'));
    expect(calls.count).toBe(1);

    xp = 20;
    emit({ type: 'progress', unitIds: [], at: NOW });
    await vi.waitFor(() => expect(text(host, 'xp-today-xp')).toBe('20'));
    expect(calls.count).toBe(2);

    emit({
      type: 'settings-changed',
      scope: 'extensionValues',
      extensionId: 'other',
    });
    emit({ type: 'settings-changed', scope: 'ui' });
    emit({ type: 'extensions-changed' });
    await settled();
    expect(calls.count).toBe(2);

    xp = 25;
    emit({
      type: 'settings-changed',
      scope: 'extensionValues',
      extensionId: ID,
    });
    await vi.waitFor(() => expect(text(host, 'xp-today-xp')).toBe('25'));

    xp = 30;
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await settled();
    expect(calls.count).toBe(3);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.waitFor(() => expect(text(host, 'xp-today-xp')).toBe('30'));
    expect(calls.count).toBe(4);
  });

  it('stops listening when it is unmounted', async () => {
    const { host, listeners, calls } = mount(StatsPanel, () => status());
    await vi.waitFor(() => expect(has(host, 'xp-today')).toBe(true));
    expect(listeners.size).toBe(1);
    disposables.splice(0).forEach((dispose) => dispose());
    expect(listeners.size).toBe(0);
    const before = calls.count;
    document.dispatchEvent(new Event('visibilitychange'));
    await settled();
    expect(calls.count).toBe(before);
  });

  it('keeps the newest answer when an older call finishes later', async () => {
    const resolvers: ((value: GamificationStatus) => void)[] = [];
    const { host } = mount(
      StatsPanel,
      () =>
        new Promise<GamificationStatus>((resolve) => resolvers.push(resolve)),
    );
    await nextTick();
    host
      .querySelector<HTMLButtonElement>('[data-testid="xp-refresh"]')
      ?.click();
    await nextTick();
    expect(resolvers).toHaveLength(2);
    resolvers[1]?.(status({ totalXp: 2 }));
    await vi.waitFor(() => expect(text(host, 'xp-total')).toBe('2 XP'));
    resolvers[0]?.(status({ totalXp: 1 }));
    await settled();
    expect(text(host, 'xp-total')).toBe('2 XP');
  });
});

describe(`${ID}: plan card`, () => {
  it('shows the XP of today, the league and the streak, and opens the panel', async () => {
    const { host, opened } = mount(PlanCard, () => status());
    await vi.waitFor(() => expect(has(host, 'xp-plan-card')).toBe(true));
    expect(text(host, 'xp-plan-today')).toBe('12 of 30 XP today');
    expect(text(host, 'xp-plan-league')).toBe('Silver league');
    expect(text(host, 'xp-plan-streak')).toBe('4 days');
    host.querySelector('button')?.click();
    expect(opened).toEqual([[ID, `${ID}.main`]]);
  });

  it('shows a check and the words when the goal is reached', async () => {
    const { host } = mount(PlanCard, () =>
      status({ today: { date: dayKey(0), xp: 31, goal: 30, reached: true } }),
    );
    await vi.waitFor(() => expect(has(host, 'xp-plan-card')).toBe(true));
    expect(host.textContent).toContain('Daily goal reached');
    expect(host.querySelector('.mdi-check-circle')).not.toBeNull();
  });

  it('leaves the league out when leagues are off', async () => {
    const { host } = mount(PlanCard, () => status({ leaguesEnabled: false }));
    await vi.waitFor(() => expect(has(host, 'xp-plan-card')).toBe(true));
    expect(has(host, 'xp-plan-league')).toBe(false);
  });

  it('is not shown while the extension is off', async () => {
    const { host, calls } = mount(PlanCard, () => status({ enabled: false }));
    await vi.waitFor(() => expect(calls.count).toBe(1));
    await settled();
    expect(has(host, 'xp-plan-card')).toBe(false);
    expect(host.querySelector('button')).toBeNull();
  });

  it('follows progress and the language', async () => {
    let xp = 12;
    const { host, emit, app } = mount(
      PlanCard,
      () =>
        status({ today: { date: dayKey(0), xp, goal: 30, reached: false } }),
      'ru',
    );
    await vi.waitFor(() =>
      expect(text(host, 'xp-plan-today')).toBe('12 из 30 XP сегодня'),
    );
    xp = 18;
    emit({ type: 'progress', unitIds: [], at: NOW });
    await vi.waitFor(() =>
      expect(text(host, 'xp-plan-today')).toBe('18 из 30 XP сегодня'),
    );
    app.locale = 'en';
    await nextTick();
    expect(text(host, 'xp-plan-today')).toBe('18 of 30 XP today');
  });

  it('offers to retry when the first load fails', async () => {
    let fail = true;
    const { host } = mount(PlanCard, () => {
      if (fail) throw new Error('timeout');
      return status();
    });
    await vi.waitFor(() =>
      expect(host.textContent).toContain('could not be loaded'),
    );
    fail = false;
    host.querySelector('button')?.click();
    await vi.waitFor(() => expect(has(host, 'xp-plan-card')).toBe(true));
  });
});
