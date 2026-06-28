import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { useAuthStore } from "@/store/auth.store";

import { AccountSecurityPanel } from "./account-security-panel";

function renderPanel(): string {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <AccountSecurityPanel />
    </QueryClientProvider>,
  );
}

describe("AccountSecurityPanel", () => {
  afterEach(() => {
    useAuthStore.getState().clearSession();
  });

  it("renders account access methods and active sessions section", () => {
    useAuthStore.getState().setSession({
      accessToken: "test-token",
      user: {
        avatarUrl: null,
        email: "cliente@caninany.cl",
        emailVerifiedAt: "2026-06-27T00:00:00.000Z",
        hasGoogleIdentity: true,
        hasPassword: true,
        id: "user-1",
        name: "Cliente Caninany",
        phone: null,
        role: "cliente",
        status: "active",
      },
    });

    const markup = renderPanel();

    expect(markup).toContain("Cuenta y seguridad");
    expect(markup).toContain("Metodos de acceso");
    expect(markup).toContain("Google");
    expect(markup).toContain("Sesiones activas");
  });
});
