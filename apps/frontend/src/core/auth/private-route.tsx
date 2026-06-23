import type { UserRole } from "@caninany/shared";
import type { JSX, PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";

interface PrivateRouteProps extends PropsWithChildren {
  role?: UserRole;
}

export function PrivateRoute({
  children,
  role,
}: PrivateRouteProps): JSX.Element {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status === "initializing") {
    return (
      <div className="site-container py-20 text-center text-sm font-semibold text-brand-primary">
        Cargando sesión...
      </div>
    );
  }

  if (!accessToken || !user || status !== "authenticated") {
    return (
      <Navigate to="/ingresar" replace state={{ from: location.pathname }} />
    );
  }

  if (role && user.role !== role) {
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/perfil"} replace />
    );
  }

  return <>{children}</>;
}
