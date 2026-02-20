import { configureStore } from "@reduxjs/toolkit";
import type { RootState } from "@/types/store";

import reportReducer from "./slices/reportSlice";
import invoiceReducer from "./slices/invoiceSlice";
import companiesReducer from "./slices/companiesSlice";
import clientsReducer from "./slices/clientsSlice";
import authReducer from "./slices/authSlice";
import walletSelectionReducer from "./slices/walletSelectionSlice";

export const store = configureStore({
  reducer: {
    report: reportReducer,
    invoice: invoiceReducer,
    companies: companiesReducer,
    clients: clientsReducer,
    auth: authReducer,
    walletSelection: walletSelectionReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type { RootState };
