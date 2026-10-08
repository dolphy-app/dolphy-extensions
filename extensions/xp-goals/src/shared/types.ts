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

/** A day of the current week. */
export interface WeekDay extends DayXp {
  /** The current day. */
  today: boolean;
  /** After the current day. */
  future: boolean;
}

export interface GamificationStatus {
  /** Setting `enabled`. */
  enabled: boolean;
  today: { date: string; xp: number; goal: number; reached: boolean };
  /** The current week, Monday to Sunday in local time: `start` is its Monday. */
  week: { start: string; xp: number; days: WeekDay[] };
  totalXp: number;
  streak: { current: number; longest: number };
  /** Last 14 days including today, oldest first. */
  history: DayXp[];
  /** Up to 10 entries, newest first. */
  recent: XpEntry[];
}
