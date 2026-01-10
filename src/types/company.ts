// Company settings structure
export interface CompanySettings {
  company_name: string;
  company_tin: string;
  company_ssnit: string;
  company_address?: string;
  payroll_month: string; // YYYY-MM format
}
