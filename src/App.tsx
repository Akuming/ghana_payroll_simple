import { usePayroll } from './context/PayrollContext'
import { CompanySettings } from './components/editor/CompanySettings'
import { EmployeeTable } from './components/editor/EmployeeTable'
import { ActionBar } from './components/editor/ActionBar'
import { FileUpload } from './components/upload/FileUpload'
import { TemplateDownload } from './components/upload/TemplateDownload'
import { ProcessedResults } from './components/results/ProcessedResults'
import { Button } from './components/shared/Button'
import { Card } from './components/shared/Card'
import { InfoMessage } from './components/shared/ErrorMessage'
import { formatEmployeeCount } from './utils/formatting'
import { getStorageInfo } from './lib/storage'

function App() {
  const [state, dispatch] = usePayroll()
  const { currentTab, employees, processedEmployees } = state

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
          <div className="space-y-6">
            {/* Show results if processed */}
            {processedEmployees && processedEmployees.length > 0 ? (
              <ProcessedResults />
            ) : (
              <>
                {/* Company Settings */}
                <CompanySettings />

                {/* Action Bar */}
                <ActionBar />

                {/* Employee Editor */}
                <Card title="Employee Editor" subtitle="Add and manage employee payroll data">
                  <EmployeeTable />
                </Card>
              </>
            )}
          </div>
        )}

        {currentTab === 'upload' && (
          <div className="space-y-6">
            {/* Template Download */}
            <TemplateDownload />

            {/* File Upload */}
            <Card title="Upload Excel File" subtitle="Upload your filled payroll data">
              <FileUpload />
            </Card>
          </div>
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
