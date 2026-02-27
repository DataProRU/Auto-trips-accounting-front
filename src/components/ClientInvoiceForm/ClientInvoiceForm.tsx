import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import ReportInvoiceSwitcher from '../ReportInvoiceSwitcher/ReportInvoiceSwitcher';
import { selectProductOptions } from '@/store/selectors';
import { addClient } from '@/store/slices/clientsSlice';
import SearchableSelectField from '@/ui/searchable-select-field';
import {
  InvoiceValidationSchema,
  type ClientInvoiceFormData,
} from '@/lib/validationSchemas';
import type { Client, EstimateItem } from '@/types/api';
import { fetchClients } from '@/services/clientService';
import { DatePicker } from '@/ui/date-picker';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AddClientModal from '@/components/Modals/AddClientModal';
import EstimateModal from '@/components/Modals/EstimateModal/EstimateModal';
import { Plus } from 'lucide-react';
import { fetchCompanies } from '@/services/companyService';
import { fetchProducts } from '@/services/productService';
import {
  saveClientInvoice,
  fetchClientInvoice,
} from '@/services/clientInvoiceService';
import { useNotification } from '@/contexts/NotificationContext';
import { isAxiosError } from 'axios';
import { selectCompanyOptions } from '@/store/slices/companiesSlice';
import { selectClientOptions } from '@/store/slices/clientsSlice';
import { selectNextInvoiceNumber } from '@/store/slices/clientInvoicesSlice';
import Loader from '@/ui/loader';

const ClientInvoiceForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
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
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);
  const [estimates, setEstimates] = useState<EstimateItem[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ClientInvoiceFormData>({
    resolver: zodResolver(InvoiceValidationSchema),
    defaultValues: {
      company_id: '',
      client_id: '',
      product_id: '',
      date: '',
      amount: '',
      estimates: [],
    },
  });

  const watchedFields = watch([
    'company_id',
    'client_id',
    'product_id',
    'date',
    'amount',
  ]);
  const isFormFilled = watchedFields.every((v) => v && v.trim() !== '');

  const onSubmit = async (data: ClientInvoiceFormData) => {
    if (estimates.length === 0) {
      showError('Необходимо заполнить смету');
      return;
    }
    try {
      setIsLoading(true)
      const payload = { ...data, estimates };
      console.log(payload);
      await dispatch(saveClientInvoice(payload)).unwrap();
      showSuccess('Счёт клиента успешно сохранён');
      setEstimates([]);
      reset({
        company_id: '',
        client_id: '',
        product_id: '',
        date: '',
        amount: '',
        estimates: [],
      });
      setIsLoading(false)
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
      setIsLoading(false)
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
          <SearchableSelectField
            name="company_id"
            value={field.value}
            options={companyOptions}
            placeholder="Компания *"
            onChange={(_name: string, value: string) => field.onChange(value)}
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
          <div className="flex gap-2 items-stretch mb-3.5">
            <div className="flex-1 min-w-0">
              <SearchableSelectField
                name="client_id"
                value={field.value}
                options={clientOptions}
                placeholder="Клиент *"
                onChange={(_name: string, value: string) => field.onChange(value)}
                required
                error={errors.client_id?.message ?? undefined}
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
        )}
      />

      <Controller
        name="product_id"
        control={control}
        render={({ field }) => (
          <SearchableSelectField
            name="product_id"
            value={field.value}
            options={productOptions}
            placeholder="Продукт *"
            onChange={(_name: string, value: string) => field.onChange(value)}
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
                label="Дата счета"
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
              <div className="px-3 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Номер счёта: </span>
                <span className="text-sm font-semibold text-black">
                  {nextInvoiceNumber}
                </span>
              </div>
              <div className="px-3 py-2 rounded-lg">
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
        type="button"
        disabled={!isFormFilled}
        onClick={() => setIsEstimateModalOpen(true)}
        className="mb-3.5 w-full bg-white border border-gray-300 hover:bg-gray-50 text-black font-light p-5 rounded-[8px] text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Открыть смету{estimates.length > 0 ? ` (${estimates.length})` : ''}
      </Button>
      <Button
        type="submit"
        disabled={estimates.length === 0 || isLoading === true}
        className="mb-3.5 w-full bg-[#25fcf1] hover:bg-[#25fcf1aa] text-black font-light p-5 rounded-[8px] text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Отправка...' : 'Отправить'}
      </Button>
      <EstimateModal
        isOpen={isEstimateModalOpen}
        onClose={() => setIsEstimateModalOpen(false)}
        onSave={setEstimates}
        initialEstimates={estimates}
      />
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onSuccess={handleAddClientSuccess}
      />
      {isLoading && <Loader />}
    </form>
  );
};

export default ClientInvoiceForm;
