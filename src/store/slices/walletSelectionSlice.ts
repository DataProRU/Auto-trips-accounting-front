import {
  createSlice,
  createAction,
} from "@reduxjs/toolkit";

import type { Wallet } from "@/types/api";
import type { AppDispatch } from "@/store/store";
import type {
  OpenWalletSelectionPayload,
  SetSelectedWalletPayload,
  SetWalletLoadingPayload,
  SetWalletSubmittingPayload,
  SetWalletsPayload,
  SetWalletErrorPayload
} from "@/types/actions";

import { fetchWallets, markInvoiceAsPaid } from "@/services/invoiceService";

interface WalletSelectionState {
  isOpen: boolean;
  invoiceId: number | null;
  isContractor: boolean;
  wallets: Wallet[];
  selectedWallet: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: WalletSelectionState = {
  isOpen: false,
  invoiceId: null,
  isContractor: false,
  wallets: [],
  selectedWallet: "",
  loading: false,
  submitting: false,
  error: null,
};

export const openWalletSelection = createAction<OpenWalletSelectionPayload>("walletSelection/open");
export const closeWalletSelection = createAction("walletSelection/close");
export const setSelectedWallet = createAction<SetSelectedWalletPayload>("walletSelection/setSelectedWallet");
export const clearError = createAction("walletSelection/clearError");
export const setLoading = createAction<SetWalletLoadingPayload>("walletSelection/setLoading");
export const setSubmitting = createAction<SetWalletSubmittingPayload>("walletSelection/setSubmitting");
export const setWallets = createAction<SetWalletsPayload>("walletSelection/setWallets");
export const setError = createAction<SetWalletErrorPayload>("walletSelection/setError");

const walletSelectionSlice = createSlice({
  name: "walletSelection",
  initialState,
  reducers: {},
  extraReducers: (builder) => {

    builder.addCase(openWalletSelection, (state, action) => {
      state.isOpen = true;
      state.invoiceId = action.payload.invoiceId;
      state.isContractor = action.payload.isContractor;
      state.selectedWallet = "";
      state.error = null;
      state.submitting = false;
    });

    // closeWalletSelection
    builder.addCase(closeWalletSelection, (state) => {
      state.isOpen = false;
      state.invoiceId = null;
      state.isContractor = false;
      state.selectedWallet = "";
      state.error = null;
      state.submitting = false;
    });

    // setSelectedWallet
    builder.addCase(setSelectedWallet, (state, action) => {
      state.selectedWallet = action.payload.walletId;
      state.error = null;
    });

    // clearError
    builder.addCase(clearError, (state) => {
      state.error = null;
    });

    // setLoading
    builder.addCase(setLoading, (state, action) => {
      state.loading = action.payload.loading;
      if (action.payload.loading) {
        state.error = null;
      }
    });

    // setSubmitting
    builder.addCase(setSubmitting, (state, action) => {
      state.submitting = action.payload.submitting;
      if (action.payload.submitting) {
        state.error = null;
      }
    });

    // setWallets
    builder.addCase(setWallets, (state, action) => {
      state.wallets = action.payload.wallets;
      state.loading = false;
      state.error = null;
    });

    // setError
    builder.addCase(setError, (state, action) => {
      state.error = action.payload.error;
      state.loading = false;
      state.submitting = false;
    });
  },
});

// Thunk actions (using direct service calls)
export const loadWallets = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading({ loading: true }));
  try {
    const wallets = await fetchWallets();
    dispatch(setWallets({ wallets }));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Не удалось загрузить кошельки";
    dispatch(setError({ error: errorMessage }));
  }
};

export const markInvoiceAsPaidAction =
  (invoiceId: number, walletId: number, amount: number, isContractor: boolean) => async (dispatch: AppDispatch) => {
    dispatch(setSubmitting({ submitting: true }));
    try {
      await markInvoiceAsPaid(invoiceId, walletId, amount, isContractor);
      dispatch(setSubmitting({ submitting: false }));
      dispatch(closeWalletSelection());
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Не удалось отметить счет как оплаченный";
      dispatch(setError({ error: errorMessage }));
    }
  };

export default walletSelectionSlice.reducer;
