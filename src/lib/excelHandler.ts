import * as XLSX from 'xlsx';
import type { Employee, ProcessedEmployee } from '../types/employee';
import type { CompanySettings } from '../types/company';

/**
 * Column mapping for the Excel template
 * These match the PRD specification
 */
export const EXCEL_COLUMNS = {
  // Input columns (A-I)
  employee_name: 'A',
  employee_id: 'B',
  tin: 'C',
  ssnit_number: 'D',
  basic_salary: 'E',
  allowances: 'F',
  bank_name: 'G',
  account_number: 'H',
  mobile_money: 'I',

  // Output columns (J-P) - for processed results
  gross_pay: 'J',
  ssnit_employee: 'K',
  ssnit_employer: 'L',
  taxable_income: 'M',
  paye: 'N',
  total_deductions: 'O',
  net_pay: 'P'
} as const;

/**
 * Parse an uploaded Excel file and extract employee data
 *
 * @param file - The uploaded Excel file
 * @returns Promise with employees array and optional company settings
 *
 * @example
 * const { employees, companySettings } = await parseExcelFile(file);
 */
export async function parseExcelFile(file: File): Promise<{
  employees: Employee[];
  companySettings?: CompanySettings;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    // Read the file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Parse employees from "Employees" sheet (or first sheet)
    const employeesSheetName = workbook.SheetNames.includes('Employees')
      ? 'Employees'
      : workbook.SheetNames[0];

    if (!employeesSheetName) {
      errors.push('No sheets found in the Excel file');
      return { employees: [], errors };
    }

    const employeesSheet = workbook.Sheets[employeesSheetName];
    const employeesData = XLSX.utils.sheet_to_json<any>(employeesSheet, {
      header: 1,
      defval: ''
    });

    // Parse employees (skip header row)
    const employees = parseEmployeesFromRows(employeesData, errors);

    // Parse company settings if "Settings" sheet exists
    let companySettings: CompanySettings | undefined;
    if (workbook.SheetNames.includes('Settings')) {
      companySettings = parseCompanySettings(workbook.Sheets['Settings']);
    }

    return { employees, companySettings, errors };

  } catch (error) {
    errors.push(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { employees: [], errors };
  }
}

/**
 * Parse employee rows from Excel data
 */
