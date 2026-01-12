import {
  TAX_BRACKETS,
  SSNIT_EMPLOYEE_RATE,
  SSNIT_EMPLOYER_RATE,
  BONUS_TAX_RATE,
  STANDARD_MONTHLY_HOURS,
  OVERTIME_MULTIPLIER
} from './constants';
import type { Employee, ProcessedEmployee } from '../types/employee';

/**
 * Rounds a number to specified decimal places
 * Used for all financial calculations to ensure consistency
 */
export function round(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Calculate PAYE (Pay As You Earn) income tax using Ghana's progressive tax brackets
 *
 * IMPORTANT: Tax brackets are INCREMENTAL, not cumulative
 * Each bracket applies only to the portion of income within that range
 *
 * @param taxableIncome - The income subject to tax (gross pay - SSNIT employee contribution)
 * @returns The calculated PAYE tax amount
 *
 * @example
 * // For taxable income of 5,225 GHS:
 * // First 490 @ 0% = 0
 * // Next 110 @ 5% = 5.50
 * // Next 130 @ 10% = 13.00
 * // Next 3,166.67 @ 17.5% = 554.17
 * // Remaining 1,328.33 @ 25% = 332.08
 * // Total = 904.75
 * calculatePAYE(5225) // returns 904.75
 */
export function calculatePAYE(taxableIncome: number): number {
  if (taxableIncome <= 0) {
    return 0;
  }

  let tax = 0;
  let remaining = taxableIncome;

  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break;

    const taxableInBracket = Math.min(remaining, bracket.limit);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }

  return round(tax, 2);
}

/**
 * Calculate SSNIT (Social Security) contributions
 *
 * CRITICAL: SSNIT applies ONLY to BASIC SALARY, not allowances or gross pay
 *
 * @param basicSalary - The employee's basic salary (excluding allowances)
 * @returns Object with employee, employer, and total SSNIT contributions
 *
 * @example
 * calculateSSNIT(5000)
 * // returns {
 * //   employee: 275.00,  // 5.5% of basic
 * //   employer: 650.00,  // 13% of basic
 * //   total: 925.00      // Combined
 * // }
 */
export function calculateSSNIT(basicSalary: number): {
  employee: number;
  employer: number;
  total: number;
} {
  if (basicSalary <= 0) {
    return { employee: 0, employer: 0, total: 0 };
  }

  const employee = round(basicSalary * SSNIT_EMPLOYEE_RATE, 2);
  const employer = round(basicSalary * SSNIT_EMPLOYER_RATE, 2);
  const total = round(employee + employer, 2);

  return { employee, employer, total };
}

/**
 * Calculate bonus tax (flat rate)
 *
 * In Ghana, bonuses are taxed at a flat 5% rate, NOT using progressive PAYE brackets.
 * This is separate from regular income tax.
 *
 * @param bonus - The bonus amount
 * @returns The calculated bonus tax
 *
 * @example
 * calculateBonusTax(1000) // returns 50.00 (5% of 1000)
 */
export function calculateBonusTax(bonus: number): number {
  if (bonus <= 0) {
    return 0;
  }
  return round(bonus * BONUS_TAX_RATE, 2);
}

/**
 * Calculate overtime pay
 *
 * Overtime is calculated as:
 * 1. Hourly rate = Basic Salary / Standard Monthly Hours (176)
 * 2. Overtime Pay = Overtime Hours × Hourly Rate × Overtime Multiplier (1.5)
 *
 * Note: Overtime pay is added to gross pay and taxed through normal PAYE.
 *
 * @param basicSalary - The employee's basic salary
 * @param overtimeHours - Number of overtime hours worked
 * @returns The calculated overtime pay
 *
 * @example
 * // For basic salary of 5000 GHS and 10 overtime hours:
 * // Hourly rate = 5000 / 176 = 28.41
 * // Overtime pay = 10 × 28.41 × 1.5 = 426.14
 * calculateOvertimePay(5000, 10) // returns 426.14
 */
export function calculateOvertimePay(basicSalary: number, overtimeHours: number): number {
  if (basicSalary <= 0 || overtimeHours <= 0) {
    return 0;
  }

  const hourlyRate = basicSalary / STANDARD_MONTHLY_HOURS;
  const overtimePay = overtimeHours * hourlyRate * OVERTIME_MULTIPLIER;

  return round(overtimePay, 2);
}

/**
 * Process a single employee's payroll
 * Calculates all payroll components: gross pay, overtime, bonus, SSNIT, PAYE, and net pay
 *
 * Calculation order is critical:
 * 1. Overtime Pay = (Basic Salary / 176) × Overtime Hours × 1.5
 * 2. Gross Pay = Basic Salary + Allowances + Overtime Pay + Bonus
 * 3. SSNIT Employee = Basic Salary × 5.5% (on basic only, not overtime/bonus)
 * 4. Taxable Income = Gross Pay - SSNIT Employee - Bonus (bonus taxed separately)
 * 5. PAYE = Progressive tax on Taxable Income
 * 6. Bonus Tax = Bonus × 5% (flat rate)
 * 7. Total Deductions = SSNIT Employee + PAYE + Bonus Tax
 * 8. Net Pay = Gross Pay - Total Deductions
 *
 * @param employee - The employee data
 * @returns Complete employee data with all calculated fields
 *
 * @example
 * const employee = {
 *   employee_name: 'Kofi Mensah',
 *   tin: 'P0012345678',
 *   ssnit_number: 'C00123456789',
 *   basic_salary: 5000,
 *   allowances: 500,
 *   bonus: 1000,
 *   overtime_hours: 10
 * };
 *
 * const result = processEmployee(employee);
 * // result.overtime_pay: 426.14
 * // result.gross_pay: 6926.14 (5000 + 500 + 426.14 + 1000)
 * // result.ssnit_employee: 275.00
 * // result.taxable_income: 5651.14 (gross - ssnit - bonus)
 * // result.paye: 1011.45
 * // result.bonus_tax: 50.00
 * // result.total_deductions: 1336.45
 * // result.net_pay: 5589.69
 */
