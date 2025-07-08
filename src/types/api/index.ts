// API Response Types
export interface Article {
  id: number;
  title: string;
}

export interface Category {
  id: number;
  name: string;
  operation_type_id: number;
  articles: Article[];
}

export interface Company {
  id: number;
  name: string;
  phone: string;
  address: string;
  categories: Category[];
}

export interface OperationType {
  id: number;
  name: string;
}

export interface PaymentType {
  id: number;
  name: string;
}

export interface Wallet {
  id: number;
  name: string;
  user_id: number;
  username: string;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

export interface Counterparty {
  id: number;
  full_name: string;
}

export interface Invoice {
  id: number;
  company: { id: number; name: string };
  counterparty: { id: number; full_name: string };
  currency: { id: number; code: string; symbol: string };
  operation_type: { id: number; name: string };
  category: { id: number; name: string };
  article: { id: number; title: string };
  payment_type: { id: number; name: string };
  date: string;
  finish_date: string;
  amount: number;
  is_paid: boolean;
  created_at: string;
  comment: string;
}

// API Response Interfaces
export interface IInitialDataResponse {
  companies: Company[];
  operation_types: OperationType[];
  payment_types: PaymentType[];
  wallets: Wallet[];
  currencies: Currency[];
  counterparties: Counterparty[];
}

export interface ISubmitPayload {
  username: string;
  company_id: number;
  operation_type_id: number;
  date: string;
  amount: number;
  category_id: number | null;
  article_id: number | null;
  finish_date: string;
  payment_type_id: number;
  comment: string;
  wallet_id: number;
  wallet_from_id: number;
  wallet_to_id: number;
  counterparty_id: number;
  currency_id: number | null;
}

export interface InvoiceResponse {
  items: Invoice[];
  total: number;
} 