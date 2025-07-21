import axios from "axios";

import type { InvoiceResponse } from "@/types/api";
import type { Wallet } from "@/types/api";

import { $api } from "@/setup/http/http";

export const fetchInvoices = async (): Promise<InvoiceResponse> => {
  try {
    const response = await $api.get("/api/invoices");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.message || "Ошибка загрузки инвойсов"
      );
    }
    throw new Error("Ошибка сети при загрузке инвойсов");
  }
};

export const fetchInvoicePdf = async (invoiceId: number): Promise<string> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await $api.get(
      `/api/financial_operation/${invoiceId}/pdf`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.type !== "application/pdf") {
      throw new Error("Получен неверный формат файла (не PDF)");
    }

    return URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.message || "Ошибка загрузки PDF"
      );
    }
    throw new Error("Ошибка сети при загрузке PDF");
  }
};

export const fetchWallets = async (): Promise<Wallet[]> => {
  try {
    const response = await $api.get("/wallets_react");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.message || "Ошибка загрузки кошельков"
      );
    }
    throw new Error("Ошибка сети при загрузке кошельков");
  }
};

export const markInvoiceAsPaid = async (
  invoiceId: number,
  walletId: number,
  amount: number,
  isContractor: boolean
): Promise<void> => {
  try {
    await $api.patch(`/api/invoices/${invoiceId}/pay`, {
      wallet_id: walletId,
      amount: amount,
      is_contractor: isContractor,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.message || "Ошибка обновления статуса"
      );
    }
    throw new Error("Ошибка сети при обновлении статуса");
  }
};
