import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  name: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  className?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  value,
  options,
  placeholder,
  onChange,
  required = false,
  className = "w-full text-sm truncate",
}) => (
  <Select
    name={name}
    value={value}
    onValueChange={(value) => onChange(name, value)}
    required={required}
  >
    <SelectTrigger className={className}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.length > 0 ? (
        options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))
      ) : (
        <div className="text-center text-gray-500">Нет данных</div>
      )}
    </SelectContent>
  </Select>
);

export default SelectField;
