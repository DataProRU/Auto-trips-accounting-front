import { useState, useMemo, useRef, useEffect } from 'react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  value: string;
  label: string;
  key?: string;
}

interface SearchableSelectFieldProps<T extends string = string> {
  name: T;
  value: string;
  options: SearchableSelectOption[];
  placeholder: string;
  onChange: (name: T, value: string) => void;
  required?: boolean;
  className?: string;
  error?: string;
}

const triggerClassName =
  "rounded-[8px] border border-[#E7E5E2] bg-white px-2.5 py-5 text-sm text-black focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex w-full items-center justify-between gap-2 transition-[color,border] outline-none h-9 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:not([class*='size-']):size-4 truncate min-w-0 overflow-hidden data-[placeholder]:text-gray-400";

function SearchableSelectField<T extends string = string>({
  name,
  value,
  options,
  placeholder,
  onChange,
  className,
  error,
}: SearchableSelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? '',
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, search]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSelect = (optionValue: string) => {
    onChange(name, optionValue);
    setOpen(false);
  };

  const displayText = selectedLabel || placeholder;
  const displayIsPlaceholder = !value;

  return (
    <div className="w-full ">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              triggerClassName,
              error ? 'border-red-500' : '',
              className
            )}
            aria-label={placeholder}
          >
            <span
              className={cn(
                'overflow-hidden text-ellipsis whitespace-nowrap truncate min-w-0 flex-1 text-left',
                displayIsPlaceholder ? 'text-gray-400' : 'text-black'
              )}
            >
              {displayText}
            </span>
            <ChevronDownIcon className="size-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 min-w-[var(--radix-popover-trigger-width)] bg-white text-black rounded-[4px] border border-[#c5c5c5] overflow-x-hidden max-h-[var(--radix-select-content-available-height)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:translate-y-1 flex flex-col shadow-none outline-none"
          align="start"
          side="bottom"
          sideOffset={4}
          avoidCollisions={false}
        >
          <div className="p-1 border-t border-[#c5c5c5] shrink-0 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false);
                }
              }}
              placeholder="Поиск..."
              className="w-full rounded-[4px] px-2 py-2 text-sm text-black placeholder:text-gray-400 border border-[#E7E5E2] bg-white focus:outline-none focus-visible:outline-none"
            />
          </div>
          <div className="p-1 overflow-y-auto flex-1 min-h-0 flex flex-col">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.key ?? option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none transition-colors duration-200 text-left',
                      'hover:bg-gray-100 focus:bg-gray-100 focus:text-black text-black',
                      isSelected && 'bg-gray-100'
                    )}
                  >
                    <span className="flex-1 truncate">{option.label}</span>
                    {isSelected && (
                      <span className="absolute right-2 flex size-3.5 items-center justify-center pointer-events-none shrink-0">
                        <CheckIcon className="size-4" />
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-4 text-sm">
                Нет данных
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

export default SearchableSelectField;
