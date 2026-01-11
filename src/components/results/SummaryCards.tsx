import { useMemo } from 'react';
import type { ProcessedEmployee } from '../../types/employee';
import { formatCurrency } from '../../utils/formatting';

interface SummaryCardsProps {
  processedEmployees: ProcessedEmployee[];
}

export function SummaryCards({ processedEmployees }: SummaryCardsProps) {
  const totals = useMemo(() => {
    return processedEmployees.reduce(
      (acc, emp) => ({
        grossPay: acc.grossPay + emp.gross_pay,
        ssnitEmployee: acc.ssnitEmployee + emp.ssnit_employee,
        ssnitEmployer: acc.ssnitEmployer + emp.ssnit_employer,
        paye: acc.paye + emp.paye,
        netPay: acc.netPay + emp.net_pay,
      }),
      {
        grossPay: 0,
        ssnitEmployee: 0,
        ssnitEmployer: 0,
        paye: 0,
        netPay: 0,
      }
    );
  }, [processedEmployees]);

  const cards = [
    {
      title: 'Total Gross Pay',
      value: totals.grossPay,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'SSNIT Employee (5.5%)',
      value: totals.ssnitEmployee,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: 'SSNIT Employer (13%)',
      value: totals.ssnitEmployer,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      iconColor: 'text-indigo-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'Total PAYE Tax',
      value: totals.paye,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Total Net Pay',
      value: totals.netPay,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} rounded-lg p-4 shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <div className={card.iconColor}>{card.icon}</div>
          </div>
          <div className="text-sm text-gray-600 mb-1">{card.title}</div>
          <div className={`text-2xl font-bold ${card.textColor}`}>
            {formatCurrency(card.value)}
          </div>
        </div>
      ))}
    </div>
  );
}
