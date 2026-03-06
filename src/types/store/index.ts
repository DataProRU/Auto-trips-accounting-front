import type {
  OperationType,
  Wallet,
  Company,
  Counterparty,
  InvoiceResponse,
  Client,
  Product,
  ClientInvoice,
  VinNumber,
} from '../api';
import type { FormData } from '../forms';

export interface ReportState {
  formData: FormData;
  operation_types: OperationType[];
  wallets: Wallet[];
  users: { id: number; username: string }[];
  categoryArticles: Record<string, string[]>;
  operationCategories: Record<string, string[]>;
  companies: Company[];
  counterparties: Counterparty[];
  loading: boolean;
  success: boolean;
  error: string | null;
}

// Invoice State
export interface InvoiceState {
  view: 'contractors' | 'expenses' | null;
  invoices: InvoiceResponse;
  loading: boolean;
  error: string | null;
}

// Companies State
export interface CompaniesState {
  companies: Company[];
  loading: boolean;
  error: string | null;
}

// Clients State
export interface ClientsState {
  clients: Client[];
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

// Products State
export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

// Client Invoices State
export interface ClientInvoicesState {
  clientInvoices: ClientInvoice[];
  count: number;
  loading: boolean;
  error: string | null;
}

// Vins State
export interface VinsState {
  vins: VinNumber[];
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
  companies: CompaniesState;
  clients: ClientsState;
  products: ProductsState;
  clientInvoices: ClientInvoicesState;
  vins: VinsState;
  auth: AuthState;
  walletSelection: WalletSelectionState;
}

// Re-export FormData for convenience
export type { FormData } from '../forms';