export function processEmployee(employee: Employee): ProcessedEmployee {
  const basicSalary = employee.basic_salary || 0;
  const allowances = employee.allowances || 0;
  const bonus = employee.bonus || 0;
  const overtimeHours = employee.overtime_hours || 0;

  // Step 1: Calculate overtime pay
  const overtimePay = calculateOvertimePay(basicSalary, overtimeHours);

  // Step 2: Calculate gross pay (includes overtime and bonus)
  const grossPay = basicSalary + allowances + overtimePay + bonus;

  // Step 3: Calculate SSNIT (based on basic salary only, not overtime/bonus)
  const ssnit = calculateSSNIT(basicSalary);

  // Step 4: Calculate taxable income
  // Note: Bonus is excluded from taxable income as it's taxed separately at flat rate
  const taxableIncome = grossPay - ssnit.employee - bonus;

  // Step 5: Calculate PAYE on taxable income (excludes bonus)
  const paye = calculatePAYE(taxableIncome);

  // Step 6: Calculate bonus tax (flat 5% rate)
  const bonusTax = calculateBonusTax(bonus);

  // Step 7: Calculate total deductions and net pay
  const totalDeductions = ssnit.employee + paye + bonusTax;
  const netPay = grossPay - totalDeductions;

  return {
    ...employee,
    allowances: allowances,
    bonus: bonus,
    overtime_hours: overtimeHours,
    overtime_pay: round(overtimePay, 2),
    gross_pay: round(grossPay, 2),
    ssnit_employee: round(ssnit.employee, 2),
    ssnit_employer: round(ssnit.employer, 2),
    taxable_income: round(taxableIncome, 2),
    paye: round(paye, 2),
    bonus_tax: round(bonusTax, 2),
    total_deductions: round(totalDeductions, 2),
    net_pay: round(netPay, 2)
  };
}

/**
 * Process multiple employees at once
 *
 * @param employees - Array of employee data
 * @returns Array of processed employees with calculations
 */
export function processEmployees(employees: Employee[]): ProcessedEmployee[] {
  return employees.map(employee => processEmployee(employee));
}

/**
 * Calculate summary totals for all employees
 * Used for generating summary reports
 *
 * @param processedEmployees - Array of processed employees
 * @returns Summary totals
 */
export function calculateSummaryTotals(processedEmployees: ProcessedEmployee[]) {
  const totals = processedEmployees.reduce(
    (acc, emp) => ({
      employeeCount: acc.employeeCount + 1,
      totalBasicSalary: acc.totalBasicSalary + emp.basic_salary,
      totalAllowances: acc.totalAllowances + (emp.allowances || 0),
      totalBonus: acc.totalBonus + (emp.bonus || 0),
      totalOvertimePay: acc.totalOvertimePay + (emp.overtime_pay || 0),
      totalGrossPay: acc.totalGrossPay + emp.gross_pay,
      totalSSNITEmployee: acc.totalSSNITEmployee + emp.ssnit_employee,
      totalSSNITEmployer: acc.totalSSNITEmployer + emp.ssnit_employer,
      totalPAYE: acc.totalPAYE + emp.paye,
      totalBonusTax: acc.totalBonusTax + (emp.bonus_tax || 0),
      totalDeductions: acc.totalDeductions + emp.total_deductions,
      totalNetPay: acc.totalNetPay + emp.net_pay
    }),
    {
      employeeCount: 0,
      totalBasicSalary: 0,
      totalAllowances: 0,
      totalBonus: 0,
      totalOvertimePay: 0,
      totalGrossPay: 0,
      totalSSNITEmployee: 0,
      totalSSNITEmployer: 0,
      totalPAYE: 0,
      totalBonusTax: 0,
      totalDeductions: 0,
      totalNetPay: 0
    }
  );

  // Round all totals
  return {
    employeeCount: totals.employeeCount,
    totalBasicSalary: round(totals.totalBasicSalary, 2),
    totalAllowances: round(totals.totalAllowances, 2),
    totalBonus: round(totals.totalBonus, 2),
    totalOvertimePay: round(totals.totalOvertimePay, 2),
    totalGrossPay: round(totals.totalGrossPay, 2),
    totalSSNITEmployee: round(totals.totalSSNITEmployee, 2),
    totalSSNITEmployer: round(totals.totalSSNITEmployer, 2),
    totalSSNIT: round(totals.totalSSNITEmployee + totals.totalSSNITEmployer, 2),
    totalPAYE: round(totals.totalPAYE, 2),
    totalBonusTax: round(totals.totalBonusTax, 2),
    totalDeductions: round(totals.totalDeductions, 2),
    totalNetPay: round(totals.totalNetPay, 2)
  };
}
