# Ghana Payroll Calculator - Implementation Guide

**Version:** 1.0
**Date:** January 2026
**Based on:** ghana-payroll-prd-v2.md

---

## Table of Contents
1. [Overall Architecture Strategy](#overall-architecture-strategy)
2. [Technology Stack](#technology-stack)
3. [Implementation Phases](#implementation-phases)
4. [Critical Implementation Details](#critical-implementation-details)
5. [Project Structure](#project-structure)
6. [State Management](#state-management)
7. [Key Challenges & Solutions](#key-challenges--solutions)
8. [Testing Strategy](#testing-strategy)
9. [PDF Generation Approach](#pdf-generation-approach)
10. [MVP Simplifications](#mvp-simplifications)
11. [Deployment Strategy](#deployment-strategy)
12. [Risk Areas](#risk-areas)
13. [Build Order](#build-order)

---

## Overall Architecture Strategy

This is a client-side payroll system with no backend. All processing happens in the browser using modern web technologies.

**Core Principles:**
- Privacy-first: No data leaves the browser
- Offline-capable: Can work without internet after initial load
- Simple deployment: GitHub Pages static hosting
- Professional UX: Excel-like editing experience

---

## Technology Stack

### Recommended Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Framework** | React + TypeScript | Complex state management, type safety for calculations |
| **Build Tool** | Vite | Fast builds, modern bundling |
| **Styling** | Tailwind CSS | Rapid UI development, responsive utilities |
| **Table Component** | AG-Grid Community | Professional Excel-like editing, built-in validation |
| **State Management** | React Context + useReducer | Sufficient for this app, no Redux needed |
| **Excel Parsing** | SheetJS (xlsx) | Industry standard, robust |
| **PDF Generation** | jsPDF + jsPDF-AutoTable | Most popular, well-documented |
| **File Upload** | react-dropzone | Drag-drop UX |
| **Testing** | Vitest + React Testing Library | Fast, modern testing |

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.1",
    "ag-grid-react": "^31.0.0",
    "ag-grid-community": "^31.0.0",
    "react-dropzone": "^14.2.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Days 1-2)

**Focus:** Core business logic - calculator and validation

```
Priority 1: Calculator Engine
├── src/lib/calculator.ts (PAYE progressive brackets)
├── src/lib/validators.ts (TIN, SSNIT format validation)
└── src/lib/calculator.test.ts (Critical - test all tax brackets)
```

**Why start here?**
- Business logic is independent of UI
- Can be tested thoroughly
- Foundation for everything else

**Deliverables:**
- [x] PAYE calculation function with all 7 tax brackets
- [x] SSNIT calculation (employee + employer)
- [x] Complete calculation for an employee record
- [x] Validation functions for TIN, SSNIT formats
- [x] Comprehensive unit tests (>90% coverage)

---

### Phase 2: Excel Handler (Day 3)

**Focus:** Excel import/export functionality

```
├── src/lib/excelHandler.ts (SheetJS integration)
├── public/template.xlsx generation
└── Parse "Employees" + "Settings" sheets
```

**Deliverables:**
- [x] Generate downloadable template.xlsx
- [x] Parse uploaded Excel files
- [x] Read "Employees" sheet (columns A-I)
- [x] Read optional "Settings" sheet
- [x] Export employee data to Excel
- [x] Export processed results to Excel

---

### Phase 3: Basic UI Shell (Day 4)

**Focus:** Navigation and layout structure

```
├── Tab navigation (Editor | Upload | Help)
├── Company Settings Panel
└── Basic layout structure
```

**Deliverables:**
- [x] Tab-based navigation component
- [x] Company settings form (collapsible panel)
- [x] Basic responsive layout
- [x] Header with app branding

---

### Phase 4: Excel Editor - Most Complex (Days 5-7)

**Focus:** In-app spreadsheet editor

```
├── Editable table component (AG-Grid)
├── Inline validation with visual feedback
├── Row operations (add, delete, duplicate)
├── Keyboard navigation (Tab, Enter, Escape)
└── localStorage persistence
```

**Deliverables:**
- [x] AG-Grid integrated with custom cell editors
- [x] Real-time validation with visual feedback (red borders)
- [x] Add/delete employee rows
- [x] Keyboard navigation between cells
- [x] Auto-generate employee_id if blank
- [x] Save to localStorage on changes
- [x] Load from localStorage on app start

**AG-Grid Configuration Example:**
```typescript
const columnDefs: ColDef[] = [
  {
    field: 'employee_name',
    headerName: 'Name*',
    editable: true,
    cellEditor: 'agTextCellEditor',
    cellClass: (params) => params.value ? '' : 'border-red-500',
    valueSetter: (params) => {
      params.data.employee_name = params.newValue;
      validateAndUpdate(params.data);
      return true;
    }
  },
  {
    field: 'basic_salary',
    headerName: 'Basic Salary*',
    editable: true,
    cellEditor: 'agNumberCellEditor',
    valueParser: (params) => Number(params.newValue),
    cellClass: (params) => params.value > 0 ? '' : 'border-red-500'
  },
  // ... more columns
];
```

---

### Phase 5: Upload & Processing (Day 8)

**Focus:** File upload and direct processing flow

```
├── Drag-and-drop zone (react-dropzone)
├── File validation
└── "Edit First" vs "Process Now" flow
```

**Deliverables:**
- [x] Drag-and-drop file upload
- [x] File type validation (.xlsx, .xls)
- [x] File size validation (< 5MB)
- [x] Parse and validate uploaded data
- [x] Show validation errors
- [x] Route to Editor or Results based on user choice

---

### Phase 6: Results Display (Day 9)

**Focus:** Display calculated results

```
├── Summary cards (totals, SSNIT due, PAYE due)
├── Employee breakdown table
└── Download section UI
```

**Deliverables:**
- [x] Summary statistics cards
- [x] Employee results table (sortable)
- [x] Totals row in table
- [x] Download buttons section
- [x] Back to Editor navigation

---

### Phase 7: PDF Generation (Days 10-12) ⚠️ MOST TIME-CONSUMING

**Focus:** Generate all PDF reports

```
├── Individual payslip template
├── Bulk payslips (multi-page)
├── GRA PAYE Report
└── SSNIT Report
```

**Deliverables:**
- [x] Individual payslip PDF (matching PRD format)
- [x] Bulk payslips (all employees in one PDF)
- [x] GRA PAYE Report PDF
- [x] SSNIT Contribution Report PDF
- [x] Proper formatting, alignment, tables

**Note:** PDF generation takes longer than expected. Budget extra time here.

---

### Phase 8: Mobile + Polish (Days 13-14)

**Focus:** Mobile responsiveness and final touches

```
├── Card view for mobile editor (optional for MVP)
├── Responsive tables
└── Testing across devices
```

**Deliverables:**
- [x] Responsive layout (mobile, tablet, desktop)
- [x] Touch-friendly buttons (min 44px)
- [x] Horizontal scroll for tables on mobile
- [x] Collapsible sections on mobile
- [x] Test on iOS Safari, Android Chrome

---

### Phase 9: Deployment (Day 15)

**Focus:** GitHub Pages deployment

```
├── GitHub Actions workflow
├── GitHub Pages setup
└── Final testing on production URL
```

**Deliverables:**
- [x] Automated deployment pipeline
- [x] Production build optimizations
- [x] Final cross-browser testing
- [x] README with usage instructions

---

## Critical Implementation Details

### PAYE Calculation - The Tricky Part

```typescript
// IMPORTANT: Brackets are INCREMENTAL, not cumulative
const TAX_BRACKETS = [
  { limit: 490, rate: 0 },        // 0-490: tax-free
  { limit: 110, rate: 0.05 },     // NEXT 110 (490-600): 5%
  { limit: 130, rate: 0.10 },     // NEXT 130 (600-730): 10%
  { limit: 3166.67, rate: 0.175 },// NEXT 3166.67: 17.5%
  { limit: 16000, rate: 0.25 },   // NEXT 16000: 25%
  { limit: 30520, rate: 0.30 },   // NEXT 30520: 30%
  { limit: Infinity, rate: 0.35 } // Remainder: 35%
];

export function calculatePAYE(taxableIncome: number): number {
  let tax = 0;
  let remaining = taxableIncome;

  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.limit);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }

  return round(tax, 2);
}

// CRITICAL: Taxable income = Gross Pay - SSNIT Employee Contribution
// NOT just basic salary!
```

### SSNIT - The Gotcha

```typescript
// IMPORTANT: SSNIT applies to BASIC SALARY ONLY (not allowances!)
export function calculateSSNIT(basicSalary: number) {
  return {
    employee: round(basicSalary * 0.055, 2),  // NOT gross pay
    employer: round(basicSalary * 0.13, 2),
    total: round(basicSalary * 0.185, 2)
  };
}
```

### Complete Employee Calculation

```typescript
export interface Employee {
  employee_name: string;
  employee_id?: string;
  tin: string;
  ssnit_number: string;
  basic_salary: number;
  allowances?: number;
  bank_name?: string;
  account_number?: string;
  mobile_money?: string;
}

export interface ProcessedEmployee extends Employee {
  gross_pay: number;
  ssnit_employee: number;
  ssnit_employer: number;
  taxable_income: number;
  paye: number;
  total_deductions: number;
  net_pay: number;
}

export function processEmployee(employee: Employee): ProcessedEmployee {
  const basicSalary = employee.basic_salary || 0;
  const allowances = employee.allowances || 0;

  const grossPay = basicSalary + allowances;
  const ssnitEmployee = basicSalary * 0.055;
  const ssnitEmployer = basicSalary * 0.13;
  const taxableIncome = grossPay - ssnitEmployee;
  const paye = calculatePAYE(taxableIncome);
  const totalDeductions = ssnitEmployee + paye;
  const netPay = grossPay - totalDeductions;

  return {
    ...employee,
    gross_pay: round(grossPay, 2),
    ssnit_employee: round(ssnitEmployee, 2),
    ssnit_employer: round(ssnitEmployer, 2),
    taxable_income: round(taxableIncome, 2),
    paye: round(paye, 2),
    total_deductions: round(totalDeductions, 2),
    net_pay: round(netPay, 2)
  };
}

function round(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
```

### Validation Formats

```typescript
export const TIN_REGEX = /^P\d{10}$/;         // P + 10 digits
export const SSNIT_REGEX = /^C\d{11}$/;       // C + 11 digits
export const PHONE_REGEX = /^0\d{9}$/;        // Ghana phone format

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function validateEmployee(employee: Employee, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!employee.employee_name?.trim()) {
    errors.push({
      row: rowIndex,
      field: 'employee_name',
      message: 'Employee name is required'
    });
  }

  if (!employee.tin || !TIN_REGEX.test(employee.tin)) {
    errors.push({
      row: rowIndex,
      field: 'tin',
      message: 'Invalid TIN format (must be P followed by 10 digits)'
    });
  }

  if (!employee.ssnit_number || !SSNIT_REGEX.test(employee.ssnit_number)) {
    errors.push({
      row: rowIndex,
      field: 'ssnit_number',
      message: 'Invalid SSNIT number (must be C followed by 11 digits)'
    });
  }

  if (!employee.basic_salary || employee.basic_salary <= 0) {
    errors.push({
      row: rowIndex,
      field: 'basic_salary',
      message: 'Basic salary must be a positive number'
    });
  }

  if (employee.allowances && employee.allowances < 0) {
    errors.push({
      row: rowIndex,
      field: 'allowances',
      message: 'Allowances cannot be negative'
    });
  }

  return errors;
}
```

---

## Project Structure

```
ghana-payroll/
├── public/
│   ├── template.xlsx              # Downloadable template
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── editor/
│   │   │   ├── EmployeeTable.tsx      # AG-Grid table
│   │   │   ├── EmployeeRow.tsx        # Row component (if needed)
│   │   │   ├── EditableCell.tsx       # Custom cell editors
│   │   │   ├── CompanySettings.tsx    # Settings panel
│   │   │   └── ActionBar.tsx          # Add/Load/Save buttons
│   │   ├── upload/
│   │   │   ├── FileUpload.tsx         # Drag-drop zone
│   │   │   └── TemplateDownload.tsx   # Download template button
│   │   ├── results/
│   │   │   ├── ResultsView.tsx        # Main results page
│   │   │   ├── SummaryCard.tsx        # Stats cards
│   │   │   ├── EmployeeTable.tsx      # Results table
│   │   │   └── DownloadSection.tsx    # Download buttons
│   │   ├── shared/
│   │   │   ├── Tabs.tsx               # Tab navigation
│   │   │   ├── Button.tsx             # Reusable button
│   │   │   ├── Card.tsx               # Card component
│   │   │   └── ErrorMessage.tsx       # Error display
│   │   └── Layout.tsx                 # Main layout wrapper
│   ├── lib/
│   │   ├── calculator.ts              # PAYE & SSNIT calculations
│   │   ├── validators.ts              # Validation logic
│   │   ├── excelHandler.ts            # Excel import/export
│   │   ├── pdfGenerator.ts            # PDF generation
│   │   ├── storage.ts                 # localStorage wrapper
│   │   └── constants.ts               # Tax rates, formats
│   ├── types/
│   │   ├── employee.ts                # Employee interfaces
│   │   ├── company.ts                 # Company settings
│   │   └── results.ts                 # Calculation results
│   ├── utils/
│   │   ├── formatting.ts              # Currency, date formatting
│   │   └── helpers.ts                 # Misc utilities
│   ├── hooks/
│   │   ├── useEmployeeEditor.ts       # Editor state management
│   │   ├── useLocalStorage.ts         # Persist to localStorage
│   │   └── useFileUpload.ts           # File upload handling
│   ├── context/
│   │   └── PayrollContext.tsx         # Global state context
│   ├── App.tsx                        # Main app component
│   ├── main.tsx                       # Entry point
│   └── index.css                      # Global styles
├── tests/
│   ├── calculator.test.ts             # Core calculation tests
│   ├── validators.test.ts             # Validation tests
│   └── integration.test.tsx           # Integration tests
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Pages deployment
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── README.md
├── ghana-payroll-prd-v2.md           # Original PRD
└── IMPLEMENTATION_GUIDE.md            # This file
```

---

## State Management

### Application State Structure

```typescript
interface CompanySettings {
  company_name: string;
  company_tin: string;
  company_ssnit: string;
  company_address?: string;
  payroll_month: string; // YYYY-MM format
}

interface AppState {
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

type Action =
  | { type: 'SET_COMPANY_SETTINGS'; payload: CompanySettings }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: { index: number; employee: Employee } }
  | { type: 'DELETE_EMPLOYEE'; payload: number }
  | { type: 'PROCESS_PAYROLL' }
  | { type: 'SET_PROCESSED_EMPLOYEES'; payload: ProcessedEmployee[] }
  | { type: 'SET_TAB'; payload: 'editor' | 'upload' | 'help' }
  | { type: 'SHOW_RESULTS'; payload: boolean }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] }
  | { type: 'RESET' };
```

### Context Implementation

```typescript
// src/context/PayrollContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react';

const PayrollContext = createContext<AppState | undefined>(undefined);
const PayrollDispatch = createContext<Dispatch<Action> | undefined>(undefined);

function payrollReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_COMPANY_SETTINGS':
      return { ...state, companySettings: action.payload };

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

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

const initialState: AppState = {
  companySettings: {
    company_name: '',
    company_tin: '',
    company_ssnit: '',
    payroll_month: new Date().toISOString().slice(0, 7) // YYYY-MM
  },
  employees: [],
  processedEmployees: null,
  currentTab: 'editor',
  showResults: false,
  validationErrors: [],
  isProcessing: false,
  isGeneratingPDF: false
};

export function PayrollProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(payrollReducer, initialState);

  return (
    <PayrollContext.Provider value={state}>
      <PayrollDispatch.Provider value={dispatch}>
        {children}
      </PayrollDispatch.Provider>
    </PayrollContext.Provider>
  );
}

export function usePayrollState() {
  const context = useContext(PayrollContext);
  if (!context) throw new Error('usePayrollState must be used within PayrollProvider');
  return context;
}

export function usePayrollDispatch() {
  const context = useContext(PayrollDispatch);
  if (!context) throw new Error('usePayrollDispatch must be used within PayrollProvider');
  return context;
}
```

---

## Key Challenges & Solutions

| Challenge | Solution | Implementation Notes |
|-----------|----------|---------------------|
| **Excel editor UX** | Use AG-Grid Community | Professional editing with minimal code, built-in keyboard navigation |
| **PDF quality** | jsPDF-AutoTable for tables, custom templates | Create reusable template functions, test early |
| **Mobile table editing** | Detect viewport width, switch to card view | `useMediaQuery` hook, render different components |
| **localStorage limits** | Warn if > 1000 employees | localStorage has ~5-10MB limit, don't auto-save huge datasets |
| **Validation UX** | Real-time validation with debounce | Visual feedback (red border + tooltip), aggregate errors |
| **Large datasets (500+ rows)** | Virtual scrolling with AG-Grid | AG-Grid has built-in virtual scrolling |
| **Floating point errors** | Always round to 2 decimals | Use consistent rounding function everywhere |
| **Browser compatibility** | Test file downloads in Safari | Safari has quirks with blob downloads |
| **PDF file size** | Optimize fonts, use compression | Keep payslip PDFs < 100KB each |
| **Excel format variations** | Handle both .xlsx and .xls | SheetJS handles both, test with Google Sheets exports |

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// tests/calculator.test.ts
import { describe, test, expect } from 'vitest';
import { calculatePAYE, processEmployee } from '../src/lib/calculator';

describe('PAYE Calculation', () => {
  // Test case from Appendix B of PRD
  test('Kofi Mensah: basic 5000 + allowances 500 = PAYE 904.75', () => {
    const taxableIncome = 5500 - 275; // gross - ssnit_employee = 5225
    const paye = calculatePAYE(taxableIncome);
    expect(paye).toBe(904.75);
  });

  test('Below tax threshold: income 400 = PAYE 0', () => {
    const paye = calculatePAYE(400);
    expect(paye).toBe(0);
  });

  test('First bracket only: income 600 = PAYE ~2.20', () => {
    // First 490 @ 0% = 0
    // Next 110 @ 5% = 5.50
    const paye = calculatePAYE(600);
    expect(paye).toBe(5.50);
  });

  test('Mid-range salary verification', () => {
    const employee = {
      employee_name: 'Test Employee',
      tin: 'P0012345678',
      ssnit_number: 'C00123456789',
      basic_salary: 5000,
      allowances: 500
    };

    const result = processEmployee(employee);

    expect(result.gross_pay).toBe(5500);
    expect(result.ssnit_employee).toBe(275);
    expect(result.ssnit_employer).toBe(650);
    expect(result.taxable_income).toBe(5225);
    expect(result.paye).toBe(904.75);
    expect(result.net_pay).toBe(4320.25);
  });

  test('High salary edge case', () => {
    const employee = {
      employee_name: 'High Earner',
      tin: 'P0099999999',
      ssnit_number: 'C00999999999',
      basic_salary: 60000,
      allowances: 5000
    };

    const result = processEmployee(employee);

    // Verify calculations are reasonable
    expect(result.gross_pay).toBe(65000);
    expect(result.ssnit_employee).toBe(3300); // 60000 * 0.055
    expect(result.paye).toBeGreaterThan(19000);
  });

  test('Zero allowances should work', () => {
    const employee = {
      employee_name: 'No Allowances',
      tin: 'P0011111111',
      ssnit_number: 'C00111111111',
      basic_salary: 3000,
      allowances: 0
    };

    const result = processEmployee(employee);
    expect(result.allowances).toBe(0);
    expect(result.gross_pay).toBe(3000);
  });
});

describe('Validation', () => {
  test('Valid TIN format', () => {
    expect(TIN_REGEX.test('P0012345678')).toBe(true);
    expect(TIN_REGEX.test('P001234567')).toBe(false); // too short
    expect(TIN_REGEX.test('0012345678')).toBe(false); // no P
  });

  test('Valid SSNIT format', () => {
    expect(SSNIT_REGEX.test('C00123456789')).toBe(true);
    expect(SSNIT_REGEX.test('C0012345678')).toBe(false); // too short
    expect(SSNIT_REGEX.test('00123456789')).toBe(false); // no C
  });
});
```

### Integration Tests

```typescript
// tests/integration.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import App from '../src/App';

describe('End-to-end flow', () => {
  test('User can add employee, calculate payroll, and see results', async () => {
    render(<App />);

    // Fill company settings
    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: 'Test Company Ltd' }
    });

    // Add employee
    fireEvent.click(screen.getByText(/add employee/i));

    // Fill employee data
    // ... (fill in form fields)

    // Calculate payroll
    fireEvent.click(screen.getByText(/calculate payroll/i));

    // Verify results appear
    expect(screen.getByText(/payroll summary/i)).toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

- [ ] Upload valid Excel file
- [ ] Upload invalid Excel file (wrong format)
- [ ] Add 100+ employees (performance test)
- [ ] Validate all input fields
- [ ] Generate all PDF types
- [ ] Download Excel outputs
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test in different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test offline functionality (after initial load)
- [ ] Test localStorage persistence
- [ ] Clear localStorage and verify reset

---

## PDF Generation Approach

### Strategy

Use **templates** for consistency and maintainability.

### Individual Payslip

```typescript
// src/lib/pdfGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePayslip(
  employee: ProcessedEmployee,
  company: CompanySettings
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(company.company_name, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.text('PAYSLIP', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const monthYear = formatMonthYear(company.payroll_month);
  doc.text(monthYear, pageWidth / 2, 38, { align: 'center' });

  // Employee Details
  doc.setFontSize(10);
  const startY = 50;
  doc.text(`Employee: ${employee.employee_name}`, 20, startY);
  doc.text(`Employee ID: ${employee.employee_id || 'N/A'}`, 20, startY + 6);
  doc.text(`TIN: ${employee.tin}`, 20, startY + 12);
  doc.text(`SSNIT No: ${employee.ssnit_number}`, 20, startY + 18);

  // Earnings and Deductions Table
  autoTable(doc, {
    startY: startY + 28,
    head: [['EARNINGS', 'AMOUNT (GHS)', 'DEDUCTIONS', 'AMOUNT (GHS)']],
    body: [
      [
        'Basic Salary',
        formatCurrency(employee.basic_salary),
        'SSNIT (5.5%)',
        formatCurrency(employee.ssnit_employee)
      ],
      [
        'Allowances',
        formatCurrency(employee.allowances || 0),
        'PAYE',
        formatCurrency(employee.paye)
      ],
      ['', '', '', ''],
      [
        { content: 'Gross Pay', styles: { fontStyle: 'bold' } },
        { content: formatCurrency(employee.gross_pay), styles: { fontStyle: 'bold' } },
        { content: 'Total Deductions', styles: { fontStyle: 'bold' } },
        { content: formatCurrency(employee.total_deductions), styles: { fontStyle: 'bold' } }
      ]
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 }
  });

  // Net Pay (prominent)
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `NET PAY: ${formatCurrency(employee.net_pay)}`,
    pageWidth / 2,
    finalY,
    { align: 'center' }
  );

  // Bank Details
  if (employee.bank_name || employee.account_number) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank: ${employee.bank_name || 'N/A'}`, 20, finalY + 15);
    doc.text(`Account: ${employee.account_number || 'N/A'}`, 20, finalY + 21);
  }

  return doc;
}

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr + '-01');
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
```

### Bulk Payslips

```typescript
export function generateAllPayslips(
  employees: ProcessedEmployee[],
  company: CompanySettings
): jsPDF {
  const doc = new jsPDF();

  employees.forEach((employee, index) => {
    if (index > 0) {
      doc.addPage(); // New page for each employee
    }

    // Generate payslip on current page
    generatePayslipOnPage(doc, employee, company);
  });

  return doc;
}
```

### GRA PAYE Report

```typescript
export function generateGRAReport(
  employees: ProcessedEmployee[],
  company: CompanySettings
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYE MONTHLY RETURN SUMMARY', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.text(formatMonthYear(company.payroll_month), pageWidth / 2, 28, { align: 'center' });

  // Company info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Employer: ${company.company_name}`, 20, 40);
  doc.text(`TIN: ${company.company_tin}`, 20, 46);

  // Employee table
  const tableData = employees.map((emp, idx) => [
    (idx + 1).toString(),
    emp.employee_name,
    emp.tin,
    formatCurrency(emp.taxable_income),
    formatCurrency(emp.paye)
  ]);

  const totalPAYE = employees.reduce((sum, emp) => sum + emp.paye, 0);

  autoTable(doc, {
    startY: 55,
    head: [['No.', 'Employee Name', 'TIN', 'Taxable Income', 'PAYE']],
    body: tableData,
    foot: [[
      { content: 'TOTAL PAYE PAYABLE:', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: formatCurrency(totalPAYE), styles: { fontStyle: 'bold' } }
    ]],
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 2 }
  });

  // Due date
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Due Date: 15th of next month`, 20, finalY);

  return doc;
}
```

### SSNIT Report

```typescript
export function generateSSNITReport(
  employees: ProcessedEmployee[],
  company: CompanySettings
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SSNIT CONTRIBUTION SUMMARY', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.text(formatMonthYear(company.payroll_month), pageWidth / 2, 28, { align: 'center' });

  // Company info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Employer: ${company.company_name}`, 20, 40);
  doc.text(`SSNIT Employer No: ${company.company_ssnit}`, 20, 46);

  // Employee table
  const tableData = employees.map((emp, idx) => [
    (idx + 1).toString(),
    emp.employee_name,
    emp.ssnit_number,
    formatCurrency(emp.basic_salary),
    formatCurrency(emp.ssnit_employee),
    formatCurrency(emp.ssnit_employer)
  ]);

  const totals = employees.reduce(
    (acc, emp) => ({
      basic: acc.basic + emp.basic_salary,
      employee: acc.employee + emp.ssnit_employee,
      employer: acc.employer + emp.ssnit_employer
    }),
    { basic: 0, employee: 0, employer: 0 }
  );

  autoTable(doc, {
    startY: 55,
    head: [['No.', 'Employee Name', 'SSNIT No.', 'Basic Salary', 'EE (5.5%)', 'ER (13%)']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 2 }
  });

  // Totals section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTALS:', 20, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Employee Contribution (5.5%): GHS ${formatCurrency(totals.employee)}`, 30, finalY + 6);
  doc.text(`Employer Contribution (13%): GHS ${formatCurrency(totals.employer)}`, 30, finalY + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL SSNIT PAYABLE: GHS ${formatCurrency(totals.employee + totals.employer)}`, 30, finalY + 20);

  // Due date
  doc.setFont('helvetica', 'italic');
  doc.text(`Due Date: 14th of next month`, 20, finalY + 30);

  return doc;
}
```

---

## MVP Simplifications

To ship faster (7-8 days instead of 10), initially skip:

### Features to Defer to v1.1

| Feature | Why Skip for MVP | Add in Version |
|---------|------------------|----------------|
| Row drag-to-reorder | Just add/delete sufficient | v1.1 |
| Undo feature | Nice-to-have, adds complexity | v1.1 |
| Mobile card view | Responsive table works | v1.1 |
| Advanced PDF styling | Basic formatting first | v1.1 |
| Dark mode | Not in PRD requirements | v1.2 |
| Overtime calculations | Marked as "Future" in PRD | v1.2 |
| Bonus calculations | Marked as "Future" in PRD | v1.2 |
| Multi-month processing | Marked as "Future" in PRD | v2.0 |

### MVP Feature Set

Focus on core functionality:
- ✅ Excel editor with basic add/delete
- ✅ Upload and parse Excel
- ✅ PAYE and SSNIT calculations
- ✅ Validation with error messages
- ✅ Results display
- ✅ All 4 PDF outputs (basic formatting)
- ✅ Excel export
- ✅ Responsive layout (no special mobile views)
- ✅ localStorage persistence

---

## Deployment Strategy

### GitHub Pages Setup

```bash
# 1. Create repository
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/[username]/ghana-payroll.git
git push -u origin main

# 2. Configure GitHub Pages
# Go to repo Settings > Pages
# Source: GitHub Actions

# 3. Deployment happens automatically on push to main
```

### Automated Deployment Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linter
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    permissions:
      contents: read
      pages: write
      id-token: write

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ghana-payroll/', // Replace with your repo name
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable for production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          excel: ['xlsx'],
          pdf: ['jspdf', 'jspdf-autotable']
        }
      }
    }
  }
});
```

---

## Risk Areas

### High-Risk Items (Require Extra Attention)

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| **PDF generation complexity** | High - Most time-consuming task | Start early, create templates, test incrementally |
| **Browser compatibility** | Medium - Safari has quirks | Test downloads in Safari, use polyfills if needed |
| **Excel format variations** | Medium - Users may upload unexpected formats | Validate strictly, provide clear error messages |
| **Floating point precision** | High - Financial calculations must be exact | Use consistent rounding, test edge cases |
| **localStorage limits** | Low - ~5-10MB limit | Warn users, don't auto-save > 1000 employees |
| **Performance with large datasets** | Medium - 500+ employees | Use AG-Grid virtual scrolling, optimize calculations |
| **Mobile UX** | Medium - Complex table on small screens | Horizontal scroll + responsive design |
| **Tax rate changes** | Low - But critical if happens | Document how to update rates in constants.ts |

### Testing Priorities

1. **Critical:** Calculator accuracy (PAYE, SSNIT)
2. **Critical:** Validation logic (prevent bad data)
3. **High:** PDF generation (all 4 types)
4. **High:** Excel import/export
5. **Medium:** UI interactions
6. **Medium:** Mobile responsiveness
7. **Low:** Edge cases (empty fields, special characters)

---

## Build Order (Recommended Sequence)

### Week 1: Core Functionality

**Day 1: Foundation**
- [ ] Initialize Vite + React + TypeScript project
- [ ] Setup Tailwind CSS
- [ ] Create project structure (folders, files)
- [ ] Implement calculator.ts (PAYE, SSNIT, processEmployee)
- [ ] Write comprehensive calculator tests
- [ ] Verify all test cases from PRD pass

**Day 2: Validation & Excel**
- [ ] Implement validators.ts (TIN, SSNIT, validateEmployee)
- [ ] Write validation tests
- [ ] Implement excelHandler.ts (parse, export)
- [ ] Create template.xlsx file
- [ ] Test Excel import/export

**Day 3: UI Shell**
- [ ] Create main layout component
- [ ] Implement tab navigation
- [ ] Create CompanySettings panel
- [ ] Setup PayrollContext (state management)
- [ ] Basic styling with Tailwind

**Day 4: Excel Editor - Part 1**
- [ ] Install AG-Grid
- [ ] Create EmployeeTable component
- [ ] Configure column definitions
- [ ] Implement inline editing
- [ ] Add employee button

**Day 5: Excel Editor - Part 2**
- [ ] Delete employee functionality
- [ ] Validation with visual feedback
- [ ] Keyboard navigation (Tab, Enter)
- [ ] Auto-generate employee_id

### Week 2: Processing & Output

**Day 6: Editor Completion**
- [ ] localStorage persistence
- [ ] Load from localStorage on start
- [ ] Download as Excel button
- [ ] Clear all functionality
- [ ] Action bar UI

**Day 7: Upload & Processing**
- [ ] File upload component (react-dropzone)
- [ ] Parse uploaded Excel
- [ ] Validation error display
- [ ] "Edit First" vs "Process Now" routing

**Day 8: Results Display**
- [ ] Results view component
- [ ] Summary cards (totals, SSNIT, PAYE)
- [ ] Employee breakdown table
- [ ] Download section UI
- [ ] Navigation between views

**Day 9-10: PDF Generation** (CRITICAL)
- [ ] Individual payslip template
- [ ] Bulk payslips (multi-page)
- [ ] GRA PAYE Report
- [ ] SSNIT Report
- [ ] Test all PDFs with sample data

### Week 3: Polish & Deploy

**Day 11: Mobile Responsive**
- [ ] Test on mobile devices
- [ ] Responsive breakpoints
- [ ] Touch-friendly buttons
- [ ] Horizontal scroll for tables
- [ ] Fix any layout issues

**Day 12: Testing & Bug Fixes**
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Test with large datasets (100+ employees)
- [ ] Test all user flows (editor, upload, results)
- [ ] Fix bugs discovered

**Day 13: Documentation & Deployment**
- [ ] Write README.md
- [ ] Setup GitHub Actions workflow
- [ ] Deploy to GitHub Pages
- [ ] Test production build
- [ ] Create demo video/screenshots

**Day 14-15: Buffer & Launch**
- [ ] Final testing on production URL
- [ ] User acceptance testing
- [ ] Address feedback
- [ ] Launch 🚀

---

## Success Criteria

### MVP Completion Checklist

- [ ] User can create new payroll from scratch
- [ ] User can upload Excel file and see results
- [ ] PAYE calculation matches PRD examples
- [ ] SSNIT calculation is correct
- [ ] Validation prevents invalid data
- [ ] All 4 PDF types can be generated
- [ ] Excel export works
- [ ] localStorage saves data
- [ ] Mobile responsive (basic)
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Deployed to GitHub Pages
- [ ] No console errors
- [ ] Privacy notice displayed

### Performance Targets

- [ ] Initial page load < 3 seconds
- [ ] Process 100 employees < 1 second
- [ ] Generate bulk PDF (100 employees) < 5 seconds
- [ ] Responsive to user input (no lag when typing)

### Quality Gates

- [ ] All calculator tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code coverage > 80% for lib/ folder
- [ ] Documentation complete

---

## Conclusion

This implementation guide provides a comprehensive roadmap for building the Ghana Payroll Calculator. Key success factors:

1. **Start with the calculator logic** - It's the foundation
2. **Test financial calculations thoroughly** - Accuracy is critical
3. **Budget extra time for PDF generation** - Always takes longer than expected
4. **Use proven libraries** - Don't reinvent the wheel
5. **Keep MVP scope tight** - Ship core features first, iterate later

**Estimated Timeline:** 13-15 days for MVP
**Team Size:** 1 developer
**Risk Level:** Medium (PDF generation is the main unknown)

For questions or clarification, refer to the original PRD: `ghana-payroll-prd-v2.md`

---

**Document Version:** 1.0
**Last Updated:** January 2026
**Author:** Implementation Team
