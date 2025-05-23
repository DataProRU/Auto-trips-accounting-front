import Header from "@/components/Header/Header";
import ReportForm from "@/components/ReportForm/ReportForm";
import React from "react";

const ReportFormPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f3e9] w-full h-full">
      <Header />
      <ReportForm />
    </div>
  );
};

export default ReportFormPage;
