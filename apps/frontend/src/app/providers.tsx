import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { JSX, PropsWithChildren } from "react";
import { useState } from "react";

import { ThemeProvider } from "@/context/theme-provider";

export function AppProviders({ children }: PropsWithChildren): JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
