// Core employee data structure
export interface Employee {
  employee_name: string;
  employee_id?: string;
  tin: string;
  ssnit_number: string;
  basic_salary: number;
  allowances?: number;
  bonus?: number;
  overtime_hours?: number;
  bank_name?: string;
  account_number?: string;
  mobile_money?: string;
}

// Employee with calculated payroll data
export interface ProcessedEmployee extends Employee {
  gross_pay: number;
  overtime_pay: number;
  bonus_tax: number;
  ssnit_employee: number;
  ssnit_employer: number;
  taxable_income: number;
  paye: number;
  total_deductions: number;
  net_pay: number;
}

// Validation error structure
export interface ValidationError {
  row: number;
  field: string;
  message: string;
}
