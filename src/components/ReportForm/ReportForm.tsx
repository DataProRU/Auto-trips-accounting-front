import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { DatePicker } from "@/ui/date-picker";
import ErrorMessage from "@/ui/error-message";
import SelectField from "@/ui/select-field";
import {
  setFormDataField,
  resetAccountingFields,
  resetAccountType,
  setSuccess,
} from "@/store/slices/reportSlice";
import { fetchInitialData, submitForm } from "@/services/reportService";
import TransferForm from "../TransferForm/TransferForm";
import NoneTransferForm from "../NoneTransferForm/NoneTransferForm";
import SuccessMessage from "@/ui/success-message";
import Loader from "@/ui/loader";

const ReportForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    formData,
    operations,
    wallets,
    categoryArticles,
    operationCategories,
    paymentTypes,
    loading,
    success,
    error,
    currencies,
  } = useAppSelector((state) => state.report);

  const params = new URLSearchParams(location.search);
  const username = params.get("username");

  const createOptions = <T,>(
    items: T[],
    key: keyof T,
    labelFn?: (item: T) => string
  ) =>
    items.map((item, index) => ({
      value: String(item[key]),
      label: labelFn ? labelFn(item) : String(item[key]),
      key: `${String(item[key])}-${index}`,
    }));

  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);

  useEffect(() => {
    const operation = operations.find(
      (op) => op.id === Number(formData.operation)
    );
    if (operation && operationCategories[operation.name]) {
      dispatch(resetAccountingFields());
      if (operation.name !== "Перемещение") {
        dispatch(setFormDataField({ name: "wallet_from", value: "" }));
        dispatch(setFormDataField({ name: "wallet_to", value: "" }));
      }
    }
  }, [formData.operation, operationCategories, operations, dispatch]);

  useEffect(() => {
    if (formData.category && categoryArticles[formData.category]) {
      dispatch(resetAccountType());
    }
  }, [formData.category, categoryArticles, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(setSuccess(false)), 1000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(
        () => dispatch(setFormDataField({ name: "error", value: "" })),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleChange = (name: string, value: string) => {
    dispatch(setFormDataField({ name, value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      handleChange("date", date.toISOString().split("T")[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operations.length) {
      dispatch(
        setFormDataField({ name: "error", value: "Операции не загружены" })
      );
      return;
    }
    dispatch(submitForm({ ...formData, operations, username: username ?? "" }));
  };

  const operationOptions = createOptions(operations, "id", (op) => op.name);
  const paymentOptions = createOptions(paymentTypes, "name");
  const walletOptions = createOptions(
    wallets,
    "name",
    (w) => `${w.name} (${w.username})`
  );
  const currencyOptions = createOptions(currencies, "code", (c) => c.name);

  const selectedOperation = operations.find(
    (op) => op.id === Number(formData.operation)
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="py-10 px-4 bg-white flex flex-col gap-2.5 w-full h-screen mx-auto mt-1.5 rounded-t-[13px]"
    >
      <div className="relative mb-3.5">
        <DatePicker
          value={formData.date ? new Date(formData.date) : undefined}
          onChange={handleDateChange}
          disabled={true}
          className="text-black"
        />
      </div>
      <SelectField
        name="operation"
        value={formData.operation}
        options={operationOptions}
        placeholder="Вид операции"
        onChange={handleChange}
        required
        className="mb-3.5 w-full text-sm text-black placeholder:text-gray-400"
      />
      {selectedOperation?.name === "Перемещение" ? (
        <TransferForm
          formData={formData}
          wallets={wallets}
          handleChange={handleChange}
        />
      ) : (
        <NoneTransferForm
          formData={formData}
          operations={operations}
          operationCategories={operationCategories}
          categoryArticles={categoryArticles}
          handleChange={handleChange}
        />
      )}
      <div className="flex sm:flex-row gap-3 sm:gap-5 mb-3.5">
        <Input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          placeholder="Сумма"
          className="w-1/2"
          required
        />
        <SelectField
          name="currency"
          value={formData.currency}
          options={currencyOptions}
          placeholder="Валюта"
          onChange={handleChange}
          required
          className="w-1/2   text-sm text-black truncate placeholder:text-gray-400"
        />
      </div>
      <SelectField
        name="payment_type"
        value={formData.payment_type}
        options={paymentOptions}
        placeholder="Способ оплаты"
        onChange={handleChange}
        required
        className="w-full text-sm text-black truncate mb-3.5 placeholder:text-gray-400"
      />
      <Textarea
        name="comment"
        value={formData.comment}
        onChange={(e) => handleChange("comment", e.target.value)}
        placeholder="Назначение платежа"
        className="my-1"
      />
      {selectedOperation?.name !== "Перемещение" && (
        <SelectField
          name="wallet"
          value={formData.wallet}
          options={walletOptions}
          placeholder="Кошелёк"
          onChange={handleChange}
          required
          className="my-3.5 w-full text-sm text-black "
        />
      )}
      <Button
        type="submit"
        disabled={loading}
        className="mb-3.5 w-full bg-[#25fcf1] hover:bg-[#25fcf1aa] text-black font-light p-5 rounded-[8px] text-sm sm:text-base"
      >
        Отправить
      </Button>
      {loading && <Loader />}
      {success && <SuccessMessage />}
      {error && <ErrorMessage />}
    </form>
  );
};

export default ReportForm;
