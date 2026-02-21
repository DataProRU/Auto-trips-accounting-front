import { VinValidationSchema } from '@/lib/validationSchemas';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { VinFormData } from '@/lib/validationSchemas';
import { isAxiosError } from 'axios';
import { useNotification } from '@/contexts/NotificationContext';
import { createVin } from '@/services/vinService';
import { addVin } from '@/store/slices/vinsSlice';
import { useAppDispatch } from '@/hooks/hooks';

interface AddNewVInProps {
  onSuccess?: () => void;
}

export const AddNewVIn: React.FC<AddNewVInProps> = ({ onSuccess }) => {
  const { showSuccess, showError } = useNotification();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VinFormData>({
    resolver: zodResolver(VinValidationSchema),
  });
  const dispatch = useAppDispatch();

  const onSubmit = async (data: VinFormData) => {
    try {
      const response = await createVin(data);
      if (response) {
        showSuccess('VIN успешно добавлен');
        dispatch(addVin(response));
        onSuccess?.();
      }
    } catch (err) {
      const message =
        isAxiosError(err) && err.response?.data?.detail
          ? String(err.response.data.detail)
          : isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : err instanceof Error
          ? err.message
          : 'Не удалось создать VIN';
      showError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mb-4">
      <div className="flex gap-2 mb-2">
        <Input
          {...register('vin')}
          placeholder="Введите VIN"
          className="flex-1 text-sm"
          error={errors.vin?.message ?? undefined}
        />
      </div>
      <div className="flex gap-2 mb-2">
        <Input
          {...register('car_model')}
          placeholder="Введите год модель марку автомобиля"
          className="flex-1 text-sm"
          error={errors.car_model?.message ?? undefined}
        />
      </div>
      <Button type="button" variant="outline" onClick={handleSubmit(onSubmit)}>
        Создать
      </Button>
    </form>
  );
};
