// Ghana PAYE Tax Brackets (2024 Monthly Rates)
// IMPORTANT: These are INCREMENTAL brackets, not cumulative
export const TAX_BRACKETS = [
  { limit: 490, rate: 0 },        // 0-490: tax-free
  { limit: 110, rate: 0.05 },     // NEXT 110 (490-600): 5%
  { limit: 130, rate: 0.10 },     // NEXT 130 (600-730): 10%
  { limit: 3166.67, rate: 0.175 },// NEXT 3166.67: 17.5%
  { limit: 16000, rate: 0.25 },   // NEXT 16000: 25%
  { limit: 30520, rate: 0.30 },   // NEXT 30520: 30%
  { limit: Infinity, rate: 0.35 } // Remainder: 35%
] as const;

// SSNIT Contribution Rates
export const SSNIT_EMPLOYEE_RATE = 0.055;  // 5.5% (Tier 1 + 2)
export const SSNIT_EMPLOYER_RATE = 0.13;   // 13.0%

// Validation Regex Patterns
export const TIN_REGEX = /^P\d{10}$/;         // P + 10 digits
export const SSNIT_REGEX = /^C\d{11}$/;       // C + 11 digits
export const PHONE_REGEX = /^0\d{9}$/;        // Ghana phone format

// File size limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Storage keys
export const STORAGE_KEYS = {
  COMPANY_SETTINGS: 'ghana_payroll_company_settings',
  EMPLOYEES: 'ghana_payroll_employees',
  LAST_SAVED: 'ghana_payroll_last_saved'
} as const;
