import { describe, test, expect } from 'vitest';
import {
  validateTIN,
  validateSSNIT,
  validatePhone,
  validateEmployee,
  validateEmployees,
  validateCompanySettings,
  generateEmployeeId,
  checkDuplicateTINs,
  checkDuplicateSSNIT
} from './validators';
import type { Employee } from '../types/employee';
import type { CompanySettings } from '../types/company';

describe('validateTIN', () => {
  test('accepts valid TIN format', () => {
    expect(validateTIN('P0012345678')).toBe(true);
    expect(validateTIN('P9999999999')).toBe(true);
    expect(validateTIN('P0000000000')).toBe(true);
  });

  test('rejects invalid TIN formats', () => {
    expect(validateTIN('P001234567')).toBe(false);  // Too short
    expect(validateTIN('P00123456789')).toBe(false); // Too long
    expect(validateTIN('0012345678')).toBe(false);   // Missing P
    expect(validateTIN('A0012345678')).toBe(false);  // Wrong prefix
    expect(validateTIN('P001234567X')).toBe(false);  // Non-digit
    expect(validateTIN('')).toBe(false);             // Empty
    expect(validateTIN('   ')).toBe(false);          // Whitespace only
  });

  test('trims whitespace before validation', () => {
    expect(validateTIN(' P0012345678 ')).toBe(true);
    expect(validateTIN('  P0012345678')).toBe(true);
  });
});

describe('validateSSNIT', () => {
  test('accepts valid SSNIT format', () => {
    expect(validateSSNIT('C00123456789')).toBe(true);
    expect(validateSSNIT('C99999999999')).toBe(true);
    expect(validateSSNIT('C00000000000')).toBe(true);
  });

  test('rejects invalid SSNIT formats', () => {
    expect(validateSSNIT('C0012345678')).toBe(false);  // Too short
    expect(validateSSNIT('C001234567890')).toBe(false); // Too long
    expect(validateSSNIT('00123456789')).toBe(false);   // Missing C
    expect(validateSSNIT('S00123456789')).toBe(false);  // Wrong prefix
    expect(validateSSNIT('C0012345678X')).toBe(false);  // Non-digit
    expect(validateSSNIT('')).toBe(false);              // Empty
    expect(validateSSNIT('   ')).toBe(false);           // Whitespace only
  });

  test('trims whitespace before validation', () => {
    expect(validateSSNIT(' C00123456789 ')).toBe(true);
    expect(validateSSNIT('  C00123456789')).toBe(true);
  });
});

describe('validatePhone', () => {
  test('accepts valid Ghana phone format', () => {
    expect(validatePhone('0241234567')).toBe(true);
    expect(validatePhone('0501234567')).toBe(true);
    expect(validatePhone('0201234567')).toBe(true);
  });

  test('rejects invalid phone formats', () => {
    expect(validatePhone('024123456')).toBe(false);   // Too short
    expect(validatePhone('02412345678')).toBe(false); // Too long
    expect(validatePhone('1241234567')).toBe(false);  // Doesn't start with 0
    expect(validatePhone('024123456X')).toBe(false);  // Non-digit
  });

  test('returns true for empty phone (optional field)', () => {
    expect(validatePhone('')).toBe(true);
    expect(validatePhone('   ')).toBe(true);
  });

  test('trims whitespace before validation', () => {
    expect(validatePhone(' 0241234567 ')).toBe(true);
  });
});

