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

- **Panel "XP goals"** (sidebar), top to bottom:
  1. **Today**, on the accent gradient of the plan page: a large ring with
     today's XP against the daily goal (it fills when the panel opens and
     follows changes), "N XP to the daily goal" or, once it is met, a trophy, a
     check and "Daily goal reached" (the ring turns green; no confetti), the
     "Start practice" button (it runs the app command `app:go:dailyPlan` and
     opens Today's plan), the streak with its record, and the week Monday to
     Sunday as seven circles: reached (check), missed, today (outlined) and days
     ahead (empty).
  2. **League**: a badge with the league's own color, its name and number, the
     ladder of all seven leagues (passed, current, ahead), the week's XP as a
     bar with marks for keeping the league and for promotion, and one line:
     "N XP more to be promoted", "League kept: enough XP earned", or, in the
     last two days of the week, a warning with what is missing to keep the
     league. The first week adds "Results of your first week appear on Monday".
     **Total** sits next to it: total XP and perfect sessions.
  3. **Last 14 days**: bars on a scale of the goal plus 25% (or the best day),
     the goal line, the XP above each bar, the days that met the goal in the
     accent color and today highlighted. With only one or two active days the
     chart is compact; with none, a friendly empty card replaces it.
  4. **Weekly results** (up to 8 weeks) and **Recent XP** ("+3 XP — grade 5").
     A block without entries is not drawn, and the grid closes the gap.
- **Card in "Today's plan"** (the page has one extension anchor, below the
  other blocks, so the card stays there): a ring, "N of 30 XP today", the
  league and streak chips, the week as seven small circles and "Details" which
  opens the panel. It is hidden while the extension is switched off.
- The league colors (bronze, silver, gold, sapphire, ruby, emerald, diamond)
  are CSS variables defined once in `LeagueBadge.vue`, with a variant for the
  light and the dark theme; the icon on a badge has at least 4.5:1 contrast and
  the name is always written out. They color only the league; XP use the
  primary color of the app.
- Animations (the ring filling, the bars growing, the checks appearing) take
  200–400 ms and are switched off by `prefers-reduced-motion`.
- While the first status loads, placeholders keep the layout; with leagues
  switched off a short card says so; with the extension off the panel shows what
  was earned and a button to the settings; if the status cannot be loaded, an
  error is shown and "Refresh" tries again.
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

- `src/core/` — pure logic (`xp.ts`, `dates.ts`, `week.ts`); the time is an
  argument.
- `src/server.ts` — settings, event handlers run through one promise chain, and
  the `xpgoals.status` call (the RPC name pattern forbids a hyphen in its first
  segment).
- `src/shared/` — `types.ts` and `rpc.ts` (zod schema of the status) shared with
  the client.
- `src/client.ts` — registers the panel and the plan card.
- `src/StatsPanel.vue` lays out the panel from `src/TodayHero.vue`,
  `src/LeagueCard.vue` and `src/DayBars.vue`; `src/PlanCard.vue` is the card of
  the plan page. Shared: `src/XpRing.vue` (the progress ring),
  `src/LeagueBadge.vue` (the badge and the league color tokens),
  `src/NoticeBox.vue` and `src/dayLabel.ts` (the spoken name of a day). The
  interface uses Vuetify components and theme tokens only;
  `src/useGamification.ts` loads and refreshes the status; `src/i18n.ts` holds
  every visible string in English and Russian.

```sh
npm test
npm run typecheck
npm run build      # dist-ext/xp-goals
npm run validate
```
