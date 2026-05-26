/**
 * Formatting utility functions for hours, numbers, and INR currency.
 */

export function formatInteger(value?: number | string | null): string {
  if (value == null) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return String(Math.round(num));
}

export function formatHours(value?: number | string | null): string {
  if (value == null) return '0h';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0h';
  return `${Math.round(num)}h`;
}

export function formatHoursRatio(actual?: number | string | null, estimated?: number | string | null): string {
  const actFormatted = formatHours(actual);
  const estFormatted = formatHours(estimated);
  return `${actFormatted} / ${estFormatted}`;
}

export function formatCurrencyINR(value?: number | string | null): string {
  if (value == null) return '₹0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export function formatNumber(value?: number | string | null): string {
  if (value == null) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(num);
}
