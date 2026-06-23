import type { ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";

import type { AuthenticatedUser } from "../../src/infrastructure/auth/authenticated-user";
import { RolesGuard } from "../../src/infrastructure/auth/roles.guard";

function createContext(user: AuthenticatedUser): ExecutionContext {
  return {
    getClass: () => RolesGuard,
    getHandler: () => createContext,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  const reflector = {
    getAllAndOverride: vi.fn(() => ["admin"]),
  } as unknown as Reflector;
  const guard = new RolesGuard(reflector);

  it("denies a client token on administrator operations", () => {
    expect(
      guard.canActivate(
        createContext({
          id: "cliente-id",
          email: "cliente@caninany.cl",
          name: "Cliente",
          role: "cliente",
          sessionId: "session-id",
        }),
      ),
    ).toBe(false);
  });

  it("allows an administrator token on administrator operations", () => {
    expect(
      guard.canActivate(
        createContext({
          id: "admin-id",
          email: "admin@caninany.cl",
          name: "Administración",
          role: "admin",
          sessionId: "session-id",
        }),
      ),
    ).toBe(true);
  });
});
