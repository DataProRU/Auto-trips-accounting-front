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

export interface Client {
  id?: number;
  full_name: string;
  phone: string;
}

export interface Product {
  id: number;
  name: string;
}

export interface ClientInvoice {
  id: number;
  company: number;
  client: number;
  product: number;
  date: string;
  amount: number;
  created_at: string;
  updated_at: string;
  deal_number?: string | number;
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
  currency_id?: number;
  currency_code?: string;
  currency_symbol?: string;
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
  remainder: number;
  is_paid: boolean;
  created_at: string;
  comment: string;
}

export interface User {
  id: number;
  username: string;
}

// API Response Interfaces
export interface IInitialDataResponse {
  companies: Company[];
  operation_types: OperationType[];
  payment_types: PaymentType[];
  wallets: Wallet[];
  currencies: Currency[];
  counterparties: Counterparty[];
  users?: User[];
}

export interface ISubmitPayload {
  operation_type_id: number;
  company_id: number;
  client_id: number;
  client_invoice_id: number;
  username: string;
  date: string;
  amount: number;
  article_id: number;
  finish_date: string;
  comment: string;
  wallet_id: number;
  wallet_from_id: number;
  wallet_to_id: number;
  product_id: number;
  money_holder_id: number;
}

export interface IClientInvoiceSubmitPayload {
  username: string;
  company_id: number;
  client_id: number;
}

export interface InvoiceResponse {
  items: Invoice[];
  total: number;
}

export interface VinNumber {
  id?: number;
  vin: string;
  car_model: string;
}

export interface EstimateItem {
  vin_id: number;
  port: number;
  terminal: number;
  loader_terminal: number;
  car_pickup: number;
  reexport: number;
  parking: number;
  broker: number;
  delivery: number;
  security: number;
  loader_parking: number;
  extra_services: number;
  extra_services_comment: string;
}
