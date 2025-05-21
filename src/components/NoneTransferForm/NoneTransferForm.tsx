import React from "react";
import { DatePicker } from "@/ui/date-picker";
import SelectField from "@/ui/select-field";

interface NoneTransferFormProps {
  formData: {
    category: string;
    article: string;
    date_finish: string;
    operation: string;
  };
  operations: { id: number; name: string }[];
  operationCategories: Record<string, string[]>;
  categoryArticles: Record<string, string[]>;
  handleChange: (name: string, value: string) => void;
}

const NoneTransferForm: React.FC<NoneTransferFormProps> = ({
  formData,
  operations,
  operationCategories,
  categoryArticles,
  handleChange,
}) => {
  const selectedOperation = operations.find(
    (op) => op.id === Number(formData.operation)
  );
  const operationName = selectedOperation?.name || "";
  const categoryOptions = Array.from(
    new Set(operationCategories[operationName] || [])
  ).map((cat, index) => ({
    value: cat,
    label: cat,
    key: `${cat}-${index}`,
  }));
  const articleOptions = Array.from(
    new Set(categoryArticles[formData.category] || [])
  ).map((art, index) => ({
    value: art,
    label: art,
    key: `${art}-${index}`,
  }));

  const handleDateChange = (selectedDate: Date | undefined) => {
    handleChange(
      "date_finish",
      selectedDate ? selectedDate.toISOString().split("T")[0] : ""
    );
  };

  return (
    <>
      <div className="flex sm:flex-row gap-3 mb-3.5">
        <SelectField
          name="category"
          value={formData.category}
          options={categoryOptions}
          placeholder="Категория"
          onChange={handleChange}
          required
        />
        <SelectField
          name="article"
          value={formData.article}
          options={articleOptions}
          placeholder="Статья"
          onChange={handleChange}
          required
        />
      </div>
      <div className="date-wrapper mb-3.5">
        <DatePicker
          value={
            formData.date_finish ? new Date(formData.date_finish) : undefined
          }
          onChange={handleDateChange}
        />
      </div>
    </>
  );
};

export default NoneTransferForm;
