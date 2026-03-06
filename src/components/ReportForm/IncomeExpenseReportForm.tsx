import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import type { FormData } from '@/types/forms';
import type { RootState } from '@/store/store';
import type { Client } from '@/types/api';

import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import SelectField from '@/ui/select-field';
import SearchableSelectField from '@/ui/searchable-select-field';
import NoneTransferForm from '../NoneTransferForm/NoneTransferForm';
import AddClientModal from '../Modals/AddClientModal';
import { incomeExpenseSchema } from '@/lib/validationSchemas';
import { Plus } from 'lucide-react';

import { submitForm } from '@/services/reportService';
import { fetchClients } from '@/services/clientService';
import { fetchProducts } from '@/services/productService';
import { fetchClientInvoice } from '@/services/clientInvoiceService';

import {
  setFormDataField,
  resetAccountType,
  createSubmitPayload,
  validateSubmitPayload,
  selectFormData,
  selectOperationTypes,
  selectWallets,
  selectCategoryArticles,
  selectOperationCategories,
  selectReportCompanies,
  selectLoading,
  selectIsFormValid,
  selectReportCompanyOptions,
  selectUserOptions,
} from '@/store/slices/reportSlice';
import { addClient, selectClientOptions } from '@/store/slices/clientsSlice';
import { selectClientInvoices } from '@/store/slices/clientInvoicesSlice';
import { selectProductOptions } from '@/store/selectors';
import { useSelector } from 'react-redux';
import { selectIsWalletModalOpen } from '@/store/selectors/walletSelectionSelectors';
import type { Company } from '@/types/api';

