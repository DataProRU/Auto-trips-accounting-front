import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

import type { ReportState, FormData } from '@/types/store';
import type {
  IInitialDataResponse,
  ISubmitPayload,
  OperationType,
  Company,
} from '@/types/api';
import type {
  SetFormFieldPayload,
  SetLoadingPayload,
  SetSuccessPayload,
} from '@/types/actions';

import { fetchInitialData, submitForm } from '../../services/reportService';

const initialFormData: FormData = {
  username: '',
  date: new Date().toISOString().split('T')[0],
  operation: '',
  client_id: '',
  product_id: '',
  invoice_id: '',
  deal_number: '',
  category: '',
  article: '',
  date_finish: new Date().toISOString().split('T')[0],
  amount: '',
  comment: '',
  wallet_from: '',
  wallet_to: '',
  user_id: '',
  wallet: '',
  company: '',
  counterparty: '',
  status: '',
};

const initialState: ReportState = {
  formData: initialFormData,
  operation_types: [],
  wallets: [],
  users: [],
  categoryArticles: {},
  operationCategories: {},
  companies: [],
  counterparties: [],
  loading: false,
  success: false,
  error: null,
};

// Функция для парсинга данных из API ответа
const parseInitialData = (data: IInitialDataResponse) => {
  const companies = data.companies.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    address: c.address,
    categories: c.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      operation_type_id: cat.operation_type_id,
      articles: cat.articles.map((art) => ({
        id: art.id,
        title: art.title,
      })),
    })),
  }));

  const counterparties = data.counterparties.map((c) => ({
    id: c.id,
    full_name: c.full_name,
  }));

  const operationCategories: Record<string, string[]> = {};
  companies.forEach((company) => {
    company.categories.forEach(
      (category: { operation_type_id: number; name: string }) => {
        const opId = String(category.operation_type_id);
        if (!operationCategories[opId]) {
          operationCategories[opId] = [];
        }
        if (!operationCategories[opId].includes(category.name)) {
          operationCategories[opId].push(category.name);
        }
      }
    );
  });

  const categoryArticles: Record<string, string[]> = {};
  data.companies.forEach((company) => {
    company.categories.forEach(
      (category: {
        name: string | number;
        articles: { id: number; title: string }[];
      }) => {
        categoryArticles[category.name] = category.articles.map(
          (article) => article.title
        );
      }
    );
  });

  const users: { id: number; username: string }[] = data.users ?? [];

  return {
    operation_types: data.operation_types,
    companies,
    counterparties,
    users,
    wallets: data.wallets.map((w) => ({
      id: w.id,
      name: w.name,
      user_id: w.user_id || 0,
      username: w.username || '',
      currency_id: (w as { currency_id?: number }).currency_id,
      currency_code: (w as { currency_code?: string }).currency_code,
      currency_symbol: (w as { currency_symbol?: string }).currency_symbol,
    })),
    categoryArticles,
    operationCategories,
  };
};

// Функция для создания payload из данных формы (поля по контракту бэкенда)
export const createSubmitPayload = (
  formData: FormData,
  operation_types: OperationType[],
  companies: Company[],
  state?: RootState,
  estimates?: { vin_id: number; amount: number }[]
): ISubmitPayload => {
  const operation = operation_types.find(
    (op) => op.id === Number(formData.operation)
  );
  const isTransfer = operation?.name === 'Перемещение';

  let articleId = 0;
  if (!isTransfer && formData.category && formData.article) {
    const company = companies.find((c) => String(c.id) === formData.company);
    if (company) {
      const category = company.categories.find(
        (cat) => cat.name === formData.category
      );
      if (category) {
        const article = category.articles.find(
          (art) => art.title === formData.article
        );
        if (article) articleId = article.id;
      }
    }
  }

  const username =
    state?.auth.user?.username || localStorage.getItem('username') || '';

  return {
    operation_type_id: formData.operation ? Number(formData.operation) : 0,
    company_id: formData.company ? Number(formData.company) : 0,
    client_id: formData.client_id ? Number(formData.client_id) : 0,
    client_invoice_id: formData.invoice_id ? Number(formData.invoice_id) : 0,
    username,
    date: isTransfer ? formData.date || '' : '',
    amount: parseFloat(formData.amount) || 0,
    article_id: articleId,
    finish_date: isTransfer ? '' : formData.date_finish || '',
    comment: formData.comment || '',
    wallet_id: formData.wallet ? Number(formData.wallet) : 0,
    wallet_from_id: formData.wallet_from ? Number(formData.wallet_from) : 0,
    wallet_to_id: formData.wallet_to ? Number(formData.wallet_to) : 0,
    product_id: formData.product_id ? Number(formData.product_id) : 0,
    money_holder_id: formData.user_id ? Number(formData.user_id) : 0,
    ...(estimates && estimates.length > 0 ? { estimates } : {}),
  };
};

