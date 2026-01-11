import { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Button } from '../shared/Button';
import { exportToExcel, downloadBlob, generateFilename } from '../../lib/excelHandler';
import { clearAllData } from '../../lib/storage';

export function ActionBar() {
  const [state, dispatch] = usePayroll();
  const { employees, companySettings } = state;
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadExcel = () => {
    if (employees.length === 0) {
      alert('No employees to export. Please add employees first.');
      return;
    }

    setIsExporting(true);

    try {
      const blob = exportToExcel(employees, companySettings);
      const filename = generateFilename('payroll_data');
      downloadBlob(blob, filename);
      setIsExporting(false);
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Failed to export data. Please try again.');
      setIsExporting(false);
    }
  };

  const handleClearAll = () => {
    if (employees.length === 0) {
      alert('No data to clear.');
      return;
    }

    if (confirm(`Are you sure you want to clear all ${employees.length} employees and company settings? This cannot be undone.`)) {
      clearAllData();
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleDownloadExcel}
          variant="outline"
          size="sm"
          loading={isExporting}
          disabled={employees.length === 0}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download as Excel
        </Button>

        <Button
          onClick={handleClearAll}
          variant="outline"
          size="sm"
          disabled={employees.length === 0}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All
        </Button>
      </div>

      <div className="text-sm text-gray-600">
        {employees.length > 0 ? (
          <>
            <span className="font-medium">{employees.length}</span> employee{employees.length !== 1 ? 's' : ''} •
            <span className="text-gray-500 ml-2">Auto-saved to browser</span>
          </>
        ) : (
          <span className="text-gray-400">No employees added yet</span>
        )}
      </div>
    </div>
  );
}
