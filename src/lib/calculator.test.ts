import { describe, test, expect } from 'vitest';
import {
  calculatePAYE,
  calculateSSNIT,
  processEmployee,
  processEmployees,
  calculateSummaryTotals,
  round
} from './calculator';
import type { Employee } from '../types/employee';

describe('round function', () => {
  test('rounds to 2 decimal places by default', () => {
    expect(round(5.123456)).toBe(5.12);
    expect(round(5.126)).toBe(5.13);
    expect(round(5.125)).toBe(5.13); // Banker's rounding
  });

  test('rounds to specified decimal places', () => {
    expect(round(5.123456, 0)).toBe(5);
    expect(round(5.123456, 1)).toBe(5.1);
    expect(round(5.123456, 3)).toBe(5.123);
  });

  test('handles negative numbers', () => {
    expect(round(-5.126, 2)).toBe(-5.13);
  });
});

describe('calculatePAYE', () => {
  test('returns 0 for income below tax threshold', () => {
    expect(calculatePAYE(0)).toBe(0);
    expect(calculatePAYE(400)).toBe(0);
    expect(calculatePAYE(490)).toBe(0);
  });

  test('calculates tax for income in first taxable bracket (5%)', () => {
    // First 490 @ 0% = 0
    // Next 110 @ 5% = 5.50
    expect(calculatePAYE(600)).toBe(5.50);
  });

  test('calculates tax for income spanning multiple brackets', () => {
    // First 490 @ 0% = 0
    // Next 110 @ 5% = 5.50
    // Next 130 @ 10% = 13.00
    // Total = 18.50
    expect(calculatePAYE(730)).toBe(18.50);
  });

  test('Kofi Mensah example from PRD: taxable income 5,225', () => {
    // From PRD Appendix B:
    // Basic: 5000, Allowances: 500
    // Gross: 5500
    // SSNIT: 275
    // Taxable: 5225
    //
    // Tax calculation:
    // First 490 @ 0% = 0
    // Next 110 @ 5% = 5.50
    // Next 130 @ 10% = 13.00
    // Next 3,166.67 @ 17.5% = 554.17
    // Remaining 1,328.33 @ 25% = 332.08
    // Total = 904.75
    const taxableIncome = 5225;
    const paye = calculatePAYE(taxableIncome);
    expect(paye).toBe(904.75);
  });

  test('high salary edge case', () => {
    // Test income in the 30% bracket
    const taxableIncome = 25000;
    const paye = calculatePAYE(taxableIncome);

    // Manual calculation:
    // 490 @ 0% = 0
    // 110 @ 5% = 5.50
    // 130 @ 10% = 13.00
    // 3166.67 @ 17.5% = 554.17
    // 16000 @ 25% = 4000.00
    // 5103.33 @ 30% = 1531.00
    // Total = 6103.67
    expect(paye).toBe(6103.67);
  });

  test('very high salary in top bracket (35%)', () => {
    // Test income in the 35% bracket
    const taxableIncome = 60000;
    const paye = calculatePAYE(taxableIncome);

    // Manual calculation:
    // 490 @ 0% = 0
    // 110 @ 5% = 5.50
    // 130 @ 10% = 13.00
    // 3166.67 @ 17.5% = 554.17
    // 16000 @ 25% = 4000.00
    // 30520 @ 30% = 9156.00
    // 9583.33 @ 35% = 3354.17
    // Total = 17082.84 (may be 17082.83 due to rounding)
    expect(paye).toBeCloseTo(17082.84, 1); // Within 0.1
  });

  test('handles negative income', () => {
    expect(calculatePAYE(-100)).toBe(0);
  });
});

