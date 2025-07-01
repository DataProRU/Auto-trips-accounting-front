import type { FormData } from "../forms";
import type { InvoiceResponse, Wallet } from "../api";

// Report Actions
export interface SetFormFieldPayload {
  name: keyof FormData;
  value: string;
}

export interface SetLoadingPayload {
  loading: boolean;
}

export interface SetSuccessPayload {
  success: boolean;
}

// Invoice Actions
export interface SetViewPayload {
  view: "contractors" | "expenses" | null;
}

export interface SetInvoicesPayload {
  invoices: InvoiceResponse;
}

// Auth Actions
export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginSuccessPayload {
  username: string;
  token: string;
}

// Wallet Selection Actions
export interface OpenWalletSelectionPayload {
  invoiceId: number;
  isContractor: boolean;
}

export interface SetSelectedWalletPayload {
  walletId: string;
}

export interface SetWalletLoadingPayload {
  loading: boolean;
}

export interface SetWalletSubmittingPayload {
  submitting: boolean;
}

export interface SetWalletsPayload {
  wallets: Wallet[];
}

export interface SetWalletErrorPayload {
  error: string;
} 