import { describe, test, expect } from 'vitest';
import {
  calculatePAYE,
  calculateSSNIT,
  calculateBonusTax,
  calculateOvertimePay,
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

describe('calculateBonusTax', () => {
  test('calculates 5% tax on bonus', () => {
    expect(calculateBonusTax(1000)).toBe(50.00);
    expect(calculateBonusTax(500)).toBe(25.00);
  });

  test('returns 0 for zero bonus', () => {
    expect(calculateBonusTax(0)).toBe(0);
  });

  test('returns 0 for negative bonus', () => {
    expect(calculateBonusTax(-100)).toBe(0);
  });

  test('rounds correctly', () => {
    expect(calculateBonusTax(333.33)).toBe(16.67); // 333.33 * 0.05 = 16.6665
  });
});

describe('calculateOvertimePay', () => {
  test('calculates overtime at 1.5x hourly rate', () => {
    // Basic: 5000, Standard hours: 176
    // Hourly rate = 5000 / 176 = 28.409...
    // Overtime pay = 10 * 28.409 * 1.5 = 426.14
    const result = calculateOvertimePay(5000, 10);
    expect(result).toBe(426.14);
  });

  test('returns 0 for zero overtime hours', () => {
    expect(calculateOvertimePay(5000, 0)).toBe(0);
  });

  test('returns 0 for negative overtime hours', () => {
    expect(calculateOvertimePay(5000, -5)).toBe(0);
  });

  test('returns 0 for zero basic salary', () => {
    expect(calculateOvertimePay(0, 10)).toBe(0);
  });

  test('handles fractional overtime hours', () => {
    // 5.5 hours at 1.5x rate
    const result = calculateOvertimePay(5000, 5.5);
    expect(result).toBe(234.38); // 5.5 * (5000/176) * 1.5
  });
});

describe('processEmployee with bonus and overtime', () => {
  test('employee with bonus only', () => {
    const employee: Employee = {
      employee_name: 'Bonus Employee',
      tin: 'P0011111111',
      ssnit_number: 'C00111111111',
      basic_salary: 5000,
      allowances: 500,
      bonus: 1000
    };

    const result = processEmployee(employee);

    expect(result.bonus).toBe(1000);
    expect(result.bonus_tax).toBe(50.00); // 5% of 1000
    expect(result.gross_pay).toBe(6500.00); // 5000 + 500 + 1000
    // Taxable income excludes bonus (taxed separately)
    expect(result.taxable_income).toBe(5225.00); // 6500 - 275 (SSNIT) - 1000 (bonus)
    expect(result.total_deductions).toBeGreaterThan(result.ssnit_employee + result.paye); // Includes bonus tax
  });

  test('employee with overtime only', () => {
    const employee: Employee = {
      employee_name: 'Overtime Employee',
      tin: 'P0022222222',
      ssnit_number: 'C00222222222',
      basic_salary: 5000,
      allowances: 500,
      overtime_hours: 10
    };

    const result = processEmployee(employee);

    expect(result.overtime_hours).toBe(10);
    expect(result.overtime_pay).toBe(426.14); // 10 * (5000/176) * 1.5
    expect(result.gross_pay).toBe(5926.14); // 5000 + 500 + 426.14 = 5926.14
    // Overtime is taxed through PAYE (included in taxable income)
    expect(result.taxable_income).toBe(5651.14); // 5926.14 - 275 (SSNIT)
  });

  test('employee with both bonus and overtime', () => {
    const employee: Employee = {
      employee_name: 'Full Compensation',
      tin: 'P0033333333',
      ssnit_number: 'C00333333333',
      basic_salary: 5000,
      allowances: 500,
      bonus: 1000,
      overtime_hours: 10
    };

    const result = processEmployee(employee);

    expect(result.overtime_pay).toBe(426.14);
    expect(result.bonus_tax).toBe(50.00);
    // Gross = 5000 + 500 + 426.14 + 1000 = 6926.14
    expect(result.gross_pay).toBe(6926.14);
    // Taxable = gross - SSNIT - bonus = 6926.14 - 275 - 1000 = 5651.14
    expect(result.taxable_income).toBe(5651.14);
    // Total deductions = SSNIT + PAYE + bonus tax
    expect(result.total_deductions).toBe(
      round(result.ssnit_employee + result.paye + result.bonus_tax, 2)
    );
  });

  test('employee without bonus or overtime', () => {
    const employee: Employee = {
      employee_name: 'Regular Employee',
      tin: 'P0044444444',
      ssnit_number: 'C00444444444',
      basic_salary: 5000,
      allowances: 500
    };

    const result = processEmployee(employee);

    expect(result.overtime_pay).toBe(0);
    expect(result.bonus_tax).toBe(0);
    expect(result.gross_pay).toBe(5500.00);
  });

  test('summary totals include bonus and overtime', () => {
    const employees: Employee[] = [
      {
        employee_name: 'Employee 1',
        tin: 'P0011111111',
        ssnit_number: 'C00111111111',
        basic_salary: 5000,
        allowances: 500,
        bonus: 1000,
        overtime_hours: 10
      },
      {
        employee_name: 'Employee 2',
        tin: 'P0022222222',
        ssnit_number: 'C00222222222',
        basic_salary: 4000,
        bonus: 500
      }
    ];

    const processedEmployees = processEmployees(employees);
    const totals = calculateSummaryTotals(processedEmployees);

    expect(totals.totalBonus).toBe(1500.00);
    expect(totals.totalOvertimePay).toBeGreaterThan(0);
    expect(totals.totalBonusTax).toBe(75.00); // 5% of 1500
  });
});