describe('calculateSSNIT', () => {
  test('calculates employee contribution at 5.5%', () => {
    const result = calculateSSNIT(5000);
    expect(result.employee).toBe(275.00); // 5000 * 0.055
  });

  test('calculates employer contribution at 13%', () => {
    const result = calculateSSNIT(5000);
    expect(result.employer).toBe(650.00); // 5000 * 0.13
  });

  test('calculates total contribution', () => {
    const result = calculateSSNIT(5000);
    expect(result.total).toBe(925.00); // 275 + 650
  });

  test('handles zero salary', () => {
    const result = calculateSSNIT(0);
    expect(result.employee).toBe(0);
    expect(result.employer).toBe(0);
    expect(result.total).toBe(0);
  });

  test('handles negative salary', () => {
    const result = calculateSSNIT(-1000);
    expect(result.employee).toBe(0);
    expect(result.employer).toBe(0);
    expect(result.total).toBe(0);
  });

  test('rounds correctly for fractional amounts', () => {
    const result = calculateSSNIT(3333.33);
    expect(result.employee).toBe(183.33); // 3333.33 * 0.055 = 183.333...
    expect(result.employer).toBe(433.33); // 3333.33 * 0.13 = 433.333...
  });
});

describe('processEmployee', () => {
  test('Kofi Mensah example from PRD Appendix B', () => {
    const employee: Employee = {
      employee_name: 'Kofi Mensah',
      employee_id: 'EMP001',
      tin: 'P0012345678',
      ssnit_number: 'C00123456789',
      basic_salary: 5000,
      allowances: 500
    };

    const result = processEmployee(employee);

    // Verify all calculations from PRD
    expect(result.gross_pay).toBe(5500.00);
    expect(result.ssnit_employee).toBe(275.00);
    expect(result.ssnit_employer).toBe(650.00);
    expect(result.taxable_income).toBe(5225.00);
    expect(result.paye).toBe(904.75);
    expect(result.total_deductions).toBe(1179.75);
    expect(result.net_pay).toBe(4320.25);
  });

  test('employee with zero allowances', () => {
    const employee: Employee = {
      employee_name: 'Ama Owusu',
      tin: 'P0098765432',
      ssnit_number: 'C00987654321',
      basic_salary: 3000,
      allowances: 0
    };

    const result = processEmployee(employee);

    expect(result.allowances).toBe(0);
    expect(result.gross_pay).toBe(3000.00);
    expect(result.ssnit_employee).toBe(165.00); // 3000 * 0.055
  });

  test('employee without allowances field', () => {
    const employee: Employee = {
      employee_name: 'Kwame Asante',
      tin: 'P0011223344',
      ssnit_number: 'C00112233445',
      basic_salary: 3500
    };

    const result = processEmployee(employee);

    expect(result.allowances).toBe(0);
    expect(result.gross_pay).toBe(3500.00);
  });

  test('high salary employee', () => {
    const employee: Employee = {
      employee_name: 'Efua Darko',
      tin: 'P0055667788',
      ssnit_number: 'C00556677889',
      basic_salary: 60000,
      allowances: 5000
    };

    const result = processEmployee(employee);

    expect(result.gross_pay).toBe(65000.00);
    expect(result.ssnit_employee).toBe(3300.00); // 60000 * 0.055
    expect(result.ssnit_employer).toBe(7800.00); // 60000 * 0.13
    expect(result.taxable_income).toBe(61700.00); // 65000 - 3300
    expect(result.paye).toBeGreaterThan(17000); // Should be in high tax bracket
    expect(result.paye).toBeLessThan(18000); // Verify reasonable range
    expect(result.net_pay).toBeGreaterThan(40000);
  });

  test('below tax threshold salary', () => {
    const employee: Employee = {
      employee_name: 'Low Earner',
      tin: 'P0011111111',
      ssnit_number: 'C00111111111',
      basic_salary: 400,
      allowances: 0
    };

    const result = processEmployee(employee);

    expect(result.gross_pay).toBe(400.00);
    expect(result.ssnit_employee).toBe(22.00); // 400 * 0.055
    expect(result.taxable_income).toBe(378.00); // 400 - 22
    expect(result.paye).toBe(0); // Below tax threshold
    expect(result.net_pay).toBe(378.00); // 400 - 22 - 0
  });

  test('preserves all original employee data', () => {
    const employee: Employee = {
      employee_name: 'Test Employee',
      employee_id: 'EMP999',
      tin: 'P0099999999',
      ssnit_number: 'C00999999999',
      basic_salary: 4000,
      allowances: 300,
      bank_name: 'GCB Bank',
      account_number: '1234567890',
      mobile_money: '0241234567'
    };

    const result = processEmployee(employee);

    // Check original fields are preserved
    expect(result.employee_name).toBe('Test Employee');
    expect(result.employee_id).toBe('EMP999');
    expect(result.bank_name).toBe('GCB Bank');
    expect(result.account_number).toBe('1234567890');
    expect(result.mobile_money).toBe('0241234567');
  });
});

