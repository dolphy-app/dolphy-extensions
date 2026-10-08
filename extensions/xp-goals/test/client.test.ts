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

/** Monday 2026-03-09 .. Sunday 2026-03-15; NOW is Wednesday the 11th. */
const weekOf = (xp: number[]) =>
  xp.map((value, i) => ({
    date: dayKey(i - 2),
    xp: value,
    reached: value >= 30,
    today: i === 2,
    future: i > 2,
  }));

const status = (
  patch: Partial<GamificationStatus> = {},
): GamificationStatus => ({
  enabled: true,
  today: { date: dayKey(0), xp: 12, goal: 30, reached: false },
  week: { start: dayKey(-2), xp: 62, days: weekOf([35, 15, 12, 0, 0, 0, 0]) },
  totalXp: 412,
  streak: { current: 4, longest: 9 },
  history: Array.from({ length: 14 }, (_, i) => {
    const xp = (i * 7) % 41;
    return { date: dayKey(i - 13), xp, reached: xp >= 30 };
  }),
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
  ...patch,
});

const EMPTY: Partial<GamificationStatus> = {
  totalXp: 0,
  recent: [],
  today: { date: dayKey(0), xp: 0, goal: 30, reached: false },
  week: { start: dayKey(-2), xp: 0, days: weekOf([0, 0, 0, 0, 0, 0, 0]) },
  history: Array.from({ length: 14 }, (_, i) => ({
    date: dayKey(i - 13),
    xp: 0,
    reached: false,
  })),
  streak: { current: 0, longest: 0 },
};

