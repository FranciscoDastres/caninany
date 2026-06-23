import * as React from "react";

import { cn } from "@/lib/cn";

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">): React.JSX.Element {
  return (
    <input
      type={type}
      className={cn(
        "flex h-13 w-full rounded-[0.65rem] border border-[#d9d4da] bg-white px-4 py-2 text-sm text-[#403441] outline-none transition placeholder:text-[#a19aa3] focus-visible:border-[#9b6e9e] focus-visible:ring-4 focus-visible:ring-[#9b6e9e]/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
