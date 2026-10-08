import { defineRpc } from '@dolphy-app/extension-sdk/rpc';
import { z } from 'zod';

const day = z.object({
  date: z.string(),
  xp: z.number(),
  reached: z.boolean(),
});

export const statusRpc = defineRpc({
  // the RPC name pattern forbids a hyphen in the first segment
  name: 'xpgoals.status',
  input: z.object({}),
  output: z.object({
    enabled: z.boolean(),
    today: z.object({
      date: z.string(),
      xp: z.number(),
      goal: z.number(),
      reached: z.boolean(),
    }),
    week: z.object({
      start: z.string(),
      xp: z.number(),
      days: z.array(day.extend({ today: z.boolean(), future: z.boolean() })),
    }),
    totalXp: z.number(),
    streak: z.object({ current: z.number(), longest: z.number() }),
    history: z.array(day),
    recent: z.array(
      z.object({
        at: z.number(),
        xp: z.number(),
        kind: z.enum(['attempt', 'perfect-bonus']),
        grade: z.number().nullable(),
        exerciseId: z.string().nullable(),
      }),
    ),
  }),
});
