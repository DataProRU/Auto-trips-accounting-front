import $api from "@/setup/http/http";
import type { Client } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchClients = createAsyncThunk<
  Client[],
  void,
  { rejectValue: string }
>("clients/fetchClients", async (_, { rejectWithValue }) => {
  try {
    const response = await $api.get<Client[]>("/api/clients");
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



export async function createClient(
  payload: Client
): Promise<Client> {
  const response = await $api.post<Client>("/api/clients", payload);
  return response.data;
}