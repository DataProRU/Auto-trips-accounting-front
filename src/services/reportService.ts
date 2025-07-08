import { createAsyncThunk } from "@reduxjs/toolkit";

import type {
  IInitialDataResponse,
  ISubmitPayload,
} from "@/models/response/ReportResponse";

import { $api } from "@/setup/http/http";

export const fetchInitialData = createAsyncThunk<
  IInitialDataResponse,
  void,
  { rejectValue: string }
>("report/fetchInitialData", async (_, { rejectWithValue }) => {
  try {
    const response = await $api.get<IInitialDataResponse>("/get_form_data");
    return response.data;
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
  ISubmitPayload,
  { rejectValue: string }
>("report/submitForm", async (payload, { rejectWithValue }) => {
  try {
    await $api.post("/submit", payload, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("submitForm error:", error);
    if (error instanceof Error && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return rejectWithValue(
        axiosError.response?.data?.message || "Ошибка при отправке формы"
      );
    }
    return rejectWithValue("Ошибка при отправке формы: " + String(error));
  }
});
