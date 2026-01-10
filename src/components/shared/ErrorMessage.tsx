import { ReactNode } from 'react';

interface ErrorMessageProps {
  children: ReactNode;
  className?: string;
}

export function ErrorMessage({ children, className = '' }: ErrorMessageProps) {
  return (
    <div className={`error-message ${className}`}>
      <div className="flex items-start">
        <svg
          className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

interface SuccessMessageProps {
  children: ReactNode;
  className?: string;
}

export function SuccessMessage({ children, className = '' }: SuccessMessageProps) {
  return (
    <div className={`success-message ${className}`}>
      <div className="flex items-start">
        <svg
          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

interface InfoMessageProps {
  children: ReactNode;
  className?: string;
}

export function InfoMessage({ children, className = '' }: InfoMessageProps) {
  return (
    <div className={`privacy-notice ${className}`}>
      <div className="flex items-start">
        <svg
          className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
