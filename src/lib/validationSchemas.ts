import { z } from "zod";
import type { FormData } from "@/types/forms";
import type { 
  OperationType, 
  Wallet, 
  Counterparty 
} from "@/models/response/ReportResponse";

// Базовые поля для всех операций
const baseFields = {
  company: z.string().min(1, "Компания обязательна"),
  operation: z.string().min(1, "Вид операции обязателен"),
  amount: z
    .string()
    .min(1, "Сумма обязательна")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Сумма должна быть положительным числом",
    }),
  currency: z.string().min(1, "Валюта обязательна"),
  payment_type: z.string().min(1, "Способ оплаты обязателен"),
  date_finish: z.string().min(1, "Дата обязательна"),
  comment: z.string().optional(),
};

// Схема для операции "Перемещение"
export const transferSchema = z.object({
  wallet_from: z.string().min(1, "Кошелёк отправителя обязателен"),
  wallet_to: z.string().min(1, "Кошелёк получателя обязателен"),
  company: z.string().optional(),
  operation: z.string().optional(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  payment_type: z.string().optional(),
  date_finish: z.string().optional(),
  comment: z.string().optional(),
  wallet: z.string().optional(),
  category: z.string().optional(),
  article: z.string().optional(),
  counterparty: z.string().optional(),
});

// Схема для операций "Выставить счёт" и "Выставить расход"
export const invoiceSchema = (counterparties: Counterparty[]) =>
  z.object({
    ...baseFields,
    counterparty: z
      .string()
      .min(1, "Контрагент обязателен")
      .refine((val) => counterparties.find((cp) => String(cp.id) === val), {
        message: "Выберите действительного контрагента",
      }),
    wallet: z.string().optional(),
    wallet_from: z.string().optional(),
    wallet_to: z.string().optional(),
    category: z.string().optional(),
    article: z.string().optional(),
  });

// Схема для операций "Приход" и "Расход"
export const incomeExpenseSchema = (
  wallets: Wallet[],
  operationCategories: Record<string, string[]>,
  categoryArticles: Record<string, string[]>,
  formData: FormData
) => {
  const baseFieldsWithWallet = {
    ...baseFields,
    wallet: z
      .string()
      .min(1, "Кошелёк обязателен")
      .refine((val) => wallets.find((w) => String(w.id) === val), {
        message: "Выберите действительный кошелёк",
      }),
    wallet_from: z.string().optional(),
    wallet_to: z.string().optional(),
    counterparty: z.string().optional(),
  };

  const shouldValidateCategory = formData.category && formData.category !== "";
  const shouldValidateArticle = formData.article && formData.article !== "";

  if (shouldValidateCategory) {
    const fieldsWithCategory = {
      ...baseFieldsWithWallet,
      category: z
        .string()
        .min(1, "Категория обязательна")
        .refine(
          (val) =>
            operationCategories[String(formData.operation)]?.includes(val),
          { message: "Выберите действительную категорию" }
        ),
    };

    if (shouldValidateArticle) {
      return z.object({
        ...fieldsWithCategory,
        article: z
          .string()
          .min(1, "Статья обязательна")
          .refine((val) => categoryArticles[formData.category]?.includes(val), {
            message: "Выберите действительную статью",
          }),
      });
    } else {
      return z.object({
        ...fieldsWithCategory,
        article: z.string().optional(),
      });
    }
  } else {
    return z.object({
      ...baseFieldsWithWallet,
      category: z.string().optional(),
      article: z.string().optional(),
    });
  }
};

// Функция для получения схемы валидации на основе типа операции
export const getValidationSchema = (
  formData: FormData,
  operation_types: OperationType[],
  wallets: Wallet[],
  counterparties: Counterparty[],
  operationCategories: Record<string, string[]>,
  categoryArticles: Record<string, string[]>
) => {
  const selectedOperation = operation_types.find(
    (op) => op.id === Number(formData.operation)
  );

  if (!selectedOperation) {
    return z.object(baseFields);
  }

  switch (selectedOperation.name) {
    case "Перемещение":
      return transferSchema;

    case "Выставить счёт":
    case "Выставить расход":
      return invoiceSchema(counterparties);

    case "Приход":
    case "Расход":
      return incomeExpenseSchema(
        wallets,
        operationCategories,
        categoryArticles,
        formData
      );

    default:
      return z.object(baseFields);
  }
};

// Типы для валидации
export type TransferFormData = z.infer<typeof transferSchema>;
export type InvoiceFormData = z.infer<ReturnType<typeof invoiceSchema>>;
export type IncomeExpenseFormData = z.infer<
  ReturnType<typeof incomeExpenseSchema>
>;
