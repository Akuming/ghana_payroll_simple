# Product Requirements Document (PRD)
# Ghana Payroll Calculator - Excel-Based Web App

**Version:** 2.0  
**Date:** January 2026  
**Status:** Draft

---

## 1. Overview

### 1.1 Concept
A simple, static web application hosted on GitHub Pages that processes payroll from an uploaded Excel file. No backend, no database, no login required. All processing happens in the browser.

### 1.2 How It Works
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │   Web App   │     │   Output    │
│  uploads    │────▶│  calculates │────▶│  downloads  │
│  Excel file │     │  PAYE/SSNIT │     │  results    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 1.3 Benefits
- **Free hosting** on GitHub Pages
- **No server costs** - runs entirely in browser
- **Privacy** - data never leaves user's computer
- **Simple** - just upload and download
- **Offline capable** - can work without internet after initial load

---

## 2. User Flow

### 2.1 Flow Diagram
```
                            ┌─────────────────┐
                            │   User opens    │
                            │    web app      │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
           ┌───────────────┐ ┌─────────────┐ ┌───────────────┐
           │  Use Editor   │ │  Download   │ │Upload existing│
           │  (build new)  │ │  template   │ │  Excel file   │
           └───────┬───────┘ └──────┬──────┘ └───────┬───────┘
                   │                │                │
                   │                ▼                │
                   │        ┌─────────────┐          │
                   │        │ Fill in     │          │
                   │        │ Excel       │          │
                   │        │ offline     │          │
                   │        └──────┬──────┘          │
                   │               │                 │
                   │               ▼                 │
                   │        ┌─────────────┐          │
                   │        │Upload filled│          │
                   │        │   Excel     │◀─────────┤
                   │        └──────┬──────┘          │
                   │               │                 │
                   │    ┌──────────┴──────────┐      │
                   │    │                     │      │
                   │    ▼                     ▼      │
                   │  ┌───────────┐    ┌───────────┐ │
                   │  │Edit First │    │ Process   │ │
                   │  │ (Editor)  │    │  Now      │ │
                   │  └─────┬─────┘    └─────┬─────┘ │
                   │        │                │       │
                   └────────┴────────┬───────┘       │
                                     │               │
                                     ▼               │
                            ┌─────────────────┐      │
                            │   Add/Edit      │      │
                            │   employees     │      │
                            │   in Editor     │◀─────┘
                            └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   Validate &    │
                            │   Calculate     │
                            └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   Review        │
                            │   Results       │
                            └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   Download      │
                            │   Outputs       │
                            └─────────────────┘
```

