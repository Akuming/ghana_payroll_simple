import { useState } from 'react'

function App() {
  const [currentTab, setCurrentTab] = useState<'editor' | 'upload' | 'help'>('editor')

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
            <div className="text-sm text-gray-500">
              v1.0.0
            </div>
          </div>
        </div>
      </header>

      {/* Privacy Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="privacy-notice">
          <p className="font-semibold mb-1">Your Privacy is Protected</p>
          <p>
            Your payroll data is processed entirely in your browser. No information is sent to any server
            or stored anywhere. When you close or refresh this page, all data is cleared.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setCurrentTab('editor')}
              className={`${
                currentTab === 'editor'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Editor
            </button>
            <button
              onClick={() => setCurrentTab('upload')}
              className={`${
                currentTab === 'upload'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Upload & Process
            </button>
            <button
              onClick={() => setCurrentTab('help')}
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Payroll Editor</h2>
            <p className="text-gray-600">
              Editor component will be implemented here. This is the foundation setup.
            </p>
          </div>
        )}

        {currentTab === 'upload' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upload & Process</h2>
            <p className="text-gray-600">
              Upload component will be implemented here.
            </p>
          </div>
        )}

        {currentTab === 'help' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Help & Information</h2>

            <div className="space-y-4">
              <section>
                <h3 className="font-semibold text-lg mb-2">How to Use</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Enter your company information in the Editor tab</li>
                  <li>Add employee details (name, TIN, SSNIT, salary)</li>
                  <li>Click "Calculate Payroll" to process</li>
                  <li>Download payslips and reports</li>
                </ol>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">Tax Rates (2024)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Income Range (GHS)</th>
                        <th className="px-4 py-2 text-left">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr><td className="px-4 py-2">0 - 490</td><td className="px-4 py-2">0%</td></tr>
                      <tr><td className="px-4 py-2">491 - 600</td><td className="px-4 py-2">5%</td></tr>
                      <tr><td className="px-4 py-2">601 - 730</td><td className="px-4 py-2">10%</td></tr>
                      <tr><td className="px-4 py-2">731 - 3,896.67</td><td className="px-4 py-2">17.5%</td></tr>
                      <tr><td className="px-4 py-2">3,896.68 - 19,896.67</td><td className="px-4 py-2">25%</td></tr>
                      <tr><td className="px-4 py-2">19,896.68 - 50,416.67</td><td className="px-4 py-2">30%</td></tr>
                      <tr><td className="px-4 py-2">Above 50,416.67</td><td className="px-4 py-2">35%</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">SSNIT Rates</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Employee Contribution: 5.5% of basic salary</li>
                  <li>Employer Contribution: 13% of basic salary</li>
                </ul>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-auto">
        <div className="text-center text-sm text-gray-500">
          <p>Ghana Payroll Calculator - Open Source Project</p>
          <p className="mt-1">All calculations are performed locally in your browser</p>
        </div>
      </footer>
    </div>
  )
}

export default App
