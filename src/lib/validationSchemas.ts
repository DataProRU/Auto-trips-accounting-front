import { z } from 'zod';
import type { Wallet } from '@/models/response/ReportResponse';

const positiveAmount = z
  .string()
  .min(1, 'Сумма обязательна')
  .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Сумма должна быть положительным числом',
  });

// Базовые поля для операций "Приход" / "Расход"
const incomeExpenseBaseFields = {
  company: z.string().min(1, 'Компания обязательна'),
  operation: z.string().min(1, 'Вид операции обязателен'),
  user_id: z.string().min(1, 'Держатель денег обязателен'),
  amount: positiveAmount,
  invoice_id: z.string().min(1, 'Выберите номер счёта'),
  deal_number: z.string().min(1, 'Номер сделки обязателен'),
  comment: z.string().optional(),
};

// Схема для операции "Перемещение" (без компании, валюты и способов оплаты)
export const transferSchema = z.object({
  company: z.string().optional(),
  operation: z.string().min(1, 'Вид операции обязателен'),
  user_id: z.string().min(1, 'Держатель денег обязателен'),
  wallet_from: z.string().min(1, 'Кошелёк отправителя обязателен'),
  wallet_to: z.string().min(1, 'Кошелёк получателя обязателен'),
  amount: positiveAmount,
  date: z.string().optional(),
  comment: z.string().optional(),
});

// Схема для операций "Приход" и "Расход"
export const incomeExpenseSchema = (
  wallets: Wallet[],
  operationCategories: Record<string, string[]>,
  categoryArticles: Record<string, string[]>
) => {
  const baseFieldsWithWallet = z.object({
    ...incomeExpenseBaseFields,
    wallet: z
      .string()
      .min(1, 'Кошелёк обязателен')
      .refine((val) => wallets.find((w) => String(w.id) === val), {
        message: 'Выберите действительный кошелёк',
      }),
    category: z.string().optional(),
    article: z.string().min(1, 'Статья обязательна'),
    wallet_from: z.string().optional(),
    wallet_to: z.string().optional(),
  });

  return baseFieldsWithWallet.superRefine((data, ctx) => {
    const category = (data.category ?? '').trim();
    if (category === '') return;

    const opId = String(data.operation);
    if (!operationCategories[opId]?.includes(category)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['category'],
        message: 'Выберите действительную категорию',
      });
      return;
    }

    const article = data.article.trim();
    const allowedArticles = categoryArticles[category] ?? [];
    if (allowedArticles.length > 0 && !allowedArticles.includes(article)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['article'],
        message: 'Выберите действительную статью',
      });
    }
  });
};

export const EstimateItemSchema = z.object({
  vin_id: z.number().min(1, 'VIN обязателен'),
  port: z.number().min(0),
  terminal: z.number().min(0),
  loader_terminal: z.number().min(0),
  car_pickup: z.number().min(0),
  reexport: z.number().min(0),
  parking: z.number().min(0),
  broker: z.number().min(0),
  delivery: z.number().min(0),
  security: z.number().min(0),
  loader_parking: z.number().min(0),
  extra_services: z.number().min(0),
  extra_services_comment: z.string(),
});

export const InvoiceValidationSchema = z.object({
  company_id: z.string().min(1, 'Компания обязательна'),
  client_id: z.string().min(1, 'Клиент обязательный'),
  product_id: z.string().min(1, 'Продукт обязательный'),
  date: z.string().min(1, 'Дата обязательна'),
  amount: z
    .string()
    .min(1, 'Сумма обязательна')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Сумма должна быть положительным числом',
    }),
  estimates: z.array(EstimateItemSchema).optional(),
});

export const ClientValidationSchema = z
  .object({
    full_name: z.string().min(1, 'ФИО обязательно'),
    phone: z.string().min(1, 'Телефон обязательный'),
  })
  .refine(
    (data) => {
      const phoneRegex = /^\+\d{1,4}\d{7,11}$/;
      return phoneRegex.test(data.phone);
    },
    {
      message: 'Телефон должен быть в формате +XXXXXXXXXXXX',
      path: ['phone'],
    }
  );

export const VinValidationSchema = z.object({
  vin: z.string().min(1, 'VIN обязательный'),
  car_model: z.string().min(1, 'Модель автомобиля обязательна'),
});

// Типы для валидации
export type TransferFormData = z.infer<typeof transferSchema>;
export type IncomeExpenseFormData = z.infer<
  ReturnType<typeof incomeExpenseSchema>
>;
export type ClientInvoiceFormData = z.infer<typeof InvoiceValidationSchema>;
export type VinFormData = z.infer<typeof VinValidationSchema>;
