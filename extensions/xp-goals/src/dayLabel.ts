import type { WeekDay } from './core/week.ts';
import type { Format } from './i18n.ts';

/** The spoken name of a day of the week strip: the date, the XP and what became of the goal. */
export const dayLabel = (f: Format, day: WeekDay): string => {
  if (day.state === 'upcoming') {
    return `${f.dayLong(day.date)}, ${f.t('dayUpcoming')}`;
  }
  const outcome = {
    reached: f.t('historyReached'),
    missed: f.t('dayMissed'),
    today: f.t('dayToday'),
  }[day.state];
  const base = f.t('historyDay', {
    date: f.dayLong(day.date),
    xp: f.number(day.xp),
  });
  return `${base}, ${outcome}`;
};
