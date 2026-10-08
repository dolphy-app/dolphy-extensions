import { defineRpc } from '@dolphy-app/extension-sdk/rpc';
import { z } from 'zod';
import { LEAGUE_TIERS } from './types.ts';

const tier = z.enum(LEAGUE_TIERS);

export const statusRpc = defineRpc({
  // the RPC name pattern forbids a hyphen in the first segment
  name: 'xpgoals.status',
  input: z.object({}),
  output: z.object({
    enabled: z.boolean(),
    leaguesEnabled: z.boolean(),
    today: z.object({
      date: z.string(),
      xp: z.number(),
      goal: z.number(),
      reached: z.boolean(),
    }),
    week: z.object({
      start: z.string(),
      xp: z.number(),
      promoteAt: z.number(),
      keepAt: z.number(),
      daysLeft: z.number(),
    }),
    league: z.object({
      tier,
      index: z.number(),
      next: tier.nullable(),
      previous: tier.nullable(),
      toPromote: z.number(),
      atRisk: z.boolean(),
    }),
    totalXp: z.number(),
    streak: z.object({ current: z.number(), longest: z.number() }),
    history: z.array(
      z.object({ date: z.string(), xp: z.number(), reached: z.boolean() }),
    ),
    weeks: z.array(
      z.object({
        start: z.string(),
        xp: z.number(),
        tier,
        result: z.enum(['promoted', 'demoted', 'kept']),
      }),
    ),
    recent: z.array(
      z.object({
        at: z.number(),
        xp: z.number(),
        kind: z.enum(['attempt', 'perfect-bonus']),
        grade: z.number().nullable(),
        exerciseId: z.string().nullable(),
      }),
    ),
    perfectSessions: z.number(),
  }),
});
