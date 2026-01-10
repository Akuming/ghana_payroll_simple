import { TIN_REGEX, SSNIT_REGEX, PHONE_REGEX } from './constants';
import type { Employee, ValidationError } from '../types/employee';
import type { CompanySettings } from '../types/company';

/**
 * Validate TIN (Tax Identification Number) format
 * Format: P followed by 10 digits
 *
 * @param tin - The TIN to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * validateTIN('P0012345678') // true
 * validateTIN('P001234567')  // false (too short)
 * validateTIN('0012345678')  // false (missing P)
 */
export function validateTIN(tin: string): boolean {
  if (!tin) return false;
  return TIN_REGEX.test(tin.trim());
}

/**
 * Validate SSNIT number format
 * Format: C followed by 11 digits
 *
 * @param ssnitNumber - The SSNIT number to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * validateSSNIT('C00123456789') // true
 * validateSSNIT('C0012345678')  // false (too short)
 * validateSSNIT('00123456789')  // false (missing C)
 */
export function validateSSNIT(ssnitNumber: string): boolean {
  if (!ssnitNumber) return false;
  return SSNIT_REGEX.test(ssnitNumber.trim());
}

/**
 * Validate Ghana phone number format
 * Format: 0 followed by 9 digits
 *
 * @param phone - The phone number to validate
 * @returns true if valid, false otherwise
 */
export function validatePhone(phone: string): boolean {
  if (!phone || !phone.trim()) return true; // Phone is optional
  return PHONE_REGEX.test(phone.trim());
}

/**
 * Validate a single employee record
 * Checks all required fields and formats
 *
 * @param employee - The employee data to validate
 * @param rowIndex - The row number (for error reporting)
 * @returns Array of validation errors (empty if valid)
 */
export function validateEmployee(employee: Employee, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Employee name is required
  if (!employee.employee_name || !employee.employee_name.trim()) {
    errors.push({
      row: rowIndex,
      field: 'employee_name',
      message: 'Employee name is required'
    });
  }

  // TIN is required and must be valid format
  if (!employee.tin) {
    errors.push({
      row: rowIndex,
      field: 'tin',
      message: 'TIN is required'
    });
  } else if (!validateTIN(employee.tin)) {
    errors.push({
      row: rowIndex,
      field: 'tin',
      message: 'Invalid TIN format (must be P followed by 10 digits)'
    });
  }

  // SSNIT number is required and must be valid format
  if (!employee.ssnit_number) {
    errors.push({
      row: rowIndex,
      field: 'ssnit_number',
      message: 'SSNIT number is required'
    });
  } else if (!validateSSNIT(employee.ssnit_number)) {
    errors.push({
      row: rowIndex,
      field: 'ssnit_number',
      message: 'Invalid SSNIT number (must be C followed by 11 digits)'
    });
  }

  // Basic salary is required and must be positive
  if (employee.basic_salary === undefined || employee.basic_salary === null) {
    errors.push({
      row: rowIndex,
      field: 'basic_salary',
      message: 'Basic salary is required'
    });
  } else if (typeof employee.basic_salary !== 'number' || isNaN(employee.basic_salary)) {
    errors.push({
      row: rowIndex,
      field: 'basic_salary',
      message: 'Basic salary must be a valid number'
    });
  } else if (employee.basic_salary <= 0) {
    errors.push({
      row: rowIndex,
      field: 'basic_salary',
      message: 'Basic salary must be a positive number'
    });
  }

  // Allowances must be non-negative if provided
  if (employee.allowances !== undefined && employee.allowances !== null) {
    if (typeof employee.allowances !== 'number' || isNaN(employee.allowances)) {
      errors.push({
        row: rowIndex,
        field: 'allowances',
        message: 'Allowances must be a valid number'
      });
    } else if (employee.allowances < 0) {
      errors.push({
        row: rowIndex,
        field: 'allowances',
        message: 'Allowances cannot be negative'
      });
    }
  }

  // Mobile money format validation (if provided)
  if (employee.mobile_money && !validatePhone(employee.mobile_money)) {
    errors.push({
      row: rowIndex,
      field: 'mobile_money',
      message: 'Invalid phone number format (must be 10 digits starting with 0)'
    });
  }

  return errors;
}

