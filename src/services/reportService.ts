import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { ReportState, FormData } from "../types/types";

export const fetchInitialData = createAsyncThunk<
  Partial<ReportState>,
  void,
  { rejectValue: string }
>("report/fetchInitialData", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      "http://localhost:8001/tg_bot_add?username=admin"
    );
    return {
      username: response.data.username,
      operations: response.data.operations.map((op: any) => ({
        id: op.id,
        name: op.name,
      })),
      wallets: response.data.wallets.map((w: any) => ({
        name: w.name,
        username: w.username,
      })),
      categoryArticles: response.data.category_articles,
      operationCategories: response.data.operation_categories,
      paymentTypes: response.data.payment_types.map((pt: any) => ({
        name: pt.name,
      })),
      currencies: response.data.currencies,
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Ошибка загрузки данных"
    );
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
      const payload = {
        ...formData,
        operation: operation ? operation.name : "",
        amount: parseFloat(formData.amount) || 0,
        currency: formData.currency || "",
        wallet_from: formData.wallet_from || "",
        wallet_to: formData.wallet_to || "",
      };

      await axios.post("http://localhost:8001/submit", payload, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при отправке формы"
      );
    }
  }
);
