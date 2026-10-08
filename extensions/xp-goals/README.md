# XP goals

Earn XP for every solved exercise, reach a daily goal and climb weekly
leagues. Modelled on the XP system of
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
(at least 1 XP).

## Daily goal and leagues

- The **daily goal** (default 30 XP) is reached when the day's XP is at least
  the goal. The first time it is reached in a day, a system notification says so
  (it can be switched off).
- A **week** runs Monday to Sunday in local time. Leagues, from the lowest:
  bronze (start), silver, gold, sapphire, ruby, emerald, diamond.
- A week closes lazily, when the next event or status request arrives:
  at least `5 × daily goal` XP promotes one league, less than `2 × daily goal`
  demotes one, anything in between keeps the league. Each week is judged by the
  goal at that moment. Weeks before your first XP never count.
- XP is never taken away: totals and daily history are kept, and every week
  starts from zero.

## Settings

Settings → Extensions → "XP goals" (group "XP and leagues"):

| Setting               | Default | Meaning                                       |
| --------------------- | ------- | --------------------------------------------- |
| `xp-goals.enabled`    | on      | Off: no new XP; the earned progress is shown  |
| `xp-goals.daily-goal` | 30      | Daily goal in XP, 5–240                       |
| `xp-goals.leagues`    | on      | Off: weeks are recorded, the league is frozen |
| `xp-goals.notify`     | on      | Notification when the daily goal is reached   |

## Data and permissions

- **Reads:** the learning events `session.started`, `session.finished` and
  `attempt.closed` (identifiers, grade, outcome, time) and the study streak
  (`server.stats.streak`).
- **Writes:** one storage key, `state`: totals, up to 120 days of XP, up to 12
  closed weeks, the league, the last 20 XP entries and the open session.
- **Sends:** nothing over the network; it only shows a system notification.

## What you see

- **Panel "XP goals"** (sidebar): a ring with today's XP against the daily goal
  (a check mark and the words "Daily goal reached" once it is met), the league
  card (league and its number, the week's XP against the XP needed for
  promotion, "N XP more to be promoted", a warning when the league is at risk
  of demotion in the last two days of the week, days left in the week), the
  streak and total XP, the last 14 days as bars (days that met the goal are
  marked), up to 8 completed weeks with promotion / demotion / no change, and
  the last XP entries ("+3 XP — grade 5", "+4 XP — perfect session bonus").
- **Card in "Today's plan"**: a small ring, the league and the streak; the
  button opens the panel. The card is hidden while the extension is switched
  off.
- With no XP yet the panel asks you to finish a practice session. With leagues
  switched off it says so instead of the league progress. With the extension
  off it shows what was earned and a button to the settings. If the status
  cannot be loaded, an error with "Refresh" is shown.
- Text follows the language of the app (English or Russian), colors follow the
  light and dark theme.

## Limitations

- The server part counts XP only while the app runs and delivers events;
  attempts made earlier are not back-filled.
- The leagues are personal: there are no other players, the league measures
  your own weekly XP against fixed thresholds.
- Weeks are closed at most 8 per call, so a very long break is processed over
  several calls; with a break that long the league falls week by week.
- XP is an estimate of effort: the minutes are read from the pauses between
  attempts, not measured. Turning the extension off does not remove earned XP,
  and the state is not rewritten when the study progress is reset.
- The panel and the card reload when the window becomes visible and when the
  engine reports progress; a session's perfect-session bonus appears on the
  next reload (press "Refresh").

## Structure

- `src/core/` — pure logic (`xp.ts`, `dates.ts`); the time is an argument.
- `src/server.ts` — settings, event handlers run through one promise chain, and
  the `xpgoals.status` call (the RPC name pattern forbids a hyphen in its first
  segment).
- `src/shared/` — `types.ts` and `rpc.ts` (zod schema of the status) shared with
  the client.
- `src/client.ts` — registers the panel and the plan card.
- `src/StatsPanel.vue`, `src/DayBars.vue`, `src/PlanCard.vue` — the user
  interface (Vuetify components, theme tokens only); `src/useGamification.ts`
  loads and refreshes the status; `src/i18n.ts` holds every visible string in
  English and Russian.

```sh
npm test
npm run typecheck
npm run build      # dist-ext/xp-goals
npm run validate
```
