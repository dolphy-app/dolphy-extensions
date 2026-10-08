# XP goals

Earn XP for every solved exercise and reach a daily goal. The extension shows
today's XP against the goal, your streak, the week and the last 14 days on one
quiet page. Modelled on the XP system of
[Math Academy](https://www.mathacademy.com/how-it-works): 1 XP is about one
minute of focused work, and the better the answer, the more of those minutes
count.

## How XP is earned

For every closed attempt the extension takes the _effort_ (whole minutes from
the previous mark of the session to the attempt, rounded and clamped to 1–5; 1
without a session) and multiplies it by the _quality_ of the grade:

| Grade   | 5   | 4   | 3    | 2   | 1   | 0   |
| ------- | --- | --- | ---- | --- | --- | --- |
| Quality | 1.0 | 1.0 | 0.75 | 0.4 | 0.2 | 0   |

`xp = max(1, round(effort × quality))`, and `0` when the quality is 0. A
give-up and an attempt imported from Trane (`trane-import`) earn nothing.

**Perfect session.** When a session with at least 3 attempts ends with no grade
below 4 and no give-up, the extension adds a bonus of 20% of the session XP
(at least 1 XP). It shows up in the recent entries as "perfect session bonus".

## Daily goal

- The **daily goal** (default 30 XP) is reached when the day's XP is at least
  the goal. The first time it is reached in a day, a system notification says so
  (it can be switched off).
- The **week** runs Monday to Sunday in local time; "This week" is the sum of
  its days. The **streak** is the study streak of the app
  (`server.stats.streak`).
- XP is never taken away: totals and the daily history are kept.

## Settings

Settings → Extensions → "XP goals":

| Setting               | Default | Meaning                                      |
| --------------------- | ------- | -------------------------------------------- |
| `xp-goals.enabled`    | on      | Off: no new XP; the earned progress is shown |
| `xp-goals.daily-goal` | 30      | Daily goal in XP, 5–240                      |
| `xp-goals.notify`     | on      | Notification when the daily goal is reached  |

## Data and permissions

- **Reads:** the learning events `session.started`, `session.finished` and
  `attempt.closed` (identifiers, grade, outcome, time) and the study streak
  (`server.stats.streak`).
- **Writes:** one storage key, `state`: the total, up to 120 days of XP, the
  last 20 XP entries, the open session and the day of the last goal
  notification. Any other field an older build stored is ignored when the
  state is read and is not written back.
- **Sends:** nothing over the network; it only shows a system notification.

## What you see

- **Panel "XP goals"** (sidebar): one column, top to bottom.
  1. The page title, the date and a refresh button.
  2. **Today:** a thin ring with the day's XP against the goal (it turns green
     with a check once the goal is met), "3 of 30 XP", one line — "27 XP to go
     to the daily goal" or "Daily goal reached" — the "Start practice" button
     (it runs the app command `app:go:dailyPlan` and opens Today's plan), and
     the week Monday to Sunday as seven circles: goal reached (filled, check),
     a day gone by without the goal (small mark), today (outlined), days ahead
     (empty).
  3. **Streak, This week, Total:** three figures in one row.
  4. **Last 14 days:** bars on a scale of the goal plus 25% (or the best day),
     a thin goal line, bars of the days that met the goal in green, today
     highlighted. The XP of a day is in the tooltip and in a list for screen
     readers. While there is no XP in these days, a single line replaces the
     chart.
  5. **Recent XP:** up to 10 entries ("+3 XP — grade 5") with the time. It is
     not drawn when empty.
- **Card in "Today's plan"** (the page has one extension anchor, below the
  other blocks): a small ring, "3 of 30 XP today", "Streak 12 days" (only while
  the streak is above zero) and "Details", which opens the panel. It is hidden
  while the extension is switched off.
- While the first status loads, placeholders of the final size keep the layout;
  with the extension off the panel says so and still shows what was earned; if
  the status cannot be loaded, a line with "Try again" is shown.
- The ring has the `progressbar` role with a value, a range and a name; the
  days of the week and of the chart are readable as text; animations (ring,
  bars) are switched off by `prefers-reduced-motion`.
- Text follows the language of the app (English or Russian), colors follow the
  light and dark theme through theme tokens only.

## Limitations

- The server part counts XP only while the app runs and delivers events;
  attempts made earlier are not back-filled.
- XP is an estimate of effort: the minutes are read from the pauses between
  attempts, not measured. Turning the extension off does not remove earned XP,
  and the state is not rewritten when the study progress is reset.
- The panel and the card reload when the window becomes visible and when the
  engine reports progress; the bonus of a perfect session appears on the next
  reload (press "Refresh").

## Structure

- `src/core/` — pure logic (`xp.ts`, `dates.ts`); the time is an argument.
- `src/server.ts` — settings, event handlers run through one promise chain, and
  the `xpgoals.status` call (the RPC name pattern forbids a hyphen in its first
  segment).
- `src/shared/` — `types.ts` and `rpc.ts` (zod schema of the status) shared with
  the client.
- `src/client.ts` — registers the panel and the plan card.
- `src/StatsPanel.vue` lays out the panel from `src/TodayCard.vue` and
  `src/DayBars.vue`; `src/PlanCard.vue` is the card of the plan page. Shared:
  `src/XpRing.vue` (the progress ring), `src/NoticeBox.vue` and
  `src/dayLabel.ts` (the spoken name of a day). The interface uses Vuetify
  components and theme tokens only; `src/useGamification.ts` loads and
  refreshes the status; `src/i18n.ts` holds every visible string in English and
  Russian.

```sh
npm test
npm run typecheck
npm run build      # dist-ext/xp-goals
npm run validate
```