interface Harness {
  host: HTMLElement;
  opened: unknown[][];
  settingsOpened: unknown[][];
  /** Keys of the app commands the component ran. */
  commands: string[];
  /** Arguments of `app.notify`. */
  notices: unknown[][];
  /** Set `fails` to make `app.runCommand` reject. */
  command: { fails: boolean };
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
  const commands: string[] = [];
  const notices: unknown[][] = [];
  const command = { fails: false };
  const calls = { count: 0 };
  const appApi = reactive({
    locale,
    theme: { id: 'light', dark: false },
    openPanel: (...args: unknown[]) => void opened.push(args),
    openSettings: (...args: unknown[]) => void settingsOpened.push(args),
    runCommand: async (key: string) => {
      commands.push(key);
      if (command.fails) throw new Error('no such command');
    },
    notify: (...args: unknown[]) => void notices.push(args),
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
    commands,
    notices,
    command,
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
        header: false,
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
  it('draws its own page header: the h1 title, the date and the refresh button', async () => {
    const en = mount(StatsPanel, () => status());
    await vi.waitFor(() => expect(has(en.host, 'xp-today')).toBe(true));
    const titles = en.host.querySelectorAll('h1');
    expect(titles).toHaveLength(1);
    expect(titles[0]?.textContent?.trim()).toBe('XP goals');
    const header = en.host.querySelector('header');
    expect(header?.contains(titles[0] ?? null)).toBe(true);
    expect(header?.textContent).toContain('Wednesday');
    const refresh = header?.querySelector('[data-testid="xp-refresh"]');
    expect(refresh?.getAttribute('aria-label')).toBe('Refresh');

    const ru = mount(StatsPanel, () => status(), 'ru');
    await vi.waitFor(() => expect(has(ru.host, 'xp-today')).toBe(true));
    expect(ru.host.querySelector('h1')?.textContent?.trim()).toBe('XP и цели');
    expect(
      ru.host
        .querySelector('[data-testid="xp-refresh"]')
        ?.getAttribute('aria-label'),
    ).toBe('Обновить');
  });

  it('shows the XP of today, the streak, the week, the total and the recent entries', async () => {
    const { host } = mount(StatsPanel, () => status());
    await vi.waitFor(() => expect(has(host, 'xp-today')).toBe(true));
    expect(text(host, 'xp-today-xp')).toBe('12');
    expect(text(host, 'xp-hero')).toContain('of 30 XP');
    expect(text(host, 'xp-goal-left')).toBe('18 XP to go to the daily goal');
    expect(text(host, 'xp-streak')).toBe('4 days');
    expect(text(host, 'xp-week-xp')).toBe('62 XP');
    expect(text(host, 'xp-total')).toBe('412 XP');
    const entries = [...host.querySelectorAll('[data-testid="xp-entry"]')];
    expect(
      entries.map((e) => e.querySelector('.xp__item-main')?.textContent),
    ).toEqual(['+3 XP — grade 5', '+4 XP — perfect session bonus']);
  });

  it('gives the ring the progressbar role with a correct value, range and name', async () => {
    const { host } = mount(StatsPanel, () => status());
    await vi.waitFor(() => expect(has(host, 'xp-today')).toBe(true));
    const ring = host.querySelector(
      '[data-testid="xp-today"] [role="progressbar"]',
    );
    expect(ring?.getAttribute('aria-valuemin')).toBe('0');
    expect(ring?.getAttribute('aria-valuemax')).toBe('30');
    expect(ring?.getAttribute('aria-valuenow')).toBe('12');
    expect(ring?.getAttribute('aria-label')).toBe('12 of 30 XP today');
  });

  it('shows the week Monday to Sunday: reached, missed, today and days ahead, each with a spoken name', async () => {
    const { host } = mount(StatsPanel, () => status());
    await vi.waitFor(() => expect(has(host, 'xp-week-strip')).toBe(true));
    const days = [...host.querySelectorAll('[data-testid="xp-week-day"]')];
    expect(days.map((day) => day.getAttribute('data-state'))).toEqual([
      'reached',
      'missed',
      'today',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
    ]);
    const spoken = (i: number) => days[i]?.querySelector('.sr')?.textContent;
    expect(spoken(0)).toContain('35 XP, goal reached');
    expect(spoken(1)).toContain('15 XP, goal not reached');
    expect(spoken(2)).toContain('12 XP, today');
    expect(spoken(6)).toContain('ahead');
    expect(days[2]?.getAttribute('title')).toContain('today');
    expect(host.querySelector('ol[aria-label="This week"]')).not.toBeNull();
    // the check marks the days that reached the goal, nothing else
    expect(
      days.map((day) => day.querySelector('.mdi-check-bold') !== null),
    ).toEqual([true, false, false, false, false, false, false]);
  });

  it('shows today as reached on the strip once its goal is done', async () => {
    const { host } = mount(StatsPanel, () =>
      status({
        today: { date: dayKey(0), xp: 31, goal: 30, reached: true },
        week: {
          start: dayKey(-2),
          xp: 66,
          days: weekOf([35, 0, 31, 0, 0, 0, 0]),
        },
      }),
    );
    await vi.waitFor(() => expect(has(host, 'xp-week-strip')).toBe(true));
    const days = [...host.querySelectorAll('[data-testid="xp-week-day"]')];
    expect(days[2]?.getAttribute('data-state')).toBe('reached');
  });

  it('opens the daily plan with the app command from the main button', async () => {
    const { host, commands, notices, command } = mount(StatsPanel, () =>
      status(),
    );
    await vi.waitFor(() => expect(has(host, 'xp-start')).toBe(true));
    host.querySelector<HTMLButtonElement>('[data-testid="xp-start"]')?.click();
    await settled();
    expect(commands).toEqual(['app:go:dailyPlan']);
    expect(notices).toEqual([]);

    command.fails = true;
    host.querySelector<HTMLButtonElement>('[data-testid="xp-start"]')?.click();
    await vi.waitFor(() =>
      expect(notices).toEqual([["Today's plan could not be opened.", 'error']]),
    );
  });

  it('marks the reached goal with a check and words, not only with a color', async () => {
    const { host } = mount(StatsPanel, () =>
      status({ today: { date: dayKey(0), xp: 35, goal: 30, reached: true } }),
    );
    await vi.waitFor(() => expect(has(host, 'xp-goal-reached')).toBe(true));
    expect(text(host, 'xp-goal-reached')).toBe('Daily goal reached');
    expect(host.querySelector('.today__check')).not.toBeNull();
    expect(has(host, 'xp-goal-left')).toBe(false);
    const ring = host.querySelector(
      '[data-testid="xp-today"] [role="progressbar"]',
    );
    // the value never exceeds the maximum
    expect(ring?.getAttribute('aria-valuenow')).toBe('30');
    expect(ring?.getAttribute('aria-valuetext')).toBe('35 of 30 XP today');
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
      expect(day.querySelector('.bars__sr')?.textContent).toContain(
        'goal reached',
      );
    }
    expect(
      days.every((day) => /: \d+ XP/.test(day.getAttribute('title') ?? '')),
    ).toBe(true);
    expect(text(host, 'xp-history')).toContain(
      `Goal reached on ${reached.length} of 14 days`,
    );
  });

  it('scales the chart to the goal with headroom, or to the best day when it is higher', async () => {
    const lineAt = (host: HTMLElement) =>
      host.querySelector<HTMLElement>('.bars__goal')?.style.bottom;
    const days = (max: number) =>
      Array.from({ length: 14 }, (_, i) => ({
        date: dayKey(i - 13),
        xp: i === 13 ? max : 5,
        reached: false,
      }));
    const low = mount(StatsPanel, () => status({ history: days(10) }));
    await vi.waitFor(() => expect(has(low.host, 'xp-history')).toBe(true));
    // goal 30 with 25% headroom: the scale is 37.5, the goal line is at 80%
    expect(lineAt(low.host)).toBe('80%');

    const high = mount(StatsPanel, () => status({ history: days(60) }));
    await vi.waitFor(() => expect(has(high.host, 'xp-history')).toBe(true));
    expect(lineAt(high.host)).toBe('50%');
  });

  it('draws no chart without any XP in 14 days: one calm line instead', async () => {
    const { host } = mount(StatsPanel, () => status(EMPTY));
    await vi.waitFor(() => expect(has(host, 'xp-history')).toBe(true));
    expect(text(host, 'xp-history-empty')).toBe(
      'Your activity will appear here',
    );
    expect(host.querySelector('.bars')).toBeNull();
    expect(host.querySelectorAll('[data-testid="xp-day"]')).toHaveLength(0);
  });

  it('shows a first day without XP: zeros, the goal still to go, no recent list', async () => {
    const { host } = mount(StatsPanel, () => status(EMPTY));
    await vi.waitFor(() => expect(has(host, 'xp-hero')).toBe(true));
    expect(text(host, 'xp-today-xp')).toBe('0');
    expect(text(host, 'xp-goal-left')).toBe('30 XP to go to the daily goal');
    expect(text(host, 'xp-streak')).toBe('0 days');
    expect(text(host, 'xp-week-xp')).toBe('0 XP');
    expect(text(host, 'xp-total')).toBe('0 XP');
    expect(has(host, 'xp-recent')).toBe(false);
    expect(has(host, 'xp-start')).toBe(true);
  });

  it('shows the time of today\u2019s entries and the date of older ones', async () => {
    const { host } = mount(StatsPanel, () =>
      status({
        recent: [
          { at: NOW, xp: 3, kind: 'attempt', grade: 5, exerciseId: 'e1' },
          {
            at: NOW - 2 * DAY,
            xp: 2,
            kind: 'attempt',
            grade: 4,
            exerciseId: 'e2',
          },
        ],
      }),
    );
    await vi.waitFor(() => expect(has(host, 'xp-recent')).toBe(true));
    const times = [...host.querySelectorAll('[data-testid="xp-entry"] time')];
    expect(times.map((t) => t.textContent)).toEqual([
      new Intl.DateTimeFormat('en', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(NOW),
      new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(NOW - 2 * DAY),
    ]);
  });

  it('says the extension is off and still shows what was earned', async () => {
    const { host, settingsOpened } = mount(StatsPanel, () =>
      status({ enabled: false }),
    );
    await vi.waitFor(() => expect(has(host, 'xp-disabled')).toBe(true));
    expect(text(host, 'xp-disabled')).toContain('Switched off in the settings');
    expect(text(host, 'xp-total')).toBe('412 XP');
    host
      .querySelector<HTMLButtonElement>('[data-testid="xp-disabled"] button')
      ?.click();
    expect(settingsOpened).toEqual([[ID]]);
  });

  it('shows the error of the call and loads again on "Try again" and on "Refresh"', async () => {
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
    host.querySelector<HTMLButtonElement>('[data-testid="xp-retry"]')?.click();
    await vi.waitFor(() => expect(has(host, 'xp-today')).toBe(true));
    expect(has(host, 'xp-error')).toBe(false);
    expect(calls.count).toBe(2);

    host
      .querySelector<HTMLButtonElement>('[data-testid="xp-refresh"]')
      ?.click();
    await vi.waitFor(() => expect(calls.count).toBe(3));
  });

  it('shows a placeholder while the first answer is awaited and the thin bar on later loads', async () => {
    let release: (value: GamificationStatus) => void = () => undefined;
    const pending = new Promise<GamificationStatus>((resolve) => {
      release = resolve;
    });
    const { host } = mount(StatsPanel, () => pending);
    await nextTick();
    expect(
      host
        .querySelector('[data-testid="xp-loading"]')
        ?.getAttribute('aria-label'),
    ).toBe('Loading');
    expect(has(host, 'xp-hero')).toBe(false);
    release(status());
    await vi.waitFor(() => expect(has(host, 'xp-hero')).toBe(true));
    expect(has(host, 'xp-loading')).toBe(false);

    host
      .querySelector<HTMLButtonElement>('[data-testid="xp-refresh"]')
      ?.click();
    await nextTick();
    expect(
      host.querySelector('[role="progressbar"][aria-label="Loading"]'),
    ).not.toBeNull();
    expect(has(host, 'xp-hero')).toBe(true);
  });

  it('speaks Russian and follows a change of the language', async () => {
    const { host, app } = mount(StatsPanel, () => status(), 'ru');
    await vi.waitFor(() => expect(has(host, 'xp-today')).toBe(true));
    expect(text(host, 'xp-hero')).toContain('из 30 XP');
    expect(text(host, 'xp-goal-left')).toBe('Ещё 18 XP до цели');
    expect(text(host, 'xp-streak')).toBe('4 дня');
    expect(text(host, 'xp-week-xp')).toBe('62 XP');
    const entries = [
      ...host.querySelectorAll('[data-testid="xp-entry"] .xp__item-main'),
    ];
    expect(entries.map((e) => e.textContent)).toEqual([
      '+3 XP — оценка 5',
      '+4 XP — бонус за идеальную сессию',
    ]);
    expect(
      host.querySelector('ul[aria-label="Последние 14 дней"]'),
    ).not.toBeNull();
    expect(host.querySelector('ol[aria-label="Эта неделя"]')).not.toBeNull();

    app.locale = 'en';
    await nextTick();
    expect(text(host, 'xp-goal-left')).toBe('18 XP to go to the daily goal');
    expect(text(host, 'xp-streak')).toBe('4 days');
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
  it('shows the XP of today and the streak in one line, and opens the panel', async () => {
    const { host, opened } = mount(PlanCard, () => status());
    await vi.waitFor(() => expect(has(host, 'xp-plan-card')).toBe(true));
    expect(text(host, 'xp-plan-today')).toBe('12 of 30 XP today');
    expect(text(host, 'xp-plan-streak')).toBe('Streak 4 days');
    host.querySelector('button')?.click();
    expect(opened).toEqual([[ID, `${ID}.main`]]);
  });

  it('leaves the streak out while there is none', async () => {
    const { host } = mount(PlanCard, () =>
      status({ streak: { current: 0, longest: 3 } }),
    );
    await vi.waitFor(() => expect(has(host, 'xp-plan-card')).toBe(true));
    expect(has(host, 'xp-plan-streak')).toBe(false);
  });

  it('has the ring with the progressbar role and a check when the goal is reached', async () => {
    const { host } = mount(PlanCard, () =>
      status({ today: { date: dayKey(0), xp: 31, goal: 30, reached: true } }),
    );
    await vi.waitFor(() => expect(has(host, 'xp-plan-card')).toBe(true));
    const ring = host.querySelector('.ring');
    expect(ring?.getAttribute('role')).toBe('progressbar');
    expect(ring?.getAttribute('aria-valuenow')).toBe('30');
    expect(ring?.getAttribute('aria-valuemax')).toBe('30');
    expect(host.querySelector('.mdi-check-bold')).not.toBeNull();
    expect(text(host, 'xp-plan-today')).toBe('31 of 30 XP today');
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
    expect(text(host, 'xp-plan-streak')).toBe('Серия 4 дня');
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
