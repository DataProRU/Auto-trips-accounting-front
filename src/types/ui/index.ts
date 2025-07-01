import type { Invoice } from "../api";

// UI Component Types
export interface SelectOption {
  value: string;
  label: string;
  key: string;
}

export interface CurrentData {
  issuer: string;
  amount: string;
  items: { number: number; description: string; invoice: Invoice }[];
}

export interface ButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "active" | "inactive" | "blue" | "gray" | "green";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  backdropClickClose?: boolean;
}

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export interface PdfViewerProps {
  pdfUrl: string | null;
  pdfError: string | null;
  pdfLoading: boolean;
  isMobile: boolean;
} 