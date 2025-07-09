import type { RootState } from "../store";
import type { FormData } from "@/types/forms";
import type { OperationType, SelectOption } from "@/types";

// Утилиты для работы с опциями
export const createOptions = <T>(
  items: T[],
  key: keyof T,
  labelFn?: (item: T) => string
): SelectOption[] =>
  items.map((item, index) => ({
    value: String(item[key]),
    label: labelFn ? labelFn(item) : String(item[key]),
    key: `${String(item[key])}-${index}`,
  }));

// Утилиты для работы с операциями
export const getSelectedOperation = (
  operation_types: OperationType[],
  operationId: string
) => {
  return operation_types.find((op) => op.id === Number(operationId));
};

export const isCounterpartyFieldVisible = (operationName?: string): boolean => {
  return (
    operationName === "Выставить расход" || operationName === "Выставить счёт"
  );
};

export const shouldShowSuccessMessage = (
  success: boolean,
  operationName?: string
): boolean => {
  return (
    success &&
    operationName !== "Выставить счёт" &&
    operationName !== "Выставить расход"
  );
};

// Базовые селекторы
export const selectFormData = (state: RootState): FormData => state.report.formData;
export const selectOperationTypes = (state: RootState) => state.report.operation_types;
export const selectWallets = (state: RootState) => state.report.wallets;
export const selectCategoryArticles = (state: RootState) => state.report.categoryArticles;
export const selectOperationCategories = (state: RootState) => state.report.operationCategories;
export const selectPaymentTypes = (state: RootState) => state.report.paymentTypes;
export const selectCurrencies = (state: RootState) => state.report.currencies;
export const selectCompanies = (state: RootState) => state.report.companies;
export const selectCounterparties = (state: RootState) => state.report.counterparties;

// Состояние UI
export const selectLoading = (state: RootState): boolean => state.report.loading;
export const selectSuccess = (state: RootState): boolean => state.report.success;
export const selectError = (state: RootState): string | null => state.report.error;

// Вычисляемые селекторы
export const selectSelectedOperation = (state: RootState) => {
  const formData = selectFormData(state);
  const operationTypes = selectOperationTypes(state);
  return getSelectedOperation(operationTypes, formData.operation);
};

export const selectSelectedCompany = (state: RootState) => {
  const formData = selectFormData(state);
  const companies = selectCompanies(state);
  return companies.find(company => String(company.id) === formData.company);
};

export const selectSelectedCurrency = (state: RootState) => {
  const formData = selectFormData(state);
  const currencies = selectCurrencies(state);
  return currencies.find(currency => currency.code === formData.currency);
};

export const selectSelectedPaymentType = (state: RootState) => {
  const formData = selectFormData(state);
  const paymentTypes = selectPaymentTypes(state);
  return paymentTypes.find(paymentType => String(paymentType.id) === formData.payment_type);
};

export const selectSelectedWallet = (state: RootState) => {
  const formData = selectFormData(state);
  const wallets = selectWallets(state);
  return wallets.find(wallet => String(wallet.id) === formData.wallet);
};

export const selectSelectedCounterparty = (state: RootState) => {
  const formData = selectFormData(state);
  const counterparties = selectCounterparties(state);
  return counterparties.find(counterparty => String(counterparty.id) === formData.counterparty);
};

// Селекторы для валидации
export const selectIsFormValid = (state: RootState): boolean => {
  const formData = selectFormData(state);
  const operationTypes = selectOperationTypes(state);
  
  // Базовые поля
  const basicFields = [
    formData.company,
    formData.operation,
    formData.amount,
    formData.currency,
    formData.payment_type,
  ];

  const basicFieldsValid = basicFields.every(field => field && field.trim() !== "");
  if (!basicFieldsValid) return false;

  const selectedOperation = getSelectedOperation(operationTypes, formData.operation);
  if (!selectedOperation) return false;

  // Проверка специфичных полей для каждого типа операции
  switch (selectedOperation.name) {
    case "Перемещение":
      return Boolean(formData.wallet_from) && Boolean(formData.wallet_to) &&
             formData.wallet_from.trim() !== "" && formData.wallet_to.trim() !== "";
    
    case "Выставить счёт":
    case "Выставить расход":
      return Boolean(formData.counterparty) && formData.counterparty.trim() !== "";
    
    case "Приход":
    case "Расход":
      return Boolean(formData.wallet) && formData.wallet.trim() !== "";
    
    default:
      return true;
  }
};

// Селекторы для UI состояния
export const selectShowCounterpartyField = (state: RootState): boolean => {
  const selectedOperation = selectSelectedOperation(state);
  return selectedOperation?.name === "Выставить расход" || selectedOperation?.name === "Выставить счёт";
};

export const selectShowWalletField = (state: RootState): boolean => {
  const selectedOperation = selectSelectedOperation(state);
  return selectedOperation?.name === "Приход" || selectedOperation?.name === "Расход";
};

export const selectShowTransferForm = (state: RootState): boolean => {
  const selectedOperation = selectSelectedOperation(state);
  return selectedOperation?.name === "Перемещение";
};

export const selectShowSuccessMessage = (state: RootState): boolean => {
  const success = selectSuccess(state);
  const selectedOperation = selectSelectedOperation(state);
  
  return success && 
         selectedOperation?.name !== "Выставить счёт" && 
         selectedOperation?.name !== "Выставить расход";
};

// Селекторы для опций форм
export const selectOperationOptions = (state: RootState) => {
  const operationTypes = selectOperationTypes(state);
  return operationTypes.map((op, index) => ({
    value: String(op.id),
    label: op.name,
    key: `${op.id}-${index}`,
  }));
};

export const selectPaymentOptions = (state: RootState) => {
  const paymentTypes = selectPaymentTypes(state);
  return paymentTypes.map((pt, index) => ({
    value: String(pt.id),
    label: pt.name,
    key: `${pt.id}-${index}`,
  }));
};

export const selectReportWalletOptions = (state: RootState) => {
  const wallets = selectWallets(state);
  return wallets.map((w, index) => ({
    value: String(w.id),
    label: w.username ? `${w.name} (${w.username})` : w.name,
    key: `${w.id}-${index}`,
  }));
};

export const selectCurrencyOptions = (state: RootState) => {
  const currencies = selectCurrencies(state);
  return currencies.map((c, index) => ({
    value: c.code,
    label: c.name,
    key: `${c.code}-${index}`,
  }));
};

export const selectCompanyOptions = (state: RootState) => {
  const companies = selectCompanies(state);
  return companies.map((c, index) => ({
    value: String(c.id),
    label: c.name,
    key: `${c.id}-${index}`,
  }));
};

export const selectCounterpartyOptions = (state: RootState) => {
  const counterparties = selectCounterparties(state);
  return counterparties.map((cp, index) => ({
    value: String(cp.id),
    label: cp.full_name,
    key: `${cp.id}-${index}`,
  }));
}; 