import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import ReportInvoiceSwitcher from '../ReportInvoiceSwitcher/ReportInvoiceSwitcher';
import { selectClientOptions, selectCompanyOptions } from '@/store/selectors';
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

const InvoiceForm: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchClients());
  }, [dispatch]);

  const companyOptions = useAppSelector(selectCompanyOptions);
  const clientOptions = useAppSelector(selectClientOptions);

  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ClientInvoiceFormData>({
    resolver: zodResolver(InvoiceValidationSchema),
    defaultValues: {
      company: '',
      client: '',
      date: '',
      amount: '',
    },
  });

  const onSubmit = async (data: ClientInvoiceFormData) => {
    console.log(data);
  };

  const handleAddClientSuccess = (client: Client) => {
    dispatch(addClient(client));
    if (client.id != null) {
      setValue('client', String(client.id));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="py-10 px-4 bg-white flex flex-col gap-2.5 w-full h-screen mx-auto mt-1.5 rounded-t-[13px]"
    >
      <ReportInvoiceSwitcher activeTab="invoice" />
      <Controller
        name="company"
        control={control}
        render={({ field }) => (
          <SelectField
            name="company"
            value={field.value}
            options={companyOptions}
            placeholder="Компания *"
            onChange={(_name, value) => field.onChange(value)}
            required
            error={errors.company?.message ?? undefined}
            className="mb-3.5 w-full text-sm text-black placeholder:text-gray-400"
          />
        )}
      />
      <Controller
        name="client"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 items-start mb-3.5">
            <div className="flex-1">
              <SelectField
                name="client"
                value={field.value}
                options={clientOptions}
                placeholder="Клиент *"
                onChange={(_name, value) => field.onChange(value)}
                required
                error={errors.client?.message ?? undefined}
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
        name="date"
        control={control}
        render={({ field }) => (
          <div className="relative mb-3.5">
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

export default InvoiceForm;
