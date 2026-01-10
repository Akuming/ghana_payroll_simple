import { usePayroll } from './context/PayrollContext'
import { CompanySettings } from './components/editor/CompanySettings'
import { Button } from './components/shared/Button'
import { Card } from './components/shared/Card'
import { InfoMessage } from './components/shared/ErrorMessage'
import { formatEmployeeCount } from './utils/formatting'
import { getStorageInfo } from './lib/storage'

function App() {
  const [state, dispatch] = usePayroll()
  const { currentTab, employees } = state

  const storageInfo = getStorageInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ghana Payroll Calculator</h1>
              <p className="text-sm text-gray-600 mt-1">Free browser-based payroll processing</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">v1.0.0</div>
              {storageInfo.hasData && (
                <div className="text-xs text-gray-400 mt-1">
                  {formatEmployeeCount(storageInfo.employeeCount)} saved
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Privacy Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <InfoMessage>
          <p className="font-semibold mb-1">Your Privacy is Protected</p>
          <p>
            Your payroll data is processed entirely in your browser. No information is sent to any server
            or stored anywhere except your browser's local storage. When you clear browser data, all payroll information is removed.
          </p>
        </InfoMessage>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'editor' })}
              className={`${
                currentTab === 'editor'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Editor
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'upload' })}
              className={`${
                currentTab === 'upload'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Upload & Process
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'help' })}
              className={`${
                currentTab === 'help'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Help
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'editor' && (
          <div>
            {/* Company Settings */}
            <CompanySettings />

            {/* Employee Editor Placeholder */}
            <Card title="Employee Editor" subtitle="Add and manage employee payroll data">
              <div className="text-center py-12">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No employees added</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first employee or uploading an Excel file.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <Button variant="primary">
                    Add Employee
                  </Button>
                  <Button variant="outline">
                    Upload Excel
                  </Button>
                </div>
              </div>

              {/* Stats when employees exist */}
              {employees.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Employees</div>
                    <div className="text-2xl font-semibold text-gray-900">{employees.length}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Valid Records</div>
                    <div className="text-2xl font-semibold text-green-600">{employees.length}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Errors</div>
                    <div className="text-2xl font-semibold text-red-600">0</div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {currentTab === 'upload' && (
          <Card title="Upload & Process" subtitle="Upload an Excel file for quick payroll processing">
            <div className="space-y-6">
              {/* Template Download */}
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
                  <Button variant="outline">
                    Download Template
                  </Button>
                </div>
              </div>

              {/* File Upload */}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Upload Excel File</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Accepts .xlsx and .xls files (max 5MB)
                </p>
                <div className="mt-4">
                  <Button variant="primary">
                    Browse Files
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {currentTab === 'help' && (
          <div className="space-y-6">
            <Card title="How to Use" subtitle="Step-by-step guide">
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Enter your company information in the Editor tab</li>
                <li>Add employee details (name, TIN, SSNIT, salary, allowances)</li>
                <li>Click "Calculate Payroll" to process all calculations</li>
                <li>Review results and download payslips and reports</li>
              </ol>
            </Card>

            <Card title="Ghana PAYE Tax Rates (2024)" subtitle="Monthly income tax brackets">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Income Range (GHS)</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Tax Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr><td className="px-4 py-2">0 - 490</td><td className="px-4 py-2">0%</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2">491 - 600</td><td className="px-4 py-2">5%</td></tr>
                    <tr><td className="px-4 py-2">601 - 730</td><td className="px-4 py-2">10%</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2">731 - 3,896.67</td><td className="px-4 py-2">17.5%</td></tr>
                    <tr><td className="px-4 py-2">3,896.68 - 19,896.67</td><td className="px-4 py-2">25%</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-2">19,896.68 - 50,416.67</td><td className="px-4 py-2">30%</td></tr>
                    <tr><td className="px-4 py-2">Above 50,416.67</td><td className="px-4 py-2">35%</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="SSNIT Contribution Rates" subtitle="Social Security calculations">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Employee Contribution:</strong> 5.5% of basic salary (Tier 1 + 2)</li>
                <li><strong>Employer Contribution:</strong> 13% of basic salary</li>
                <li><strong>Important:</strong> SSNIT is calculated on basic salary only, not total gross pay</li>
              </ul>
            </Card>

            <Card title="Calculation Example" subtitle="Kofi Mensah - Basic: GHS 5,000 | Allowances: GHS 500">
              <div className="bg-gray-50 p-4 rounded-md font-mono text-sm space-y-1">
                <div>Gross Pay = 5,000 + 500 = <strong>GHS 5,500.00</strong></div>
                <div>SSNIT (Employee) = 5,000 × 5.5% = <strong>GHS 275.00</strong></div>
                <div>SSNIT (Employer) = 5,000 × 13% = <strong>GHS 650.00</strong></div>
                <div>Taxable Income = 5,500 - 275 = <strong>GHS 5,225.00</strong></div>
                <div>PAYE (Progressive) = <strong>GHS 904.75</strong></div>
                <div>Total Deductions = 275 + 904.75 = <strong>GHS 1,179.75</strong></div>
                <div className="text-lg font-bold text-green-600 pt-2">
                  Net Pay = 5,500 - 1,179.75 = <strong>GHS 4,320.25</strong>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>Ghana Payroll Calculator - Open Source Project</p>
          <p>All calculations are performed locally in your browser</p>
          <p className="text-xs mt-2">
            Built with React + TypeScript + Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
