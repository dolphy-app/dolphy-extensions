export const LEAGUE_TIERS = [
  'bronze',
  'silver',
  'gold',
  'sapphire',
  'ruby',
  'emerald',
  'diamond',
] as const;
export type LeagueTier = (typeof LEAGUE_TIERS)[number];

export interface XpEntry {
  at: number;
  xp: number;
  kind: 'attempt' | 'perfect-bonus';
  grade: number | null;
  exerciseId: string | null;
}

/** One local day; `date` is `YYYY-MM-DD`. */
export interface DayXp {
  date: string;
  xp: number;
  reached: boolean;
}

/** A completed week; `start` is its Monday, `YYYY-MM-DD`. */
export interface WeekSummary {
  start: string;
  xp: number;
  tier: LeagueTier;
  result: 'promoted' | 'demoted' | 'kept';
}

export interface GamificationStatus {
  /** Setting `enabled`. */
  enabled: boolean;
  /** Setting `leagues`. */
  leaguesEnabled: boolean;
  today: { date: string; xp: number; goal: number; reached: boolean };
  /** `daysLeft`: days until the next Monday, today included (1..7). */
  week: {
    start: string;
    xp: number;
    promoteAt: number;
    keepAt: number;
    daysLeft: number;
  };
  /**
   * `toPromote` = max(0, promoteAt - week.xp); `atRisk` = week.xp < keepAt and
   * daysLeft <= 2 (always false while leagues are off).
   */
  league: {
    tier: LeagueTier;
    index: number;
    next: LeagueTier | null;
    previous: LeagueTier | null;
    toPromote: number;
    atRisk: boolean;
  };
  totalXp: number;
  streak: { current: number; longest: number };
  /** Last 14 days including today, oldest first. */
  history: DayXp[];
  /** Up to 8 completed weeks, newest first. */
  weeks: WeekSummary[];
  /** Up to 10 entries, newest first. */
  recent: XpEntry[];
  perfectSessions: number;
}
