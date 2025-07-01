// Form Data Types
export interface FormData {
  status: string;
  company: string;
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