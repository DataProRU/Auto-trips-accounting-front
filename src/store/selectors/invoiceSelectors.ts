import type { RootState } from "../store";
import type { Invoice } from "@/types/api";
import type { CurrentData } from "@/types/ui";

// Утилиты для работы с инвойсами
export const formatInvoiceData = (invoices: Invoice[]): CurrentData => ({
  issuer: invoices.length > 0 ? invoices[0].company.name : "[Неизвестно]",
  amount:
    invoices.length > 0
      ? `${invoices.reduce((sum, item) => sum + item.amount, 0)} ${
          invoices[0].currency.symbol || ""
        }`
      : "0 ",
  items: invoices.map((invoice, index) => ({
    number: index + 1,
    description: `[№ счета ${invoice.id}], [${
      invoice.counterparty.full_name
    }] от [${new Date(invoice.date).toLocaleDateString("ru-RU")}]`,
    invoice,
  })),
});

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error("Ошибка копирования:", error);
    alert("Ссылка скопирована!");
  }
};

export const downloadPdf = (url: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
};

export const openPdfInNewTab = (url: string): void => {
  window.open(url, "_blank");
};

// Базовые селекторы
export const selectInvoices = (state: RootState) => state.invoice.invoices.items;
export const selectInvoicesLoading = (state: RootState) => state.invoice.loading;
export const selectInvoicesError = (state: RootState) => state.invoice.error;

export const selectLatestInvoice = (state: RootState): Invoice | null => {
  const invoices = state.invoice.invoices.items;
  if (!invoices.length) return null;
  
  return invoices.reduce((latest: Invoice | null, current: Invoice) => {
    if (!latest || current.id > latest.id) {
      return current;
    }
    return latest;
  }, null);
}; 