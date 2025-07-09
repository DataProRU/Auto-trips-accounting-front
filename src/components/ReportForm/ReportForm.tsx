import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import type { Invoice } from "@/types/api";
import type { FormData } from "@/types/forms";
import type { RootState } from "@/store/store";

import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { DatePicker } from "@/ui/date-picker";
import ErrorMessage from "@/ui/error-message";
import SelectField from "@/ui/select-field";
import SuccessMessage from "@/ui/success-message";
import Loader from "@/ui/loader";
import TransferForm from "../TransferForm/TransferForm";
import NoneTransferForm from "../NoneTransferForm/NoneTransferForm";
import CounterpartyModal from "../Modals/CounterpartyModal";
import { getValidationSchema } from "@/lib/validationSchemas";

import { fetchInitialData, submitForm } from "@/services/reportService";
import { fetchInvoices } from "@/store/slices/invoiceSlice";

import {
  setFormDataField,
  resetAccountingFields,
  resetAccountType,
  setSuccess,
  clearError,
  createSubmitPayload,
  validateSubmitPayload,
} from "@/store/slices/reportSlice";
import {
  selectFormData,
  selectOperationTypes,
  selectWallets,
  selectCategoryArticles,
  selectOperationCategories,
  selectCurrencies,
  selectCompanies,
  selectCounterparties,
  selectLoading,
  selectSuccess,
  selectError,
  selectSelectedOperation,
  selectIsFormValid,
  selectShowCounterpartyField,
  selectShowTransferForm,
  selectShowSuccessMessage,
  selectOperationOptions,
  selectPaymentOptions,
  selectReportWalletOptions,
  selectCurrencyOptions,
  selectCompanyOptions,
  selectCounterpartyOptions,
} from "@/store/selectors/reportSelectors";
import { useSelector } from "react-redux";
import { selectIsWalletModalOpen } from "@/store/selectors/walletSelectionSelectors";

