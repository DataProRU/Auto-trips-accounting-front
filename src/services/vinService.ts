import $api from '@/setup/http/http';
import type { VinNumber } from '@/types/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchVins = createAsyncThunk<
  VinNumber[],
  void,
  { rejectValue: string }
>('vins/fetchVins', async (_, { rejectWithValue }) => {
  try {
    const response = await $api.get<VinNumber[]>('/api/vin_numbers');
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return rejectWithValue(
        axiosError.response?.data?.message || 'Ошибка загрузки VIN-номеров'
      );
    }
    return rejectWithValue('Ошибка загрузки VIN-номеров');
  }
});

export async function createVin(payload: VinNumber): Promise<VinNumber> {
  const response = await $api.post<VinNumber>('/api/vin_numbers', payload);
  return response.data;
}
