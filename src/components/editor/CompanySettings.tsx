import { useState } from 'react';
import { usePayrollState, usePayrollDispatch } from '../../context/PayrollContext';
import { Input } from '../shared/Input';
import { validateCompanySettings } from '../../lib/validators';
import { getCurrentMonth } from '../../utils/formatting';

export function CompanySettings() {
  const state = usePayrollState();
  const dispatch = usePayrollDispatch();
  const [isExpanded, setIsExpanded] = useState(true);

  const { companySettings } = state;

  const handleChange = (field: keyof typeof companySettings, value: string) => {
    dispatch({
      type: 'UPDATE_COMPANY_SETTING',
      payload: { field, value }
    });
  };

  // Validate settings
  const errors = validateCompanySettings(companySettings);
  const getFieldError = (field: string) => {
    const error = errors.find(e => e.field === field);
    return error?.message;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6">
      {/* Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <svg
            className={`w-5 h-5 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">Company Settings</h3>
            <p className="text-sm text-gray-500">
              {companySettings.company_name || 'Click to configure company information'}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {errors.length > 0 && (
            <span className="text-red-600 mr-2">{errors.length} error{errors.length > 1 ? 's' : ''}</span>
          )}
          {isExpanded ? 'Collapse' : 'Expand'}
        </div>
      </button>

      {/* Content - Expandable */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <Input
              label="Company Name"
              value={companySettings.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              placeholder="e.g., ABC Company Ltd"
              required
              error={getFieldError('company_name')}
            />

            {/* Company TIN */}
            <Input
              label="Company TIN"
              value={companySettings.company_tin}
              onChange={(e) => handleChange('company_tin', e.target.value)}
              placeholder="P0000000000"
              required
              error={getFieldError('company_tin')}
              helperText="Format: P followed by 10 digits"
              maxLength={11}
            />

            {/* SSNIT Employer Number */}
            <Input
              label="SSNIT Employer Number"
              value={companySettings.company_ssnit}
              onChange={(e) => handleChange('company_ssnit', e.target.value)}
              placeholder="C00000000000"
              required
              error={getFieldError('company_ssnit')}
              helperText="Format: C followed by 11 digits"
              maxLength={12}
            />

            {/* Payroll Month */}
            <Input
              label="Payroll Month"
              type="month"
              value={companySettings.payroll_month}
              onChange={(e) => handleChange('payroll_month', e.target.value)}
              required
              error={getFieldError('payroll_month')}
              helperText="Month for which payroll is being processed"
            />

            {/* Company Address */}
            <div className="md:col-span-2">
              <Input
                label="Company Address"
                value={companySettings.company_address || ''}
                onChange={(e) => handleChange('company_address', e.target.value)}
                placeholder="e.g., 123 Independence Avenue, Accra"
                helperText="Optional - appears on payslips"
              />
            </div>
          </div>

          {/* Summary Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Info</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• This information will appear on all payslips and reports</li>
              <li>• Settings are automatically saved to your browser</li>
              <li>• All fields except address are required</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
