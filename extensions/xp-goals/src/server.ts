import { defineServer } from '@dolphy-app/extension-sdk';
import {
  applyAttempt,
  DEFAULT_DAILY_GOAL,
  finishSession,
  goalReachedDate,
  initialState,
  parseState,
  rollWeeks,
  startSession,
  statusOf,
} from './core/xp.ts';
import type { Settings, State } from './core/xp.ts';
import { statusRpc } from './shared/rpc.ts';

const ID = 'xp-goals';
const KEY = 'state';
const GROUP = { en: 'XP and leagues', ru: 'XP и лиги' };

export const server = defineServer((s) => {
  s.registerSettings([
    {
      id: `${ID}.enabled`,
      type: 'boolean',
      label: { en: 'Earn XP', ru: 'Начислять XP' },
      description: {
        en: 'Turn off to stop earning XP; what you earned is kept.',
        ru: 'Выключите, чтобы XP не начислялись; накопленное сохранится.',
      },
      group: GROUP,
      default: true,
      order: 1,
    },
    {
      id: `${ID}.dailyGoal`,
      type: 'number',
      label: { en: 'Daily goal (XP)', ru: 'Дневная цель (XP)' },
      description: {
        en: '1 XP is about one minute of focused work.',
        ru: '1 XP — примерно одна минута сосредоточенной работы.',
      },
      group: GROUP,
      default: DEFAULT_DAILY_GOAL,
      min: 5,
      max: 240,
      integer: true,
      order: 2,
    },
    {
      id: `${ID}.leagues`,
      type: 'boolean',
      label: { en: 'Weekly leagues', ru: 'Недельные лиги' },
      description: {
        en: 'Promotion and demotion at the end of each week.',
        ru: 'Повышение и понижение в конце каждой недели.',
      },
      group: GROUP,
      default: true,
      order: 3,
    },
    {
      id: `${ID}.notify`,
      type: 'boolean',
      label: {
        en: 'Notify when the daily goal is reached',
        ru: 'Уведомлять о достижении дневной цели',
      },
      group: GROUP,
      default: true,
      order: 4,
    },
  ]);

  const settings = (): Settings => ({
    dailyGoal: Number(s.settings.get(`${ID}.dailyGoal`)),
    leagues: Boolean(s.settings.get(`${ID}.leagues`)),
    notify: Boolean(s.settings.get(`${ID}.notify`)),
    enabled: Boolean(s.settings.get(`${ID}.enabled`)),
  });

  const load = async (): Promise<State> =>
    parseState((await s.storage.get(KEY)) ?? initialState());
  const save = (state: State) => s.storage.set(KEY, state as never);

  // handlers run strictly one after another: no record is lost
  let chain: Promise<unknown> = Promise.resolve();
  const enqueue = <T>(job: () => Promise<T>): Promise<T> => {
    const run = chain.then(job);
    chain = run.catch(() => undefined);
    return run;
  };

  const announce = async (state: State, at: number, cfg: Settings) => {
    const date = goalReachedDate(state, at, cfg);
    if (date === null) return state;
    const marked = { ...state, goalNotifiedDate: date };
    await save(marked);
    if (cfg.notify) {
      try {
        await s.notifications.show({
          title: 'Daily goal reached',
          body: `${cfg.dailyGoal} XP earned today. Well done!`,
        });
      } catch (error) {
        s.logger.warn({ error: String(error) }, 'goal notification failed');
      }
    }
    return marked;
  };

  s.on('session.started', (event) =>
    enqueue(async () => {
      const cfg = settings();
      if (!cfg.enabled) return;
      await save(startSession(rollWeeks(await load(), event.at, cfg), event));
    }),
  );

  s.on('attempt.closed', (event) =>
    enqueue(async () => {
      const cfg = settings();
      if (!cfg.enabled) return;
      const state = applyAttempt(rollWeeks(await load(), event.at, cfg), event);
      await save(state);
      await announce(state, event.at, cfg);
    }),
  );

  s.on('session.finished', (event) =>
    enqueue(async () => {
      const cfg = settings();
      if (!cfg.enabled) return;
      const state = finishSession(
        rollWeeks(await load(), event.at, cfg),
        event,
      );
      await save(state);
      await announce(state, event.at, cfg);
    }),
  );

  s.handle(statusRpc, () =>
    enqueue(async () => {
      const cfg = settings();
      const now = Date.now();
      const state = rollWeeks(await load(), now, cfg);
      await save(state);
      return statusOf(state, now, cfg, await s.stats.streak());
    }),
  );
});
