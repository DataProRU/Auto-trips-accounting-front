import { Button } from "@/ui/button";
import React from "react";

interface InvoiceFilterButtonsProps {
  view: "contractors" | "expenses" | null;
  onCreateInvoice: () => void;
  onViewContracts: () => void;
}

const InvoiceFilterButtons: React.FC<InvoiceFilterButtonsProps> = ({
  view,
  onCreateInvoice,
  onViewContracts,
}) => (
  <div className="flex justify-between mb-6">
    <Button
      onClick={onCreateInvoice}
      variant={view === "contractors" ? "active" : "inactive"}
      size="default"
    >
      Счета контрагентам
    </Button>
    <Button
      onClick={onViewContracts}
      variant={view === "expenses" ? "active" : "inactive"}
      size="default"
    >
      Счета по расходам
    </Button>
  </div>
);

export default InvoiceFilterButtons;
