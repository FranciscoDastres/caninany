import type { UserRole } from "@caninany/shared";
import type { JSX, PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { decodeAccessToken } from "@/core/auth/jwt";
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
  const user = useAuthStore((state) => state.user);
  const tokenPayload = accessToken ? decodeAccessToken(accessToken) : null;

  if (
    !accessToken ||
    !user ||
    !tokenPayload ||
    tokenPayload.exp * 1000 <= Date.now()
  ) {
    return (
      <Navigate to="/ingresar" replace state={{ from: location.pathname }} />
    );
  }

  if (role && tokenPayload.role !== role) {
    return (
      <Navigate
        to={tokenPayload.role === "admin" ? "/admin" : "/perfil"}
        replace
      />
    );
  }

  return <>{children}</>;
}