describe('validateEmployee', () => {
  test('returns no errors for valid employee', () => {
    const employee: Employee = {
      employee_name: 'Kofi Mensah',
      employee_id: 'EMP001',
      tin: 'P0012345678',
      ssnit_number: 'C00123456789',
      basic_salary: 5000,
      allowances: 500,
      bank_name: 'GCB Bank',
      account_number: '1234567890',
      mobile_money: '0241234567'
    };

    const errors = validateEmployee(employee, 1);
    expect(errors).toHaveLength(0);
  });

  test('detects missing employee name', () => {
    const employee: Employee = {
      employee_name: '',
      tin: 'P0012345678',
      ssnit_number: 'C00123456789',
      basic_salary: 5000
    };

    const errors = validateEmployee(employee, 1);
    const nameError = errors.find(e => e.field === 'employee_name');
    expect(nameError).toBeDefined();
    expect(nameError?.message).toContain('required');
  });

  test('detects missing TIN', () => {
    const employee: Employee = {
      employee_name: 'Test',
      tin: '',
      ssnit_number: 'C00123456789',
      basic_salary: 5000
    };

    const errors = validateEmployee(employee, 1);
    const tinError = errors.find(e => e.field === 'tin');
    expect(tinError).toBeDefined();
  });

  test('detects invalid TIN format', () => {
    const employee: Employee = {
      employee_name: 'Test',
      tin: 'INVALID',
      ssnit_number: 'C00123456789',
      basic_salary: 5000
    };

    const errors = validateEmployee(employee, 1);
    const tinError = errors.find(e => e.field === 'tin');
    expect(tinError).toBeDefined();
    expect(tinError?.message).toContain('Invalid');
  });

  test('detects missing SSNIT number', () => {
    const employee: Employee = {
      employee_name: 'Test',
      tin: 'P0012345678',
      ssnit_number: '',
      basic_salary: 5000
    };

    const errors = validateEmployee(employee, 1);
    const ssnitError = errors.find(e => e.field === 'ssnit_number');
    expect(ssnitError).toBeDefined();
  });

  test('detects invalid SSNIT format', () => {
    const employee: Employee = {
      employee_name: 'Test',
      tin: 'P0012345678',
      ssnit_number: 'INVALID',
      basic_salary: 5000
    };

    const errors = validateEmployee(employee, 1);
    const ssnitError = errors.find(e => e.field === 'ssnit_number');
    expect(ssnitError).toBeDefined();
    expect(ssnitError?.message).toContain('Invalid');
  });

  test('detects missing basic salary', () => {
    const employee = {
      employee_name: 'Test',
      tin: 'P0012345678',
      ssnit_number: 'C00123456789'
    } as Employee;

    const errors = validateEmployee(employee, 1);
    const salaryError = errors.find(e => e.field === 'basic_salary');
    expect(salaryError).toBeDefined();
  });

  test('detects zero basic salary', () => {
    const employee: Employee = {
      employee_name: 'Test',
      tin: 'P0012345678',
      ssnit_number: 'C00123456789',
      basic_salary: 0
    };

    const errors = validateEmployee(employee, 1);
    const salaryError = errors.find(e => e.field === 'basic_salary');
    expect(salaryError).toBeDefined();
    expect(salaryError?.message).toContain('positive');
  });

  test('detects negative basic salary', () => {
    const employee: Employee = {
      employee_name: 'Test',
      tin: 'P0012345678',
      ssnit_number: 'C00123456789',
      basic_salary: -1000
    };

    const errors = validateEmployee(employee, 1);
    const salaryError = errors.find(e => e.field === 'basic_salary');
    expect(salaryError).toBeDefined();
  });

  test('detects negative allowances', () => {
    const employee: Employee = {
      employee_name: 'Test',
      tin: 'P0012345678',
      ssnit_number: 'C00123456789',
      basic_salary: 5000,
      allowances: -100
    };

    const errors = validateEmployee(employee, 1);
    const allowanceError = errors.find(e => e.field === 'allowances');
    expect(allowanceError).toBeDefined();
    expect(allowanceError?.message).toContain('negative');
  });

  test('detects invalid phone format', () => {
    const employee: Employee = {
      employee_name: 'Test',
      tin: 'P0012345678',
      ssnit_number: 'C00123456789',
      basic_salary: 5000,
      mobile_money: 'INVALID'
    };

    const errors = validateEmployee(employee, 1);
    const phoneError = errors.find(e => e.field === 'mobile_money');
    expect(phoneError).toBeDefined();
  });

  test('includes correct row number in errors', () => {
    const employee: Employee = {
      employee_name: '',
      tin: '',
      ssnit_number: '',
      basic_salary: 0
    };

    const errors = validateEmployee(employee, 5);
    expect(errors.every(e => e.row === 5)).toBe(true);
  });

  test('returns multiple errors for multiple issues', () => {
    const employee: Employee = {
      employee_name: '',
      tin: 'INVALID',
      ssnit_number: 'INVALID',
      basic_salary: -100
    };

    const errors = validateEmployee(employee, 1);
    expect(errors.length).toBeGreaterThan(3);
  });
});

describe('validateEmployees', () => {
  test('validates multiple employees', () => {
    const employees: Employee[] = [
      {
        employee_name: 'Valid Employee',
        tin: 'P0012345678',
        ssnit_number: 'C00123456789',
        basic_salary: 5000
      },
      {
        employee_name: '', // Invalid
        tin: 'P0098765432',
        ssnit_number: 'C00987654321',
        basic_salary: 4000
      }
    ];

    const errors = validateEmployees(employees);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.row === 2)).toBe(true);
  });

  test('returns empty array for valid employees', () => {
    const employees: Employee[] = [
      {
        employee_name: 'Employee 1',
        tin: 'P0012345678',
        ssnit_number: 'C00123456789',
        basic_salary: 5000
      },
      {
        employee_name: 'Employee 2',
        tin: 'P0098765432',
        ssnit_number: 'C00987654321',
        basic_salary: 4000
      }
    ];

    const errors = validateEmployees(employees);
    expect(errors).toHaveLength(0);
  });
});