const IncomeExpenseReportForm: React.FC = () => {
  const dispatch = useAppDispatch();

  const formData = useAppSelector(selectFormData);
  const operation_types = useAppSelector(selectOperationTypes);
  const wallets = useAppSelector(selectWallets);
  const categoryArticles = useAppSelector(selectCategoryArticles);
  const operationCategories = useAppSelector(selectOperationCategories);
  const companies = useAppSelector(selectReportCompanies);
  const loading = useAppSelector(selectLoading);
  const isFormValid = useAppSelector(selectIsFormValid);

  const walletOptions = useMemo(() => {
    const list =
      formData.user_id.trim() !== ''
        ? wallets.filter((w) => String(w.user_id) === formData.user_id)
        : wallets;
    return list.map((w, index) => ({
      value: String(w.id),
      label: w.username
        ? `${w.name} (${w.username}) ${w.currency_symbol}`
        : w.name,
      key: `${w.id}-${index}`,
    }));
  }, [wallets, formData.user_id]);
  const companyOptions = useAppSelector(selectReportCompanyOptions);
  const userOptions = useAppSelector(selectUserOptions);
  const clientOptions = useAppSelector(selectClientOptions);
  const productOptions = useAppSelector(selectProductOptions);
  const clientInvoices = useAppSelector(selectClientInvoices);

  const invoiceOptions = clientInvoices.map((inv) => ({
    value: String(inv.id),
    label: `№ ${inv.id}`,
    key: `invoice-${inv.id}`,
  }));

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  const reduxState = useAppSelector((state) => state as RootState);
  const isWalletModalOpen = useSelector(selectIsWalletModalOpen);
  const isAnyModalOpen = isWalletModalOpen;

  useEffect(() => {
    if (formData.category && categoryArticles[formData.category]) {
      dispatch(resetAccountType());
    }
  }, [formData.category, categoryArticles, dispatch]);

  useEffect(() => {
    dispatch(setFormDataField({ name: 'category', value: '' }));
    dispatch(setFormDataField({ name: 'article', value: '' }));
  }, [formData.company, dispatch]);

  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchProducts());
    dispatch(fetchClientInvoice());
  }, [dispatch]);

  useEffect(() => {
    if (formData.user_id.trim() === '') {
      if (formData.wallet.trim() !== '') {
        dispatch(setFormDataField({ name: 'wallet', value: '' }));
      }
      return;
    }
    if (formData.wallet.trim() === '') return;
    const selectedWallet = wallets.find(
      (w) => String(w.id) === formData.wallet
    );
    if (selectedWallet && String(selectedWallet.user_id) !== formData.user_id) {
      dispatch(setFormDataField({ name: 'wallet', value: '' }));
    }
  }, [formData.user_id, formData.wallet, wallets, dispatch]);

  const handleAddClientSuccess = (client: Client) => {
    dispatch(addClient(client));
    if (client.id != null) {
      handleChange('client_id', String(client.id));
    }
  };

  const handleChange = (name: keyof FormData, value: string) => {
    dispatch(setFormDataField({ name, value }));
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleInvoiceSelect = (value: string) => {
    handleChange('invoice_id', value);
    handleChange('deal_number', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWasSubmitted(true);

    const result = incomeExpenseSchema(
      wallets,
      operationCategories,
      categoryArticles
    ).safeParse(formData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setValidationErrors(
        Object.keys(errors).reduce(
          (acc, key) => ({
            ...acc,
            [key]: (errors as Record<string, string[]>)[key]?.[0] || '',
          }),
          {}
        )
      );
      return;
    }

    try {
      const payload = createSubmitPayload(
        formData,
        operation_types,
        companies,
        reduxState
      );

      const validationError = validateSubmitPayload(payload);
      if (validationError) {
        dispatch(setFormDataField({ name: 'comment', value: validationError }));
        return;
      }

      await dispatch(submitForm(payload)).unwrap();
    } catch (err) {
      dispatch(setFormDataField({ name: 'comment', value: String(err) }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <SelectField
        name="company"
        value={formData.company}
        options={companyOptions}
        placeholder="Компания *"
        onChange={handleChange}
        required
        error={
          wasSubmitted && !isAnyModalOpen ? validationErrors.company : undefined
        }
        className="mb-3.5 w-full text-sm text-black placeholder:text-gray-400"
      />
      <div className="flex gap-2 items-stretch mb-3.5">
        <div className="flex-1 min-w-0">
          <SearchableSelectField
            name="client_id"
            value={formData.client_id}
            options={clientOptions}
            placeholder="Клиент"
            onChange={(_name: string, value: string) =>
              handleChange('client_id', value)
            }
            error={
              wasSubmitted && !isAnyModalOpen
                ? validationErrors.client_id
                : undefined
            }
            className="w-full text-sm text-black placeholder:text-gray-400"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 w-9 self-stretch"
          onClick={() => setIsAddClientModalOpen(true)}
          aria-label="Добавить клиента"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <NoneTransferForm
        formData={formData}
        operation_types={operation_types}
        operationCategories={operationCategories}
        categoryArticles={categoryArticles}
        companies={companies as Company[]}
        handleChange={handleChange}
        errors={wasSubmitted && !isAnyModalOpen ? validationErrors : {}}
      />
      <SearchableSelectField
        name="product_id"
        value={formData.product_id}
        options={productOptions}
        placeholder="Продукт"
        onChange={(_name: string, value: string) =>
          handleChange('product_id', value)
        }
        error={
          wasSubmitted && !isAnyModalOpen
            ? validationErrors.product_id
            : undefined
        }
        className="mb-3.5 w-full text-sm text-black placeholder:text-gray-400"
      />

      <div className="flex flex-row gap-3 sm:gap-5 mb-3.5">
        <div className="flex-1 min-w-0">
          <SearchableSelectField
            name="invoice_id"
            value={formData.invoice_id}
            options={invoiceOptions}
            placeholder="Номер счета"
            onChange={(_name: string, value: string) =>
              handleInvoiceSelect(value)
            }
            error={
              wasSubmitted && !isAnyModalOpen
                ? validationErrors.invoice_id
                : undefined
            }
            className="w-full text-sm text-black placeholder:text-gray-400"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Input
            type="text"
            name="deal_number"
            value={formData.deal_number}
            readOnly
            placeholder="№ сделки"
            className="w-full text-sm text-black placeholder:text-gray-400 bg-gray-50 border-gray-200"
          />
          {wasSubmitted && !isAnyModalOpen && validationErrors.deal_number && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.deal_number}
            </p>
          )}
        </div>
      </div>
      <SelectField
        name="user_id"
        value={formData.user_id}
        options={userOptions}
        placeholder="Держатель денег *"
        onChange={handleChange}
        required
        error={
          wasSubmitted && !isAnyModalOpen ? validationErrors.user_id : undefined
        }
        className="mb-3.5 w-full text-sm text-black placeholder:text-gray-400"
      />
      <SelectField
        name="wallet"
        value={formData.wallet}
        options={walletOptions}
        placeholder="Кошелёк *"
        onChange={handleChange}
        required
        disabled={!formData.user_id || formData.user_id.trim() === ''}
        error={
          wasSubmitted && !isAnyModalOpen ? validationErrors.wallet : undefined
        }
        className="mb-3.5 w-full text-sm text-black"
      />
      <Input
        type="number"
        name="amount"
        value={formData.amount}
        onChange={(e) => handleChange('amount', e.target.value)}
        placeholder="Сумма *"
        className="mb-3.5 w-full text-sm text-black placeholder:text-gray-400 border-gray-200"
        error={
          wasSubmitted && !isAnyModalOpen ? validationErrors.amount : undefined
        }
      />
      <Textarea
        name="comment"
        value={formData.comment}
        onChange={(e) => handleChange('comment', e.target.value)}
        placeholder="Назначение платежа"
        className="my-1 min-h-[70px]"
      />
      <Button
        type="submit"
        disabled={loading || !isFormValid}
        className="mb-3.5 w-full bg-[#25fcf1] hover:bg-[#25fcf1aa] text-black font-light p-5 rounded-[8px] text-sm sm:text-base"
      >
        Отправить
      </Button>
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onSuccess={handleAddClientSuccess}
      />
    </form>
  );
};

export default IncomeExpenseReportForm;
