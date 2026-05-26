export interface DashboardFilters {
  year: number;
  month: number | null;
  cycle: number | null;
  region: string | null;
  supplier: string | null;
  senior: string | null;
  state: string | null;
}

export function normalizeDashboardFilters(
  raw: Record<string, string | undefined>,
  options: { today: string },
): DashboardFilters {
  const today = parseDateParts(options.today);
  const year = normalizeYear(raw.year, today.year);
  const month = normalizeMonth(raw.month);
  const cycle = month === null ? normalizeCycle(raw.cycle, today.month) : null;

  return {
    year,
    month,
    cycle,
    region: normalizeText(raw.region),
    supplier: normalizeText(raw.supplier),
    senior: normalizeText(raw.senior),
    state: normalizeText(raw.state),
  };
}

function normalizeYear(value: string | undefined, fallback: number) {
  const year = Number(value);
  return Number.isInteger(year) && year >= 2000 ? year : fallback;
}

function normalizeMonth(value: string | undefined) {
  const month = Number(value);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null;
}

function normalizeCycle(value: string | undefined, fallbackMonth: number) {
  const cycle = Number(value);

  if (Number.isInteger(cycle) && cycle >= 1 && cycle <= 4) {
    return cycle;
  }

  return ((fallbackMonth - 1) % 4) + 1;
}

function normalizeText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseDateParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
}
