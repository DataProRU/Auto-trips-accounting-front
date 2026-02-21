import { createSlice } from '@reduxjs/toolkit';
import type { ClientInvoice } from '@/types/api';
import {
  fetchClientInvoice,
  saveClientInvoice,
} from '@/services/clientInvoiceService';
import type { RootState } from '@/types/store';

export interface ClientInvoicesState {
  clientInvoices: ClientInvoice[];
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: ClientInvoicesState = {
  clientInvoices: [],
  count: 0,
  loading: false,
  error: null,
};

const clientInvoicesSlice = createSlice({
  name: 'clientInvoices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.clientInvoices = action.payload.items ?? [];
        state.count = action.payload.total ?? state.clientInvoices.length;
        state.error = null;
      })
      .addCase(fetchClientInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
        state.clientInvoices = [];
      })
      .addCase(saveClientInvoice.fulfilled, (state) => {
        state.count += 1;
      });
  },
});

export default clientInvoicesSlice.reducer;
export const selectClientInvoices = (state: RootState) =>
  state.clientInvoices?.clientInvoices ?? [];

export const selectClientInvoicesCount = (state: RootState) =>
  state.clientInvoices?.count ?? 0;

export const selectClientInvoicesLoading = (state: RootState) =>
  state.clientInvoices?.loading ?? false;

export const selectClientInvoicesError = (state: RootState) =>
  state.clientInvoices?.error ?? null;

export const selectNextInvoiceNumber = (state: RootState) =>
  (selectClientInvoicesCount(state) ?? 0) + 1;
