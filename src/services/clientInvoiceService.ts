import type { ClientInvoiceFormData } from '@/lib/validationSchemas';
import $api from '@/setup/http/http';
import type { ClientInvoice, EstimateItem } from '@/types';
import { createAsyncThunk } from '@reduxjs/toolkit';

type SaveClientInvoicePayload = ClientInvoiceFormData & {
  estimates?: EstimateItem[];
};

export const saveClientInvoice = createAsyncThunk<
  void,
  SaveClientInvoicePayload,
  { rejectValue: string }
>('clientInvoice/saveClientInvoice', async (payload, { rejectWithValue }) => {
  try {
    await $api.post('/api/client-invoices', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return rejectWithValue(
        axiosError.response?.data?.message ||
          'Ошибка при сохранении счета клиента'
      );
    }
    return rejectWithValue(
      'Ошибка при сохранении счета клиента: ' + String(error)
    );
  }
});

interface ClientInvoiceResponse {
  items: ClientInvoice[];
  total: number;
}

export const fetchClientInvoice = createAsyncThunk<
  ClientInvoiceResponse,
  void,
  { rejectValue: string }
>('clientInvoice/fetchClientInvoice', async (_, { rejectWithValue }) => {
  try {
    const response = await $api.get<ClientInvoiceResponse | ClientInvoice[]>(
      '/api/client-invoices'
    );
    if (Array.isArray(response.data)) {
      return { items: response.data, total: response.data.length };
    }
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return rejectWithValue(
        axiosError.response?.data?.message || 'Ошибка загрузки счетов клиентов'
      );
    }
    return rejectWithValue('Ошибка загрузки счетов клиентов');
  }
});