### 2.2 Path A: Use the In-App Editor (Recommended)
1. User opens the web app
2. User clicks "Create New Payroll" or "Load Excel to Edit"
3. User enters company settings (name, TIN, SSNIT #, month)
4. User adds employees row by row OR loads existing file
5. User edits/reviews data in the table
6. User clicks "Calculate Payroll"
7. App validates and calculates PAYE/SSNIT
8. User reviews results
9. User downloads outputs (Excel, PDFs)

### 2.3 Path B: Upload Excel Directly
1. User opens the web app
2. User downloads Excel template (first time)
3. User fills in employee data in Excel offline
4. User uploads the Excel file to the web app
5. App validates the data and shows any errors
6. App calculates PAYE and SSNIT for each employee
7. User reviews the results on screen
8. User downloads outputs

---

## 3. Excel Template Format

### 3.1 Input Columns (User Fills In)

| Column | Header Name | Type | Required | Description | Example |
|--------|-------------|------|----------|-------------|---------|
| A | employee_name | Text | Yes | Full name | Kofi Mensah |
| B | employee_id | Text | No | Internal ID | EMP001 |
| C | tin | Text | Yes | Tax ID Number | P0012345678 |
| D | ssnit_number | Text | Yes | SSNIT Number | C00123456789 |
| E | basic_salary | Number | Yes | Monthly basic (GHS) | 5000 |
| F | allowances | Number | No | Total allowances (GHS) | 500 |
| G | bank_name | Text | No | Bank name | GCB Bank |
| H | account_number | Text | No | Bank account | 1234567890 |
| I | mobile_money | Text | No | MoMo number | 0241234567 |

### 3.2 Output Columns (App Calculates)

| Column | Header Name | Description | Formula |
|--------|-------------|-------------|---------|
| J | gross_pay | Total earnings | basic_salary + allowances |
| K | ssnit_employee | Employee contribution | basic_salary × 5.5% |
| L | ssnit_employer | Employer contribution | basic_salary × 13% |
| M | taxable_income | Income subject to tax | gross_pay - ssnit_employee |
| N | paye | Income tax | Progressive calculation |
| O | total_deductions | All deductions | ssnit_employee + paye |
| P | net_pay | Take-home pay | gross_pay - total_deductions |

### 3.3 Template Structure

**Row 1:** Headers (frozen)  
**Row 2+:** Employee data (one row per employee)

**Additional Sheet (Optional):** "Settings"
| Cell | Field | Default |
|------|-------|---------|
| A1 | company_name | [Company Name] |
| A2 | company_tin | [TIN] |
| A3 | company_ssnit | [SSNIT Employer #] |
| A4 | payroll_month | [YYYY-MM] |

---

## 4. Functional Requirements

### 4.1 Excel Builder & Editor

**Description:** Users can create and edit employee data directly in the web app without needing external spreadsheet software. This section serves as an in-app spreadsheet editor.

#### 4.1.1 Create New Payroll Sheet
**Description:** Start with a blank employee table and add employees directly.

**Features:**
- Click "New Payroll" to start fresh
- Empty table with correct column headers
- Add row button to insert new employees
- Delete row button for each employee
- Auto-generates employee_id if left blank

**Acceptance Criteria:**
- Table displays all input columns (A-I from template)
- Input validation on each field as user types
- Visual indicators for required fields
- Cannot proceed to calculation with empty required fields

#### 4.1.2 Load Existing Excel File for Editing
**Description:** Import an existing Excel file (template format) to edit within the app.

**Features:**
- Upload button to load .xlsx/.xls file
- Parses file and populates editable table
- Validates format matches expected template
- Shows warning if columns are missing or extra

**Acceptance Criteria:**
- Recognizes files in the correct template format
- Populates table with existing data
- Allows editing of all fields
- Preserves data that was in the file

#### 4.1.3 Inline Editing
**Description:** Edit employee data directly in the table.

**Editable Fields:**
| Field | Input Type | Validation |
|-------|------------|------------|
| employee_name | Text input | Required |
| employee_id | Text input | Optional, auto-generate if empty |
| tin | Text input | Required, format validation |
| ssnit_number | Text input | Required, format validation |
| basic_salary | Number input | Required, > 0 |
| allowances | Number input | Optional, >= 0, default 0 |
| bank_name | Text input | Optional |
| account_number | Text input | Optional |
| mobile_money | Text input | Optional |

**Table Features:**
- Click cell to edit
- Tab to move to next cell
- Enter to confirm and move down
- Escape to cancel edit
- Visual feedback on validation errors (red border)
- Tooltip showing error message on hover

#### 4.1.4 Row Management
**Description:** Add, delete, and reorder employee rows.

**Features:**
| Action | How | Result |
|--------|-----|--------|
| Add row | Click "+ Add Employee" button | New empty row at bottom |
| Delete row | Click 🗑️ icon on row | Row removed (with confirmation) |
| Duplicate row | Click 📋 icon on row | Copy row (clears name/IDs) |
| Reorder | Drag handle on row | Move row up/down |

**Acceptance Criteria:**
- Minimum 1 row required
- Confirmation dialog before deleting
- Undo option for last delete (within 10 seconds)

#### 4.1.5 Company Settings Panel
**Description:** Set company information used in reports.

**Fields:**
| Field | Required | Used In |
|-------|----------|---------|
| Company Name | Yes | Payslips, Reports |
| Company TIN | Yes | GRA Report |
| SSNIT Employer Number | Yes | SSNIT Report |
| Company Address | No | Payslips |
| Payroll Month | Yes | All outputs |

**Features:**
- Collapsible panel above employee table
- Settings persist in browser localStorage
- Edit anytime before generating reports

#### 4.1.6 Save/Export Options
**Description:** Save work in progress or export for external use.

**Options:**
| Action | Output | Use Case |
|--------|--------|----------|
| Download as Excel | .xlsx file (input columns only) | Edit in Excel later, backup |
| Save to Browser | localStorage | Continue later in same browser |
| Clear All | Reset | Start over |

**Download Excel Format:**
- Sheet 1: "Employees" - all employee data
- Sheet 2: "Settings" - company information
- Formatted headers, column widths set
- Ready to re-upload later

**Acceptance Criteria:**
- Downloaded file can be re-uploaded and edited
- Browser save persists until manually cleared
- Warning before clearing if unsaved changes exist

#### 4.1.7 Editor UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  📝 PAYROLL EDITOR                                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ▼ Company Settings                                       │   │
│  │   Company Name: [______________]  TIN: [______________]  │   │
│  │   SSNIT Employer #: [__________]  Month: [Dec 2025 ▼]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Add Employee]  [📂 Load Excel]  [💾 Save to Browser]       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐
│  │ ⋮ │ Name*        │ ID    │ TIN*        │ SSNIT*       │ ...│
│  ├───┼──────────────┼───────┼─────────────┼──────────────┼────┤
│  │ ⋮ │ Kofi Mensah  │EMP001 │ P0012345678 │ C00123456789 │ ...│
│  │ ⋮ │ Ama Owusu    │EMP002 │ P0098765432 │ C00987654321 │ ...│
│  │ ⋮ │ [+ Add new]  │       │             │              │    │
│  └─────────────────────────────────────────────────────────────┘
│  │◀ Scroll horizontally for more columns ▶│                    │
│                                                                 │
│  [📥 Download Excel]  [▶ Calculate Payroll]                    │
│                                                                 │
│  * Required fields                                              │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.1.8 Mobile Editor View
**Description:** Adapted layout for mobile devices.

**Features:**
- Card view instead of table (one employee per card)
- Swipe between employees
- Expandable sections for optional fields
- Floating action button for adding employees

```
┌─────────────────────────────┐
│  Employee 1 of 5        [🗑️]│
├─────────────────────────────┤
│  Name*                      │
│  [Kofi Mensah_________]     │
│                             │
│  Employee ID                │
│  [EMP001______________]     │
│                             │
│  TIN*                       │
│  [P0012345678_________]     │
│                             │
│  SSNIT Number*              │
│  [C00123456789________]     │
│                             │
│  Basic Salary (GHS)*        │
│  [5000________________]     │
│                             │
│  ▶ More fields...           │
├─────────────────────────────┤
│  [◀ Prev]    [Next ▶]       │
└─────────────────────────────┘
       [+ Add Employee]
```

---

### 4.2 Template Download
**Description:** User can download a blank Excel template for offline editing.

**Acceptance Criteria:**
- One-click download button on main page
- Template includes headers, formatting, and example row
- Example row clearly marked (to be deleted)
- Optional "Settings" sheet included
- Same format as files exported from the Editor

---

### 4.3 File Upload (Direct to Processing)
**Description:** User uploads their filled Excel file directly for processing (skipping the editor).

**Acceptance Criteria:**
- Drag-and-drop zone + file picker button
- Accepts .xlsx and .xls files
- Shows file name after selection
- Maximum file size: 5MB (more than enough)
- Clear button to remove selected file
- Option to "Edit First" or "Process Now"

---

### 4.4 Data Validation
**Description:** App validates uploaded data before processing.

**Validation Rules:**

| Field | Validation | Error Message |
|-------|------------|---------------|
| employee_name | Required, non-empty | "Row X: Employee name is required" |
| tin | Required, format check | "Row X: Invalid TIN format" |
| ssnit_number | Required, format check | "Row X: Invalid SSNIT number" |
| basic_salary | Required, number > 0 | "Row X: Basic salary must be a positive number" |
| allowances | If present, number >= 0 | "Row X: Allowances must be a number" |

**Acceptance Criteria:**
- All errors shown in a list before processing
- Row numbers referenced for easy fixing
- Option to proceed with valid rows only (skip invalid)
- Clear indication of how many rows valid vs. invalid

---

### 4.5 PAYE Calculation
**Description:** Calculate income tax using Ghana's progressive tax brackets.

**2024 Tax Brackets (Monthly):**

| Bracket | Chargeable Income (GHS) | Cumulative (GHS) | Rate |
|---------|-------------------------|------------------|------|
| 1 | First 490 | 490 | 0% |
| 2 | Next 110 | 600 | 5% |
| 3 | Next 130 | 730 | 10% |
| 4 | Next 3,166.67 | 3,896.67 | 17.5% |
| 5 | Next 16,000 | 19,896.67 | 25% |
| 6 | Next 30,520 | 50,416.67 | 30% |
| 7 | Exceeding 50,416.67 | - | 35% |

**Calculation Logic:**
```javascript
function calculatePAYE(taxableIncome) {
  const brackets = [
    { limit: 490, rate: 0 },
    { limit: 110, rate: 0.05 },
    { limit: 130, rate: 0.10 },
    { limit: 3166.67, rate: 0.175 },
    { limit: 16000, rate: 0.25 },
    { limit: 30520, rate: 0.30 },
    { limit: Infinity, rate: 0.35 }
  ];
  
  let tax = 0;
  let remaining = taxableIncome;
  
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.limit);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }
  
  return tax;
}
```

---

### 4.6 SSNIT Calculation
**Description:** Calculate social security contributions.

**Rates:**
| Type | Rate | Base |
|------|------|------|
| Employee (Tier 1 + 2) | 5.5% | Basic Salary |
| Employer | 13.0% | Basic Salary |

**Calculation:**
```javascript
function calculateSSNIT(basicSalary) {
  return {
    employee: basicSalary * 0.055,
    employer: basicSalary * 0.13,
    total: basicSalary * 0.185
  };
}
```

---

### 4.7 Results Display
**Description:** Show calculated results on screen.

**Display Components:**

**Summary Card:**
```
┌─────────────────────────────────────────────┐
│  PAYROLL SUMMARY - December 2025            │
├─────────────────────────────────────────────┤
│  Employees Processed:     12                │
│  Total Gross Pay:         GHS 85,000.00     │
│  Total SSNIT (Employee):  GHS 4,675.00      │
│  Total SSNIT (Employer):  GHS 11,050.00     │
│  Total PAYE:              GHS 12,450.00     │
│  Total Net Pay:           GHS 67,875.00     │
├─────────────────────────────────────────────┤
│  SSNIT Due (Combined):    GHS 15,725.00     │
│  PAYE Due to GRA:         GHS 12,450.00     │
└─────────────────────────────────────────────┘
```

**Employee Table:**
| Name | Basic | Allowances | Gross | SSNIT (EE) | PAYE | Net Pay |
|------|-------|------------|-------|------------|------|---------|
| Kofi Mensah | 5,000 | 500 | 5,500 | 275 | 904.75 | 4,320.25 |
| ... | ... | ... | ... | ... | ... | ... |
| **TOTALS** | **X** | **X** | **X** | **X** | **X** | **X** |

---

### 4.8 Download Outputs
**Description:** User can download processed files.

**Available Downloads:**

| Download | Format | Contents |
|----------|--------|----------|
| Processed Payroll | .xlsx | Original data + calculated columns |
| All Payslips | .pdf | One page per employee |
| Single Payslip | .pdf | Selected employee only |
| GRA PAYE Report | .pdf | Summary for tax filing |
| SSNIT Report | .pdf | Summary for SSNIT filing |

---

### 4.9 Payslip Format

```
╔═══════════════════════════════════════════════════════╗
║                   [COMPANY NAME]                      ║
║                      PAYSLIP                          ║
║                   December 2025                       ║
╠═══════════════════════════════════════════════════════╣
║  Employee: Kofi Mensah                                ║
║  Employee ID: EMP001                                  ║
║  TIN: P0012345678                                     ║
║  SSNIT No: C00123456789                               ║
╠═══════════════════════════════════════════════════════╣
║  EARNINGS                          DEDUCTIONS         ║
║  ─────────────────                 ───────────────    ║
║  Basic Salary    GHS 5,000.00      SSNIT (5.5%)       ║
║  Allowances      GHS   500.00          GHS 275.00    ║
║                                    PAYE               ║
║                                        GHS 904.75    ║
║  ─────────────────                 ───────────────    ║
║  Gross Pay       GHS 5,500.00      Total Deductions  ║
║                                        GHS 1,179.75  ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║              NET PAY: GHS 4,320.25                    ║
║                                                       ║
╠═══════════════════════════════════════════════════════╣
║  Bank: GCB Bank                                       ║
║  Account: 1234567890                                  ║
╚═══════════════════════════════════════════════════════╝
```

---

### 4.10 GRA PAYE Report Format

```
╔═══════════════════════════════════════════════════════╗
║            PAYE MONTHLY RETURN SUMMARY                ║
║                   December 2025                       ║
╠═══════════════════════════════════════════════════════╣
║  Employer: [Company Name]                             ║
║  TIN: [Company TIN]                                   ║
╠═══════════════════════════════════════════════════════╣
║  No. │ Employee Name   │ TIN         │ Taxable  │ PAYE║
║  ────┼─────────────────┼─────────────┼──────────┼─────║
║  1   │ Kofi Mensah     │ P001234567  │ 5,225.00 │904.75
║  2   │ Ama Owusu       │ P009876543  │ 3,850.00 │550.00
║  ... │ ...             │ ...         │ ...      │ ... ║
╠═══════════════════════════════════════════════════════╣
║  TOTAL PAYE PAYABLE:                    GHS 12,450.00 ║
║                                                       ║
║  Due Date: 15th January 2026                          ║
╚═══════════════════════════════════════════════════════╝
```

---

### 4.11 SSNIT Report Format

```
╔═══════════════════════════════════════════════════════╗
║           SSNIT CONTRIBUTION SUMMARY                  ║
║                   December 2025                       ║
╠═══════════════════════════════════════════════════════╣
║  Employer: [Company Name]                             ║
║  SSNIT Employer No: [Number]                          ║
╠═══════════════════════════════════════════════════════╣
║  No. │ Employee Name   │ SSNIT No     │ Basic   │ EE  │ ER  ║
║  ────┼─────────────────┼──────────────┼─────────┼─────┼─────║
║  1   │ Kofi Mensah     │ C0012345678  │ 5,000   │ 275 │ 650 ║
║  2   │ Ama Owusu       │ C0098765432  │ 4,000   │ 220 │ 520 ║
║  ... │ ...             │ ...          │ ...     │ ... │ ... ║
╠═══════════════════════════════════════════════════════╣
║  TOTALS:                                              ║
║    Employee Contribution (5.5%):        GHS 4,675.00  ║
║    Employer Contribution (13%):         GHS 11,050.00 ║
║    ─────────────────────────────────────────────────  ║
║    TOTAL SSNIT PAYABLE:                 GHS 15,725.00 ║
║                                                       ║
║  Due Date: 14th January 2026                          ║
╚═══════════════════════════════════════════════════════╝
```

---


## 5. User Interface

### 5.1 Tab-Based Layout

The app uses a simple tab structure with two main views plus help.

**Main Tabs:**
- **Editor** - Build/edit payroll data directly in the app
- **Upload & Process** - Upload Excel file for quick processing
- **Help** - Usage guide and tax rate information

### 5.2 Editor Tab (Default View)

The Editor is the primary interface for creating and managing payroll data.

**Components:**
1. **Company Settings Panel** (collapsible)
   - Company Name, TIN, SSNIT Employer Number
   - Payroll Month/Year selector

2. **Action Bar**
   - [+ New Payroll] - Clear and start fresh
   - [Load Excel] - Import existing file for editing
   - [Save] - Save to browser storage
   - [Download Excel] - Export current data

3. **Employee Table**
   - Editable grid with all input columns
   - Click any cell to edit
   - Row actions: delete, duplicate
   - Drag to reorder rows
   - Add new row at bottom

4. **Status Bar**
   - Employee count
   - Valid/Error count
   - [Calculate Payroll] button

**Editor Features:**
- Inline validation with visual feedback
- Tab/Enter navigation between cells
- Auto-save to browser localStorage
- Undo last delete (10 second window)

### 5.3 Upload & Process Tab

Quick path for users who prefer working in Excel.

**Components:**
1. **Template Download** - Get blank Excel template
2. **File Drop Zone** - Drag & drop or click to browse
3. **Action Buttons:**
   - [Edit in Editor] - Load file into Editor tab
   - [Process Now] - Skip to results directly

### 5.4 Results View (Modal/Overlay)

Shown after clicking "Calculate Payroll" or "Process Now".

**Components:**
1. **Summary Cards**
   - Total employees, gross pay, net pay
   - SSNIT due amount with deadline
   - PAYE due amount with deadline

2. **Employee Breakdown Table**
   - Name, Gross, SSNIT, PAYE, Net Pay
   - Sortable columns
   - Totals row

3. **Download Section**
   - [Processed Excel] - Full data with calculations
   - [All Payslips PDF] - Combined PDF
   - [GRA PAYE Report] - For tax filing
   - [SSNIT Report] - For SSNIT filing

4. **Navigation**
   - [Back to Editor] - Return to editing
   - [New Payroll] - Clear and start over

### 5.5 Mobile Responsive Design

**Editor on Mobile:**
- Card-based view (one employee per card)
- Swipe left/right between employees
- Collapsible sections for optional fields
- Sticky bottom action bar

**Results on Mobile:**
- Stacked summary cards
- Horizontally scrollable table
- Full-width download buttons

**Design Principles:**
- Touch-friendly tap targets (min 44px)
- No horizontal scroll on main layout
- Collapsible sections to reduce scrolling
- Clear visual hierarchy

## 6. Technical Specification

### 6.1 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Hosting | GitHub Pages | Free static hosting |
| Framework | React (or vanilla JS) | UI components |
| Excel Parsing | SheetJS (xlsx) | Read/write Excel files |
| PDF Generation | jsPDF + jsPDF-AutoTable | Generate payslips/reports |
| Styling | Tailwind CSS | Simple, responsive design |
| Build Tool | Vite | Fast bundling |

### 6.2 Key Libraries

```json
{
  "dependencies": {
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.1"
  }
}
```

### 6.3 File Structure

```
ghana-payroll/
├── index.html
├── src/
│   ├── main.js              # Entry point
│   ├── calculator.js        # PAYE & SSNIT logic
│   ├── excelHandler.js      # Read/write Excel
│   ├── pdfGenerator.js      # Generate PDFs
│   ├── validators.js        # Data validation
│   └── styles.css           # Styling
├── assets/
│   └── template.xlsx        # Downloadable template
├── package.json
└── README.md
```

### 6.4 Core Functions

```javascript
// calculator.js

const TAX_BRACKETS = [
  { limit: 490, rate: 0 },
  { limit: 110, rate: 0.05 },
  { limit: 130, rate: 0.10 },
  { limit: 3166.67, rate: 0.175 },
  { limit: 16000, rate: 0.25 },
  { limit: 30520, rate: 0.30 },
  { limit: Infinity, rate: 0.35 }
];

const SSNIT_EMPLOYEE_RATE = 0.055;
const SSNIT_EMPLOYER_RATE = 0.13;

export function processEmployee(employee) {
  const basicSalary = employee.basic_salary || 0;
  const allowances = employee.allowances || 0;
  
  const grossPay = basicSalary + allowances;
  const ssnitEmployee = basicSalary * SSNIT_EMPLOYEE_RATE;
  const ssnitEmployer = basicSalary * SSNIT_EMPLOYER_RATE;
  const taxableIncome = grossPay - ssnitEmployee;
  const paye = calculatePAYE(taxableIncome);
  const totalDeductions = ssnitEmployee + paye;
  const netPay = grossPay - totalDeductions;
  
  return {
    ...employee,
    gross_pay: round(grossPay),
    ssnit_employee: round(ssnitEmployee),
    ssnit_employer: round(ssnitEmployer),
    taxable_income: round(taxableIncome),
    paye: round(paye),
    total_deductions: round(totalDeductions),
    net_pay: round(netPay)
  };
}

function calculatePAYE(taxableIncome) {
  let tax = 0;
  let remaining = taxableIncome;
  
  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.limit);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }
  
  return tax;
}

function round(value) {
  return Math.round(value * 100) / 100;
}
```

---

## 7. Deployment

### 7.1 GitHub Pages Setup

1. Create repository: `github.com/[username]/ghana-payroll`
2. Build the app: `npm run build`
3. Deploy `dist/` folder to GitHub Pages
4. Access at: `https://[username].github.io/ghana-payroll`

### 7.2 Automated Deployment (Optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 8. MVP Scope

### 8.1 Version 1.0 (MVP)

**In Scope:**
- [x] **Excel Editor**
  - [x] Create new payroll from scratch in-app
  - [x] Load existing Excel file for editing
  - [x] Add, edit, delete employee rows
  - [x] Company settings panel
  - [x] Download edited data as Excel
  - [x] Save/load from browser localStorage
- [x] **Upload & Process**
  - [x] Download Excel template
  - [x] Upload and parse Excel file
  - [x] Option to edit or process directly
- [x] **Calculations**
  - [x] Validate employee data
  - [x] Calculate PAYE (2024 rates)
  - [x] Calculate SSNIT (employee + employer)
- [x] **Results & Reports**
  - [x] Display results summary
  - [x] Display employee breakdown table
  - [x] Download processed Excel
  - [x] Download all payslips (PDF)
  - [x] Download GRA report (PDF)
  - [x] Download SSNIT report (PDF)
- [x] Mobile responsive design

**Out of Scope (Future):**
- Overtime calculations
- Bonus calculations (5% flat rate)
- Tier 3 voluntary contributions
- Loan deductions
- Back pay / arrears
- Multi-month processing
- Dark mode
- Data export to GRA/SSNIT portal format

### 8.2 Estimated Timeline

| Task | Duration |
|------|----------|
| Setup & scaffolding | 1 day |
| Excel Editor UI | 2 days |
| Excel parsing & export | 1 day |
| PAYE & SSNIT calculations | 1 day |
| Results display UI | 1 day |
| PDF generation | 2 days |
| localStorage persistence | 0.5 day |
| Testing & bug fixes | 1.5 days |
| **Total** | **~10 days** |

---

## 9. Testing

### 9.1 Test Cases

| Test | Input | Expected Output |
|------|-------|-----------------|
| Below tax threshold | Basic: 400, Allow: 0 | PAYE: 0, Net: 378 |
| First bracket only | Basic: 600, Allow: 0 | PAYE: ~2.20 |
| Mid-range salary | Basic: 5000, Allow: 500 | PAYE: ~904.75 |
| High salary | Basic: 60000, Allow: 5000 | PAYE: ~19,000+ |
| Zero allowances | Basic: 3000, Allow: 0 | Calculations work |
| Missing basic salary | Basic: empty | Validation error |
| Invalid TIN format | TIN: "ABC" | Validation error |

### 9.2 Cross-Validation
- Compare results with GRA online PAYE calculator
- Verify against manual spreadsheet calculations

---

## 10. Privacy & Security

### 10.1 Data Handling
- **No server upload:** All processing in browser
- **No data storage:** Nothing saved after page refresh
- **No tracking:** No analytics or cookies
- **Open source:** Code publicly auditable

### 10.2 Privacy Notice (Display on Page)
> "Your payroll data is processed entirely in your browser. No information is sent to any server or stored anywhere. When you close or refresh this page, all data is cleared."

---

## 11. Future Enhancements

| Feature | Priority | Effort |
|---------|----------|--------|
| Remember company settings (localStorage) | High | Low |
| Process multiple months | Medium | Medium |
| Bonus calculation (5% tax) | Medium | Low |
| Tier 3 contributions | Low | Low |
| Overtime calculation | Low | Medium |
| Email payslips (via mailto) | Low | Low |
| PWA for offline use | Low | Medium |
| Update tax rates via config | Medium | Low |

---

## Appendix A: Sample Excel Data

| employee_name | employee_id | tin | ssnit_number | basic_salary | allowances |
|---------------|-------------|-----|--------------|--------------|------------|
| Kofi Mensah | EMP001 | P0012345678 | C00123456789 | 5000 | 500 |
| Ama Owusu | EMP002 | P0098765432 | C00987654321 | 4000 | 300 |
| Kwame Asante | EMP003 | P0011223344 | C00112233445 | 3500 | 0 |
| Efua Darko | EMP004 | P0055667788 | C00556677889 | 8000 | 1000 |

---

## Appendix B: Calculation Verification

**Employee: Kofi Mensah**
```
Input:
  Basic Salary: GHS 5,000
  Allowances: GHS 500

Step 1 - Gross Pay:
  5,000 + 500 = 5,500

Step 2 - SSNIT Employee (5.5% of Basic):
  5,000 × 0.055 = 275

Step 3 - SSNIT Employer (13% of Basic):
  5,000 × 0.13 = 650

Step 4 - Taxable Income:
  5,500 - 275 = 5,225

Step 5 - PAYE Calculation:
  First 490 @ 0% = 0
  Next 110 @ 5% = 5.50
  Next 130 @ 10% = 13.00
  Next 3,166.67 @ 17.5% = 554.17
  Remaining 1,328.33 @ 25% = 332.08
  ─────────────────────────
  Total PAYE = 904.75

Step 6 - Net Pay:
  5,500 - 275 - 904.75 = 4,320.25

Output:
  Gross Pay: GHS 5,500.00
  SSNIT (Employee): GHS 275.00
  SSNIT (Employer): GHS 650.00
  PAYE: GHS 904.75
  Net Pay: GHS 4,320.25
```

---

*End of Document*
