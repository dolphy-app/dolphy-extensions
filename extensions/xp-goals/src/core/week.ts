import type { GamificationStatus } from '../shared/types.ts';
import { addDays } from './dates.ts';

export interface WeekDay {
  date: string;
  xp: number;
  /** `reached` includes today when its goal is done; `today` is today before that. */
  state: 'reached' | 'missed' | 'today' | 'upcoming';
  isToday: boolean;
}

/**
 * The seven days of the current week, Monday first. Past days come from the
 * 14-day history (it always covers the current week up to today); days after
 * today are `upcoming`.
 */
export const weekDays = (
  status: Pick<GamificationStatus, 'today' | 'week' | 'history'>,
): WeekDay[] => {
  const known = new Map(status.history.map((day) => [day.date, day]));
  const { today } = status;
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(status.week.start, i);
    const isToday = date === today.date;
    if (date > today.date) return { date, xp: 0, state: 'upcoming', isToday };
    if (isToday) {
      return {
        date,
        xp: today.xp,
        state: today.reached ? 'reached' : 'today',
        isToday,
      };
    }
    const day = known.get(date);
    return {
      date,
      xp: day?.xp ?? 0,
      state: day?.reached === true ? 'reached' : 'missed',
      isToday,
    };
  });
};
