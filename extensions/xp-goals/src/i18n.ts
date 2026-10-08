import type { AppLocale } from '@dolphy-app/extension-api';
import type { LeagueTier } from './shared/types.ts';

type Plural = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
type Text = string | Plural;
type Entry = Readonly<Record<AppLocale, Text>>;

/** Every string the user sees, in both languages of the app. */
export const MESSAGES = {
  title: { en: 'XP goals', ru: 'XP и цели' },
  refresh: { en: 'Refresh', ru: 'Обновить' },
  details: { en: 'Details', ru: 'Подробнее' },
  loading: { en: 'Loading', ru: 'Загрузка' },
  loadFailed: {
    en: 'The XP status could not be loaded.',
    ru: 'Не удалось загрузить данные об XP.',
  },
  disabled: {
    en: 'The extension is switched off in the settings. New XP are not earned; what you earned is shown below.',
    ru: 'Расширение выключено в настройках. Новые XP не начисляются; накопленное показано ниже.',
  },
  openSettings: { en: 'Open settings', ru: 'Открыть настройки' },
  empty: {
    en: 'Finish a practice session to earn your first XP.',
    ru: 'Пройдите занятие, чтобы получить первые XP.',
  },
  xpToday: { en: 'XP today', ru: 'XP сегодня' },
  xpUnit: { en: 'XP', ru: 'XP' },
  ringLabel: {
    en: '{xp} of {goal} XP today',
    ru: '{xp} из {goal} XP сегодня',
  },
  goalReached: { en: 'Daily goal reached', ru: 'Цель достигнута' },
  goalLeft: {
    en: '{n} XP to the daily goal',
    ru: 'Ещё {n} XP до цели дня',
  },
  dailyGoal: { en: 'Daily goal: {goal} XP', ru: 'Цель дня: {goal} XP' },
  league: { en: 'League', ru: 'Лига' },
  leagueOf: { en: 'League {n} of {total}', ru: 'Лига {n} из {total}' },
  leaguesOff: {
    en: 'Leagues are switched off in the settings.',
    ru: 'Лиги отключены в настройках.',
  },
  weekProgress: { en: 'XP this week', ru: 'XP за неделю' },
  toPromote: {
    en: '{n} XP more to be promoted to {tier}',
    ru: 'Ещё {n} XP до повышения: {tier}',
  },
  promoteReady: {
    en: 'Enough XP to be promoted this week',
    ru: 'XP хватает для повышения на этой неделе',
  },
  topLeague: {
    en: 'You are in the top league',
    ru: 'Вы в высшей лиге',
  },
  atRisk: {
    en: 'At risk: earn {n} XP more to stay in {tier}',
    ru: 'Под угрозой: наберите ещё {n} XP, чтобы остаться в лиге «{tier}»',
  },
  daysLeft: {
    en: { one: '{n} day left in the week', other: '{n} days left in the week' },
    ru: {
      one: 'До конца недели {n} день',
      few: 'До конца недели {n} дня',
      many: 'До конца недели {n} дней',
      other: 'До конца недели {n} дня',
    },
  },
  history: { en: 'Last 14 days', ru: 'Последние 14 дней' },
  historyDay: {
    en: '{date}: {xp} XP',
    ru: '{date}: {xp} XP',
  },
  historyReached: { en: 'goal reached', ru: 'цель достигнута' },
  goalLine: { en: 'Goal', ru: 'Цель' },
  weeks: { en: 'Weekly results', ru: 'Итоги недель' },
  weeksEmpty: {
    en: 'Completed weeks will appear here.',
    ru: 'Здесь появятся завершённые недели.',
  },
  weekOf: { en: 'Week of {date}', ru: 'Неделя с {date}' },
  promoted: { en: 'Promoted', ru: 'Повышение' },
  demoted: { en: 'Demoted', ru: 'Понижение' },
  kept: { en: 'No change', ru: 'Без изменений' },
  streakAndTotal: { en: 'Streak and total', ru: 'Серия и итог' },
  streakDays: {
    en: { one: '{n} day', other: '{n} days' },
    ru: {
      one: '{n} день',
      few: '{n} дня',
      many: '{n} дней',
      other: '{n} дня',
    },
  },
  bestStreak: { en: 'Best: {n}', ru: 'Рекорд: {n}' },
  totalXp: { en: 'Total XP', ru: 'Всего XP' },
  perfectSessions: {
    en: { one: '{n} perfect session', other: '{n} perfect sessions' },
    ru: {
      one: '{n} идеальная сессия',
      few: '{n} идеальные сессии',
      many: '{n} идеальных сессий',
      other: '{n} идеальной сессии',
    },
  },
  recent: { en: 'Recent XP', ru: 'Последние начисления' },
  recentEmpty: {
    en: 'Earned XP will be listed here.',
    ru: 'Здесь появятся начисленные XP.',
  },
  entryGrade: {
    en: '+{xp} XP — grade {grade}',
    ru: '+{xp} XP — оценка {grade}',
  },
  entryAttempt: { en: '+{xp} XP — attempt', ru: '+{xp} XP — попытка' },
  entryBonus: {
    en: '+{xp} XP — perfect session bonus',
    ru: '+{xp} XP — бонус за идеальную сессию',
  },
} as const satisfies Record<string, Entry>;

