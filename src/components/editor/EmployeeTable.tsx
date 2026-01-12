import { useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent, CellValueChangedEvent } from 'ag-grid-community';
import { usePayroll } from '../../context/PayrollContext';
import { validateEmployee, generateEmployeeId } from '../../lib/validators';
import type { Employee } from '../../types/employee';
import { Button } from '../shared/Button';

export function EmployeeTable() {
  const [state, dispatch] = usePayroll();
  const { employees } = state;
  const gridRef = useRef<AgGridReact<Employee>>(null);

  // Column definitions with validation
  const columnDefs = useMemo<ColDef<Employee>[]>(() => [
    {
      headerName: '',
      width: 80,
      pinned: 'left',
      cellRenderer: (params: any) => {
        return (
          <button
            onClick={() => handleDeleteEmployee(params.node.rowIndex)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete employee"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        );
      },
      editable: false,
      sortable: false,
      filter: false
    },
    {
      headerName: 'Employee Name*',
      field: 'employee_name',
      width: 200,
      editable: true,
      cellEditor: 'agTextCellEditor',
      cellClass: (params) => {
        if (!params.data) return '';
        const errors = validateEmployee(params.data, params.node?.rowIndex || 0);
        const hasError = errors.some(e => e.field === 'employee_name');
        return hasError ? 'border-2 border-red-500' : '';
      },
      tooltipValueGetter: (params) => {
        if (!params.data || !params.node) return '';
        const errors = validateEmployee(params.data, params.node.rowIndex || 0);
        const error = errors.find(e => e.field === 'employee_name');
        return error?.message || '';
      }
    },
    {
      headerName: 'Employee ID',
      field: 'employee_id',
      width: 120,
      editable: true,
      cellEditor: 'agTextCellEditor',
      tooltipValueGetter: () => 'Optional - auto-generated if blank'
    },
    {
      headerName: 'TIN*',
      field: 'tin',
      width: 150,
      editable: true,
      cellEditor: 'agTextCellEditor',
      cellClass: (params) => {
        if (!params.data) return '';
        const errors = validateEmployee(params.data, params.node?.rowIndex || 0);
        const hasError = errors.some(e => e.field === 'tin');
        return hasError ? 'border-2 border-red-500' : '';
      },
      tooltipValueGetter: (params) => {
        if (!params.data || !params.node) return 'Format: P followed by 10 digits';
        const errors = validateEmployee(params.data, params.node.rowIndex || 0);
        const error = errors.find(e => e.field === 'tin');
        return error?.message || 'Format: P followed by 10 digits';
      }
    },
    {
      headerName: 'SSNIT Number*',
      field: 'ssnit_number',
      width: 150,
      editable: true,
      cellEditor: 'agTextCellEditor',
      cellClass: (params) => {
        if (!params.data) return '';
        const errors = validateEmployee(params.data, params.node?.rowIndex || 0);
        const hasError = errors.some(e => e.field === 'ssnit_number');
        return hasError ? 'border-2 border-red-500' : '';
      },
      tooltipValueGetter: (params) => {
        if (!params.data || !params.node) return 'Format: C followed by 11 digits';
        const errors = validateEmployee(params.data, params.node.rowIndex || 0);
        const error = errors.find(e => e.field === 'ssnit_number');
        return error?.message || 'Format: C followed by 11 digits';
      }
    },
    {
      headerName: 'Basic Salary (GHS)*',
      field: 'basic_salary',
      width: 150,
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 0,
        precision: 2
      },
      valueFormatter: (params) => {
        return params.value ? params.value.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
      },
      cellClass: (params) => {
        if (!params.data) return '';
        const errors = validateEmployee(params.data, params.node?.rowIndex || 0);
        const hasError = errors.some(e => e.field === 'basic_salary');
        return hasError ? 'border-2 border-red-500' : '';
      },
      tooltipValueGetter: (params) => {
        if (!params.data || !params.node) return '';
        const errors = validateEmployee(params.data, params.node.rowIndex || 0);
        const error = errors.find(e => e.field === 'basic_salary');
        return error?.message || '';
      }
    },
    {
      headerName: 'Allowances (GHS)',
      field: 'allowances',
      width: 150,
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 0,
        precision: 2
      },
      valueFormatter: (params) => {
        return params.value ? params.value.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
      },
      cellClass: (params) => {
        if (!params.data) return '';
        const errors = validateEmployee(params.data, params.node?.rowIndex || 0);
        const hasError = errors.some(e => e.field === 'allowances');
        return hasError ? 'border-2 border-red-500' : '';
      }
    },
    {
      headerName: 'Bonus (GHS)',
      field: 'bonus',
      width: 130,
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 0,
        precision: 2
      },
      valueFormatter: (params) => {
        return params.value ? params.value.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
      },
      cellClass: (params) => {
        if (!params.data) return '';
        const errors = validateEmployee(params.data, params.node?.rowIndex || 0);
        const hasError = errors.some(e => e.field === 'bonus');
        return hasError ? 'border-2 border-red-500' : '';
      },
      tooltipValueGetter: () => 'Optional - taxed at 5% flat rate'
    },
    {
      headerName: 'Overtime Hrs',
      field: 'overtime_hours',
      width: 120,
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 0,
        precision: 1
      },
      valueFormatter: (params) => {
        return params.value ? params.value.toFixed(1) : '';
      },
      cellClass: (params) => {
        if (!params.data) return '';
        const errors = validateEmployee(params.data, params.node?.rowIndex || 0);
        const hasError = errors.some(e => e.field === 'overtime_hours');
        return hasError ? 'border-2 border-red-500' : '';
      },
      tooltipValueGetter: () => 'Optional - paid at 1.5x hourly rate'
    },
    {
      headerName: 'Bank Name',
      field: 'bank_name',
      width: 150,
      editable: true,
      cellEditor: 'agTextCellEditor'
    },
    {
      headerName: 'Account Number',
      field: 'account_number',
      width: 150,
      editable: true,
      cellEditor: 'agTextCellEditor'
    },
    {
      headerName: 'Mobile Money',
      field: 'mobile_money',
      width: 150,
      editable: true,
      cellEditor: 'agTextCellEditor',
      cellClass: (params) => {
        if (!params.data) return '';
        const errors = validateEmployee(params.data, params.node?.rowIndex || 0);
        const hasError = errors.some(e => e.field === 'mobile_money');
        return hasError ? 'border-2 border-red-500' : '';
      },
      tooltipValueGetter: (params) => {
        if (!params.data || !params.node) return 'Optional - Ghana phone format';
        const errors = validateEmployee(params.data, params.node.rowIndex || 0);
        const error = errors.find(e => e.field === 'mobile_money');
        return error?.message || 'Optional - Ghana phone format';
      }
    }
  ], []);

  // Default column definition
  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    editable: false,
    tooltipComponent: undefined
  }), []);

  // Handle cell value changes
  const onCellValueChanged = useCallback((event: CellValueChangedEvent<Employee>) => {
    const updatedEmployee = event.data;
    const rowIndex = event.node.rowIndex;

    if (rowIndex !== null && rowIndex !== undefined) {
      // Auto-generate employee ID if blank
      if (!updatedEmployee.employee_id) {
        updatedEmployee.employee_id = generateEmployeeId(rowIndex);
      }

      dispatch({
        type: 'UPDATE_EMPLOYEE',
        payload: { index: rowIndex, employee: updatedEmployee }
      });
    }
  }, [dispatch]);

  // Handle grid ready
  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Auto-size columns on ready
    params.api.sizeColumnsToFit();
  }, []);

  // Add new employee
  const handleAddEmployee = useCallback(() => {
    const newEmployee: Employee = {
      employee_name: '',
      employee_id: generateEmployeeId(employees.length),
      tin: '',
      ssnit_number: '',
      basic_salary: 0,
      allowances: 0,
      bonus: 0,
      overtime_hours: 0,
      bank_name: '',
      account_number: '',
      mobile_money: ''
    };

    dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });

    // Focus on the new row
    setTimeout(() => {
      const rowCount = gridRef.current?.api.getDisplayedRowCount() || 0;
      gridRef.current?.api.ensureIndexVisible(rowCount - 1);
      gridRef.current?.api.setFocusedCell(rowCount - 1, 'employee_name');
      gridRef.current?.api.startEditingCell({
        rowIndex: rowCount - 1,
        colKey: 'employee_name'
      });
    }, 100);
  }, [employees.length, dispatch]);

  // Delete employee
  const handleDeleteEmployee = useCallback((rowIndex: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      dispatch({ type: 'DELETE_EMPLOYEE', payload: rowIndex });
    }
  }, [dispatch]);

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={handleAddEmployee} variant="primary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </Button>
          <span className="text-sm text-gray-500">
            {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          * Required fields
        </div>
      </div>

      {/* AG-Grid Table */}
      <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
        <AgGridReact<Employee>
          ref={gridRef}
          rowData={employees}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onCellValueChanged={onCellValueChanged}
          onGridReady={onGridReady}
          animateRows={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          tooltipShowDelay={500}
          stopEditingWhenCellsLoseFocus={true}
          singleClickEdit={true}
        />
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
        <h4 className="font-semibold mb-2">Quick Tips:</h4>
        <ul className="space-y-1">
          <li>• Click any cell to edit - changes are saved automatically</li>
          <li>• Press Tab to move to the next cell, Enter to move down</li>
          <li>• Employee ID is auto-generated if left blank</li>
          <li>• Hover over cells with red borders to see validation errors</li>
          <li>• <strong>Bonus:</strong> Taxed at flat 5% rate (separate from PAYE)</li>
          <li>• <strong>Overtime:</strong> Paid at 1.5x hourly rate, taxed through PAYE</li>
        </ul>
      </div>
    </div>
  );
}
