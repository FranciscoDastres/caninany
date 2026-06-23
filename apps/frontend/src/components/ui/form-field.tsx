import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface FormFieldProps {
  children: ReactNode;
  className?: string;
  error?: string | undefined;
  hint?: string;
  label: ReactNode;
}

export function FormField({
  children,
  className,
  error,
  hint,
  label,
}: FormFieldProps): React.JSX.Element {
  return (
    <label
      className={cn(
        "grid gap-2 text-sm font-extrabold text-[#443846]",
        className,
      )}
    >
      <span>{label}</span>
      {children}
      {hint && !error ? (
        <span className="text-xs font-normal leading-5 text-[#756e77]">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="text-xs font-semibold text-red-700">{error}</span>
      ) : null}
    </label>
  );
}
