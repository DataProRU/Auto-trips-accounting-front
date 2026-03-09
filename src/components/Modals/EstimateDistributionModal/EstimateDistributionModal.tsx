import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import Modal from '@/ui/Modal';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import SearchableSelectField from '@/ui/searchable-select-field';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {
  fetchVins,
  fetchVinsByInvoiceId,
} from '@/services/vinService';
import { selectVinOptions } from '@/store/slices/vinsSlice';
import type { VinNumber } from '@/types/api';

export type EstimateDistributionRow = {
  amount: number;
  vin_id: number;
};

type RowDraft = {
  amount: string;
  vin_id: string;
};

const vinListToOptions = (vins: VinNumber[]) =>
  vins.map((v, i) => ({
    value: String(v.id),
    label: `${v.vin} — ${v.car_model}`,
    key: `vin-${v.id}-${i}`,
  }));

interface EstimateDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  /** ID счёта: при указании подгружаются только VIN, привязанные к этому счёту (client_invoice_id) */
  invoiceId?: string;
  initialRows?: EstimateDistributionRow[];
  onSave: (rows: EstimateDistributionRow[]) => void;
}

const emptyRow = (): RowDraft => ({ amount: '', vin_id: '' });

const toCents = (value: number): number => Math.round((value || 0) * 100);

const parseAmount = (value: string): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const EstimateDistributionModal: React.FC<EstimateDistributionModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  invoiceId,
  initialRows,
  onSave,
}) => {
  const dispatch = useAppDispatch();
  const globalVinOptions = useAppSelector(selectVinOptions);

  const [rows, setRows] = useState<RowDraft[]>([emptyRow()]);
  const [invoiceVinOptions, setInvoiceVinOptions] = useState<
    { value: string; label: string; key: string }[]
  >([]);
  const [vinOptionsLoading, setVinOptionsLoading] = useState(false);

  const vinOptions = useMemo(() => {
    if (invoiceId && invoiceId.trim() !== '') {
      return invoiceVinOptions;
    }
    return globalVinOptions;
  }, [invoiceId, invoiceVinOptions, globalVinOptions]);

  useEffect(() => {
    if (!isOpen) return;
    setRows(
      initialRows && initialRows.length > 0
        ? initialRows.map((r) => ({
            amount: String(r.amount),
            vin_id: String(r.vin_id),
          }))
        : [emptyRow()]
    );
    const invoiceIdNum = invoiceId ? Number(invoiceId) : 0;
    if (Number.isFinite(invoiceIdNum) && invoiceIdNum > 0) {
      setVinOptionsLoading(true);
      fetchVinsByInvoiceId(invoiceIdNum)
        .then((vins) => setInvoiceVinOptions(vinListToOptions(vins)))
        .catch(() => setInvoiceVinOptions([]))
        .finally(() => setVinOptionsLoading(false));
    } else {
      dispatch(fetchVins());
      setInvoiceVinOptions([]);
    }
  }, [dispatch, isOpen, initialRows, invoiceId]);

  const getVinOptionsForRow = (rowIdx: number) => {
    const currentId = Number(rows[rowIdx]?.vin_id);
    const usedByOtherRows = rows
      .filter((_, i) => i !== rowIdx)
      .map((r) => Number(r.vin_id))
      .filter((id) => Number.isFinite(id) && id > 0);
    return vinOptions.filter((opt) => {
      const id = Number(opt.value);
      if (id === currentId) return true;
      return !usedByOtherRows.includes(id);
    });
  };

  const totalCents = useMemo(() => toCents(totalAmount), [totalAmount]);

  const allocatedCents = useMemo(() => {
    return rows.reduce((sum, r) => sum + toCents(parseAmount(r.amount)), 0);
  }, [rows]);

  const remainingCents = totalCents - allocatedCents;

  const allRowsValid = useMemo(() => {
    return (
      rows.length > 0 &&
      rows.every((r) => {
        const amount = parseAmount(r.amount);
        const vinId = Number(r.vin_id);
        return amount > 0 && Number.isFinite(vinId) && vinId > 0;
      })
    );
  }, [rows]);

  const isSaveEnabled = allRowsValid && allocatedCents === totalCents;

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (idx: number) => {
    if (!confirm('Удалить эту строку?')) return;
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, patch: Partial<RowDraft>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const handleSave = () => {
    if (!isSaveEnabled) return;
    const normalized: EstimateDistributionRow[] = rows.map((r) => ({
      amount: parseAmount(r.amount),
      vin_id: Number(r.vin_id),
    }));
    onSave(normalized);
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
          <h3 className="text-lg font-semibold">Распределение по смете</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-600">Сумма к распределению:</span>
            <span className="text-sm font-semibold">{totalAmount}</span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-2">
            <span className="text-sm text-gray-600">Осталось распределить:</span>
            <span
              className={`text-sm font-semibold ${
                remainingCents === 0 ? 'text-green-600' : 'text-pink-500'
              }`}
            >
              {remainingCents / 100}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="relative border border-gray-200 rounded-lg p-4"
            >
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                  aria-label="Удалить строку"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 min-h-[1.25rem] flex items-end pb-1">
                    Сумма *
                  </label>
                  <Input
                    type="number"
                    value={row.amount}
                    onChange={(e) => updateRow(idx, { amount: e.target.value })}
                    placeholder="Числовое поле"
                    className="text-sm"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 min-h-[1.25rem] flex items-end pb-1">
                    VIN *
                  </label>
                  <SearchableSelectField
                    name={`distribution-vin-${idx}`}
                    value={row.vin_id}
                    options={getVinOptionsForRow(idx)}
                    placeholder={
                      vinOptionsLoading
                        ? 'Загрузка VIN по счёту...'
                        : 'Вып список + поиск'
                    }
                    onChange={(_name: string, value: string) =>
                      updateRow(idx, { vin_id: value })
                    }
                    className="w-full text-sm text-black placeholder:text-gray-400"
                  />
                </div>
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
            onClick={addRow}
            aria-label="Добавить строку"
          >
            <Plus className="w-5 h-5 text-black" />
          </Button>
        </div>

        <p className="text-sm text-pink-500 text-center mt-4">
          Пока не распределите всю сумму, кнопку нажать нельзя
        </p>

        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          <Button
            type="button"
            disabled={!isSaveEnabled}
            className="bg-[#25fcf1] hover:bg-[#25fcf1aa] text-black font-light px-6 py-2 rounded-[8px] disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleSave}
          >
            Добавить
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Назад
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EstimateDistributionModal;

