import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import ReportInvoiceSwitcher from '../ReportInvoiceSwitcher/ReportInvoiceSwitcher';
import {
  selectClientOptions,
  selectCompanyOptions,
  selectProductOptions,
  selectNextInvoiceNumber,
} from '@/store/selectors';
import { addClient } from '@/store/slices/clientsSlice';
import SelectField from '@/ui/select-field';
import {
  InvoiceValidationSchema,
  type ClientInvoiceFormData,
} from '@/lib/validationSchemas';
import type { Client } from '@/types/api';
import { fetchClients } from '@/services/clientService';
import { DatePicker } from '@/ui/date-picker';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AddClientModal from '@/components/Modals/AddClientModal';
import { Plus } from 'lucide-react';
import { fetchCompanies } from '@/services/companyService';
import { fetchProducts } from '@/services/productService';
import {
  saveClientInvoice,
  fetchClientInvoice,
} from '@/services/clientInvoiceService';
import { useNotification } from '@/contexts/NotificationContext';
import { isAxiosError } from 'axios';

const ClientInvoiceForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchClients());
    dispatch(fetchProducts());
    dispatch(fetchClientInvoice());
  }, [dispatch]);

  const companyOptions = useAppSelector(selectCompanyOptions);
  const clientOptions = useAppSelector(selectClientOptions);
  const productOptions = useAppSelector(selectProductOptions);
  const nextInvoiceNumber = useAppSelector(selectNextInvoiceNumber);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ClientInvoiceFormData>({
    resolver: zodResolver(InvoiceValidationSchema),
    defaultValues: {
      company_id: '',
      client_id: '',
      product_id: '',
      date: '',
      amount: '',
    },
  });

  const onSubmit = async (data: ClientInvoiceFormData) => {
    try {
      await dispatch(saveClientInvoice(data)).unwrap();
      showSuccess('Счёт клиента успешно сохранён');
      reset({
        company_id: '',
        client_id: '',
        product_id: '',
        date: '',
        amount: '',
      });
    } catch (err) {
      const message =
        isAxiosError(err) && err.response?.data?.detail
          ? String(err.response.data.detail)
          : isAxiosError(err) && err.response?.data?.message
            ? String(err.response.data.message)
            : err instanceof Error
              ? err.message
              : 'Не удалось сохранить счет клиента';
      showError(message);
    }
  };

  const handleAddClientSuccess = (client: Client) => {
    dispatch(addClient(client));
    if (client.id != null) {
      setValue('client_id', String(client.id));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="py-10 px-4 bg-white flex flex-col gap-2.5 w-full h-screen mx-auto mt-1.5 rounded-t-[13px]"
    >
      <ReportInvoiceSwitcher activeTab="invoice" />
      <Controller
        name="company_id"
        control={control}
        render={({ field }) => (
          <SelectField
            name="company_id"
            value={field.value}
            options={companyOptions}
            placeholder="Компания *"
            onChange={(_name, value) => field.onChange(value)}
            required
            error={errors.company_id?.message ?? undefined}
            className="mb-3.5 w-full text-sm text-black placeholder:text-gray-400"
          />
        )}
      />
      <Controller
        name="client_id"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 items-start mb-3.5">
            <div className="flex-1">
              <SelectField
                name="client_id"
                value={field.value}
                options={clientOptions}
                placeholder="Клиент *"
                onChange={(_name, value) => field.onChange(value)}
                required
                error={errors.client_id?.message ?? undefined}
                className="w-full text-sm text-black placeholder:text-gray-400"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 h-9 w-9"
              onClick={() => setIsAddClientModalOpen(true)}
              aria-label="Добавить клиента"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      <Controller
        name="product_id"
        control={control}
        render={({ field }) => (
          <SelectField
            name="product_id"
            value={field.value}
            options={productOptions}
            placeholder="Продукт *"
            onChange={(_name, value) => field.onChange(value)}
            required
            error={errors.product_id?.message ?? undefined}
            className="mb-3.5 w-full text-sm text-black placeholder:text-gray-400"
          />
        )}
      />

      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <div className="relative mb-3.5 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[140px]">
              <DatePicker
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) =>
                  field.onChange(date ? date.toISOString().split('T')[0] : '')
                }
                className={errors.date ? 'border-red-500' : 'text-black'}
              />
              {errors.date && (
                <p className="text-red-500 text-sm">{errors.date.message}</p>
              )}
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Номер счёта: </span>
                <span className="text-sm font-semibold text-black">
                  {nextInvoiceNumber}
                </span>
              </div>
              <div className="px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Номер сделки: </span>
                <span className="text-sm font-semibold text-black">
                  {nextInvoiceNumber}
                </span>
              </div>
            </div>
          </div>
        )}
      />
      <Input
        type="number"
        {...register('amount')}
        placeholder="Сумма *"
        className="grow text-sm text-black placeholder:text-gray-400 border-gray-200"
        error={errors.amount?.message ?? undefined}
      />
      <Button
        type="submit"
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

export default ClientInvoiceForm;
