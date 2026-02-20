import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

export const selectClients = (state: RootState) => state.clients.clients;
export const selectClientsLoading = (state: RootState) => state.clients.loading;
export const selectClientsError = (state: RootState) => state.clients.error;

export const selectClientOptions = createSelector(
  [selectClients],
  (clients) =>
    clients.map((c, i) => ({
      value: String(c.id ?? i),
      label: c.full_name,
      key: `client-${c.id ?? i}-${i}`,
    }))
);
