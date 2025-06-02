/**
 * Format a number as a currency string
 */
export const formatCurrency = (amount: number, currency: string = 'ILS'): string => {
  const currencyFormats: Record<string, { locale: string, currency: string }> = {
    'SAR': { locale: 'ar-SA', currency: 'SAR' },
    'ILS': { locale: 'he-IL', currency: 'ILS' }
  };

  const format = currencyFormats[currency] || currencyFormats['ILS'];

  return new Intl.NumberFormat(format.locale, {
    style: 'currency',
    currency: format.currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date to display date and time
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    calendar: 'gregory'
  }).format(date);
};

/**
 * Format a date to display only date
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    calendar: 'gregory'
  }).format(date);
};