import { createAsyncThunk } from "@reduxjs/toolkit";
import $api from "@/setup/http/http";
import type { Product } from "@/types";

export const fetchProducts = createAsyncThunk<
    Product[],
    void,
    { rejectValue: string }
>("products/fetchProducts", async (_, { rejectWithValue }) => {
    try {
        const response = await $api.get<Product[]>("/api/products");
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