describe('validateCompanySettings', () => {
  test('returns no errors for valid settings', () => {
    const settings: CompanySettings = {
      company_name: 'Test Company Ltd',
      company_tin: 'P0012345678',
      company_ssnit: 'C00123456789',
      company_address: '123 Test St',
      payroll_month: '2026-01'
    };

    const errors = validateCompanySettings(settings);
    expect(errors).toHaveLength(0);
  });

  test('detects missing company name', () => {
    const settings: CompanySettings = {
      company_name: '',
      company_tin: 'P0012345678',
      company_ssnit: 'C00123456789',
      payroll_month: '2026-01'
    };

    const errors = validateCompanySettings(settings);
    expect(errors.some(e => e.field === 'company_name')).toBe(true);
  });

  test('detects invalid company TIN', () => {
    const settings: CompanySettings = {
      company_name: 'Test Company',
      company_tin: 'INVALID',
      company_ssnit: 'C00123456789',
      payroll_month: '2026-01'
    };

    const errors = validateCompanySettings(settings);
    expect(errors.some(e => e.field === 'company_tin')).toBe(true);
  });

  test('detects invalid payroll month format', () => {
    const settings: CompanySettings = {
      company_name: 'Test Company',
      company_tin: 'P0012345678',
      company_ssnit: 'C00123456789',
      payroll_month: '01-2026' // Wrong format
    };

    const errors = validateCompanySettings(settings);
    expect(errors.some(e => e.field === 'payroll_month')).toBe(true);
  });
});

describe('generateEmployeeId', () => {
  test('generates correct format with zero padding', () => {
    expect(generateEmployeeId(0)).toBe('EMP001');
    expect(generateEmployeeId(9)).toBe('EMP010');
    expect(generateEmployeeId(99)).toBe('EMP100');
    expect(generateEmployeeId(999)).toBe('EMP1000');
  });
});

describe('checkDuplicateTINs', () => {
  test('detects duplicate TINs', () => {
    const employees: Employee[] = [
      {
        employee_name: 'Employee 1',
        tin: 'P0012345678',
        ssnit_number: 'C00123456789',
        basic_salary: 5000
      },
      {
        employee_name: 'Employee 2',
        tin: 'P0012345678', // Duplicate
        ssnit_number: 'C00987654321',
        basic_salary: 4000
      }
    ];

    const errors = checkDuplicateTINs(employees);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every(e => e.field === 'tin')).toBe(true);
  });

  test('returns empty array for unique TINs', () => {
    const employees: Employee[] = [
      {
        employee_name: 'Employee 1',
        tin: 'P0012345678',
        ssnit_number: 'C00123456789',
        basic_salary: 5000
      },
      {
        employee_name: 'Employee 2',
        tin: 'P0098765432',
        ssnit_number: 'C00987654321',
        basic_salary: 4000
      }
    ];

    const errors = checkDuplicateTINs(employees);
    expect(errors).toHaveLength(0);
  });
});

describe('checkDuplicateSSNIT', () => {
  test('detects duplicate SSNIT numbers', () => {
    const employees: Employee[] = [
      {
        employee_name: 'Employee 1',
        tin: 'P0012345678',
        ssnit_number: 'C00123456789',
        basic_salary: 5000
      },
      {
        employee_name: 'Employee 2',
        tin: 'P0098765432',
        ssnit_number: 'C00123456789', // Duplicate
        basic_salary: 4000
      }
    ];

    const errors = checkDuplicateSSNIT(employees);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every(e => e.field === 'ssnit_number')).toBe(true);
  });

  test('returns empty array for unique SSNIT numbers', () => {
    const employees: Employee[] = [
      {
        employee_name: 'Employee 1',
        tin: 'P0012345678',
        ssnit_number: 'C00123456789',
        basic_salary: 5000
      },
      {
        employee_name: 'Employee 2',
        tin: 'P0098765432',
        ssnit_number: 'C00987654321',
        basic_salary: 4000
      }
    ];

    const errors = checkDuplicateSSNIT(employees);
    expect(errors).toHaveLength(0);
  });
});