// Функция для валидации payload
export const validateSubmitPayload = (
  payload: ISubmitPayload
): string | null => {
  if (payload.amount <= 0) return 'Сумма должна быть больше нуля';
  return null;
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setFormDataField: (state, action: PayloadAction<SetFormFieldPayload>) => {
      const { name, value } = action.payload;
      state.formData[name] = value;
    },
    resetFormData: (state) => {
      state.formData = { ...initialFormData };
    },
    resetAccountingFields: (state) => {
      state.formData.category = '';
      state.formData.article = '';
      state.formData.wallet_from = '';
      state.formData.wallet_to = '';
    },
    resetAccountType: (state) => {
      state.formData.article = '';
    },
    setLoading: (state, action: PayloadAction<SetLoadingPayload>) => {
      state.loading = action.payload.loading;
    },
    setSuccess: (state, action: PayloadAction<SetSuccessPayload>) => {
      state.success = action.payload.success;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        state.loading = false;
        const parsedData = parseInitialData(action.payload);
        state.operation_types = parsedData.operation_types;
        state.wallets = parsedData.wallets;
        state.users = parsedData.users;
        state.categoryArticles = parsedData.categoryArticles;
        state.operationCategories = parsedData.operationCategories;
        state.companies = parsedData.companies;
        state.counterparties = parsedData.counterparties;
      })
      .addCase(fetchInitialData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitForm.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitForm.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.formData = { ...initialFormData };
      })
      .addCase(submitForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFormDataField,
  resetFormData,
  resetAccountingFields,
  resetAccountType,
  setLoading,
  setSuccess,
  clearError,
  resetState,
} = reportSlice.actions;

export default reportSlice.reducer;

export const getSelectedOperation = (
  operation_types: OperationType[],
  operationId: string
) => operation_types.find((op) => op.id === Number(operationId));

export const selectFormData = (state: RootState): FormData =>
  state.report.formData;
export const selectOperationTypes = (state: RootState) =>
  state.report.operation_types;
export const selectWallets = (state: RootState) => state.report.wallets;
export const selectUsers = (state: RootState) => state.report.users;
export const selectCategoryArticles = (state: RootState) =>
  state.report.categoryArticles;
export const selectOperationCategories = (state: RootState) =>
  state.report.operationCategories;
export const selectReportCompanies = (state: RootState) =>
  state.report.companies;
export const selectCounterparties = (state: RootState) =>
  state.report.counterparties;
export const selectLoading = (state: RootState): boolean =>
  state.report.loading;
export const selectSuccess = (state: RootState): boolean =>
  state.report.success;
export const selectError = (state: RootState): string | null =>
  state.report.error;

export const selectSelectedOperation = (state: RootState) => {
  const formData = selectFormData(state);
  const operationTypes = selectOperationTypes(state);
  return getSelectedOperation(operationTypes, formData.operation);
};

export const selectSelectedCompany = (state: RootState) => {
  const formData = selectFormData(state);
  const companies = selectReportCompanies(state);
  return companies.find((c) => String(c.id) === formData.company);
};

export const selectSelectedWallet = (state: RootState) => {
  const formData = selectFormData(state);
  const wallets = selectWallets(state);
  return wallets.find((w) => String(w.id) === formData.wallet);
};

export const selectSelectedCounterparty = (state: RootState) => {
  const formData = selectFormData(state);
  const counterparties = selectCounterparties(state);
  return counterparties.find((cp) => String(cp.id) === formData.counterparty);
};

export const selectIsFormValid = (state: RootState): boolean => {
  const formData = selectFormData(state);
  const operationTypes = selectOperationTypes(state);
  const selectedOperation = getSelectedOperation(
    operationTypes,
    formData.operation
  );
  if (!selectedOperation) return false;
  switch (selectedOperation.name) {
    case 'Перемещение':
      return (
        formData.operation.trim() !== '' &&
        formData.user_id.trim() !== '' &&
        formData.wallet_from.trim() !== '' &&
        formData.wallet_to.trim() !== '' &&
        formData.amount.trim() !== '' &&
        Number(formData.amount) > 0
      );
    case 'Приход':
    case 'Расход': {
      const basicFieldsIncomeExpense = [
        formData.company,
        formData.operation,
        formData.amount,
        formData.user_id,
        formData.wallet,
        formData.invoice_id,
        formData.deal_number,
      ];
      if (!basicFieldsIncomeExpense.every((f) => f && f.trim() !== ''))
        return false;
      return Boolean(formData.article) && formData.article.trim() !== '';
    }
    default: {
      const basicFields = [
        formData.company,
        formData.operation,
        formData.amount,
      ];
      return basicFields.every((f) => f && f.trim() !== '');
    }
  }
};

export const selectShowWalletField = (state: RootState): boolean => {
  const selectedOperation = selectSelectedOperation(state);
  return (
    selectedOperation?.name === 'Приход' || selectedOperation?.name === 'Расход'
  );
};

export const selectShowTransferForm = (state: RootState): boolean => {
  const selectedOperation = selectSelectedOperation(state);
  return selectedOperation?.name === 'Перемещение';
};

export const selectShowSuccessMessage = (state: RootState): boolean =>
  selectSuccess(state);

export const selectOperationOptions = (state: RootState) => {
  const operationTypes = selectOperationTypes(state);
  const excluded = ['Выставить счёт', 'Выставить расход'];
  return operationTypes
    .filter((op) => !excluded.includes(op.name))
    .map((op, index) => ({
      value: String(op.id),
      label: op.name,
      key: `${op.id}-${index}`,
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

export const selectUserOptions = (state: RootState) => {
  const users = selectUsers(state);
  return users.map((u, index) => ({
    value: String(u.id),
    label: u.username,
    key: `user-${u.id}-${index}`,
  }));
};

export const selectReportCompanyOptions = (state: RootState) => {
  const companies = selectReportCompanies(state);
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
