import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ReportState, FormData } from "../../types/types";
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
};

const initialState: ReportState = {
  formData: initialFormData,
  operations: [],
  wallets: [],
  categoryArticles: {},
  operationCategories: {},
  paymentTypes: [],
  currencies: [],
  loading: false,
  success: false,
  error: null,
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setFormDataField: (
      state,
      action: PayloadAction<{ name: string; value: string }>
    ) => {
      state.formData[action.payload.name as keyof FormData] =
        action.payload.value;
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.success = action.payload;
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
        state.operations = action.payload.operations || [];
        state.wallets = action.payload.wallets || [];
        state.categoryArticles = action.payload.categoryArticles || {};
        state.operationCategories = action.payload.operationCategories || {};
        state.paymentTypes = action.payload.paymentTypes || [];
        state.currencies = action.payload.currencies || [];
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
} = reportSlice.actions;

export default reportSlice.reducer;
