import React from 'react'
import ReactDOM from 'react-dom/client'
import { PayrollProvider } from './context/PayrollContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PayrollProvider>
      <App />
    </PayrollProvider>
  </React.StrictMode>,
)
