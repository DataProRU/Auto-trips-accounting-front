import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Client } from "@/types/api";
import { fetchClients } from "@/services/clientService";

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
  name: "clients",
  initialState,
  reducers: {
    addClient: (state, action: PayloadAction<Client>) => {
      const client = action.payload;
      if (client.id != null && !state.clients.some((c) => c.id === client.id)) {
        state.clients.push(client);
      } else if (client.id == null) {
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
