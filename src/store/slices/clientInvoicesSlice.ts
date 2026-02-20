import { createSlice } from "@reduxjs/toolkit";
import type { ClientInvoice } from "@/types/api";
import { fetchClientInvoice, saveClientInvoice } from "@/services/clientInvoiceService";

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
    name: "clientInvoices",
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
