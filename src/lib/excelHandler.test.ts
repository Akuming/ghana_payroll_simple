import { describe, test, expect } from 'vitest';
import {
  generateTemplate,
  exportToExcel,
  exportProcessedToExcel,
  generateFilename,
  EXCEL_COLUMNS
} from './excelHandler';
import type { Employee, ProcessedEmployee } from '../types/employee';
import type { CompanySettings } from '../types/company';

describe('EXCEL_COLUMNS', () => {
  test('has correct input column mappings', () => {
    expect(EXCEL_COLUMNS.employee_name).toBe('A');
    expect(EXCEL_COLUMNS.employee_id).toBe('B');
    expect(EXCEL_COLUMNS.tin).toBe('C');
    expect(EXCEL_COLUMNS.ssnit_number).toBe('D');
    expect(EXCEL_COLUMNS.basic_salary).toBe('E');
    expect(EXCEL_COLUMNS.allowances).toBe('F');
    expect(EXCEL_COLUMNS.bank_name).toBe('G');
    expect(EXCEL_COLUMNS.account_number).toBe('H');
    expect(EXCEL_COLUMNS.mobile_money).toBe('I');
  });

  test('has correct output column mappings', () => {
    expect(EXCEL_COLUMNS.gross_pay).toBe('J');
    expect(EXCEL_COLUMNS.ssnit_employee).toBe('K');
    expect(EXCEL_COLUMNS.ssnit_employer).toBe('L');
    expect(EXCEL_COLUMNS.taxable_income).toBe('M');
    expect(EXCEL_COLUMNS.paye).toBe('N');
    expect(EXCEL_COLUMNS.total_deductions).toBe('O');
    expect(EXCEL_COLUMNS.net_pay).toBe('P');
  });
});

describe('generateTemplate', () => {
  test('generates a blob', () => {
    const template = generateTemplate();
    expect(template).toBeInstanceOf(Blob);
  });

  test('generates correct MIME type', () => {
    const template = generateTemplate();
    expect(template.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  test('generates non-empty blob', () => {
    const template = generateTemplate();
    expect(template.size).toBeGreaterThan(0);
  });
});

describe('exportToExcel', () => {
  const sampleEmployees: Employee[] = [
    {
      employee_name: 'Kofi Mensah',
      employee_id: 'EMP001',
      tin: 'P0012345678',
      ssnit_number: 'C00123456789',
      basic_salary: 5000,
      allowances: 500,
      bank_name: 'GCB Bank',
      account_number: '1234567890',
      mobile_money: '0241234567'
    },
    {
      employee_name: 'Ama Owusu',
      tin: 'P0098765432',
      ssnit_number: 'C00987654321',
      basic_salary: 4000
    }
  ];

  test('exports employees to Excel blob', () => {
    const blob = exportToExcel(sampleEmployees);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  test('generates non-empty blob', () => {
    const blob = exportToExcel(sampleEmployees);
    expect(blob.size).toBeGreaterThan(0);
  });

  test('exports with company settings', () => {
    const companySettings: CompanySettings = {
      company_name: 'Test Company Ltd',
      company_tin: 'P0012345678',
      company_ssnit: 'C00123456789',
      payroll_month: '2026-01'
    };

    const blob = exportToExcel(sampleEmployees, companySettings);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  test('handles empty employee array', () => {
    const blob = exportToExcel([]);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0); // Still has headers
  });
});

describe('exportProcessedToExcel', () => {
  const sampleProcessedEmployees: ProcessedEmployee[] = [
    {
      employee_name: 'Kofi Mensah',
      employee_id: 'EMP001',
      tin: 'P0012345678',
      ssnit_number: 'C00123456789',
      basic_salary: 5000,
      allowances: 500,
      gross_pay: 5500,
      ssnit_employee: 275,
      ssnit_employer: 650,
      taxable_income: 5225,
      paye: 904.75,
      total_deductions: 1179.75,
      net_pay: 4320.25
    }
  ];

  const companySettings: CompanySettings = {
    company_name: 'Test Company Ltd',
    company_tin: 'P0012345678',
    company_ssnit: 'C00123456789',
    payroll_month: '2026-01'
  };

  test('exports processed results to Excel blob', () => {
    const blob = exportProcessedToExcel(sampleProcessedEmployees, companySettings);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  test('generates non-empty blob', () => {
    const blob = exportProcessedToExcel(sampleProcessedEmployees, companySettings);
    expect(blob.size).toBeGreaterThan(0);
  });

  test('handles single employee', () => {
    const blob = exportProcessedToExcel([sampleProcessedEmployees[0]], companySettings);
    expect(blob).toBeInstanceOf(Blob);
  });
});

describe('generateFilename', () => {
  test('generates filename with date', () => {
    const filename = generateFilename('payroll');
    expect(filename).toMatch(/^payroll_\d{4}-\d{2}-\d{2}\.xlsx$/);
  });

  test('uses custom extension', () => {
    const filename = generateFilename('report', 'pdf');
    expect(filename).toMatch(/^report_\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  test('includes current date', () => {
    const today = new Date().toISOString().split('T')[0];
    const filename = generateFilename('test');
    expect(filename).toContain(today);
  });

  test('handles different prefixes', () => {
    const filename1 = generateFilename('payslips');
    const filename2 = generateFilename('gra_report');

    expect(filename1).toMatch(/^payslips_/);
    expect(filename2).toMatch(/^gra_report_/);
  });
});
