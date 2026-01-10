import { TAX_BRACKETS, SSNIT_EMPLOYEE_RATE, SSNIT_EMPLOYER_RATE } from './constants';
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
 * Process a single employee's payroll
 * Calculates all payroll components: gross pay, SSNIT, PAYE, and net pay
 *
 * Calculation order is critical:
 * 1. Gross Pay = Basic Salary + Allowances
 * 2. SSNIT Employee = Basic Salary × 5.5%
 * 3. Taxable Income = Gross Pay - SSNIT Employee
 * 4. PAYE = Progressive tax on Taxable Income
 * 5. Net Pay = Gross Pay - SSNIT Employee - PAYE
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
 *   allowances: 500
 * };
 *
 * const result = processEmployee(employee);
 * // result.gross_pay: 5500.00
 * // result.ssnit_employee: 275.00
 * // result.paye: 904.75
 * // result.net_pay: 4320.25
 */
export function processEmployee(employee: Employee): ProcessedEmployee {
  const basicSalary = employee.basic_salary || 0;
  const allowances = employee.allowances || 0;

  // Step 1: Calculate gross pay
  const grossPay = basicSalary + allowances;

  // Step 2: Calculate SSNIT (based on basic salary only)
  const ssnit = calculateSSNIT(basicSalary);

  // Step 3: Calculate taxable income (gross pay minus employee SSNIT)
  const taxableIncome = grossPay - ssnit.employee;

  // Step 4: Calculate PAYE on taxable income
  const paye = calculatePAYE(taxableIncome);

  // Step 5: Calculate total deductions and net pay
  const totalDeductions = ssnit.employee + paye;
  const netPay = grossPay - totalDeductions;

  return {
    ...employee,
    allowances: allowances, // Ensure allowances is always set (defaults to 0)
    gross_pay: round(grossPay, 2),
    ssnit_employee: round(ssnit.employee, 2),
    ssnit_employer: round(ssnit.employer, 2),
    taxable_income: round(taxableIncome, 2),
    paye: round(paye, 2),
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
      totalGrossPay: acc.totalGrossPay + emp.gross_pay,
      totalSSNITEmployee: acc.totalSSNITEmployee + emp.ssnit_employee,
      totalSSNITEmployer: acc.totalSSNITEmployer + emp.ssnit_employer,
      totalPAYE: acc.totalPAYE + emp.paye,
      totalDeductions: acc.totalDeductions + emp.total_deductions,
      totalNetPay: acc.totalNetPay + emp.net_pay
    }),
    {
      employeeCount: 0,
      totalBasicSalary: 0,
      totalAllowances: 0,
      totalGrossPay: 0,
      totalSSNITEmployee: 0,
      totalSSNITEmployer: 0,
      totalPAYE: 0,
      totalDeductions: 0,
      totalNetPay: 0
    }
  );

  // Round all totals
  return {
    employeeCount: totals.employeeCount,
    totalBasicSalary: round(totals.totalBasicSalary, 2),
    totalAllowances: round(totals.totalAllowances, 2),
    totalGrossPay: round(totals.totalGrossPay, 2),
    totalSSNITEmployee: round(totals.totalSSNITEmployee, 2),
    totalSSNITEmployer: round(totals.totalSSNITEmployer, 2),
    totalSSNIT: round(totals.totalSSNITEmployee + totals.totalSSNITEmployer, 2),
    totalPAYE: round(totals.totalPAYE, 2),
    totalDeductions: round(totals.totalDeductions, 2),
    totalNetPay: round(totals.totalNetPay, 2)
  };
}
