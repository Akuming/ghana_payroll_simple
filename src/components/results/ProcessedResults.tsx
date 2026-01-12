import { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { SummaryCards } from './SummaryCards';
import { ProcessedEmployeesTable } from './ProcessedEmployeesTable';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { SuccessMessage } from '../shared/ErrorMessage';
import { exportProcessedToExcel, downloadBlob, generateFilename } from '../../lib/excelHandler';
import { downloadAllPayslips, downloadGRAReport, downloadSSNITReport } from '../../lib/pdfGenerator';

export function ProcessedResults() {
  const [state, dispatch] = usePayroll();
  const { processedEmployees, companySettings } = state;
  const [isExporting, setIsExporting] = useState(false);

  if (!processedEmployees || processedEmployees.length === 0) {
    return null;
  }

  const handleExportResults = () => {
    setIsExporting(true);
    try {
      const blob = exportProcessedToExcel(processedEmployees, companySettings);
      const filename = generateFilename('payroll_results');
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Failed to export results:', error);
      alert('Failed to export results. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPayslips = () => {
    try {
      downloadAllPayslips(processedEmployees, companySettings);
    } catch (error) {
      console.error('Failed to generate payslips:', error);
      alert('Failed to generate payslips. Please try again.');
    }
  };

  const handleDownloadGRAReport = () => {
    try {
      downloadGRAReport(processedEmployees, companySettings);
    } catch (error) {
      console.error('Failed to generate GRA report:', error);
      alert('Failed to generate GRA report. Please try again.');
    }
  };

  const handleDownloadSSNITReport = () => {
    try {
      downloadSSNITReport(processedEmployees, companySettings);
    } catch (error) {
      console.error('Failed to generate SSNIT report:', error);
      alert('Failed to generate SSNIT report. Please try again.');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear the results? This will not delete your employee data.')) {
      dispatch({ type: 'RESET_RESULTS' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <SuccessMessage>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Payroll Processed Successfully!</p>
            <p className="text-sm mt-1">
              {processedEmployees.length} employee{processedEmployees.length !== 1 ? 's' : ''} processed for {companySettings.payroll_month}
            </p>
          </div>
          <Button onClick={handleReset} variant="outline" size="sm">
            Clear Results
          </Button>
        </div>
      </SuccessMessage>

      {/* Summary Cards */}
      <SummaryCards processedEmployees={processedEmployees} />

      {/* Download Options */}
      <Card title="Download Reports" subtitle="Export payslips and statutory reports">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={handleExportResults}
            variant="primary"
            loading={isExporting}
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel Results
          </Button>

          <Button
            onClick={handleDownloadPayslips}
            variant="outline"
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Payslips (PDF)
          </Button>

          <Button
            onClick={handleDownloadGRAReport}
            variant="outline"
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            GRA Report (PDF)
          </Button>

          <Button
            onClick={handleDownloadSSNITReport}
            variant="outline"
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            SSNIT Report (PDF)
          </Button>
        </div>

        <div className="mt-4 text-sm text-gray-500 bg-green-50 p-3 rounded-md">
          <p className="font-semibold text-green-900 mb-1">Download Options:</p>
          <p className="text-green-800">
            <strong>Excel Results:</strong> Complete payroll data with all calculations in spreadsheet format.<br/>
            <strong>Payslips (PDF):</strong> Individual payslips for all employees in a single PDF file.<br/>
            <strong>GRA Report (PDF):</strong> Official PAYE monthly return for Ghana Revenue Authority.<br/>
            <strong>SSNIT Report (PDF):</strong> Official contribution report for Social Security submission.
          </p>
        </div>
      </Card>

      {/* Processed Employees Table */}
      <Card>
        <ProcessedEmployeesTable processedEmployees={processedEmployees} />
      </Card>
    </div>
  );
}
