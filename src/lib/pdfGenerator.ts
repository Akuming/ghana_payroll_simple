import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProcessedEmployee } from '../types/employee';
import type { CompanySettings } from '../types/company';
import { formatCurrency } from '../utils/formatting';

/**
 * Generate individual payslip PDF for a single employee
 *
 * @param employee - Processed employee data
 * @param companySettings - Company information
 * @returns jsPDF document instance
 */
export function generatePayslip(
  employee: ProcessedEmployee,
  companySettings: CompanySettings
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header - Company Name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companySettings.company_name, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Company Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (companySettings.company_address) {
    doc.text(companySettings.company_address, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
  }
  doc.text(`TIN: ${companySettings.company_tin}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text(`SSNIT: ${companySettings.company_ssnit}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYSLIP', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Payroll Period
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const monthYear = formatPayrollMonth(companySettings.payroll_month);
  doc.text(`Payroll Period: ${monthYear}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Employee Information Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Employee details in two columns
  const leftCol = 14;
  const rightCol = 110;

  doc.text(`Name:`, leftCol, yPosition);
  doc.text(employee.employee_name, leftCol + 30, yPosition);
  doc.text(`Employee ID:`, rightCol, yPosition);
  doc.text(employee.employee_id || 'N/A', rightCol + 30, yPosition);
  yPosition += 6;

  doc.text(`TIN:`, leftCol, yPosition);
  doc.text(employee.tin, leftCol + 30, yPosition);
  doc.text(`SSNIT Number:`, rightCol, yPosition);
  doc.text(employee.ssnit_number, rightCol + 30, yPosition);
  yPosition += 10;

  // Earnings Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Earnings', 14, yPosition);
  yPosition += 2;

  // Build earnings rows dynamically
  const earningsRows: string[][] = [
    ['Basic Salary', formatCurrency(employee.basic_salary)],
    ['Allowances', formatCurrency(employee.allowances || 0)],
  ];

  // Add overtime if present
  if (employee.overtime_pay && employee.overtime_pay > 0) {
    earningsRows.push(['Overtime Pay (1.5x rate)', formatCurrency(employee.overtime_pay)]);
  }

  // Add bonus if present
  if (employee.bonus && employee.bonus > 0) {
    earningsRows.push(['Bonus', formatCurrency(employee.bonus)]);
  }

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Amount (GHS)']],
    body: earningsRows,
    foot: [['Gross Pay', formatCurrency(employee.gross_pay)]],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], fontSize: 10 },
    footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 50, halign: 'right' }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Deductions Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Deductions', 14, yPosition);
  yPosition += 2;

  // Build deductions rows dynamically
  const deductionsRows: string[][] = [
    ['SSNIT Employee Contribution (5.5%)', formatCurrency(employee.ssnit_employee)],
    ['PAYE Tax', formatCurrency(employee.paye)],
  ];

  // Add bonus tax if present
  if (employee.bonus_tax && employee.bonus_tax > 0) {
    deductionsRows.push(['Bonus Tax (5% flat rate)', formatCurrency(employee.bonus_tax)]);
  }

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Amount (GHS)']],
    body: deductionsRows,
    foot: [['Total Deductions', formatCurrency(employee.total_deductions)]],
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68], fontSize: 10 },
    footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 50, halign: 'right' }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Net Pay Section (Highlighted)
  doc.setFillColor(34, 197, 94);
  doc.rect(14, yPosition, pageWidth - 28, 15, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('NET PAY:', 20, yPosition + 10);
  doc.text(formatCurrency(employee.net_pay), pageWidth - 20, yPosition + 10, { align: 'right' });

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPosition += 20;

  // Additional Information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition += 5;
  doc.text(`Taxable Income: ${formatCurrency(employee.taxable_income)}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Employer SSNIT Contribution (13%): ${formatCurrency(employee.ssnit_employer)}`, 14, yPosition);

  // Bank Details (if available)
  if (employee.bank_name || employee.account_number || employee.mobile_money) {
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details', 14, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (employee.bank_name) {
      doc.text(`Bank: ${employee.bank_name}`, 14, yPosition);
      yPosition += 5;
    }
    if (employee.account_number) {
      doc.text(`Account Number: ${employee.account_number}`, 14, yPosition);
      yPosition += 5;
    }
    if (employee.mobile_money) {
      doc.text(`Mobile Money: ${employee.mobile_money}`, 14, yPosition);
    }
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text('This is a computer-generated payslip and does not require a signature.', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, footerY + 4, { align: 'center' });

  return doc;
}

/**
 * Generate GRA PAYE Monthly Report PDF
 *
 * @param processedEmployees - Array of all processed employees
 * @param companySettings - Company information
 * @returns jsPDF document instance
 */
export function generateGRAReport(
  processedEmployees: ProcessedEmployee[],
  companySettings: CompanySettings
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('GHANA REVENUE AUTHORITY', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(14);
  doc.text('PAYE Monthly Return', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Company Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Employer Name: ${companySettings.company_name}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Employer TIN: ${companySettings.company_tin}`, 14, yPosition);
  yPosition += 6;
  if (companySettings.company_address) {
    doc.text(`Address: ${companySettings.company_address}`, 14, yPosition);
    yPosition += 6;
  }

  const monthYear = formatPayrollMonth(companySettings.payroll_month);
  doc.setFont('helvetica', 'bold');
  doc.text(`Period: ${monthYear}`, 14, yPosition);
  yPosition += 10;

  // Employee PAYE Details Table
  const tableData = processedEmployees.map(emp => [
    emp.employee_name,
    emp.tin,
    formatCurrency(emp.gross_pay),
    formatCurrency(emp.ssnit_employee),
    formatCurrency(emp.taxable_income),
    formatCurrency(emp.paye)
  ]);

  // Calculate totals
  const totalGrossPay = processedEmployees.reduce((sum, emp) => sum + emp.gross_pay, 0);
  const totalSSNIT = processedEmployees.reduce((sum, emp) => sum + emp.ssnit_employee, 0);
  const totalTaxableIncome = processedEmployees.reduce((sum, emp) => sum + emp.taxable_income, 0);
  const totalPAYE = processedEmployees.reduce((sum, emp) => sum + emp.paye, 0);

  autoTable(doc, {
    startY: yPosition,
    head: [[
      'Employee Name',
      'TIN',
      'Gross Pay\n(GHS)',
      'SSNIT Cont.\n(GHS)',
      'Taxable Income\n(GHS)',
      'PAYE Tax\n(GHS)'
    ]],
    body: tableData,
    foot: [[
      `Total (${processedEmployees.length} employees)`,
      '',
      formatCurrency(totalGrossPay),
      formatCurrency(totalSSNIT),
      formatCurrency(totalTaxableIncome),
      formatCurrency(totalPAYE)
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [220, 38, 38],
      fontSize: 9,
      halign: 'center',
      valign: 'middle'
    },
    footStyles: {
      fillColor: [254, 226, 226],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 10
    },
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 30, fontSize: 7 },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Summary Box
  doc.setFillColor(254, 226, 226);
  doc.rect(14, yPosition, pageWidth - 28, 25, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PAYE TAX PAYABLE:', 20, yPosition + 10);
  doc.setFontSize(14);
  doc.text(formatCurrency(totalPAYE), pageWidth - 20, yPosition + 10, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Number of Employees: ${processedEmployees.length}`, 20, yPosition + 18);

  yPosition += 35;

  // Declaration
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Declaration:', 14, yPosition);
  yPosition += 6;
  doc.setFontSize(9);
  doc.text('I declare that the information provided in this return is true, correct and complete.', 14, yPosition);
  yPosition += 15;

  // Signature Lines
  doc.setFontSize(10);
  doc.line(14, yPosition, 80, yPosition);
  doc.line(120, yPosition, 190, yPosition);
  yPosition += 5;
  doc.text('Employer Signature', 14, yPosition);
  doc.text('Date', 120, yPosition);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, pageWidth / 2, footerY, { align: 'center' });
  doc.text('Ghana Payroll Calculator - For official submission to GRA', pageWidth / 2, footerY + 4, { align: 'center' });

  return doc;
}

/**
 * Generate SSNIT Contribution Report PDF
 *
 * @param processedEmployees - Array of all processed employees
 * @param companySettings - Company information
 * @returns jsPDF document instance
 */
export function generateSSNITReport(
  processedEmployees: ProcessedEmployee[],
  companySettings: CompanySettings
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SOCIAL SECURITY AND NATIONAL INSURANCE TRUST', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(14);
  doc.text('Monthly Contribution Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Company Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Employer Name: ${companySettings.company_name}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Employer SSNIT Number: ${companySettings.company_ssnit}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Employer TIN: ${companySettings.company_tin}`, 14, yPosition);
  yPosition += 6;
  if (companySettings.company_address) {
    doc.text(`Address: ${companySettings.company_address}`, 14, yPosition);
    yPosition += 6;
  }

  const monthYear = formatPayrollMonth(companySettings.payroll_month);
  doc.setFont('helvetica', 'bold');
  doc.text(`Contribution Period: ${monthYear}`, 14, yPosition);
  yPosition += 10;

  // Contribution Rates Info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Employee Contribution: 5.5% | Employer Contribution: 13% | Total: 18.5%', 14, yPosition);
  yPosition += 8;

  // Employee Contributions Table
  const tableData = processedEmployees.map(emp => [
    emp.employee_name,
    emp.ssnit_number,
    formatCurrency(emp.basic_salary),
    formatCurrency(emp.ssnit_employee),
    formatCurrency(emp.ssnit_employer),
    formatCurrency(emp.ssnit_employee + emp.ssnit_employer)
  ]);

  // Calculate totals
  const totalBasicSalary = processedEmployees.reduce((sum, emp) => sum + emp.basic_salary, 0);
  const totalEmployeeSSNIT = processedEmployees.reduce((sum, emp) => sum + emp.ssnit_employee, 0);
  const totalEmployerSSNIT = processedEmployees.reduce((sum, emp) => sum + emp.ssnit_employer, 0);
  const totalSSNIT = totalEmployeeSSNIT + totalEmployerSSNIT;

  autoTable(doc, {
    startY: yPosition,
    head: [[
      'Employee Name',
      'SSNIT Number',
      'Basic Salary\n(GHS)',
      'Employee (5.5%)\n(GHS)',
      'Employer (13%)\n(GHS)',
      'Total Contrib.\n(GHS)'
    ]],
    body: tableData,
    foot: [[
      `Total (${processedEmployees.length} employees)`,
      '',
      formatCurrency(totalBasicSalary),
      formatCurrency(totalEmployeeSSNIT),
      formatCurrency(totalEmployerSSNIT),
      formatCurrency(totalSSNIT)
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [109, 40, 217],
      fontSize: 9,
      halign: 'center',
      valign: 'middle'
    },
    footStyles: {
      fillColor: [233, 213, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 10
    },
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 30, fontSize: 7 },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Summary Boxes
  const boxWidth = (pageWidth - 40) / 3;
  const boxHeight = 20;
  const boxY = yPosition;

  // Employee Contribution Box
  doc.setFillColor(233, 213, 255);
  doc.rect(14, boxY, boxWidth, boxHeight, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Contribution', 14 + boxWidth / 2, boxY + 7, { align: 'center' });
  doc.setFontSize(11);
  doc.text(formatCurrency(totalEmployeeSSNIT), 14 + boxWidth / 2, boxY + 15, { align: 'center' });

  // Employer Contribution Box
  doc.setFillColor(196, 181, 253);
  doc.rect(14 + boxWidth + 3, boxY, boxWidth, boxHeight, 'F');
  doc.setFontSize(9);
  doc.text('Employer Contribution', 14 + boxWidth + 3 + boxWidth / 2, boxY + 7, { align: 'center' });
  doc.setFontSize(11);
  doc.text(formatCurrency(totalEmployerSSNIT), 14 + boxWidth + 3 + boxWidth / 2, boxY + 15, { align: 'center' });

  // Total Contribution Box
  doc.setFillColor(109, 40, 217);
  doc.setTextColor(255, 255, 255);
  doc.rect(14 + 2 * boxWidth + 6, boxY, boxWidth, boxHeight, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PAYABLE', 14 + 2 * boxWidth + 6 + boxWidth / 2, boxY + 7, { align: 'center' });
  doc.setFontSize(12);
  doc.text(formatCurrency(totalSSNIT), 14 + 2 * boxWidth + 6 + boxWidth / 2, boxY + 15, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  yPosition += boxHeight + 15;

  // Payment Breakdown
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Breakdown:', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Employee Deductions (to be remitted): ${formatCurrency(totalEmployeeSSNIT)}`, 20, yPosition);
  yPosition += 6;
  doc.text(`• Employer Contribution (company pays): ${formatCurrency(totalEmployerSSNIT)}`, 20, yPosition);
  yPosition += 6;
  doc.text(`• Total Amount Due to SSNIT: ${formatCurrency(totalSSNIT)}`, 20, yPosition);
  yPosition += 15;

  // Declaration
  doc.setFontSize(10);
  doc.text('Declaration:', 14, yPosition);
  yPosition += 6;
  doc.setFontSize(9);
  doc.text('I certify that the information provided in this contribution schedule is accurate and complete.', 14, yPosition);
  yPosition += 15;

  // Signature Lines
  doc.setFontSize(10);
  doc.line(14, yPosition, 80, yPosition);
  doc.line(120, yPosition, 190, yPosition);
  yPosition += 5;
  doc.text('Authorized Signature', 14, yPosition);
  doc.text('Date', 120, yPosition);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, pageWidth / 2, footerY, { align: 'center' });
  doc.text('Ghana Payroll Calculator - For official submission to SSNIT', pageWidth / 2, footerY + 4, { align: 'center' });

  return doc;
}

/**
 * Generate and download payslips for all employees
 * Creates a single PDF with multiple pages (one per employee)
 *
 * @param processedEmployees - Array of all processed employees
 * @param companySettings - Company information
 */
export function downloadAllPayslips(
  processedEmployees: ProcessedEmployee[],
  companySettings: CompanySettings
): void {
  if (processedEmployees.length === 0) {
    alert('No employees to generate payslips for.');
    return;
  }

  // Generate first payslip
  const doc = generatePayslip(processedEmployees[0], companySettings);

  // Add remaining payslips as new pages
  for (let i = 1; i < processedEmployees.length; i++) {
    doc.addPage();
    const tempDoc = generatePayslip(processedEmployees[i], companySettings);

    // Copy content from temp doc to main doc
    // Note: This copies the current page content
    const pageContent = (tempDoc as any).internal.pages[1];
    (doc as any).internal.pages[(doc as any).internal.pages.length - 1] = pageContent;
  }

  // Download the PDF
  const filename = `payslips_${companySettings.payroll_month}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Download individual payslip for a single employee
 *
 * @param employee - Processed employee data
 * @param companySettings - Company information
 */
export function downloadSinglePayslip(
  employee: ProcessedEmployee,
  companySettings: CompanySettings
): void {
  const doc = generatePayslip(employee, companySettings);
  const filename = `payslip_${employee.employee_id || employee.employee_name.replace(/\s+/g, '_')}_${companySettings.payroll_month}.pdf`;
  doc.save(filename);
}

/**
 * Download GRA PAYE report
 *
 * @param processedEmployees - Array of all processed employees
 * @param companySettings - Company information
 */
export function downloadGRAReport(
  processedEmployees: ProcessedEmployee[],
  companySettings: CompanySettings
): void {
  if (processedEmployees.length === 0) {
    alert('No employees to generate report for.');
    return;
  }

  const doc = generateGRAReport(processedEmployees, companySettings);
  const filename = `GRA_PAYE_Report_${companySettings.payroll_month}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Download SSNIT contribution report
 *
 * @param processedEmployees - Array of all processed employees
 * @param companySettings - Company information
 */
export function downloadSSNITReport(
  processedEmployees: ProcessedEmployee[],
  companySettings: CompanySettings
): void {
  if (processedEmployees.length === 0) {
    alert('No employees to generate report for.');
    return;
  }

  const doc = generateSSNITReport(processedEmployees, companySettings);
  const filename = `SSNIT_Contribution_Report_${companySettings.payroll_month}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Helper function to format payroll month for display
 *
 * @param payrollMonth - Month in YYYY-MM format
 * @returns Formatted month string (e.g., "January 2026")
 */
function formatPayrollMonth(payrollMonth: string): string {
  try {
    const [year, month] = payrollMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  } catch {
    return payrollMonth;
  }
}
