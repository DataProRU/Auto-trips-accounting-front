import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import ErrorMessage from "@/ui/error-message"; // Import ErrorMessage component

interface SelectOption {
  value: string;
  label: string;
  key?: string; // Add key to match ReportForm's createOptions
}

interface SelectFieldProps<T extends string = string> {
  name: T;
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (name: T, value: string) => void;
  required?: boolean;
  className?: string;
  error?: string; // Add error prop for validation messages
}

const SelectField = <T extends string = string>({
  name,
  value,
  options,
  placeholder,
  onChange,
  required = false,
  className = "w-full text-sm truncate",
  error,
}: SelectFieldProps<T>) => (
  <div className="w-full ">
    <Select
      name={name}
      value={value}
      onValueChange={(value) => onChange(name, value)}
      required={required}
    >
      <SelectTrigger
        className={`${className} ${error ? "border-red-500" : ""}`}
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
    {error && <ErrorMessage />}
  </div>
);

export default SelectField;
