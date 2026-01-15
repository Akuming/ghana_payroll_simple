import React from 'react'
import ReactDOM from 'react-dom/client'
import { PayrollProvider } from './context/PayrollContext'
import App from './App'

// AG-Grid styles - must be imported before app styles
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PayrollProvider>
      <App />
    </PayrollProvider>
  </React.StrictMode>,
)
