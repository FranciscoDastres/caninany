import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { JSX, PropsWithChildren } from "react";
import { useEffect, useState } from "react";

import { ThemeProvider } from "@/context/theme-provider";
import { bootstrapSession } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/store/auth.store";

function SessionBootstrap({ children }: PropsWithChildren): JSX.Element {
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    void bootstrapSession().catch(() => clearSession());
  }, [clearSession]);

  return <>{children}</>;
}

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
      <ThemeProvider>
        <SessionBootstrap>{children}</SessionBootstrap>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
