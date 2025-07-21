import type { CurrentData } from "@/types/ui";
import type { Invoice } from "@/types/api";

interface InvoiceListProps {
  loading: boolean;
  error: string | null;
  currentData: CurrentData | null;
  onInvoiceClick: (invoice: Invoice) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  loading,
  error,
  currentData,
  onInvoiceClick,
}) => {
  if (loading) {
    return <p className="text-center text-gray-500">Загрузка...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Ошибка: {error}. Попробуйте снова.
      </p>
    );
  }

  if (!currentData) {
    return (
      <p className="text-center text-gray-500">
        Выберите категорию для просмотра данных
      </p>
    );
  }

  if (currentData.items.length === 0) {
    return (
      <p className="text-center text-gray-500">
        Нет счетов для выбранной категории
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4  bg-white ">
        <h2 className="text-lg font-semibold">
          Выставлено счетов: {currentData.items.length}
        </h2>
        <p className="text-md">На сумму: {currentData &&
            Object.entries(currentData.amount).map(([symbol, amount]) => (
                <span key={symbol} className="inline-block mx-1">{amount} {symbol}</span>
            ))}</p>
      </div>
      <ol className="list-decimal mb-6 pl-8 overflow-y-scroll max-h-[56vh] flex flex-col  gap-5">
        {currentData.items.map((item, index) => (
          <li
            key={index}
            className="mb-2 text-md cursor-pointer hover:text-blue-600"
            onClick={() => onInvoiceClick(item.invoice)}
          >
            {item.description}
            {item.invoice.comment && (
                <div>{item.invoice.comment}</div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default InvoiceList;
