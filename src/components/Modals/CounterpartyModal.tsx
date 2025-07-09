import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

import type { Invoice } from "@/types/api";

import { Button } from "@/ui/button";
import Toast from "@/ui/toast";
import Modal from "@/ui/Modal";
import PdfViewer from "@/components/PdfViewer/PdfViewer";
import WalletSelectionModal from "./WalletSelectionModal";

import { useAppDispatch } from "@/hooks/hooks";

import { fetchInvoicePdf } from "@/services/invoiceService";
import { downloadPdf } from "@/store/selectors/invoiceSelectors";

import { setFormDataField } from "@/store/slices/reportSlice";
import { openWalletSelection } from "@/store/slices/walletSelectionSlice";

interface CounterpartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  refreshInvoices: () => Promise<void>;
}

const CounterpartyModal: React.FC<CounterpartyModalProps> = ({
  isOpen,
  onClose,
  invoice,
  refreshInvoices,
}) => {
  const dispatch = useAppDispatch();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Функция для получения серверного URL PDF
  const getInvoicePdfUrl = (invoiceId: number) =>
    `https://finance.workshop-garage.ru/api/financial_operation/${invoiceId}/pdf`;

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone/i.test(navigator.userAgent));

    if (!invoice) return;

    const loadPdf = async () => {
      console.log(`Fetching PDF for invoice ${invoice.id}`);
      setPdfLoading(true);
      try {
        const url = await fetchInvoicePdf(invoice.id);
        setPdfUrl(url);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Не удалось загрузить PDF";
        setPdfError(errorMessage);
      } finally {
        setPdfLoading(false);
      }
    };
    loadPdf();

    return () => {
      if (pdfUrl) {
        console.log(`Revoking PDF URL for invoice ${invoice?.id}`);
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [invoice]);

  const handleCopyLink = useCallback(async () => {
    if (invoice) {
      await navigator.clipboard.writeText(getInvoicePdfUrl(invoice.id));
      setShowToast(true);
    }
  }, [invoice]);

  const handleOpenWalletModal = useCallback(() => {
    const isContractor = invoice?.operation_type.name === "Выставить счёт";
    if (invoice) {
      dispatch(
        openWalletSelection({
          invoiceId: invoice.id,
          isContractor: isContractor,
        })
      );
    }
  }, [dispatch, invoice]);

  const handleWalletModalConfirm = useCallback(() => {
    dispatch(setFormDataField({ name: "status", value: "Оплачен" }));
    onClose();
  }, [dispatch, onClose]);

  if (!isOpen || !invoice) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-4xl max-h-[90vh] overflow-auto relative p-4 m-4"
    >
      <button
        className="absolute top-2 right-2 text-black text-2xl"
        onClick={onClose}
        aria-label="Закрыть модальное окно"
      >
        <X className="size-6 bg-white" />
      </button>
      <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-900">
        Счет №{invoice.id}
      </h2>
      {!isMobile ? (
        <PdfViewer
          pdfUrl={pdfUrl}
          pdfError={pdfError}
          pdfLoading={pdfLoading}
          isMobile={isMobile}
        />
      ) : (
        <div className="my-4 text-center text-gray-500">
          <div className="mb-2">
            Предпросмотр PDF не поддерживается на мобильных устройствах.
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 justify-center">
        <Button
          variant="blue"
          size="default"
          className="w-full sm:w-auto font-light"
          onClick={handleCopyLink}
          disabled={!pdfUrl}
        >
          Скопировать ссылку
        </Button>
        <Button
          variant="gray"
          size="default"
          className="w-full sm:w-auto font-light"
          onClick={() =>
            pdfUrl && downloadPdf(pdfUrl, `invoice-${invoice.id}.pdf`)
          }
          disabled={!pdfUrl}
        >
          Скачать PDF
        </Button>
        <Button
          variant="green"
          size="default"
          className="w-full sm:w-auto font-light"
          onClick={handleOpenWalletModal}
        >
          Отметить оплаченным
        </Button>
      </div>
      <Toast
        message="Ссылка скопирована!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <WalletSelectionModal
        refreshInvoices={refreshInvoices}
        onConfirm={handleWalletModalConfirm}
      />
    </Modal>
  );
};

export default CounterpartyModal;
