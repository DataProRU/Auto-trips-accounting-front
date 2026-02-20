import type { RootState } from "@/store/store";

export const selectClientInvoices = (state: RootState) =>
    state.clientInvoices?.clientInvoices ?? [];

export const selectClientInvoicesCount = (state: RootState) =>
    state.clientInvoices?.count ?? 0;

export const selectClientInvoicesLoading = (state: RootState) =>
    state.clientInvoices?.loading ?? false;

export const selectClientInvoicesError = (state: RootState) =>
    state.clientInvoices?.error ?? null;

export const selectNextInvoiceNumber = (state: RootState) =>
    (state.clientInvoices?.count ?? 0) + 1;
