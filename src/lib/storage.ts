import { STORAGE_KEYS } from './constants';
import type { Employee } from '../types/employee';
import type { CompanySettings } from '../types/company';

/**
 * localStorage wrapper for persisting payroll data
 * Provides type-safe access to stored data
 */

/**
 * Save company settings to localStorage
 *
 * @param settings - Company settings to save
 */
export function saveCompanySettings(settings: CompanySettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANY_SETTINGS, JSON.stringify(settings));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
  } catch (error) {
    console.error('Failed to save company settings:', error);
  }
}

/**
 * Load company settings from localStorage
 *
 * @returns Saved company settings or null
 */
export function loadCompanySettings(): CompanySettings | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANY_SETTINGS);
    if (!saved) return null;
    return JSON.parse(saved) as CompanySettings;
  } catch (error) {
    console.error('Failed to load company settings:', error);
    return null;
  }
}

/**
 * Save employees to localStorage
 *
 * @param employees - Array of employees to save
 */
export function saveEmployees(employees: Employee[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
  } catch (error) {
    console.error('Failed to save employees:', error);
    // If quota exceeded, warn the user
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Data was not saved.');
    }
  }
}

/**
 * Load employees from localStorage
 *
 * @returns Saved employees or empty array
 */
export function loadEmployees(): Employee[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!saved) return [];
    return JSON.parse(saved) as Employee[];
  } catch (error) {
    console.error('Failed to load employees:', error);
    return [];
  }
}

/**
 * Get last saved timestamp
 *
 * @returns ISO timestamp string or null
 */
export function getLastSaved(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
  } catch (error) {
    return null;
  }
}

/**
 * Clear all saved payroll data
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.COMPANY_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

/**
 * Check if there is any saved data
 *
 * @returns true if data exists in localStorage
 */
export function hasSavedData(): boolean {
  try {
    return (
      localStorage.getItem(STORAGE_KEYS.COMPANY_SETTINGS) !== null ||
      localStorage.getItem(STORAGE_KEYS.EMPLOYEES) !== null
    );
  } catch (error) {
    return false;
  }
}

/**
 * Get storage usage information
 *
 * @returns Object with storage info
 */
export function getStorageInfo(): {
  hasData: boolean;
  lastSaved: string | null;
  employeeCount: number;
} {
  const employees = loadEmployees();
  const lastSaved = getLastSaved();

  return {
    hasData: hasSavedData(),
    lastSaved,
    employeeCount: employees.length
  };
}