const ReportForm: React.FC = () => {
  const dispatch = useAppDispatch();

  // Используем селекторы вместо прямого обращения к состоянию
  const formData = useAppSelector(selectFormData);
  const operation_types = useAppSelector(selectOperationTypes);
  const wallets = useAppSelector(selectWallets);
  const categoryArticles = useAppSelector(selectCategoryArticles);
  const operationCategories = useAppSelector(selectOperationCategories);

  const currencies = useAppSelector(selectCurrencies);
  const companies = useAppSelector(selectCompanies);
  const counterparties = useAppSelector(selectCounterparties);
  const loading = useAppSelector(selectLoading);
  const success = useAppSelector(selectSuccess);
  const error = useAppSelector(selectError);

  // Вычисляемые селекторы
  const selectedOperation = useAppSelector(selectSelectedOperation);
  const isFormValid = useAppSelector(selectIsFormValid);
  const showCounterpartyField = useAppSelector(selectShowCounterpartyField);
  const showTransferForm = useAppSelector(selectShowTransferForm);
  const showSuccessMessage = useAppSelector(selectShowSuccessMessage);

  // Селекторы для опций
  const operationOptions = useAppSelector(selectOperationOptions);
  const paymentOptions = useAppSelector(selectPaymentOptions);
  const walletOptions = useAppSelector(selectReportWalletOptions);
  const currencyOptions = useAppSelector(selectCurrencyOptions);
  const companyOptions = useAppSelector(selectCompanyOptions);
  const counterpartyOptions = useAppSelector(selectCounterpartyOptions);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [wasSubmitted, setWasSubmitted] = useState(false);

  const reduxState = useAppSelector((state) => state as RootState);
  const isWalletModalOpen = useSelector(selectIsWalletModalOpen);
  const isAnyModalOpen = isModalOpen || isWalletModalOpen;

  const refreshInvoices = useCallback(async () => {
    try {
      await dispatch(fetchInvoices()).unwrap();
    } catch (err) {
      console.error("Ошибка обновления счетов:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);

  useEffect(() => {
    const operation = operation_types.find(
      (op) => op.id === Number(formData.operation)
    );
    if (operation && operationCategories[String(operation.id)]) {
      dispatch(resetAccountingFields());
      if (operation.name !== "Перемещение") {
        dispatch(setFormDataField({ name: "wallet_from", value: "" }));
        dispatch(setFormDataField({ name: "wallet_to", value: "" }));
      }
    }
  }, [
    formData.operation,
    operationCategories,
    operation_types,
    dispatch,
    counterparties,
    wallets,
  ]);

  useEffect(() => {
    if (formData.category && categoryArticles[formData.category]) {
      dispatch(resetAccountType());
    }
  }, [formData.category, categoryArticles, dispatch]);

  useEffect(() => {
    if (
      success &&
      (selectedOperation?.name === "Выставить счёт" ||
        selectedOperation?.name === "Выставить расход")
    ) {
      setIsModalOpen(true);
    } else if (success) {
      const timer = setTimeout(
        () => dispatch(setSuccess({ success: false })),
        2000
      );
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, selectedOperation]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    dispatch(setFormDataField({ name: "category", value: "" }));
    dispatch(setFormDataField({ name: "article", value: "" }));
  }, [formData.company, dispatch]);

  const handleChange = (name: keyof FormData, value: string) => {
    dispatch(setFormDataField({ name, value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      handleChange("date", date.toISOString().split("T")[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWasSubmitted(true);

    const validationSchema = getValidationSchema(
      formData,
      operation_types,
      wallets,
      counterparties,
      operationCategories,
      categoryArticles
    );

    const result = validationSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      setValidationErrors(
        Object.keys(errors).reduce(
          (acc, key) => ({
            ...acc,
            [key]: (errors as Record<string, string[]>)[key]?.[0] || "",
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
        currencies,
        reduxState
      );

      const validationError = validateSubmitPayload(payload, selectedOperation);
      if (validationError) {
        dispatch(setFormDataField({ name: "comment", value: validationError }));
        return;
      }

      await dispatch(submitForm(payload)).unwrap();

      if (
        selectedOperation?.name === "Выставить счёт" ||
        selectedOperation?.name === "Выставить расход"
      ) {
        const result = await dispatch(fetchInvoices()).unwrap();
        const invoices = result.items || [];

        const latestInvoice = invoices.reduce(
          (latest: Invoice | null, current: Invoice) => {
            if (!latest || current.id > latest.id) {
              return current;
            }
            return latest;
          },
          null
        );

        if (latestInvoice) {
          setCreatedInvoice(latestInvoice);
          setIsModalOpen(true);
        } else {
          dispatch(
            setFormDataField({
              name: "comment",
              value: "Не удалось загрузить созданный счет",
            })
          );
        }

        await refreshInvoices();
      }
    } catch (err) {
      dispatch(setFormDataField({ name: "comment", value: String(err) }));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCreatedInvoice(null);
    setWasSubmitted(false); // Сбросить флаг отправки
    dispatch(setSuccess({ success: false }));
    dispatch(setFormDataField({ name: "comment", value: "" }));
  };

  const isTransfer = selectedOperation?.name === "Перемещение";
  const isTransferValid =
    formData.wallet_from.trim() !== "" && formData.wallet_to.trim() !== "";

  return (
    <form
      onSubmit={handleSubmit}
      className="py-10 px-4 bg-white flex flex-col gap-2.5 w-full h-screen mx-auto mt-1.5 rounded-t-[13px]"
    >
      <SelectField
        name="company"
        value={formData.company}
        options={companyOptions}
        placeholder="Компания *"
        onChange={handleChange}
        required
        error={wasSubmitted && !isAnyModalOpen ? validationErrors.company : undefined}
        className="mb-3.5 w-full text-sm text-black placeholder:text-gray-400"
      />
      <div className="relative mb-3.5">
        <DatePicker
          value={formData.date ? new Date(formData.date) : undefined}
          onChange={handleDateChange}
          className={wasSubmitted && !isAnyModalOpen && validationErrors.date ? "border-red-500" : "text-black"}
        />
        {wasSubmitted && !isAnyModalOpen && validationErrors.date && <ErrorMessage />}
      </div>
      <SelectField
        name="operation"
        value={formData.operation}
        options={operationOptions}
        placeholder="Вид операции *"
        onChange={handleChange}
        required
        error={wasSubmitted && !isAnyModalOpen ? validationErrors.operation : undefined}
        className="mb-3.5 w-full text-sm text-black placeholder:text-gray-400"
      />
      {showTransferForm ? (
        <TransferForm
          formData={formData}
          handleChange={handleChange}
          errors={wasSubmitted && !isAnyModalOpen ? validationErrors : {}}
        />
      ) : (
        <NoneTransferForm
          formData={formData}
          operation_types={operation_types}
          operationCategories={operationCategories}
          categoryArticles={categoryArticles}
          companies={companies}
          handleChange={handleChange}
          errors={wasSubmitted && !isAnyModalOpen ? validationErrors : {}}
        />
      )}
      <div className="flex sm:flex-row gap-3 sm:gap-5 mb-3.5">
        <Input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          placeholder="Сумма *"
          className="grow text-sm text-black placeholder:text-gray-400 border-gray-200"

          error={wasSubmitted && !isAnyModalOpen ? validationErrors.amount : undefined}
        />
        <SelectField
          name="currency"
          value={formData.currency}
          options={currencyOptions}
          placeholder="Валюта *"
          onChange={handleChange}
          required
          error={wasSubmitted && !isAnyModalOpen ? validationErrors.currency : undefined}
          className="text-sm text-black truncate placeholder:text-gray-400"
        />
      </div>
      <SelectField
        name="payment_type"
        value={formData.payment_type}
        options={paymentOptions}
        placeholder="Способ оплаты *"
        onChange={handleChange}
        required
        error={wasSubmitted && !isAnyModalOpen ? validationErrors.payment_type : undefined}
        className="w-full text-sm text-black truncate mb-3.5 placeholder:text-gray-400"
      />
      <Textarea
        name="comment"
        value={formData.comment}
        onChange={(e) => handleChange("comment", e.target.value)}
        placeholder="Назначение платежа"
        className="my-1 min-h-[70px]"
      />
      {showCounterpartyField ? (
        <SelectField
          name="counterparty"
          value={formData.counterparty}
          options={counterpartyOptions}
          placeholder="Выберите контрагента *"
          onChange={handleChange}
          required
          error={wasSubmitted && !isAnyModalOpen ? validationErrors.counterparty : undefined}
          className="my-3.5 w-full text-sm text-black placeholder:text-gray-400"
        />
      ) : (
        selectedOperation?.name !== "Перемещение" && (
          <SelectField
            name="wallet"
            value={formData.wallet}
            options={walletOptions}
            placeholder="Кошелёк *"
            onChange={handleChange}
            required={
              selectedOperation?.name === "Приход" ||
              selectedOperation?.name === "Расход"
            }
            error={wasSubmitted && !isAnyModalOpen ? validationErrors.wallet : undefined}
            className="my-3.5 w-full text-sm text-black"
          />
        )
      )}
      <Button
        type="submit"
        disabled={loading || (isTransfer ? !isTransferValid : !isFormValid)}
        className="mb-3.5 w-full bg-[#25fcf1] hover:bg-[#25fcf1aa] text-black font-light p-5 rounded-[8px] text-sm sm:text-base"
      >
        Отправить
      </Button>
      {loading && <Loader />}
      {showSuccessMessage && <SuccessMessage />}
      {error && <ErrorMessage />}
      <CounterpartyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        invoice={createdInvoice}
        refreshInvoices={refreshInvoices}
      />
    </form>
  );
};

export default ReportForm;
