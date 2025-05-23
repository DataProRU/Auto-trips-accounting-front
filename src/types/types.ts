export interface Wallet {
  name: string;
  username: string;
}

export interface FormData {
  date: string;
  operation: string;
  wallet_from: string;
  wallet_to: string;
  category: string;
  article: string;
  date_finish: string;
  amount: string;
  payment_type: string;
  comment: string;
  currency: string;
  wallet: string;
  username: string;
}

export interface ReportState {
  formData: FormData;
  operations: { id: number; name: string }[];
  wallets: Wallet[];
  categoryArticles: Record<string, string[]>;
  operationCategories: Record<string, string[]>;
  paymentTypes: { name: string }[];
  loading: boolean;
  success: boolean;
  error: string | null;
  currencies: ICurrency[];
}

export interface ICurrency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}
