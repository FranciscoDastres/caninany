import type { JSX, PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";

interface AuthGuardProps extends PropsWithChildren {
  role?: "admin" | "client";
}

export function AuthGuard({ children, role }: AuthGuardProps): JSX.Element {
  const user = useAuthStore((state) => state.user);

  if (!user || (role && user.role !== role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
