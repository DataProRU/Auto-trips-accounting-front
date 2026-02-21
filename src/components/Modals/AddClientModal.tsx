import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Modal from '@/ui/Modal';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { createClient } from '@/services/clientService';
import type { Client } from '@/types/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientValidationSchema } from '@/lib/validationSchemas';
import { isAxiosError } from 'axios';
import { useNotification } from '@/contexts/NotificationContext';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: Client) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (!isOpen) return;

    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Client>({
    resolver: zodResolver(ClientValidationSchema),
  });

  const onSubmit = async (data: Client) => {
    try {
      const response = await createClient(data);
      if (response) {
        onSuccess(response);
        showSuccess('Клиент успешно добавлен');
      }
      reset();
      onClose();
    } catch (err) {
      const message =
        isAxiosError(err) && err.response?.data?.detail
          ? String(err.response.data.detail)
          : isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : err instanceof Error
          ? err.message
          : 'Не удалось создать клиента';
      showError(message);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="min-w-[280px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Новый клиент</h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(onSubmit)(e);
          }}
          className="flex flex-col gap-3"
        >
          <Input
            {...register('full_name')}
            placeholder="ФИО *"
            className="w-full"
            error={errors.full_name?.message ?? undefined}
          />
          <Input
            {...register('phone')}
            placeholder="Номер телефона *"
            className="w-full"
            error={errors.phone?.message ?? undefined}
          />

          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(onSubmit)(e);
              }}
            >
              Добавить
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddClientModal;
