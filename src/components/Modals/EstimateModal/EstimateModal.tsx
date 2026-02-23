import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Modal from '@/ui/Modal';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import SelectField from '@/ui/select-field';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { selectVinOptions, selectVins } from '@/store/slices/vinsSlice';
import { fetchVins } from '@/services/vinService';
import type { EstimateItem } from '@/types/api';
import { AddNewVIn } from './AddNewVIn';

interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (estimates: EstimateItem[]) => void;
  initialEstimates: EstimateItem[];
}

const EXPENSE_FIELDS = [
  { key: 'port', label: 'Портовые' },
  { key: 'terminal', label: 'Терминальные' },
  { key: 'loader_terminal', label: 'Погрузчик на терминале' },
  { key: 'car_pickup', label: 'Забор авто (Бачо)' },
  { key: 'reexport', label: 'Реэкспорт' },
  { key: 'parking', label: 'Стоянка' },
  { key: 'broker', label: 'Брокерские' },
  { key: 'delivery', label: 'Доставка' },
  { key: 'security', label: 'Обеспечение' },
  { key: 'loader_parking', label: 'Погрузчик на стоянке' },
] as const;

type ExpenseKey = (typeof EXPENSE_FIELDS)[number]['key'];

interface EstimateBlock {
  vin_id: number;
  expenses: Record<ExpenseKey | 'extra_services', number>;
  extra_services_comment: string;
}

const emptyBlock = (): EstimateBlock => ({
  vin_id: 0,
  expenses: {
    port: 0,
    terminal: 0,
    loader_terminal: 0,
    car_pickup: 0,
    reexport: 0,
    parking: 0,
    broker: 0,
    delivery: 0,
    security: 0,
    loader_parking: 0,
    extra_services: 0,
  },
  extra_services_comment: '',
});

const blockFromEstimate = (e: EstimateItem): EstimateBlock => ({
  vin_id: e.vin_id,
  expenses: {
    port: e.port,
    terminal: e.terminal,
    loader_terminal: e.loader_terminal,
    car_pickup: e.car_pickup,
    reexport: e.reexport,
    parking: e.parking,
    broker: e.broker,
    delivery: e.delivery,
    security: e.security,
    loader_parking: e.loader_parking,
    extra_services: e.extra_services,
  },
  extra_services_comment: e.extra_services_comment,
});

const blockToEstimate = (b: EstimateBlock): EstimateItem => ({
  vin_id: b.vin_id,
  port: b.expenses.port,
  terminal: b.expenses.terminal,
  loader_terminal: b.expenses.loader_terminal,
  car_pickup: b.expenses.car_pickup,
  reexport: b.expenses.reexport,
  parking: b.expenses.parking,
  broker: b.expenses.broker,
  delivery: b.expenses.delivery,
  security: b.expenses.security,
  loader_parking: b.expenses.loader_parking,
  extra_services: b.expenses.extra_services,
  extra_services_comment: b.extra_services_comment,
});

const calcTotal = (expenses: EstimateBlock['expenses']): number =>
  Object.values(expenses).reduce((sum, v) => sum + (v || 0), 0);

