import type { JSX } from "react";
import { Outlet } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";

export function RootLayout(): JSX.Element {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
