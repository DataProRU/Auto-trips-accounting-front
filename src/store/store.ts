import { configureStore } from "@reduxjs/toolkit";
import type { RootState } from "@/types/store";

import reportReducer from "./slices/reportSlice";
import invoiceReducer from "./slices/invoiceSlice";
import authReducer from "./slices/authSlice";
import walletSelectionReducer from "./slices/walletSelectionSlice";

export const store = configureStore({
  reducer: {
    report: reportReducer,
    invoice: invoiceReducer,
    auth: authReducer,
    walletSelection: walletSelectionReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type { RootState };
