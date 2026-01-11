import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { Employee, ProcessedEmployee, ValidationError } from '../types/employee';
import type { CompanySettings } from '../types/company';
import { getCurrentMonth } from '../utils/formatting';
import { loadCompanySettings, loadEmployees, saveCompanySettings, saveEmployees } from '../lib/storage';
import { processEmployee } from '../lib/calculator';

// Application state interface
export interface AppState {
  // Data
  companySettings: CompanySettings;
  employees: Employee[];
  processedEmployees: ProcessedEmployee[] | null;

  // UI State
  currentTab: 'editor' | 'upload' | 'help';
  showResults: boolean;

  // Validation
  validationErrors: ValidationError[];

  // Loading states
  isProcessing: boolean;
  isGeneratingPDF: boolean;
}

// Action types
export type Action =
  | { type: 'SET_COMPANY_SETTINGS'; payload: CompanySettings }
  | { type: 'UPDATE_COMPANY_SETTING'; payload: { field: keyof CompanySettings; value: string } }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: { index: number; employee: Employee } }
  | { type: 'DELETE_EMPLOYEE'; payload: number }
  | { type: 'PROCESS_PAYROLL' }
  | { type: 'SET_PROCESSED_EMPLOYEES'; payload: ProcessedEmployee[] }
  | { type: 'SET_TAB'; payload: 'editor' | 'upload' | 'help' }
  | { type: 'SHOW_RESULTS'; payload: boolean }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_GENERATING_PDF'; payload: boolean }
  | { type: 'RESET_RESULTS' }
  | { type: 'RESET' }
  | { type: 'LOAD_FROM_STORAGE' };

// Initial state
const initialState: AppState = {
  companySettings: {
    company_name: '',
    company_tin: '',
    company_ssnit: '',
    company_address: '',
    payroll_month: getCurrentMonth()
  },
  employees: [],
  processedEmployees: null,
  currentTab: 'editor',
  showResults: false,
  validationErrors: [],
  isProcessing: false,
  isGeneratingPDF: false
};

// Reducer function
function payrollReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_COMPANY_SETTINGS':
      return { ...state, companySettings: action.payload };

    case 'UPDATE_COMPANY_SETTING':
      return {
        ...state,
        companySettings: {
          ...state.companySettings,
          [action.payload.field]: action.payload.value
        }
      };

    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };

    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };

    case 'UPDATE_EMPLOYEE':
      const updatedEmployees = [...state.employees];
      updatedEmployees[action.payload.index] = action.payload.employee;
      return { ...state, employees: updatedEmployees };

    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter((_, i) => i !== action.payload)
      };

    case 'PROCESS_PAYROLL':
      return { ...state, isProcessing: true };

    case 'SET_PROCESSED_EMPLOYEES':
      return {
        ...state,
        processedEmployees: action.payload,
        isProcessing: false,
        showResults: true
      };

    case 'SET_TAB':
      return { ...state, currentTab: action.payload };

    case 'SHOW_RESULTS':
      return { ...state, showResults: action.payload };

    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };

    case 'SET_GENERATING_PDF':
      return { ...state, isGeneratingPDF: action.payload };

    case 'RESET_RESULTS':
      return {
        ...state,
        processedEmployees: null,
        showResults: false,
        isProcessing: false
      };

    case 'RESET':
      return initialState;

    case 'LOAD_FROM_STORAGE':
      const savedSettings = loadCompanySettings();
      const savedEmployees = loadEmployees();
      return {
        ...state,
        companySettings: savedSettings || state.companySettings,
        employees: savedEmployees
      };

    default:
      return state;
  }
}

// Context creation
const PayrollStateContext = createContext<AppState | undefined>(undefined);
const PayrollDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

// Provider component
interface PayrollProviderProps {
  children: ReactNode;
}

export function PayrollProvider({ children }: PayrollProviderProps) {
  const [state, dispatch] = useReducer(payrollReducer, initialState);

  // Load from storage on mount
  useEffect(() => {
    dispatch({ type: 'LOAD_FROM_STORAGE' });
  }, []);

  // Auto-save company settings when changed
  useEffect(() => {
    if (state.companySettings.company_name || state.companySettings.company_tin) {
      saveCompanySettings(state.companySettings);
    }
  }, [state.companySettings]);

  // Auto-save employees when changed
  useEffect(() => {
    if (state.employees.length > 0) {
      saveEmployees(state.employees);
    }
  }, [state.employees]);

  // Process payroll when isProcessing is true
  useEffect(() => {
    if (state.isProcessing && state.employees.length > 0) {
      // Process all employees
      const processed = state.employees.map(emp => processEmployee(emp));

      // Dispatch the processed results
      dispatch({ type: 'SET_PROCESSED_EMPLOYEES', payload: processed });
    }
  }, [state.isProcessing, state.employees]);

  return (
    <PayrollStateContext.Provider value={state}>
      <PayrollDispatchContext.Provider value={dispatch}>
        {children}
      </PayrollDispatchContext.Provider>
    </PayrollStateContext.Provider>
  );
}

// Custom hooks for using context
export function usePayrollState(): AppState {
  const context = useContext(PayrollStateContext);
  if (context === undefined) {
    throw new Error('usePayrollState must be used within PayrollProvider');
  }
  return context;
}

export function usePayrollDispatch(): React.Dispatch<Action> {
  const context = useContext(PayrollDispatchContext);
  if (context === undefined) {
    throw new Error('usePayrollDispatch must be used within PayrollProvider');
  }
  return context;
}

// Combined hook for convenience
export function usePayroll(): [AppState, React.Dispatch<Action>] {
  return [usePayrollState(), usePayrollDispatch()];
}
