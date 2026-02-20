import { createAsyncThunk } from "@reduxjs/toolkit";
import $api from "@/setup/http/http";
import type { Company } from "@/types";

export const fetchCompanies = createAsyncThunk<
    Company[],
    void,
    { rejectValue: string }
>("companies/fetchCompanies", async (_, { rejectWithValue }) => {
    try {
        const response = await $api.get<Company[]>("/api/companies/");
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