import React from 'react';
import { DatePicker } from '@/ui/date-picker';
import SelectField from '@/ui/select-field';
import ErrorMessage from '@/ui/error-message';
import type { Company } from '@/types/api';
import type { FormData } from '@/types/forms';

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
  const operationId = selectedOperation ? String(selectedOperation.id) : '';

  const selectedCompany = companies.find(
    (company) => String(company.id) === formData.company
  );

  const categoriesForOperation = selectedCompany
    ? selectedCompany.categories.filter(
        (cat) => cat.operation_type_id === Number(operationId)
      )
    : [];

  const articleOptionsWithCategory = categoriesForOperation.flatMap((cat) =>
    cat.articles.map((art) => ({
      value: `${cat.name}|${art.title}`,
      label: art.title,
      key: `${cat.name}-${art.title}-${art.id}`,
    }))
  );

  const currentArticleValue =
    formData.category && formData.article
      ? `${formData.category}|${formData.article}`
      : '';

  const handleArticleChange = (_name: string, value: string) => {
    if (!value) {
      handleChange('article', '');
      handleChange('category', '');
      return;
    }
    const [categoryName, articleTitle] = value.split('|');
    handleChange('category', categoryName ?? '');
    handleChange('article', articleTitle ?? '');
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    handleChange(
      'date_finish',
      selectedDate ? selectedDate.toISOString().split('T')[0] : ''
    );
  };

  return (
    <>
      <div className="flex flex-row gap-3 mb-3.5">
        <SelectField
          name="article"
          value={currentArticleValue}
          options={articleOptionsWithCategory}
          placeholder="Статья *"
          onChange={handleArticleChange}
          required
          error={errors.article}
          className="flex-1 text-sm text-black placeholder:text-gray-400"
        />
        <SelectField
          name="category"
          value={formData.category}
          options={
            formData.category
              ? [
                  {
                    value: formData.category,
                    label: formData.category,
                    key: formData.category,
                  },
                ]
              : []
          }
          placeholder="Категория"
          onChange={() => {}}
          required
          error={errors.category}
          className="flex-1 text-sm text-black placeholder:text-gray-400 bg-gray-50"
          disabled
        />
      </div>
      <div className="date-wrapper mb-3.5">
        <DatePicker
          label="Дата назначения"
          value={
            formData.date_finish ? new Date(formData.date_finish) : undefined
          }
          onChange={handleDateChange}
          className={errors.date_finish ? 'border-red-500' : ''}
        />
        {errors.date_finish && <ErrorMessage />}
      </div>
    </>
  );
};

export default NoneTransferForm;