export type MessageKey = keyof typeof MESSAGES;

export const TIER_NAMES: Record<LeagueTier, Entry> = {
  bronze: { en: 'Bronze league', ru: 'Бронзовая лига' },
  silver: { en: 'Silver league', ru: 'Серебряная лига' },
  gold: { en: 'Gold league', ru: 'Золотая лига' },
  sapphire: { en: 'Sapphire league', ru: 'Сапфировая лига' },
  ruby: { en: 'Ruby league', ru: 'Рубиновая лига' },
  emerald: { en: 'Emerald league', ru: 'Изумрудная лига' },
  diamond: { en: 'Diamond league', ru: 'Бриллиантовая лига' },
};

/** `YYYY-MM-DD` as a local date. */
export const parseDay = (key: string): Date => {
  const [y = 1970, m = 1, d = 1] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const fill = (text: string, params: Readonly<Record<string, string>>) =>
  text.replace(/\{(\w+)\}/g, (whole, name: string) => params[name] ?? whole);

/** Text, number and date formatting for one language. */
export interface Format {
  locale: AppLocale;
  number(n: number): string;
  t(key: MessageKey, params?: Params): string;
  /** A message whose form depends on `n`, which is also its `{n}`. */
  tn(key: MessageKey, n: number, params?: Params): string;
  tier(tier: LeagueTier): string;
  dayMonth(key: string): string;
  dayOnly(key: string): string;
  dayLong(key: string): string;
  dateTime(ms: number): string;
}

export const createFormat = (locale: AppLocale): Format => {
  const numbers = new Intl.NumberFormat(locale);
  const plurals = new Intl.PluralRules(locale);
  const dayMonth = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  });
  const dayOnly = new Intl.DateTimeFormat(locale, { day: 'numeric' });
  const weekdayDate = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const dateTime = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const number = (n: number) => numbers.format(n);

  const text = (
    entry: Entry,
    params: Readonly<Record<string, string | number>> = {},
    count?: number,
  ): string => {
    const raw = entry[locale];
    const chosen =
      typeof raw === 'string'
        ? raw
        : (raw[plurals.select(count ?? 0)] ?? raw.other);
    const prepared: Record<string, string> = {};
    for (const [name, value] of Object.entries(params)) {
      prepared[name] = typeof value === 'number' ? number(value) : value;
    }
    return fill(chosen, prepared);
  };

  return {
    locale,
    number,
    t: (
      key: MessageKey,
      params: Readonly<Record<string, string | number>> = {},
    ) => text(MESSAGES[key], params),
    /** A message whose form depends on `n`, which is also its `{n}`. */
    tn: (
      key: MessageKey,
      n: number,
      params: Readonly<Record<string, string | number>> = {},
    ) => text(MESSAGES[key], { n, ...params }, n),
    tier: (tier: LeagueTier) => text(TIER_NAMES[tier]),
    dayMonth: (key: string) => dayMonth.format(parseDay(key)),
    dayOnly: (key: string) => dayOnly.format(parseDay(key)),
    dayLong: (key: string) => weekdayDate.format(parseDay(key)),
    dateTime: (ms: number) => dateTime.format(new Date(ms)),
  };
};

type Params = Readonly<Record<string, string | number>>;
