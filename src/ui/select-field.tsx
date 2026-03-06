import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';

interface SelectOption {
  value: string;
  label: string;
  key?: string;
}

interface SelectFieldProps<T extends string = string> {
  name: T;
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (name: T, value: string) => void;
  required?: boolean;
  className?: string;
  error?: string;
  disabled?: boolean;
}

const SelectField = <T extends string = string>({
  name,
  value,
  options,
  placeholder,
  onChange,
  className = 'w-full text-sm truncate',
  error,
  disabled = false,
}: SelectFieldProps<T>) => (
  <div className="w-full ">
    <Select
      name={name}
      value={value}
      onValueChange={(value) => onChange(name, value)}
      required={false}
      disabled={disabled}
    >
      <SelectTrigger
        className={`${className} ${error ? 'border-red-500' : ''}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.length > 0 ? (
          options.map((option) => (
            <SelectItem key={option.key || option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        ) : (
          <div className="text-center text-gray-500">Нет данных</div>
        )}
      </SelectContent>
    </Select>
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

export default SelectField;