describe('processEmployees', () => {
  test('processes multiple employees', () => {
    const employees: Employee[] = [
      {
        employee_name: 'Employee 1',
        tin: 'P0011111111',
        ssnit_number: 'C00111111111',
        basic_salary: 5000,
        allowances: 500
      },
      {
        employee_name: 'Employee 2',
        tin: 'P0022222222',
        ssnit_number: 'C00222222222',
        basic_salary: 4000,
        allowances: 300
      }
    ];

    const results = processEmployees(employees);

    expect(results).toHaveLength(2);
    expect(results[0].employee_name).toBe('Employee 1');
    expect(results[1].employee_name).toBe('Employee 2');
    expect(results[0].net_pay).toBeGreaterThan(0);
    expect(results[1].net_pay).toBeGreaterThan(0);
  });

  test('handles empty array', () => {
    const results = processEmployees([]);
    expect(results).toHaveLength(0);
  });
});

describe('calculateSummaryTotals', () => {
  test('calculates correct totals for multiple employees', () => {
    const employees: Employee[] = [
      {
        employee_name: 'Employee 1',
        tin: 'P0011111111',
        ssnit_number: 'C00111111111',
        basic_salary: 5000,
        allowances: 500
      },
      {
        employee_name: 'Employee 2',
        tin: 'P0022222222',
        ssnit_number: 'C00222222222',
        basic_salary: 4000,
        allowances: 300
      }
    ];

    const processedEmployees = processEmployees(employees);
    const totals = calculateSummaryTotals(processedEmployees);

    expect(totals.employeeCount).toBe(2);
    expect(totals.totalBasicSalary).toBe(9000.00);
    expect(totals.totalAllowances).toBe(800.00);
    expect(totals.totalGrossPay).toBe(9800.00);
    expect(totals.totalSSNITEmployee).toBeGreaterThan(0);
    expect(totals.totalSSNITEmployer).toBeGreaterThan(0);
    expect(totals.totalSSNIT).toBe(totals.totalSSNITEmployee + totals.totalSSNITEmployer);
    expect(totals.totalPAYE).toBeGreaterThan(0);
    expect(totals.totalNetPay).toBeGreaterThan(0);
  });

  test('handles empty array', () => {
    const totals = calculateSummaryTotals([]);

    expect(totals.employeeCount).toBe(0);
    expect(totals.totalGrossPay).toBe(0);
    expect(totals.totalNetPay).toBe(0);
  });

  test('verifies total SSNIT is sum of employee and employer contributions', () => {
    const employees: Employee[] = [
      {
        employee_name: 'Test',
        tin: 'P0011111111',
        ssnit_number: 'C00111111111',
        basic_salary: 5000
      }
    ];

    const processedEmployees = processEmployees(employees);
    const totals = calculateSummaryTotals(processedEmployees);

    expect(totals.totalSSNIT).toBe(
      round(totals.totalSSNITEmployee + totals.totalSSNITEmployer, 2)
    );
  });
});
