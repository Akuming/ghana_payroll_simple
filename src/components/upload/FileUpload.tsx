import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePayrollDispatch } from '../../context/PayrollContext';
import { parseExcelFile } from '../../lib/excelHandler';
import { validateEmployees, checkDuplicateTINs, checkDuplicateSSNIT } from '../../lib/validators';
import { Button } from '../shared/Button';
import { ErrorMessage, SuccessMessage } from '../shared/ErrorMessage';
import { formatFileSize } from '../../utils/formatting';
import { MAX_FILE_SIZE } from '../../lib/constants';

interface FileUploadProps {
  onSuccess?: () => void;
}

export function FileUpload({ onSuccess }: FileUploadProps) {
  const dispatch = usePayrollDispatch();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadErrors([]);
    setUploadSuccess(null);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors: string[] = [];
      rejectedFiles.forEach(rejection => {
        rejection.errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            errors.push(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
          } else if (error.code === 'file-invalid-type') {
            errors.push('Invalid file type. Please upload .xlsx or .xls files only');
          } else {
            errors.push(error.message);
          }
        });
      });
      setUploadErrors(errors);
      return;
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadSuccess(`File "${acceptedFiles[0].name}" selected successfully`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    multiple: false
  });

  const handleEditFirst = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadErrors([]);

    try {
      const { employees, companySettings, errors } = await parseExcelFile(selectedFile);

      if (errors.length > 0) {
        setUploadErrors(errors);
        setIsProcessing(false);
        return;
      }

      if (employees.length === 0) {
        setUploadErrors(['No employee data found in the file']);
        setIsProcessing(false);
        return;
      }

      // Validate all employees
      const validationErrors = validateEmployees(employees);
      const duplicateTINErrors = checkDuplicateTINs(employees);
      const duplicateSSNITErrors = checkDuplicateSSNIT(employees);

      const allErrors = [...validationErrors, ...duplicateTINErrors, ...duplicateSSNITErrors];

      if (allErrors.length > 0) {
        // Still load the data but show warnings
        setUploadErrors([
          `Loaded ${employees.length} employees with ${allErrors.length} validation errors. You can fix them in the editor.`
        ]);
      }

      // Load employees into editor
      dispatch({ type: 'SET_EMPLOYEES', payload: employees });

      // Load company settings if available
      if (companySettings) {
        dispatch({ type: 'SET_COMPANY_SETTINGS', payload: companySettings });
      }

      // Switch to editor tab
      dispatch({ type: 'SET_TAB', payload: 'editor' });

      setUploadSuccess(`Successfully loaded ${employees.length} employees. Switched to editor.`);
      setIsProcessing(false);

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (error) {
      setUploadErrors([`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setIsProcessing(false);
    }
  };

  const handleProcessNow = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadErrors([]);

    try {
      const { employees, companySettings, errors } = await parseExcelFile(selectedFile);

      if (errors.length > 0) {
        setUploadErrors(errors);
        setIsProcessing(false);
        return;
      }

      if (employees.length === 0) {
        setUploadErrors(['No employee data found in the file']);
        setIsProcessing(false);
        return;
      }

      // Validate all employees
      const validationErrors = validateEmployees(employees);
      const duplicateTINErrors = checkDuplicateTINs(employees);
      const duplicateSSNITErrors = checkDuplicateSSNIT(employees);

      const allErrors = [...validationErrors, ...duplicateTINErrors, ...duplicateSSNITErrors];

      if (allErrors.length > 0) {
        setUploadErrors([
          `Cannot process: ${allErrors.length} validation errors found.`,
          'Please use "Edit First" to fix errors before processing.',
          ...allErrors.slice(0, 5).map(e => `Row ${e.row}: ${e.message}`)
        ]);
        setIsProcessing(false);
        return;
      }

      // Load employees
      dispatch({ type: 'SET_EMPLOYEES', payload: employees });

      // Load company settings if available
      if (companySettings) {
        dispatch({ type: 'SET_COMPANY_SETTINGS', payload: companySettings });
      }

      // Process payroll
      dispatch({ type: 'PROCESS_PAYROLL' });

      setUploadSuccess(`Successfully processed ${employees.length} employees!`);
      setIsProcessing(false);

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (error) {
      setUploadErrors([`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadErrors([]);
    setUploadSuccess(null);
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
          ${selectedFile ? 'bg-green-50 border-green-500' : ''}
        `}
      >
        <input {...getInputProps()} />

        {!selectedFile ? (
          <>
            <svg
              className={`mx-auto h-12 w-12 ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {isDragActive ? 'Drop the file here' : 'Upload Excel File'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Drag and drop your file here, or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Accepts .xlsx and .xls files (max {formatFileSize(MAX_FILE_SIZE)})
            </p>
          </>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-green-500"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">{selectedFile.name}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFile();
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Remove file
            </button>
          </>
        )}
      </div>

      {/* Errors */}
      {uploadErrors.length > 0 && (
        <ErrorMessage>
          <div>
            <p className="font-semibold mb-2">Upload Errors:</p>
            <ul className="list-disc list-inside space-y-1">
              {uploadErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </ErrorMessage>
      )}

      {/* Success */}
      {uploadSuccess && (
        <SuccessMessage>
          {uploadSuccess}
        </SuccessMessage>
      )}

      {/* Action Buttons */}
      {selectedFile && (
        <div className="flex gap-4">
          <Button
            onClick={handleEditFirst}
            variant="outline"
            loading={isProcessing}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit First
          </Button>
          <Button
            onClick={handleProcessNow}
            variant="primary"
            loading={isProcessing}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Process Now
          </Button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
        <h4 className="font-semibold mb-2">What's the difference?</h4>
        <ul className="space-y-2">
          <li>
            <strong>Edit First:</strong> Load the data into the editor where you can review and make changes before processing
          </li>
          <li>
            <strong>Process Now:</strong> Immediately calculate payroll if your data is already perfect (requires no validation errors)
          </li>
        </ul>
      </div>
    </div>
  );
}
