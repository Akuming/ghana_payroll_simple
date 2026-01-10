# Ghana Payroll Calculator

A free, client-side payroll processing application for Ghana. Process payroll with PAYE and SSNIT calculations entirely in your browser - no backend server, no database, complete privacy. Deployed as static files on GitHub Pages.

## Features

- **Client-Side Processing**: All payroll calculations happen in your browser using JavaScript - no backend server required
- **Static Hosting**: Deployed as static files on GitHub Pages - no server infrastructure needed
- **Complete Privacy**: Your data never leaves your computer, no uploads to any server
- **PAYE Calculation**: Accurate income tax calculation using Ghana's 2024 progressive tax brackets
- **SSNIT Calculation**: Employee (5.5%) and Employer (13%) contributions
- **Excel Integration**: Import/export employee data via Excel
- **PDF Reports**: Generate payslips, GRA PAYE reports, and SSNIT reports
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

## Development Status

### ✅ Completed (Day 1)

- [x] Project setup (Vite + React + TypeScript)
- [x] Tailwind CSS configuration
- [x] Core calculation engine (PAYE & SSNIT)
- [x] Validation system (TIN, SSNIT, employee data)
- [x] Comprehensive test suite (61 tests, all passing)
- [x] Basic UI shell with tab navigation

### 🚧 In Progress

- [ ] Excel editor component (AG-Grid integration)
- [ ] Company settings panel
- [ ] File upload functionality
- [ ] Results display
- [ ] PDF generation
- [ ] localStorage persistence

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Development vs Production

**During Development:**
- Vite dev server runs locally (`http://localhost:5173`)
- Hot module replacement for fast development
- Source maps for debugging

**In Production:**
- Built as static HTML/CSS/JS files (`npm run build`)
- Hosted on GitHub Pages (or any static file host)
- No server-side processing - everything runs in the user's browser
- Files are served as-is, all calculations happen client-side

```bash
# Development
npm run dev

# Production build
npm run build
# Outputs static files to ./dist/ folder
```

## Project Structure

```
src/
├── components/        # React components (to be built)
├── lib/
│   ├── calculator.ts      # PAYE & SSNIT calculation logic ✅
│   ├── validators.ts      # Input validation ✅
│   ├── constants.ts       # Tax rates and constants ✅
│   └── *.test.ts          # Test files ✅
├── types/
│   ├── employee.ts        # Employee data types ✅
│   └── company.ts         # Company settings types ✅
├── App.tsx                # Main app component ✅
└── main.tsx               # Entry point ✅
```

## Tax Rates (2024)

### PAYE (Monthly)

| Income Range (GHS) | Rate |
|-------------------|------|
| 0 - 490 | 0% |
| 491 - 600 | 5% |
| 601 - 730 | 10% |
| 731 - 3,896.67 | 17.5% |
| 3,896.68 - 19,896.67 | 25% |
| 19,896.68 - 50,416.67 | 30% |
| Above 50,416.67 | 35% |

### SSNIT

- **Employee Contribution**: 5.5% of basic salary (Tier 1 + 2)
- **Employer Contribution**: 13% of basic salary

## Testing

All core calculation logic is thoroughly tested:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

**Current Test Coverage**: 61 tests passing
- Calculator: 27 tests
- Validators: 34 tests

## Example Calculation

```typescript
import { processEmployee } from './lib/calculator';

const employee = {
  employee_name: 'Kofi Mensah',
  tin: 'P0012345678',
  ssnit_number: 'C00123456789',
  basic_salary: 5000,
  allowances: 500
};

const result = processEmployee(employee);

// Output:
// {
//   gross_pay: 5500.00,
//   ssnit_employee: 275.00,
//   ssnit_employer: 650.00,
//   taxable_income: 5225.00,
//   paye: 904.75,
//   total_deductions: 1179.75,
//   net_pay: 4320.25
// }
```

## Privacy & Security

- **No server uploads**: All processing happens in your browser
- **No data storage**: Data is cleared when you close the page
- **No tracking**: No analytics or cookies
- **Open source**: Code is publicly auditable

## Documentation

- [Product Requirements Document](ghana-payroll-prd-v2.md)
- [Implementation Guide](IMPLEMENTATION_GUIDE.md)

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Excel**: SheetJS (xlsx)
- **PDF**: jsPDF + jsPDF-AutoTable
- **Grid**: AG-Grid Community

## Roadmap

### v1.0 (MVP) - Target: 2 weeks
- [ ] Excel editor with inline editing
- [ ] Upload and process Excel files
- [ ] Calculate PAYE and SSNIT
- [ ] Generate all PDF reports
- [ ] Mobile responsive design
- [ ] Deploy to GitHub Pages

### v1.1
- [ ] Dark mode
- [ ] Row drag-to-reorder
- [ ] Undo functionality
- [ ] Advanced PDF styling

### v2.0
- [ ] Overtime calculations
- [ ] Bonus calculations (5% flat rate)
- [ ] Tier 3 contributions
- [ ] Multi-month processing

## Contributing

This is an open-source project. Contributions are welcome!

## License

MIT License - Free to use for personal and commercial purposes

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for Ghana** | All payroll processing happens locally in your browser
