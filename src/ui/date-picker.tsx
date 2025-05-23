import * as React from "react";
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { ru } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface DatePickerProps {
  startYear?: number;
  endYear?: number;
  className?: string;
  buttonClassName?: string;
  popoverClassName?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DatePicker({
  startYear = getYear(new Date()) - 25,
  endYear = getYear(new Date()) + 20,
  className,
  buttonClassName,
  popoverClassName,
  value,
  onChange,
  disabled = false,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value || (disabled ? new Date() : undefined)
  );

  React.useEffect(() => {
    if (disabled && !value) {
      const today = new Date();
      setDate(today);
      onChange?.(today);
    } else {
      setDate(value);
    }
  }, [value, disabled, onChange]);

  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(date || new Date(), months.indexOf(month));
    setDate(newDate);
    onChange?.(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(date || new Date(), parseInt(year));
    setDate(newDate);
    onChange?.(newDate);
  };

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onChange?.(selectedDate);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {disabled ? (
        <Button
          variant={"outline"}
          disabled={true}
          style={{ color: "black" }}
          className={cn(
            "w-full p-5 text-black text-sm placeholder:text-black disabled:text-black justify-start text-left font-normal",
            "border border-[#E7E5E2] rounded-[8px]",
            !date && "text-muted-foreground",
            buttonClassName
          )}
        >
          {date ? (
            format(date, "PPP", { locale: ru })
          ) : (
            <span className="text-gray-400">Дата назначения</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 text-gray-900" />
        </Button>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full p-5 text-black text-sm  disabled:text-black justify-start text-left font-normal",
                "border border-[#E7E5E2] rounded-[8px]",
                !date && "text-muted-foreground",
                buttonClassName
              )}
            >
              {date ? (
                format(date, "PPP", { locale: ru })
              ) : (
                <span className="text-gray-400">Дата назначения</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 text-gray-900" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={cn(
              "w-auto p-0 rounded bg-white shadow-lg",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              popoverClassName
            )}
            align="start"
          >
            <div className="flex gap-2 p-3 px-1.5 border-b border-[#c5c5c5]">
              <Select
                onValueChange={handleMonthChange}
                value={date ? months[getMonth(date)] : undefined}
              >
                <SelectTrigger className="w-[120px] p-2 border-[#c5c5c5] rounded-lg data-[placeholder]:text-gray-400">
                  <SelectValue placeholder="Месяц" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem
                      key={month}
                      value={month}
                      className="hover:bg-gray-100 rounded-sm"
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={handleYearChange}
                value={date ? getYear(date).toString() : undefined}
              >
                <SelectTrigger className="w-[100px] p-2 text-black border-[#c5c5c5] rounded-lg">
                  <SelectValue placeholder="Год" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem
                      key={year}
                      value={year.toString()}
                      className="hover:bg-gray-100 rounded-sm"
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              initialFocus
              month={date}
              onMonthChange={setDate}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
