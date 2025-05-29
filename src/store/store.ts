import { configureStore } from "@reduxjs/toolkit";
import reportReducer from "./slices/reportSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    report: reportReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
