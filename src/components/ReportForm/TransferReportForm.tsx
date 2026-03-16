import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import type { FormData } from '@/types/forms';
import type { RootState } from '@/store/store';

import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { DatePicker } from '@/ui/date-picker';
import ErrorMessage from '@/ui/error-message';
import SelectField from '@/ui/select-field';
import TransferForm from '../TransferForm/TransferForm';
import { transferSchema } from '@/lib/validationSchemas';

import { submitForm } from '@/services/reportService';

import {
  setFormDataField,
  createSubmitPayload,
  validateSubmitPayload,
  selectFormData,
  selectOperationTypes,
  selectCurrencies,
  selectReportCompanies,
  selectLoading,
  selectUserOptions,
} from '@/store/slices/reportSlice';
import { useSelector } from 'react-redux';
import { selectIsWalletModalOpen } from '@/store/selectors/walletSelectionSelectors';

const TransferReportForm: React.FC = () => {
  const dispatch = useAppDispatch();

  const formData = useAppSelector(selectFormData);
  const operation_types = useAppSelector(selectOperationTypes);
  const currencies = useAppSelector(selectCurrencies);
  const companies = useAppSelector(selectReportCompanies);
  const loading = useAppSelector(selectLoading);
  const userOptions = useAppSelector(selectUserOptions);

  const currencyOptions = currencies.map((c) => ({
    value: String(c.id),
    label: `${c.code} (${c.symbol})`,
    key: `currency-${c.id}`,
  }));

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [wasSubmitted, setWasSubmitted] = useState(false);

  const reduxState = useAppSelector((state) => state as RootState);
  const isWalletModalOpen = useSelector(selectIsWalletModalOpen);
  const isAnyModalOpen = isWalletModalOpen;

  const isTransferValid =
    formData.operation.trim() !== '' &&
    formData.user_id.trim() !== '' &&
    formData.wallet_from.trim() !== '' &&
    formData.wallet_to.trim() !== '' &&
    formData.currency_from.trim() !== '' &&
    formData.currency_to.trim() !== '' &&
    formData.amount.trim() !== '' &&
    Number(formData.amount) > 0;

  const handleChange = (name: keyof FormData, value: string) => {
    dispatch(setFormDataField({ name, value }));
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      handleChange('date', date.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWasSubmitted(true);

    const result = transferSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setValidationErrors(
        Object.keys(errors).reduce(
          (acc, key) => ({
            ...acc,
            [key]: (errors as Record<string, string[]>)[key]?.[0] || '',
          }),
          {}
        )
      );
      return;
    }

    try {
      const payload = createSubmitPayload(
        formData,
        operation_types,
        companies,
        reduxState
      );

      const validationError = validateSubmitPayload(payload);
      if (validationError) {
        dispatch(setFormDataField({ name: 'comment', value: validationError }));
        return;
      }

      await dispatch(submitForm(payload)).unwrap();
    } catch (err) {
      dispatch(setFormDataField({ name: 'comment', value: String(err) }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <div className="relative mb-3.5">
        <DatePicker
          label="Дата назначения"
          value={formData.date ? new Date(formData.date) : undefined}
          onChange={handleDateChange}
          className={
            wasSubmitted && !isAnyModalOpen && validationErrors.date
              ? 'border-red-500'
              : 'text-black'
          }
        />
        {wasSubmitted && !isAnyModalOpen && validationErrors.date && (
          <ErrorMessage />
        )}
      </div>

      <TransferForm
        formData={formData}
        handleChange={handleChange}
        errors={wasSubmitted && !isAnyModalOpen ? validationErrors : {}}
      />
      <div className="flex sm:flex-row gap-3 sm:gap-5 mb-3.5">
        <SelectField
          name="currency_from"
          value={formData.currency_from}
          options={currencyOptions}
          placeholder="Валюта (откуда) *"
          onChange={handleChange}
          required
          error={
            wasSubmitted && !isAnyModalOpen
              ? validationErrors.currency_from
              : undefined
          }
          className="flex-1 w-full text-sm text-black placeholder:text-gray-400"
        />
        <SelectField
          name="currency_to"
          value={formData.currency_to}
          options={currencyOptions}
          placeholder="Валюта (куда) *"
          onChange={handleChange}
          required
          error={
            wasSubmitted && !isAnyModalOpen
              ? validationErrors.currency_to
              : undefined
          }
          className="flex-1 w-full text-sm text-black placeholder:text-gray-400"
        />
      </div>
      <div className="flex sm:flex-row gap-3 sm:gap-5 mb-3.5">
        <Input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          placeholder="Сумма *"
          className="grow text-sm text-black placeholder:text-gray-400 border-gray-200"
          error={
            wasSubmitted && !isAnyModalOpen
              ? validationErrors.amount
              : undefined
          }
        />
      </div>
      <SelectField
        name="user_id"
        value={formData.user_id}
        options={userOptions}
        placeholder="Держатель денег *"
        onChange={handleChange}
        required
        error={
          wasSubmitted && !isAnyModalOpen ? validationErrors.user_id : undefined
        }
        className="mb-3.5 w-full text-sm text-black placeholder:text-gray-400"
      />
      <Textarea
        name="comment"
        value={formData.comment}
        onChange={(e) => handleChange('comment', e.target.value)}
        placeholder="Назначение платежа"
        className="my-1 min-h-[70px]"
      />
      <Button
        type="submit"
        disabled={loading || !isTransferValid}
        className="mb-3.5 w-full bg-[#25fcf1] hover:bg-[#25fcf1aa] text-black font-light p-5 rounded-[8px] text-sm sm:text-base"
      >
        Отправить
      </Button>
    </form>
  );
};

export default TransferReportForm;
