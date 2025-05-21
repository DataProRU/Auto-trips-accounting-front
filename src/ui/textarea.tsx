import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "rounded-[8px] border border-[#E7E5E2] bg-white p-2.5 text-sm text-black  focus-visible:outline-none focus-visible:outline-2 focus-visible:shadow-none disabled:cursor-not-allowed disabled:opacity-50 appearance-none placeholder:text-gray-400",

        className
      )}
      {...props}
    />
  );
}

export { Textarea };
