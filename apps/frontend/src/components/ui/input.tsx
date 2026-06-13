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
        "flex h-12 w-full rounded-xl border border-[#d8d0c5] bg-white px-4 py-2 text-sm text-[#29473a] outline-none transition placeholder:text-[#a09f98] focus-visible:border-[#527762] focus-visible:ring-4 focus-visible:ring-[#527762]/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
