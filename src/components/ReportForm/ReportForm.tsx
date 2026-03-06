import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import type { FormData } from '@/types/forms';

import SelectField from '@/ui/select-field';
import SuccessMessage from '@/ui/success-message';
import Loader from '@/ui/loader';
import ErrorMessage from '@/ui/error-message';

import { fetchInitialData } from '@/services/reportService';

import {
  setFormDataField,
  resetAccountingFields,
  setSuccess,
  clearError,
  selectFormData,
  selectOperationTypes,
  selectOperationCategories,
  selectLoading,
  selectSuccess,
  selectError,
  selectShowTransferForm,
  selectShowSuccessMessage,
  selectOperationOptions,
} from '@/store/slices/reportSlice';
import ReportInvoiceSwitcher from '../ReportInvoiceSwitcher/ReportInvoiceSwitcher';
import IncomeExpenseReportForm from './IncomeExpenseReportForm';
import TransferReportForm from './TransferReportForm';

const ReportForm: React.FC = () => {
  const dispatch = useAppDispatch();

  const formData = useAppSelector(selectFormData);
  const operation_types = useAppSelector(selectOperationTypes);
  const operationCategories = useAppSelector(selectOperationCategories);
  const loading = useAppSelector(selectLoading);
  const success = useAppSelector(selectSuccess);
  const error = useAppSelector(selectError);
  const showTransferForm = useAppSelector(selectShowTransferForm);
  const showSuccessMessage = useAppSelector(selectShowSuccessMessage);
  const operationOptions = useAppSelector(selectOperationOptions);

  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);

  useEffect(() => {
    const operation = operation_types.find(
      (op) => op.id === Number(formData.operation)
    );
    if (operation && operationCategories[String(operation.id)]) {
      dispatch(resetAccountingFields());
      if (operation.name !== 'Перемещение') {
        dispatch(setFormDataField({ name: 'wallet_from', value: '' }));
        dispatch(setFormDataField({ name: 'wallet_to', value: '' }));
      }
    }
  }, [formData.operation, operationCategories, operation_types, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(
        () => dispatch(setSuccess({ success: false })),
        2000
      );
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOperationChange = (name: keyof FormData, value: string) => {
    dispatch(setFormDataField({ name, value }));
  };

  return (
    <div className="py-10 px-4 bg-white flex flex-col gap-2.5 w-full h-screen mx-auto mt-1.5 rounded-t-[13px]">
      <ReportInvoiceSwitcher activeTab="report" />

      <SelectField
        name="operation"
        value={formData.operation}
        options={operationOptions}
        placeholder="Вид операции *"
        onChange={handleOperationChange}
        required
        className="mb-3.5 w-full text-sm text-black placeholder:text-gray-400"
      />

      {showTransferForm ? <TransferReportForm /> : <IncomeExpenseReportForm />}

      {loading && <Loader />}
      {showSuccessMessage && <SuccessMessage />}
      {error && <ErrorMessage />}
    </div>
  );
};

export default ReportForm;
