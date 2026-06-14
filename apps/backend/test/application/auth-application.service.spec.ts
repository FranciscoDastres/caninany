import { describe, expect, it, vi } from "vitest";

import { AuthApplicationService } from "../../src/application/services/auth-application.service";
import { InvalidCredentialsError } from "../../src/domain/errors/domain.error";
import type {
  CreateUserRecord,
  UserRecord,
  UserRepository,
} from "../../src/domain/repositories/user.repository";

const user: UserRecord = {
  id: "2a47deef-f031-4d78-a6da-083d2d483d90",
  email: "cliente@caninany.cl",
  name: "Francisca",
  passwordHash: "hashed-password",
  role: "cliente",
  createdAt: new Date("2026-06-13T12:00:00.000Z"),
};

function createUserRepository(): UserRepository {
  return {
    create: vi.fn(async (input: CreateUserRecord) => ({
      ...user,
      ...input,
    })),
    findByEmail: vi.fn(async () => null),
    findById: vi.fn(async () => user),
    list: vi.fn(async () => [user]),
    updateRole: vi.fn(async () => user),
  };
}

describe("AuthApplicationService", () => {
  it("registers new accounts as clients and includes role in the token", async () => {
    const users = createUserRepository();
    const passwords = {
      hash: vi.fn(async () => "hashed-password"),
      verify: vi.fn(async () => true),
    };
    const tokens = {
      issue: vi.fn(async () => "signed-jwt"),
    };
    const service = new AuthApplicationService(users, passwords, tokens);

    const session = await service.register({
      name: "Francisca",
      email: "cliente@caninany.cl",
      password: "clave-segura",
    });

    expect(session.user.role).toBe("cliente");
    expect(session.accessToken).toBe("signed-jwt");
    expect(tokens.issue).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        role: "cliente",
      }),
    );
  });

  it("rejects an invalid password without issuing a token", async () => {
    const users = createUserRepository();
    users.findByEmail = vi.fn(async () => user);
    const passwords = {
      hash: vi.fn(async () => "unused"),
      verify: vi.fn(async () => false),
    };
    const tokens = {
      issue: vi.fn(async () => "unused"),
    };
    const service = new AuthApplicationService(users, passwords, tokens);

    await expect(
      service.login({
        email: user.email,
        password: "incorrecta",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(tokens.issue).not.toHaveBeenCalled();
  });
});
