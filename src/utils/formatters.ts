/**
 * Utility functions for currency, dates, numbers, and data export
 */

export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  const formatted = new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  const symbols: Record<string, string> = {
    SAR: 'ر.س',
    ETB: 'بر إثيوبي',
    AED: 'د.إ',
    USD: '$',
    EUR: '€',
    KWD: 'د.ك',
    EGP: 'ج.م',
    QAR: 'ر.ق',
    BHD: 'د.ب',
    OMR: 'ر.ع',
  };

  const symbol = symbols[currency] || currency;
  const sign = amount < 0 ? '-' : '';
  return `${sign}${formatted} ${symbol}`;
};

export const formatDualCurrency = (
  amountInSAR: number,
  rateSarToEtb: number = 34.5,
  mode: 'SAR' | 'ETB' | 'dual' = 'SAR'
): string => {
  const sarFormatted = formatCurrency(amountInSAR, 'SAR');
  const amountInEtb = amountInSAR * rateSarToEtb;
  const etbFormatted = formatCurrency(amountInEtb, 'ETB');

  if (mode === 'ETB') {
    return etbFormatted;
  }
  if (mode === 'dual') {
    return `${sarFormatted} (${etbFormatted})`;
  }
  return sarFormatted;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ar-SA').format(num);
};

export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const formatDateShort = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('ar-SA', {
      month: 'numeric',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const exportToCSV = (filename: string, rows: (string | number)[][]) => {
  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Arabic Excel support
    rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
