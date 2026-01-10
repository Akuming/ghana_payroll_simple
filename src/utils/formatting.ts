/**
 * Formatting utilities for currency, dates, and other display values
 */

/**
 * Format a number as Ghana Cedis currency
 *
 * @param amount - The amount to format
 * @param includeSymbol - Whether to include GHS symbol (default: true)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(5000) // 'GHS 5,000.00'
 * formatCurrency(5000, false) // '5,000.00'
 */
export function formatCurrency(amount: number, includeSymbol: boolean = true): string {
  const formatted = amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return includeSymbol ? `GHS ${formatted}` : formatted;
}

/**
 * Format payroll month (YYYY-MM) to readable format
 *
 * @param monthString - The month in YYYY-MM format
 * @returns Formatted month string
 *
 * @example
 * formatMonth('2026-01') // 'January 2026'
 */
export function formatMonth(monthString: string): string {
  try {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const formatted = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    // Return original if invalid date
    if (formatted === 'Invalid Date' || isNaN(date.getTime())) {
      return monthString;
    }
    return formatted;
  } catch (error) {
    return monthString;
  }
}

/**
 * Format a date to Ghana format (DD/MM/YYYY)
 *
 * @param date - Date object or ISO string
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date('2026-01-10')) // '10/01/2026'
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY format
}

/**
 * Get current month in YYYY-MM format
 *
 * @returns Current month string
 *
 * @example
 * getCurrentMonth() // '2026-01'
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Format a percentage
 *
 * @param value - The decimal value (e.g., 0.055 for 5.5%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(0.055) // '5.5%'
 * formatPercentage(0.13) // '13.0%'
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Truncate long text with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 *
 * @example
 * truncate('Very Long Employee Name', 15) // 'Very Long Emplo...'
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format employee count with proper pluralization
 *
 * @param count - Number of employees
 * @returns Formatted string
 *
 * @example
 * formatEmployeeCount(1) // '1 employee'
 * formatEmployeeCount(5) // '5 employees'
 */
export function formatEmployeeCount(count: number): string {
  return `${count} employee${count !== 1 ? 's' : ''}`;
}

/**
 * Format file size in bytes to human-readable format
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size
 *
 * @example
 * formatFileSize(1024) // '1.00 KB'
 * formatFileSize(1048576) // '1.00 MB'
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Capitalize first letter of each word
 *
 * @param text - The text to capitalize
 * @returns Capitalized text
 *
 * @example
 * capitalize('kofi mensah') // 'Kofi Mensah'
 */
export function capitalize(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
