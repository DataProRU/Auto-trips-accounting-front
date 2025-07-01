import type { 
  OperationType, 
  PaymentType, 
  Wallet, 
  Currency, 
  Company, 
  Counterparty,
  InvoiceResponse
} from "../api";
import type { FormData } from "../forms";

export interface ReportState {
  formData: FormData;
  operation_types: OperationType[];
  wallets: Wallet[];
  categoryArticles: Record<string, string[]>;
  operationCategories: Record<string, string[]>;
  paymentTypes: PaymentType[];
  currencies: Currency[];
  companies: Company[];
  counterparties: Counterparty[];
  loading: boolean;
  success: boolean;
  error: string | null;
}

// Invoice State
export interface InvoiceState {
  view: "contractors" | "expenses" | null;
  invoices: InvoiceResponse;
  loading: boolean;
  error: string | null;
}

// Auth State
export interface AuthState {
  isAuthenticated: boolean;
  user: {
    username: string;
    token: string;
  } | null;
  loading: boolean;
  error: string | null;
}

// Wallet Selection State
export interface WalletSelectionState {
  isOpen: boolean;
  invoiceId: number | null;
  isContractor: boolean;
  wallets: Wallet[];
  selectedWallet: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

// Root State
export interface RootState {
  report: ReportState;
  invoice: InvoiceState;
  auth: AuthState;
  walletSelection: WalletSelectionState;
}

// Re-export FormData for convenience
export type { FormData } from "../forms"; 