import type { RootState } from "@/types/store";

export const selectWallets = (state: RootState) => state.report.wallets;
export const selectWalletLoading = (state: RootState) => state.report.loading;
export const selectWalletError = (state: RootState) => state.report.error;

export const createWalletOptions = (wallets: { id: number; name: string; username: string }[]) => {
  return wallets.map((wallet, index) => ({
    value: String(wallet.id),
    label: wallet.username ? `${wallet.name} (${wallet.username})` : wallet.name,
    key: `${wallet.id}-${index}`,
  }));
};

