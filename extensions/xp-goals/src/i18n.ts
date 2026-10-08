import type { AppLocale } from '@dolphy-app/extension-api';

type Plural = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
type Text = string | Plural;
type Entry = Readonly<Record<AppLocale, Text>>;

/** Every string the user sees, in both languages of the app. */
export const MESSAGES = {
  title: { en: 'XP goals', ru: 'XP и цели' },
  refresh: { en: 'Refresh', ru: 'Обновить' },
  retry: { en: 'Try again', ru: 'Повторить' },
  details: { en: 'Details', ru: 'Подробнее' },
  loading: { en: 'Loading', ru: 'Загрузка' },
  loadFailed: {
    en: 'The XP status could not be loaded.',
    ru: 'Не удалось загрузить данные об XP.',
  },
  disabled: {
    en: 'Switched off in the settings: new XP are not earned.',
    ru: 'Выключено в настройках: новые XP не начисляются.',
  },
  openSettings: { en: 'Open settings', ru: 'Открыть настройки' },
  startPractice: { en: 'Start practice', ru: 'Начать занятие' },
  commandFailed: {
    en: "Today's plan could not be opened.",
    ru: 'Не удалось открыть план на сегодня.',
  },
  today: { en: 'Today', ru: 'Сегодня' },
  ringLabel: {
    en: '{xp} of {goal} XP today',
    ru: '{xp} из {goal} XP сегодня',
  },
  ofGoal: { en: 'of {goal} XP', ru: 'из {goal} XP' },
  goalReached: {
    en: 'Daily goal reached',
    ru: 'Цель на сегодня выполнена',
  },
  goalLeft: {
    en: '{n} XP to go to the daily goal',
    ru: 'Ещё {n} XP до цели',
  },
  thisWeek: { en: 'This week', ru: 'Эта неделя' },
  dayToday: { en: 'today', ru: 'сегодня' },
  dayUpcoming: { en: 'ahead', ru: 'впереди' },
  dayMissed: { en: 'goal not reached', ru: 'цель не выполнена' },
  streak: { en: 'Streak', ru: 'Серия' },
  streakDays: {
    en: { one: '{n} day', other: '{n} days' },
    ru: {
      one: '{n} день',
      few: '{n} дня',
      many: '{n} дней',
      other: '{n} дня',
    },
  },
  total: { en: 'Total', ru: 'Всего' },
  xpAmount: { en: '{n} XP', ru: '{n} XP' },
  history: { en: 'Last 14 days', ru: 'Последние 14 дней' },
  historyDay: { en: '{date}: {xp} XP', ru: '{date}: {xp} XP' },
  historyReached: { en: 'goal reached', ru: 'цель выполнена' },
  historyReachedCount: {
    en: 'Goal reached on {n} of 14 days',
    ru: 'Цель выполнена: {n} из 14 дней',
  },
  historyEmpty: {
    en: 'Your activity will appear here',
    ru: 'Здесь появится ваша активность',
  },
  goalLine: { en: 'Goal', ru: 'Цель' },
  recent: { en: 'Recent XP', ru: 'Последние начисления' },
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
  dayMonth(key: string): string;
  dayOnly(key: string): string;
  /** Short weekday with the first letter upper-cased: `Mon`, `Пн`. */
  weekdayShort(key: string): string;
  dayLong(key: string): string;
  time(ms: number): string;
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
  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: 'short' });
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
  const time = new Intl.DateTimeFormat(locale, {
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
    dayMonth: (key: string) => dayMonth.format(parseDay(key)),
    dayOnly: (key: string) => dayOnly.format(parseDay(key)),
    weekdayShort: (key: string) => {
      const name = weekdayShort.format(parseDay(key));
      return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
    },
    dayLong: (key: string) => weekdayDate.format(parseDay(key)),
    time: (ms: number) => time.format(new Date(ms)),
    dateTime: (ms: number) => dateTime.format(new Date(ms)),
  };
};

type Params = Readonly<Record<string, string | number>>;
