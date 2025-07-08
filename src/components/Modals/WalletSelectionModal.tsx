import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { X } from "lucide-react";

import { Button } from "@/ui/button";
import SelectField from "@/ui/select-field";
import Modal from "@/ui/Modal";

import { useAppDispatch } from "@/hooks/hooks";

import {
  loadWallets,
  markInvoiceAsPaidAction,
  closeWalletSelection,
  setSelectedWallet,
  clearError,
} from "@/store/slices/walletSelectionSlice";
import {
  selectIsWalletModalOpen,
  selectWalletModalInvoiceId,
  selectWalletModalIsContractor,
  selectWalletSelectionWallets,
  selectWalletSelectionSelectedWallet,
  selectWalletLoading,
  selectWalletSubmitting,
  selectWalletError,
  selectWalletOptions,
  selectCanConfirmWalletSelection,
  selectWalletSelectionDisabled,
} from "@/store/selectors/walletSelectionSelectors";

interface WalletSelectionModalProps {
  refreshInvoices: () => Promise<void>;
  onConfirm: () => void;
}

const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
  refreshInvoices,
  onConfirm,
}) => {
  const dispatch = useAppDispatch();
  const isOpen = useSelector(selectIsWalletModalOpen);
  const invoiceId = useSelector(selectWalletModalInvoiceId);
  const isContractor = useSelector(selectWalletModalIsContractor);
  const wallets = useSelector(selectWalletSelectionWallets);
  const selectedWallet = useSelector(selectWalletSelectionSelectedWallet);
  const loading = useSelector(selectWalletLoading);
  const submitting = useSelector(selectWalletSubmitting);
  const error = useSelector(selectWalletError);
  const walletOptions = useSelector(selectWalletOptions);
  const canConfirm = useSelector(selectCanConfirmWalletSelection);
  const isDisabled = useSelector(selectWalletSelectionDisabled);

  useEffect(() => {
    if (isOpen && wallets.length === 0) {
      dispatch(loadWallets());
    }
  }, [isOpen, wallets.length, dispatch]);

  const handleChange = (_name: string, value: string) => {
    dispatch(setSelectedWallet({ walletId: value }));
  };

  const handleConfirm = async () => {
    if (!selectedWallet || !invoiceId) {
      return;
    }

    await dispatch(
      markInvoiceAsPaidAction(invoiceId, parseInt(selectedWallet), isContractor)
    );
    await refreshInvoices();
    onConfirm();
  };

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(loadWallets());
  };

  const handleClose = () => {
    dispatch(closeWalletSelection());
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="w-full max-w-md relative"
    >
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        onClick={handleClose}
        aria-label="Закрыть модальное окно"
        disabled={submitting}
      >
        <X className="w-6 h-6" />
      </button>

      <h2 className="text-xl font-bold mb-2 text-gray-900 pr-8">
        Укажите кошелек,
      </h2>
      <p className="text-xl font-bold mb-6 text-gray-900">
        {isContractor
          ? "на который поступили средства"
          : "с которого будут списаны средства"}
      </p>

      {loading ? (
        <p className="text-gray-500 text-center mb-6">Загрузка кошельков...</p>
      ) : error ? (
        <div className="text-center mb-4">
          <p className="text-red-500">{error}</p>
          <Button
            variant="blue"
            size="default"
            className="mt-2 w-full sm:w-auto font-light"
            onClick={handleRetry}
            disabled={submitting}
          >
            Повторить
          </Button>
        </div>
      ) : wallets.length === 0 ? (
        <div className="text-center mb-6">
          <p className="text-gray-500">Кошельки не найдены</p>
          <Button
            variant="blue"
            size="default"
            className="mt-2 w-full sm:w-auto font-light"
            onClick={handleRetry}
            disabled={submitting}
          >
            Повторить
          </Button>
        </div>
      ) : (
        <div className="mb-6">
          <SelectField
            name="wallet"
            value={selectedWallet}
            options={walletOptions}
            placeholder="Выпадающий список"
            onChange={handleChange}
            required
            error={error && !selectedWallet ? "Выберите кошелек" : undefined}
            className="w-full text-sm text-black"
          />
        </div>
      )}

      <Button
        variant="active"
        size="lg"
        className="w-full text-lg"
        onClick={handleConfirm}
        disabled={!canConfirm || isDisabled}
      >
        {submitting ? "Сохранение..." : "Сохранить"}
      </Button>
    </Modal>
  );
};

export default WalletSelectionModal;
