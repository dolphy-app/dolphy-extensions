// Local calendar helpers. Dates are `YYYY-MM-DD` keys; arithmetic goes through
// the local `Date` constructor, so daylight-saving shifts never move a day.

const pad = (n: number): string => String(n).padStart(2, '0');

const keyOf = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parse = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Local date of an epoch-millisecond timestamp. */
export const dateKey = (ms: number): string => keyOf(new Date(ms));

export const addDays = (key: string, days: number): string => {
  const d = parse(key);
  d.setDate(d.getDate() + days);
  return keyOf(d);
};

/** Days since Monday: Monday 0 … Sunday 6. */
const dayIndex = (key: string): number => (parse(key).getDay() + 6) % 7;

/** Monday of the week the date belongs to. */
export const weekStartOf = (key: string): string =>
  addDays(key, -dayIndex(key));
