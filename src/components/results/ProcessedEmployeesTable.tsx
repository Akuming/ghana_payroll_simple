import { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, CellStyle } from 'ag-grid-community';
import type { ProcessedEmployee } from '../../types/employee';
import { formatCurrency } from '../../utils/formatting';

interface ProcessedEmployeesTableProps {
  processedEmployees: ProcessedEmployee[];
}

export function ProcessedEmployeesTable({ processedEmployees }: ProcessedEmployeesTableProps) {
  const gridRef = useRef<AgGridReact<ProcessedEmployee>>(null);

  // Column definitions
  const columnDefs = useMemo<ColDef<ProcessedEmployee>[]>(
    () => [
      {
        headerName: 'Employee Name',
        field: 'employee_name',
        width: 180,
        pinned: 'left',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Employee ID',
        field: 'employee_id',
        width: 120,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'TIN',
        field: 'tin',
        width: 140,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Basic Salary',
        field: 'basic_salary',
        width: 140,
        valueFormatter: (params) => formatCurrency(params.value || 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Allowances',
        field: 'allowances',
        width: 130,
        valueFormatter: (params) => formatCurrency(params.value || 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Bonus',
        field: 'bonus',
        width: 110,
        valueFormatter: (params) => formatCurrency(params.value || 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: { color: '#0891b2' } as CellStyle,
      },
      {
        headerName: 'OT Pay',
        field: 'overtime_pay',
        width: 110,
        valueFormatter: (params) => formatCurrency(params.value || 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: { color: '#0d9488' } as CellStyle,
      },
      {
        headerName: 'Gross Pay',
        field: 'gross_pay',
        width: 130,
        valueFormatter: (params) => formatCurrency(params.value || 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: { fontWeight: 'bold' } as CellStyle,
      },
      {
        headerName: 'SSNIT (Employee)',
        field: 'ssnit_employee',
        width: 150,
        valueFormatter: (params) => formatCurrency(params.value || 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: { color: '#7c3aed' } as CellStyle,
      },
      {
        headerName: 'SSNIT (Employer)',
        field: 'ssnit_employer',
        width: 150,
        valueFormatter: (params) => formatCurrency(params.value || 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: { color: '#6366f1' } as CellStyle,
      },
      {
        headerName: 'Taxable Income',
        field: 'taxable_income',
        width: 150,
        valueFormatter: (params) => formatCurrency(params.value || 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'PAYE Tax',
        field: 'paye',
        width: 130,
        valueFormatter: (params) => formatCurrency(params.value || 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: { color: '#ea580c' } as CellStyle,
      },
      {
        headerName: 'Bonus Tax',
        field: 'bonus_tax',
        width: 110,
        valueFormatter: (params) => formatCurrency(params.value || 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: { color: '#d946ef' } as CellStyle,
      },
      {
        headerName: 'Total Deductions',
        field: 'total_deductions',
        width: 150,
        valueFormatter: (params) => formatCurrency(params.value || 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: { fontWeight: 'bold', color: '#dc2626' } as CellStyle,
      },
      {
        headerName: 'Net Pay',
        field: 'net_pay',
        width: 140,
        valueFormatter: (params) => formatCurrency(params.value || 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: { fontWeight: 'bold', color: '#16a34a' } as CellStyle,
        pinned: 'right',
      },
    ],
    []
  );

  // Default column definition
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      editable: false,
    }),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Processed Employee Details
          </h3>
          <p className="text-sm text-gray-500">
            {processedEmployees.length} employee{processedEmployees.length !== 1 ? 's' : ''} processed
          </p>
        </div>
      </div>

      {/* AG-Grid Table */}
      <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
        <AgGridReact<ProcessedEmployee>
          ref={gridRef}
          rowData={processedEmployees}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          pagination={true}
          paginationPageSize={20}
          domLayout="normal"
        />
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-md text-sm">
        <h4 className="font-semibold mb-2 text-gray-700">Column Legend:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600">
          <div>
            <span className="font-medium">OT Pay:</span> Overtime Hours x (Basic/176) x 1.5
          </div>
          <div>
            <span className="font-medium">Gross Pay:</span> Basic + Allowances + OT Pay + Bonus
          </div>
          <div>
            <span className="font-medium">SSNIT Employee:</span> 5.5% of Basic Salary only
          </div>
          <div>
            <span className="font-medium">SSNIT Employer:</span> 13% of Basic Salary (company pays)
          </div>
          <div>
            <span className="font-medium">Taxable Income:</span> Gross Pay - SSNIT - Bonus
          </div>
          <div>
            <span className="font-medium">PAYE Tax:</span> Progressive tax on Taxable Income
          </div>
          <div>
            <span className="font-medium">Bonus Tax:</span> Flat 5% on Bonus amount
          </div>
          <div>
            <span className="font-medium">Total Deductions:</span> SSNIT + PAYE + Bonus Tax
          </div>
          <div>
            <span className="font-medium">Net Pay:</span> Gross Pay - Total Deductions
          </div>
        </div>
      </div>
    </div>
  );
}
