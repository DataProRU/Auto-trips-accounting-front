// Form Data Types
export interface FormData {
  status: string;
  company: string;
  client_id: string;
  product_id: string;
  invoice_id: string;
  deal_number: string;
  date: string;
  operation: string;
  wallet_from: string;
  wallet_to: string;
  currency_from: string;
  currency_to: string;
  user_id: string;
  category: string;
  article: string;
  date_finish: string;
  amount: string;
  comment: string;
  wallet: string;
  username: string;
  counterparty: string;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
