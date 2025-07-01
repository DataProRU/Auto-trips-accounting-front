import * as React from "react";
import { cn } from "@/lib/utils";
import ErrorMessage from "@/ui/error-message";

interface InputProps extends React.ComponentProps<"input"> {
  error?: string;
}

function Input({ className, type, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <input
        type={type}
        data-slot="input"
        className={cn(
          "rounded-[8px] border border-[#E7E5E2] bg-white p-2.5 text-sm text-black focus-visible:outline-none focus-visible:outline-2 focus-visible:shadow-none disabled:cursor-not-allowed disabled:opacity-50 appearance-none placeholder:text-gray-400",
          type === "number" &&
            "[-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <ErrorMessage />}
    </div>
  );
}

export { Input };
