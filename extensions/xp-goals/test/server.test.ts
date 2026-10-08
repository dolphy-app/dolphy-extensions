import { createTestServer } from '@dolphy-app/extension-sdk/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../src/server.ts';
import { statusRpc } from '../src/shared/rpc.ts';

const ID = 'xp-goals';
const MIN = 60_000;
const NOW = new Date(2026, 9, 7, 12, 0).getTime(); // Wednesday

const disposables: { dispose(): unknown }[] = [];
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});
afterEach(async () => {
  vi.useRealTimers();
  await Promise.all(disposables.splice(0).map((item) => item.dispose()));
});

const start = async (options: Parameters<typeof createTestServer>[1] = {}) => {
  const running = await createTestServer(server, {
    extensionId: ID,
    ...options,
  });
  disposables.push(running);
  return running;
};

const closed = (at: number, grade: 1 | 2 | 3 | 4 | 5 = 5) => ({
  exerciseId: 'e1',
  courseId: 'c1',
  lessonId: 'l1',
  grade,
  outcome: 'passed' as const,
  source: 'runner' as const,
  at,
});

describe(`${ID}: server`, () => {
  it('earns XP over a session, adds the bonus and reports it in status', async () => {
    const running = await start();
    const events = running.events;
    await events.emit('session.started', { sessionId: 's', at: NOW });
    await events.emit('attempt.closed', closed(NOW + 3 * MIN));
    await events.emit('attempt.closed', closed(NOW + 5 * MIN, 4));
    await events.emit('attempt.closed', closed(NOW + 6 * MIN));
    await events.emit('session.finished', {
      sessionId: 's',
      at: NOW + 7 * MIN,
    });
    const status = await running.rpc(statusRpc, {});
    expect(status.today.xp).toBe(3 + 2 + 1 + 1);
    expect(status.totalXp).toBe(7);
    expect(status.perfectSessions).toBe(1);
    expect(status.recent.map((e) => e.kind)).toEqual([
      'perfect-bonus',
      'attempt',
      'attempt',
      'attempt',
    ]);
    expect(status.history).toHaveLength(14);
    expect(status.league.tier).toBe('bronze');
  });

  it('notifies once a day when the goal is reached', async () => {
    const running = await start({ settingValues: { [`${ID}.daily-goal`]: 5 } });
    for (let i = 1; i <= 4; i += 1) {
      await running.events.emit('attempt.closed', closed(NOW + i * 6 * MIN));
    }
    await running.events.emit('attempt.closed', closed(NOW + 40 * MIN));
    expect(running.notifications.shown).toHaveLength(1);
    expect((await running.rpc(statusRpc, {})).today.reached).toBe(true);
  });

  it('survives a refused notification and respects the notify setting', async () => {
    const running = await start({ settingValues: { [`${ID}.daily-goal`]: 5 } });
    const show = vi
      .spyOn(running.notifications, 'show')
      .mockRejectedValue(new Error('no'));
    for (let i = 1; i <= 5; i += 1) {
      await running.events.emit('attempt.closed', closed(NOW + i * 6 * MIN));
    }
    expect(show).toHaveBeenCalledTimes(1);
    expect((await running.rpc(statusRpc, {})).totalXp).toBe(5);

    const quiet = await start({
      settingValues: { [`${ID}.daily-goal`]: 5, [`${ID}.notify`]: false },
    });
    for (let i = 1; i <= 5; i += 1) {
      await quiet.events.emit('attempt.closed', closed(NOW + i * 6 * MIN));
    }
    expect(quiet.notifications.shown).toHaveLength(0);
  });

  it('earns nothing while disabled but still reports the status', async () => {
    const running = await start();
    await running.events.emit('attempt.closed', closed(NOW + MIN));
    await running.settings.set(`${ID}.enabled`, false);
    await running.events.emit('attempt.closed', closed(NOW + 2 * MIN));
    const status = await running.rpc(statusRpc, {});
    expect(status.enabled).toBe(false);
    expect(status.totalXp).toBe(1);
  });

  it('follows a changed daily goal in status', async () => {
    const running = await start();
    await running.events.emit('attempt.closed', closed(NOW + MIN));
    await running.settings.set(`${ID}.daily-goal`, 60);
    const status = await running.rpc(statusRpc, {});
    expect(status.today.goal).toBe(60);
    expect(status.week.promoteAt).toBe(300);
  });

  it('closes a past week on status and promotes the league', async () => {
    const running = await start({ settingValues: { [`${ID}.daily-goal`]: 5 } });
    const lastWeek = new Date(2026, 9, 1, 12).getTime(); // Thursday
    await running.events.emit('session.started', {
      sessionId: 's',
      at: lastWeek,
    });
    for (let i = 1; i <= 40; i += 1) {
      await running.events.emit(
        'attempt.closed',
        closed(lastWeek + i * 5 * MIN),
      );
    }
    const status = await running.rpc(statusRpc, {});
    expect(status.weeks[0]).toMatchObject({
      start: '2026-09-28',
      tier: 'bronze',
      result: 'promoted',
    });
    expect(status.league.tier).toBe('silver');
  });

  it('keeps the records of concurrently delivered events', async () => {
    const running = await start();
    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        running.events.emit('attempt.closed', closed(NOW + (i + 1) * MIN)),
      ),
    );
    expect((await running.rpc(statusRpc, {})).totalXp).toBe(10);
  });
});
