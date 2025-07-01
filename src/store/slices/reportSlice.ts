import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

import type { 
  ReportState, 
  FormData
} from "@/types/store";
import type { 
  IInitialDataResponse, 
  ISubmitPayload,
  OperationType,
  Company,
  Currency
} from "@/types/api";
import type {
  SetFormFieldPayload,
  SetLoadingPayload,
  SetSuccessPayload
} from "@/types/actions";

import { fetchInitialData, submitForm } from "../../services/reportService";

const initialFormData: FormData = {
  username: "",
  date: new Date().toISOString().split("T")[0],
  operation: "",
  category: "",
  article: "",
  date_finish: "",
  amount: "",
  currency: "",
  payment_type: "",
  comment: "",
  wallet_from: "",
  wallet_to: "",
  wallet: "",
  company: "",
  counterparty: "",
  status: "",
};

const initialState: ReportState = {
  formData: initialFormData,
  operation_types: [], 
  wallets: [],
  categoryArticles: {},
  operationCategories: {},
  paymentTypes: [],
  currencies: [],
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

  return {
    operation_types: data.operation_types,
    companies,
    counterparties,
    wallets: data.wallets.map((w) => ({
      id: w.id,
      name: w.name,
      user_id: w.user_id || 0,
      username: w.username || "",
    })),
    categoryArticles,
    operationCategories,
    paymentTypes: data.payment_types.map((pt) => ({
      id: pt.id,
      name: pt.name,
    })),
    currencies: data.currencies.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      symbol: c.symbol,
    })),
  };
};

// Функция для создания payload из данных формы
export const createSubmitPayload = (
  formData: FormData,
  operation_types: OperationType[],
  companies: Company[],
  currencies: Currency[],
  state?: RootState
): ISubmitPayload => {
  const operation = operation_types.find(
    (op) => op.id === Number(formData.operation)
  );
  
  let categoryId: number | null = null;
  let articleId: number | null = null;
  
  if (formData.category && formData.article) {
    for (const company of companies) {
      const category = company.categories.find(
        (cat) => cat.name === formData.category
      );
      if (category) {
        categoryId = category.id;
        const article = category.articles.find(
          (art) => art.title === formData.article
        );
        if (article) {
          articleId = article.id;
        }
        break;
      }
    }
  }

  const currency = currencies.find((cur) => cur.code === formData.currency);
  const currencyId = currency ? currency.id : null;

  const counterpartyId = formData.counterparty
    ? Number(formData.counterparty)
    : 0;

  const isTransfer = operation?.name === "Перемещение";

  const username = state?.auth.user?.username || localStorage.getItem("username") || "";

  return {
    username,
    company_id: formData.company ? Number(formData.company) : 0,
    operation_type_id: formData.operation ? Number(formData.operation) : 0,
    date: formData.date || "",
    amount: parseFloat(formData.amount) || 0,
    category_id: isTransfer ? null : categoryId,
    article_id: isTransfer ? null : articleId,
    finish_date: isTransfer ? "" : formData.date_finish || "",
    payment_type_id: formData.payment_type
      ? Number(formData.payment_type)
      : 0,
    comment: formData.comment || "",
    wallet_id: formData.wallet ? Number(formData.wallet) : 0,
    wallet_from_id: formData.wallet_from ? Number(formData.wallet_from) : 0,
    wallet_to_id: formData.wallet_to ? Number(formData.wallet_to) : 0,
    counterparty_id: counterpartyId,
    currency_id: currencyId,
  };
};

// Функция для валидации payload
export const validateSubmitPayload = (payload: ISubmitPayload, operation?: OperationType): string | null => {
  if (!payload.currency_id) {
    return "currency_id обязателен и должен быть числом";
  }

  if (
    (operation?.name === "Выставить счёт" ||
      operation?.name === "Выставить расход") &&
    !payload.counterparty_id
  ) {
    return "counterparty_id обязателен для операций 'Выставить счёт' и 'Выставить расход'";
  }

  return null;
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setFormDataField: (
      state,
      action: PayloadAction<SetFormFieldPayload>
    ) => {
      const { name, value } = action.payload;
      state.formData[name] = value;
    },
    resetFormData: (state) => {
      state.formData = { ...initialFormData };
    },
    resetAccountingFields: (state) => {
      state.formData.category = "";
      state.formData.article = "";
      state.formData.wallet_from = "";
      state.formData.wallet_to = "";
    },
    resetAccountType: (state) => {
      state.formData.article = "";
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
        state.categoryArticles = parsedData.categoryArticles;
        state.operationCategories = parsedData.operationCategories;
        state.paymentTypes = parsedData.paymentTypes;
        state.currencies = parsedData.currencies;
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
