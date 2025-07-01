import type { RootState } from "@/types/store";
import type { Wallet } from "@/types/api";
import type { SelectOption } from "@/types/ui";

// Базовые селекторы
export const selectWalletSelection = (state: RootState) => state.walletSelection;
export const selectIsWalletModalOpen = (state: RootState) => state.walletSelection.isOpen;
export const selectWalletModalInvoiceId = (state: RootState) => state.walletSelection.invoiceId;
export const selectWalletModalIsContractor = (state: RootState) => state.walletSelection.isContractor;
export const selectWalletSelectionWallets = (state: RootState) => state.walletSelection.wallets;
export const selectWalletSelectionSelectedWallet = (state: RootState) => state.walletSelection.selectedWallet;
export const selectWalletLoading = (state: RootState) => state.walletSelection.loading;
export const selectWalletSubmitting = (state: RootState) => state.walletSelection.submitting;
export const selectWalletError = (state: RootState) => state.walletSelection.error;

// Вычисляемые селекторы
export const selectWalletOptions = (state: RootState): SelectOption[] => {
  const wallets = selectWalletSelectionWallets(state);
  return wallets.map((wallet, index) => ({
    value: String(wallet.id),
    label: wallet.username ? `${wallet.name} (${wallet.username})` : wallet.name,
    key: `${wallet.id}-${index}`,
  }));
};

export const selectSelectedWalletData = (state: RootState): Wallet | undefined => {
  const selectedWalletId = selectWalletSelectionSelectedWallet(state);
  const wallets = selectWalletSelectionWallets(state);
  return wallets.find((wallet: Wallet) => String(wallet.id) === selectedWalletId);
};

// Селекторы для UI состояния
export const selectCanConfirmWalletSelection = (state: RootState): boolean => {
  const selectedWallet = selectWalletSelectionSelectedWallet(state);
  const submitting = selectWalletSubmitting(state);
  return Boolean(selectedWallet) && !submitting;
};

export const selectShowWalletSelectionModal = (state: RootState): boolean => {
  const isOpen = selectIsWalletModalOpen(state);
  const loading = selectWalletLoading(state);
  const submitting = selectWalletSubmitting(state);
  
  return isOpen && !loading && !submitting;
};

export const selectWalletSelectionDisabled = (state: RootState): boolean => {
  const loading = selectWalletLoading(state);
  const submitting = selectWalletSubmitting(state);
  
  return loading || submitting;
}; 