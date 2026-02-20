import React from 'react';
import Header from '@/components/Header/Header';
import ClientInvoiceForm from '@/components/ClientInvoiceForm/ClientInvoiceForm';

const ClientInvoicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f3e9] w-full h-full">
      <Header />
      <ClientInvoiceForm />
    </div>
  );
};

export default ClientInvoicePage;
