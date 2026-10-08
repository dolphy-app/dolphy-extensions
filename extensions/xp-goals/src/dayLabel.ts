import type { Format } from './i18n.ts';
import type { WeekDay } from './shared/types.ts';

/** The spoken name of a day of the week strip: the date, the XP and what became of the goal. */
export const dayLabel = (f: Format, day: WeekDay): string => {
  const date = f.dayLong(day.date);
  if (day.future) return `${date}, ${f.t('dayUpcoming')}`;
  const outcome = day.reached
    ? f.t('historyReached')
    : day.today
      ? f.t('dayToday')
      : f.t('dayMissed');
  return `${f.t('historyDay', { date, xp: day.xp })}, ${outcome}`;
};
