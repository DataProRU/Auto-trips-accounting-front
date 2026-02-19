import React from 'react';
import Header from '@/components/Header/Header';
import InvoiceForm from '@/components/InvoiceForm/InvoiceForm';

const ClientInvoicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f3e9] w-full h-full">
      <Header />
      <InvoiceForm />
    </div>
  );
};

export default ClientInvoicePage;
