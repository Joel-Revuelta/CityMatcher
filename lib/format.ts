const eur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-IE", {
  maximumFractionDigits: 0,
});

const oneDecimal = new Intl.NumberFormat("en-IE", {
  maximumFractionDigits: 1,
});

export function formatEUR(value: number): string {
  return eur.format(value);
}

export function formatNumber(value: number): string {
  return number.format(value);
}

export function formatDecimal(value: number): string {
  return oneDecimal.format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  return `${formatNumber(count)} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}
