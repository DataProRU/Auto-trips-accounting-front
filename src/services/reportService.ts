import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ReportState, FormData } from "../types/types";
import { $api } from "@/setup/http/http";
import type {
  IInitialDataResponse,
  ISubmitPayload,
} from "@/models/response/ReportResponse";

export const fetchInitialData = createAsyncThunk<
  Partial<ReportState>,
  void,
  { rejectValue: string }
>("report/fetchInitialData", async (_, { rejectWithValue }) => {
  try {
    const response = await $api.get<IInitialDataResponse>(
      "/tg_bot_add?username=admin"
    );
    const { data } = response;
    return {
      ...data,
      wallets: data.wallets.map((w) => ({
        name: w.name,
        username: w.username,
      })),
      categoryArticles: data.category_articles,
      operationCategories: data.operation_categories,
      paymentTypes: data.payment_types.map((pt) => ({
        name: pt.name,
      })),
    };
  } catch (error: unknown) {
    if (error instanceof Error && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return rejectWithValue(
        axiosError.response?.data?.message || "Ошибка загрузки данных"
      );
    }
    return rejectWithValue("Ошибка загрузки данных");
  }
});

export const submitForm = createAsyncThunk<
  void,
  FormData & { operations: { id: number; name: string }[] },
  { rejectValue: string }
>(
  "report/submitForm",
  async ({ operations, ...formData }, { rejectWithValue }) => {
    try {
      const operation = operations.find(
        (op) => op.id === Number(formData.operation)
      );
      const payload: ISubmitPayload = {
        ...formData,
        operation: operation ? operation.name : "",
        amount: parseFloat(formData.amount) || 0,
        currency: formData.currency || "",
        wallet_from: formData.wallet_from || "",
        wallet_to: formData.wallet_to || "",
      };

      await $api.post<ISubmitPayload, void>("/submit", payload, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message || "Ошибка при отправке формы"
        );
      }
      return rejectWithValue("Ошибка при отправке формы");
    }
  }
);
