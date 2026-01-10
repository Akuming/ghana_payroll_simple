import { describe, test, expect } from 'vitest';
import {
  formatCurrency,
  formatMonth,
  formatDate,
  formatPercentage,
  truncate,
  formatEmployeeCount,
  formatFileSize,
  capitalize
} from './formatting';

describe('formatCurrency', () => {
  test('formats with GHS symbol by default', () => {
    expect(formatCurrency(5000)).toBe('GHS 5,000.00');
  });

  test('formats without symbol when requested', () => {
    expect(formatCurrency(5000, false)).toBe('5,000.00');
  });

  test('formats decimal values', () => {
    expect(formatCurrency(5000.50)).toBe('GHS 5,000.50');
  });

  test('formats zero', () => {
    expect(formatCurrency(0)).toBe('GHS 0.00');
  });

  test('formats negative values', () => {
    expect(formatCurrency(-500)).toBe('GHS -500.00');
  });

  test('includes thousands separator', () => {
    expect(formatCurrency(1234567.89)).toContain(',');
  });

  test('always shows 2 decimal places', () => {
    expect(formatCurrency(100)).toBe('GHS 100.00');
    expect(formatCurrency(100.5)).toBe('GHS 100.50');
  });
});

describe('formatMonth', () => {
  test('formats YYYY-MM to readable month', () => {
    expect(formatMonth('2026-01')).toBe('January 2026');
    expect(formatMonth('2026-12')).toBe('December 2026');
  });

  test('handles all months', () => {
    expect(formatMonth('2026-06')).toBe('June 2026');
    expect(formatMonth('2026-07')).toBe('July 2026');
  });

  test('returns original string for invalid format', () => {
    expect(formatMonth('invalid')).toBe('invalid');
  });
});

describe('formatDate', () => {
  test('formats Date object to DD/MM/YYYY', () => {
    const date = new Date('2026-01-10');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  test('formats ISO string to DD/MM/YYYY', () => {
    const formatted = formatDate('2026-01-10');
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe('formatPercentage', () => {
  test('formats decimal to percentage', () => {
    expect(formatPercentage(0.055)).toBe('5.5%');
    expect(formatPercentage(0.13)).toBe('13.0%');
  });

  test('respects decimal places parameter', () => {
    expect(formatPercentage(0.055, 2)).toBe('5.50%');
    expect(formatPercentage(0.055, 0)).toBe('6%');
  });

  test('handles whole percentages', () => {
    expect(formatPercentage(0.25)).toBe('25.0%');
  });
});

describe('truncate', () => {
  test('truncates long text', () => {
    const long = 'Very Long Employee Name';
    // maxLength 15: substring(0, 12) + '...' = 'Very Long Em...' (15 chars total)
    expect(truncate(long, 15)).toBe('Very Long Em...');
  });

  test('does not truncate short text', () => {
    const short = 'Short Name';
    expect(truncate(short, 20)).toBe('Short Name');
  });

  test('handles exact length', () => {
    const text = 'Exactly 15 Char';
    expect(truncate(text, 15)).toBe('Exactly 15 Char');
  });
});

describe('formatEmployeeCount', () => {
  test('singular for one employee', () => {
    expect(formatEmployeeCount(1)).toBe('1 employee');
  });

  test('plural for multiple employees', () => {
    expect(formatEmployeeCount(5)).toBe('5 employees');
    expect(formatEmployeeCount(100)).toBe('100 employees');
  });

  test('handles zero', () => {
    expect(formatEmployeeCount(0)).toBe('0 employees');
  });
});

describe('formatFileSize', () => {
  test('formats bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(500)).toBe('500.00 Bytes');
  });

  test('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB');
    expect(formatFileSize(2048)).toBe('2.00 KB');
  });

  test('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.00 MB');
    expect(formatFileSize(5242880)).toBe('5.00 MB');
  });

  test('formats gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1.00 GB');
  });
});

describe('capitalize', () => {
  test('capitalizes first letter of each word', () => {
    expect(capitalize('kofi mensah')).toBe('Kofi Mensah');
  });

  test('handles single word', () => {
    expect(capitalize('ghana')).toBe('Ghana');
  });

  test('handles all caps', () => {
    expect(capitalize('JOHN DOE')).toBe('John Doe');
  });

  test('handles mixed case', () => {
    expect(capitalize('jOhN dOe')).toBe('John Doe');
  });
});
