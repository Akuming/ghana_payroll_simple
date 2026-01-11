import { useState } from 'react';
import { Button } from '../shared/Button';
import { generateTemplate, downloadBlob, generateFilename } from '../../lib/excelHandler';

export function TemplateDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);

    try {
      // Generate template
      const blob = generateTemplate();

      // Download
      const filename = generateFilename('payroll_template');
      downloadBlob(blob, filename);

      setIsDownloading(false);
    } catch (error) {
      console.error('Failed to generate template:', error);
      alert('Failed to generate template. Please try again.');
      setIsDownloading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">Download Excel Template</h3>
      <p className="mt-1 text-sm text-gray-500">
        First time? Download our template to get started
      </p>
      <div className="mt-4">
        <Button
          onClick={handleDownload}
          variant="outline"
          loading={isDownloading}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Template
        </Button>
      </div>

      {/* Template Info */}
      <div className="mt-6 text-left bg-blue-50 p-4 rounded-md">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Template Includes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Header row with all required column names</li>
          <li>• Example employee data (delete before filling)</li>
          <li>• Company settings sheet (optional)</li>
          <li>• Proper formatting and column widths</li>
        </ul>
      </div>
    </div>
  );
}
