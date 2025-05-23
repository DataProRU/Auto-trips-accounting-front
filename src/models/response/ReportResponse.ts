import type { ICurrency } from "@/types/types";

export interface IInitialDataResponse {
  username: string;
  operations: { id: number; name: string }[];
  wallets: { id: number; name: string; username: string }[];
  category_articles: Record<string, string[]>;
  operation_categories: Record<string, string[]>;
  payment_types: { id: number; name: string }[];
  currencies: ICurrency[];
}

export interface ISubmitPayload {
  date: string;
  operation: string;
  wallet_from: string;
  wallet_to: string;
  category: string;
  article: string;
  date_finish: string;
  amount: number;
  payment_type: string;
  comment: string;
  currency: string;
  wallet: string;
  username: string;
}