function parseEmployeesFromRows(rows: any[][], errors: string[]): Employee[] {
  const employees: Employee[] = [];

  if (rows.length < 2) {
    errors.push('No employee data found in the file');
    return employees;
  }

  // Skip header row (row 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Skip empty rows
    if (!row || row.every(cell => !cell)) {
      continue;
    }

    try {
      const employee: Employee = {
        employee_name: String(row[0] || '').trim(),
        employee_id: row[1] ? String(row[1]).trim() : undefined,
        tin: String(row[2] || '').trim(),
        ssnit_number: String(row[3] || '').trim(),
        basic_salary: parseFloat(row[4]) || 0,
        allowances: row[5] !== undefined && row[5] !== '' ? parseFloat(row[5]) : undefined,
        bank_name: row[6] ? String(row[6]).trim() : undefined,
        account_number: row[7] ? String(row[7]).trim() : undefined,
        mobile_money: row[8] ? String(row[8]).trim() : undefined
      };

      employees.push(employee);
    } catch (error) {
      errors.push(`Error parsing row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return employees;
}

/**
 * Parse company settings from the Settings sheet
 */
function parseCompanySettings(sheet: XLSX.WorkSheet): CompanySettings | undefined {
  try {
    const data = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });

    return {
      company_name: String(data[0]?.[1] || ''),
      company_tin: String(data[1]?.[1] || ''),
      company_ssnit: String(data[2]?.[1] || ''),
      company_address: data[3]?.[1] ? String(data[3][1]) : undefined,
      payroll_month: String(data[4]?.[1] || '')
    };
  } catch (error) {
    console.error('Error parsing company settings:', error);
    return undefined;
  }
}

/**
 * Export employee data to Excel file (input columns only)
 * Used for downloading work-in-progress or templates
 *
 * @param employees - Array of employee data
 * @param companySettings - Optional company settings
 * @returns Blob of the Excel file
 */
export function exportToExcel(
  employees: Employee[],
  companySettings?: CompanySettings
): Blob {
  const workbook = XLSX.utils.book_new();

  // Create Employees sheet
  const employeesData = [
    // Header row
    [
      'employee_name',
      'employee_id',
      'tin',
      'ssnit_number',
      'basic_salary',
      'allowances',
      'bank_name',
      'account_number',
      'mobile_money'
    ],
    // Employee rows
    ...employees.map(emp => [
      emp.employee_name,
      emp.employee_id || '',
      emp.tin,
      emp.ssnit_number,
      emp.basic_salary,
      emp.allowances || '',
      emp.bank_name || '',
      emp.account_number || '',
      emp.mobile_money || ''
    ])
  ];

  const employeesSheet = XLSX.utils.aoa_to_sheet(employeesData);

  // Set column widths
  employeesSheet['!cols'] = [
    { wch: 20 }, // employee_name
    { wch: 12 }, // employee_id
    { wch: 15 }, // tin
    { wch: 15 }, // ssnit_number
    { wch: 12 }, // basic_salary
    { wch: 12 }, // allowances
    { wch: 15 }, // bank_name
    { wch: 15 }, // account_number
    { wch: 12 }  // mobile_money
  ];

  XLSX.utils.book_append_sheet(workbook, employeesSheet, 'Employees');

  // Create Settings sheet if company settings provided
  if (companySettings) {
    const settingsData = [
      ['company_name', companySettings.company_name],
      ['company_tin', companySettings.company_tin],
      ['company_ssnit', companySettings.company_ssnit],
      ['company_address', companySettings.company_address || ''],
      ['payroll_month', companySettings.payroll_month]
    ];

    const settingsSheet = XLSX.utils.aoa_to_sheet(settingsData);
    settingsSheet['!cols'] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, settingsSheet, 'Settings');
  }

  // Write to binary string
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Export processed payroll results to Excel
 * Includes both input and calculated columns
 *
 * @param processedEmployees - Array of processed employee data with calculations
 * @param companySettings - Company settings
 * @returns Blob of the Excel file
 */
export function exportProcessedToExcel(
  processedEmployees: ProcessedEmployee[],
  companySettings: CompanySettings
): Blob {
  const workbook = XLSX.utils.book_new();

  // Create header row with all columns (input + calculated)
  const headers = [
    'employee_name',
    'employee_id',
    'tin',
    'ssnit_number',
    'basic_salary',
    'allowances',
    'bank_name',
    'account_number',
    'mobile_money',
    'gross_pay',
    'ssnit_employee',
    'ssnit_employer',
    'taxable_income',
    'paye',
    'total_deductions',
    'net_pay'
  ];

  // Create data rows
  const dataRows = processedEmployees.map(emp => [
    emp.employee_name,
    emp.employee_id || '',
    emp.tin,
    emp.ssnit_number,
    emp.basic_salary,
    emp.allowances || 0,
    emp.bank_name || '',
    emp.account_number || '',
    emp.mobile_money || '',
    emp.gross_pay,
    emp.ssnit_employee,
    emp.ssnit_employer,
    emp.taxable_income,
    emp.paye,
    emp.total_deductions,
    emp.net_pay
  ]);

  // Combine headers and data
  const sheetData = [headers, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // employee_name
    { wch: 12 }, // employee_id
    { wch: 15 }, // tin
    { wch: 15 }, // ssnit_number
    { wch: 12 }, // basic_salary
    { wch: 12 }, // allowances
    { wch: 15 }, // bank_name
    { wch: 15 }, // account_number
    { wch: 12 }, // mobile_money
    { wch: 12 }, // gross_pay
    { wch: 12 }, // ssnit_employee
    { wch: 12 }, // ssnit_employer
    { wch: 12 }, // taxable_income
    { wch: 12 }, // paye
    { wch: 12 }, // total_deductions
    { wch: 12 }  // net_pay
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Results');

  // Add Settings sheet
  const settingsData = [
    ['company_name', companySettings.company_name],
    ['company_tin', companySettings.company_tin],
    ['company_ssnit', companySettings.company_ssnit],
    ['company_address', companySettings.company_address || ''],
    ['payroll_month', companySettings.payroll_month]
  ];

  const settingsSheet = XLSX.utils.aoa_to_sheet(settingsData);
  settingsSheet['!cols'] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, settingsSheet, 'Settings');

  // Write to binary string
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Generate a blank Excel template for download
 * Includes example row to guide users
 *
 * @returns Blob of the template Excel file
 */
export function generateTemplate(): Blob {
  const workbook = XLSX.utils.book_new();

  // Create template with header and example row
  const templateData = [
    // Header row
    [
      'employee_name',
      'employee_id',
      'tin',
      'ssnit_number',
      'basic_salary',
      'allowances',
      'bank_name',
      'account_number',
      'mobile_money'
    ],
    // Example row (to be deleted by user)
    [
      'Kofi Mensah (EXAMPLE - DELETE THIS ROW)',
      'EMP001',
      'P0012345678',
      'C00123456789',
      5000,
      500,
      'GCB Bank',
      '1234567890',
      '0241234567'
    ]
  ];

  const templateSheet = XLSX.utils.aoa_to_sheet(templateData);

  // Set column widths
  templateSheet['!cols'] = [
    { wch: 35 }, // employee_name (wider for example text)
    { wch: 12 }, // employee_id
    { wch: 15 }, // tin
    { wch: 15 }, // ssnit_number
    { wch: 12 }, // basic_salary
    { wch: 12 }, // allowances
    { wch: 15 }, // bank_name
    { wch: 15 }, // account_number
    { wch: 12 }  // mobile_money
  ];

  XLSX.utils.book_append_sheet(workbook, templateSheet, 'Employees');

  // Add Settings sheet template
  const settingsData = [
    ['company_name', '[Your Company Name]'],
    ['company_tin', 'P0000000000'],
    ['company_ssnit', 'C00000000000'],
    ['company_address', '[Optional Address]'],
    ['payroll_month', '2026-01']
  ];

  const settingsSheet = XLSX.utils.aoa_to_sheet(settingsData);
  settingsSheet['!cols'] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, settingsSheet, 'Settings');

  // Write to binary string
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Download a blob as a file
 * Helper function to trigger browser download
 *
 * @param blob - The file blob
 * @param filename - The desired filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with current date
 *
 * @param prefix - Filename prefix
 * @param extension - File extension (default: 'xlsx')
 * @returns Formatted filename
 *
 * @example
 * generateFilename('payroll') // 'payroll_2026-01-10.xlsx'
 */
export function generateFilename(prefix: string, extension: string = 'xlsx'): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${prefix}_${date}.${extension}`;
}
