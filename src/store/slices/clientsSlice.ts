import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Client } from '@/types/api';
import { fetchClients } from '@/services/clientService';
import type { RootState } from '@/types/store';

export interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [],
  loading: false,
  error: null,
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    addClient: (state, action: PayloadAction<Client>) => {
      const client = action.payload;
      if (!state.clients.some((c) => c.id === client.id)) {
        state.clients.push(client);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
        state.error = null;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      });
  },
});

export const { addClient } = clientsSlice.actions;

export default clientsSlice.reducer;
export const selectClients = (state: RootState) => state.clients.clients;
export const selectClientsLoading = (state: RootState) => state.clients.loading;
export const selectClientsError = (state: RootState) => state.clients.error;

export const selectClientOptions = createSelector([selectClients], (clients) =>
  clients.map((c, i) => ({
    value: String(c.id ?? i),
    label: c.full_name,
    key: `client-${c.id ?? i}-${i}`,
  }))
);