/**
 * Validate multiple employee records
 *
 * @param employees - Array of employee data to validate
 * @returns Array of all validation errors
 */
export function validateEmployees(employees: Employee[]): ValidationError[] {
  const allErrors: ValidationError[] = [];

  employees.forEach((employee, index) => {
    const errors = validateEmployee(employee, index + 1); // Row numbers start at 1
    allErrors.push(...errors);
  });

  return allErrors;
}

/**
 * Validate company settings
 *
 * @param settings - The company settings to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateCompanySettings(settings: CompanySettings): ValidationError[] {
  const errors: ValidationError[] = [];

  // Company name is required
  if (!settings.company_name || !settings.company_name.trim()) {
    errors.push({
      row: 0,
      field: 'company_name',
      message: 'Company name is required'
    });
  }

  // Company TIN is required and must be valid
  if (!settings.company_tin) {
    errors.push({
      row: 0,
      field: 'company_tin',
      message: 'Company TIN is required'
    });
  } else if (!validateTIN(settings.company_tin)) {
    errors.push({
      row: 0,
      field: 'company_tin',
      message: 'Invalid company TIN format'
    });
  }

  // Company SSNIT number is required and must be valid
  if (!settings.company_ssnit) {
    errors.push({
      row: 0,
      field: 'company_ssnit',
      message: 'Company SSNIT employer number is required'
    });
  } else if (!validateSSNIT(settings.company_ssnit)) {
    errors.push({
      row: 0,
      field: 'company_ssnit',
      message: 'Invalid SSNIT employer number format'
    });
  }

  // Payroll month is required and must be valid format (YYYY-MM)
  if (!settings.payroll_month) {
    errors.push({
      row: 0,
      field: 'payroll_month',
      message: 'Payroll month is required'
    });
  } else if (!/^\d{4}-\d{2}$/.test(settings.payroll_month)) {
    errors.push({
      row: 0,
      field: 'payroll_month',
      message: 'Payroll month must be in YYYY-MM format'
    });
  }

  return errors;
}

/**
 * Generate auto employee ID
 * Format: EMP + zero-padded number
 *
 * @param index - The employee index (0-based)
 * @returns Generated employee ID
 *
 * @example
 * generateEmployeeId(0)   // 'EMP001'
 * generateEmployeeId(99)  // 'EMP100'
 */
export function generateEmployeeId(index: number): string {
  const num = (index + 1).toString().padStart(3, '0');
  return `EMP${num}`;
}

/**
 * Check for duplicate TINs in employee list
 *
 * @param employees - Array of employees to check
 * @returns Array of duplicate TIN errors
 */
export function checkDuplicateTINs(employees: Employee[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const tinMap = new Map<string, number[]>();

  employees.forEach((employee, index) => {
    if (employee.tin) {
      const tin = employee.tin.trim();
      if (!tinMap.has(tin)) {
        tinMap.set(tin, []);
      }
      tinMap.get(tin)!.push(index + 1);
    }
  });

  tinMap.forEach((rows, tin) => {
    if (rows.length > 1) {
      rows.forEach(row => {
        errors.push({
          row,
          field: 'tin',
          message: `Duplicate TIN: ${tin} (also appears in row${rows.length > 2 ? 's' : ''} ${rows.filter(r => r !== row).join(', ')})`
        });
      });
    }
  });

  return errors;
}

/**
 * Check for duplicate SSNIT numbers in employee list
 *
 * @param employees - Array of employees to check
 * @returns Array of duplicate SSNIT errors
 */
export function checkDuplicateSSNIT(employees: Employee[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const ssnitMap = new Map<string, number[]>();

  employees.forEach((employee, index) => {
    if (employee.ssnit_number) {
      const ssnit = employee.ssnit_number.trim();
      if (!ssnitMap.has(ssnit)) {
        ssnitMap.set(ssnit, []);
      }
      ssnitMap.get(ssnit)!.push(index + 1);
    }
  });

  ssnitMap.forEach((rows, ssnit) => {
    if (rows.length > 1) {
      rows.forEach(row => {
        errors.push({
          row,
          field: 'ssnit_number',
          message: `Duplicate SSNIT number: ${ssnit} (also appears in row${rows.length > 2 ? 's' : ''} ${rows.filter(r => r !== row).join(', ')})`
        });
      });
    }
  });

  return errors;
}
