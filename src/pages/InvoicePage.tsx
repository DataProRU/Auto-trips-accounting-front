import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { setView, fetchInvoices } from "@/store/slices/invoiceSlice";
import { setFormDataField } from "@/store/slices/reportSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { Invoice } from "@/types/api";
import Header from "@/components/Header/Header";
import InvoiceFilterButtons from "@/components/InvoiceFilterButtons/InvoiceFilterButtons";
import InvoiceList from "@/components/InvoiceList/InvoiceList";
import { Button } from "@/ui/button";
import { formatInvoiceData } from "@/store/selectors/invoiceSelectors";
import CounterpartyModal from "@/components/Modals/CounterpartyModal";

const InvoicePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { view, invoices, loading, error } = useSelector(
    (state: RootState) => state.invoice
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const refreshInvoices = useCallback(async () => {
    try {
      await dispatch(fetchInvoices()).unwrap();
    } catch (err) {
      console.error("Ошибка обновления счетов:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        dispatch(setView({ view: "contractors" }));
        await refreshInvoices();
      } catch (err) {
        console.error("Ошибка загрузки счетов:", err);
      }
    };
    loadInvoices();
  }, [dispatch, refreshInvoices]);

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    dispatch(
      setFormDataField({
        name: "counterparty",
        value: String(invoice.counterparty.id),
      })
    );
    dispatch(
      setFormDataField({ name: "amount", value: String(invoice.amount) })
    );
    dispatch(
      setFormDataField({
        name: "date",
        value: new Date(invoice.date).toLocaleDateString("ru-RU"),
      })
    );
    dispatch(
      setFormDataField({
        name: "status",
        value: invoice.is_paid ? "Оплачен" : "Ожидает оплаты",
      })
    );
    dispatch(
      setFormDataField({
        name: "company",
        value: String(invoice.company.id),
      })
    );
    dispatch(setFormDataField({ name: "date", value: invoice.date }));
    dispatch(setFormDataField({ name: "date_finish", value: invoice.finish_date }));
    dispatch(
      setFormDataField({ name: "operation", value: String(invoice.operation_type.id) })
    );
    setIsModalOpen(true);
  };

  const filteredInvoices = view
    ? invoices.items.filter((invoice: Invoice) =>
        view === "contractors"
          ? invoice.operation_type.name === "Выставить счёт" && !invoice.is_paid
          : invoice.operation_type.name !== "Выставить счёт"
      )
    : [];

  const currentData = view ? formatInvoiceData(filteredInvoices) : null;

  const handleCreateInvoice = () => dispatch(setView({ view: "contractors" }));
  const handleViewContracts = () => dispatch(setView({ view: "expenses" }));

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div
        style={{ minHeight: "80vh" }}
        className="max-w-7xl mx-auto p-6 bg-white mt-6 rounded-[13px] shadow flex flex-col justify-between"
      >
        <div>
          <InvoiceFilterButtons
            view={view}
            onCreateInvoice={handleCreateInvoice}
            onViewContracts={handleViewContracts}
          />
          <InvoiceList
            loading={loading}
            error={error}
            currentData={currentData}
            onInvoiceClick={handleInvoiceClick}
          />
        </div>
        <CounterpartyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          invoice={selectedInvoice}
          refreshInvoices={refreshInvoices}
        />
        <div className="text-center w-full">
          <Link
            to={`/tg_bot_add?username=${
              localStorage.getItem("username") || ""
            }`}
          >
            <Button variant="active" size="default" className="w-full">
              Назад
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default InvoicePage;
