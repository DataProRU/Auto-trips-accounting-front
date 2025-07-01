import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { InvoiceState } from "@/types/store";
import type { InvoiceResponse } from "@/types/api";

import { fetchInvoices as fetchInvoicesService } from "@/services/invoiceService";

interface SetViewPayload {
  view: "contractors" | "expenses" | null;
}

interface SetInvoicesPayload {
  invoices: InvoiceResponse;
}

export const fetchInvoices = createAsyncThunk<
  InvoiceResponse,
  void,
  { rejectValue: string }
>(
  "invoice/fetchInvoices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchInvoicesService();
      return response;
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message || "Ошибка загрузки инвойсов"
        );
      }
      return rejectWithValue("Ошибка загрузки инвойсов");
    }
  }
);

const initialState: InvoiceState = {
  view: null,
  invoices: { items: [], total: 0 },
  loading: false,
  error: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<SetViewPayload>) => {
      state.view = action.payload.view;
    },
    setInvoices: (state, action: PayloadAction<SetInvoicesPayload>) => {
      state.invoices = action.payload.invoices;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setView, setInvoices, clearError } = invoiceSlice.actions;
export default invoiceSlice.reducer;