const EstimateModal: React.FC<EstimateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEstimates,
}) => {
  const dispatch = useAppDispatch();
  const vinOptions = useAppSelector(selectVinOptions);
  const vins = useAppSelector(selectVins);

  const [blocks, setBlocks] = useState<EstimateBlock[]>([emptyBlock()]);
  const [showNewVin, setShowNewVin] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchVins());
      setBlocks(
        initialEstimates.length > 0
          ? initialEstimates.map(blockFromEstimate)
          : [emptyBlock()]
      );
      setShowNewVin({});
    }
  }, [isOpen, dispatch, initialEstimates]);

  useEffect(() => {
    if (!isOpen) return;

    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  const updateBlock = useCallback(
    (idx: number, patch: Partial<EstimateBlock>) => {
      setBlocks((prev) =>
        prev.map((b, i) => (i === idx ? { ...b, ...patch } : b))
      );
    },
    []
  );

  const updateExpense = useCallback(
    (blockIdx: number, key: ExpenseKey | 'extra_services', value: number) => {
      setBlocks((prev) =>
        prev.map((b, i) =>
          i === blockIdx
            ? { ...b, expenses: { ...b.expenses, [key]: value } }
            : b
        )
      );
    },
    []
  );

  const addBlock = () => setBlocks((prev) => [...prev, emptyBlock()]);

  const removeBlock = (idx: number) => {
    if (!confirm('Удалить этот VIN-блок?')) return;
    setBlocks((prev) => prev.filter((_, i) => i !== idx));
  };

  const getCarModel = (vinId: number): string | null => {
    const found = vins.find((v) => v.id === vinId);
    return found ? found.car_model : null;
  };

  const getVinOptionsForBlock = (blockIdx: number) => {
    const usedByOtherBlocks = blocks
      .filter((_, i) => i !== blockIdx)
      .map((b) => b.vin_id)
      .filter((id) => id > 0);
    return vinOptions.filter((opt) => {
      const id = Number(opt.value);
      return !usedByOtherBlocks.includes(id) || id === blocks[blockIdx].vin_id;
    });
  };

  const handleSave = () => {
    const validBlocks = blocks.filter((b) => b.vin_id > 0);
    onSave(validBlocks.map(blockToEstimate));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[95vw] w-[600px] max-h-[90vh] overflow-y-auto"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Смета</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {blocks.map((block, blockIdx) => (
            <div
              key={blockIdx}
              className="relative border border-gray-200 rounded-lg p-4"
            >
              {blocks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBlock(blockIdx)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                  aria-label="Удалить блок"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div className="flex gap-2 items-stretch mb-2">
                <div className="flex-1 min-w-0">
                  <SelectField
                    name={`vin-${blockIdx}`}
                    value={block.vin_id ? String(block.vin_id) : ''}
                    options={getVinOptionsForBlock(blockIdx)}
                    placeholder="VIN *"
                    onChange={(_name, value) =>
                      updateBlock(blockIdx, { vin_id: Number(value) })
                    }
                    className="w-full text-sm text-black placeholder:text-gray-400"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 w-9 self-stretch"
                  onClick={() =>
                    setShowNewVin((prev) => ({
                      ...prev,
                      [blockIdx]: !prev[blockIdx],
                    }))
                  }
                  aria-label="Добавить VIN"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {showNewVin[blockIdx] && (
                <AddNewVIn
                  onSuccess={() =>
                    setShowNewVin((prev) => ({ ...prev, [blockIdx]: false }))
                  }
                />
              )}

              {block.vin_id > 0 && getCarModel(block.vin_id) && (
                <p className="text-sm text-gray-500 mb-3">
                  Авто:{' '}
                  <span className="font-medium text-black">
                    {getCarModel(block.vin_id)}
                  </span>
                </p>
              )}

              <p className="text-sm font-semibold mb-2">Расходные статьи</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {EXPENSE_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500">{label}</label>
                    <Input
                      type="number"
                      value={block.expenses[key] || ''}
                      onChange={(e) =>
                        updateExpense(
                          blockIdx,
                          key,
                          Number(e.target.value) || 0
                        )
                      }
                      placeholder="Числовой ввод"
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                <div>
                  <label className="text-xs text-gray-500">Доп услуги</label>
                  <Input
                    type="number"
                    value={block.expenses.extra_services || ''}
                    onChange={(e) =>
                      updateExpense(
                        blockIdx,
                        'extra_services',
                        Number(e.target.value) || 0
                      )
                    }
                    placeholder="Числовой ввод"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">
                    Комментарий к доп услуге
                  </label>
                  <Input
                    value={block.extra_services_comment}
                    onChange={(e) =>
                      updateBlock(blockIdx, {
                        extra_services_comment: e.target.value,
                      })
                    }
                    placeholder="Текстовый ввод"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-600">Итого:</span>
                <span className="text-sm font-semibold">
                  {calcTotal(block.expenses)} $
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 bg-[#25fcf1] hover:bg-[#25fcf1aa] border-0"
            onClick={addBlock}
            aria-label="Добавить блок"
          >
            <Plus className="w-5 h-5 text-black" />
          </Button>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <Button
            type="button"
            className="bg-[#25fcf1] hover:bg-[#25fcf1aa] text-black font-light px-6 py-2 rounded-[8px]"
            onClick={handleSave}
          >
            Сохранить
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Назад
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EstimateModal;
