import React from "react";
import { DatePicker } from "@/ui/date-picker";
import SelectField from "@/ui/select-field";
import ErrorMessage from "@/ui/error-message"; 
import type { Company } from "@/types/api";
import type { FormData } from "@/types/forms";

interface NoneTransferFormProps {
  formData: {
    company: string;
    category: string;
    article: string;
    date_finish: string;
    operation: string;
  };
  operation_types: { id: number; name: string }[];
  operationCategories: Record<string, string[]>;
  categoryArticles: Record<string, string[]>;
  companies: Company[];
  handleChange: (name: keyof FormData, value: string) => void;
  errors: Record<string, string>; 
}

const NoneTransferForm: React.FC<NoneTransferFormProps> = ({
  formData,
  operation_types,
  companies,
  handleChange,
  errors,
}) => {
  const selectedOperation = operation_types.find(
    (op) => op.id === Number(formData.operation)
  );
  const operationId = selectedOperation ? String(selectedOperation.id) : "";

  const selectedCompany = companies.find(
    (company) => String(company.id) === formData.company
  );

  const categoryOptions = selectedCompany
    ? selectedCompany.categories
        .filter((cat) => cat.operation_type_id === Number(operationId))
        .map((cat, index) => ({
          value: cat.name,
          label: cat.name,
          key: `${cat.name}-${index}`,
        }))
    : [];

  const articleOptions = selectedCompany
    ? selectedCompany.categories
        .find((cat) => cat.name === formData.category)
        ?.articles.map((art, index) => ({
          value: art.title,
          label: art.title,
          key: `${art.title}-${index}`,
        })) || []
    : [];

  const handleDateChange = (selectedDate: Date | undefined) => {
    handleChange(
      "date_finish",
      selectedDate ? selectedDate.toISOString().split("T")[0] : ""
    );
  };

  return (
    <>
      <div className="flex flex-row gap-3 mb-3.5">
        <SelectField
          name="category"
          value={formData.category}
          options={categoryOptions}
          placeholder="Категория"
          onChange={handleChange}
          required
          error={errors.category}
          className="flex-1 text-sm text-black placeholder:text-gray-400"
        />
        <SelectField
          name="article"
          value={formData.article}
          options={articleOptions}
          placeholder="Статья"
          onChange={handleChange}
          required
          error={errors.article}
          className="flex-1 text-sm text-black placeholder:text-gray-400"
        />
      </div>
      <div className="date-wrapper mb-3.5">
        <DatePicker
          value={
            formData.date_finish ? new Date(formData.date_finish) : undefined
          }
          onChange={handleDateChange}
          className={errors.date_finish ? "border-red-500" : ""}
        />
        {errors.date_finish && <ErrorMessage />}
      </div>
    </>
  );
};

export default NoneTransferForm;
