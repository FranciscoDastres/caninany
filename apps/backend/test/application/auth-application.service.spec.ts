import { describe, expect, it, vi } from "vitest";

import { AuthApplicationService } from "../../src/application/services/auth-application.service";
import {
  GoogleLinkRequiredError,
  InvalidActionTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
} from "../../src/domain/errors/domain.error";
import type {
  AuthSessionRepository,
  RotateRefreshTokenResult,
} from "../../src/domain/repositories/auth-session.repository";
import type { AuthTokenRepository } from "../../src/domain/repositories/auth-token.repository";
import type {
  CreateUserRecord,
  UserRecord,
  UserRepository,
} from "../../src/domain/repositories/user.repository";

const now = new Date("2026-06-23T12:00:00.000Z");
const sessionId = "67fc9d52-763d-4dd8-b26f-610d14736b1b";
const user: UserRecord = {
  id: "2a47deef-f031-4d78-a6da-083d2d483d90",
  avatarUrl: null,
  email: "cliente@caninany.cl",
  emailVerifiedAt: now,
  name: "Francisca",
  passwordHash: "hashed-password",
  phone: null,
  role: "cliente",
  status: "active",
  createdAt: new Date("2026-06-13T12:00:00.000Z"),
};

function createUserRepository(): UserRepository {
  return {
    create: vi.fn(async (input: CreateUserRecord) => ({ ...user, ...input })),
    createGoogle: vi.fn(async () => ({ ...user, passwordHash: null })),
    findByEmail: vi.fn(async () => null),
    findByGoogleSubject: vi.fn(async () => null),
    findById: vi.fn(async () => user),
    hasGoogleIdentity: vi.fn(async () => false),
    linkGoogleIdentity: vi.fn(async () => undefined),
    list: vi.fn(async () => [user]),
    unlinkGoogleIdentity: vi.fn(async () => true),
    updateRole: vi.fn(async () => user),
  };
}

function createSessionRepository(): AuthSessionRepository {
  const record = {
    id: sessionId,
    userId: user.id,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    lastUsedAt: now,
    revokedAt: null,
    ipAddress: null,
    userAgent: null,
  };
  return {
    create: vi.fn(async () => record),
    findActiveById: vi.fn(async () => record),
    isActive: vi.fn(async () => true),
    listActive: vi.fn(async () => [record]),
    revokeAll: vi.fn(async () => undefined),
    revokeById: vi.fn(async () => true),
    revokeWithToken: vi.fn(async () => true),
    rotate: vi.fn(async (): Promise<RotateRefreshTokenResult> => "rotated"),
  };
}

function createService(
  users = createUserRepository(),
  sessions = createSessionRepository(),
) {
  const passwords = {
    hash: vi.fn(async () => "hashed-password"),
    verify: vi.fn(async () => true),
  };
  const tokens = { issue: vi.fn(async () => "signed-jwt") };
  const refreshTokens = {
    create: vi.fn(() => ({ hash: "next-hash", raw: `${sessionId}.secret` })),
    parse: vi.fn(() => ({ hash: "current-hash", sessionId })),
  };
  const authTokens: AuthTokenRepository = {
    replace: vi.fn(async () => undefined),
    resetPassword: vi.fn(async () => true),
    verifyEmail: vi.fn(async () => true),
  };
  const actionTokens = {
    create: vi.fn(() => ({ hash: "action-hash", raw: "action-token" })),
    hash: vi.fn(() => "action-hash"),
  };
  const notifications = {
    sendPasswordReset: vi.fn(async () => undefined),
    sendVerification: vi.fn(async () => undefined),
  };
  const googleIdentity = {
    verify: vi.fn(async () => ({
      avatarUrl: null,
      email: user.email,
      name: user.name,
      subject: "google-subject",
    })),
  };
  const service = new AuthApplicationService(
    users,
    passwords,
    tokens,
    sessions,
    refreshTokens,
    { generate: () => sessionId },
    { now: () => now },
    authTokens,
    actionTokens,
    notifications,
    googleIdentity,
  );
  return {
    actionTokens,
    authTokens,
    notifications,
    googleIdentity,
    passwords,
    refreshTokens,
    service,
    sessions,
    tokens,
    users,
  };
}

describe("AuthApplicationService", () => {
  it("registers an unverified account and sends a one-use verification token", async () => {
    const { authTokens, notifications, service, sessions, tokens } =
      createService();

    const result = await service.register({
      name: "Francisca",
      email: "cliente@caninany.cl",
      password: "clave-segura",
    });

    expect(result.message).toContain("Revisa tu correo");
    expect(authTokens.replace).toHaveBeenCalledWith(
      user.id,
      "email-verification",
      "action-hash",
      new Date("2026-06-24T12:00:00.000Z"),
      now,
    );
    expect(notifications.sendVerification).toHaveBeenCalled();
    expect(sessions.create).not.toHaveBeenCalled();
    expect(tokens.issue).not.toHaveBeenCalled();
  });

  it("rejects an invalid password without creating a session", async () => {
    const users = createUserRepository();
    users.findByEmail = vi.fn(async () => user);
    const setup = createService(users);
    setup.passwords.verify.mockResolvedValue(false);

    await expect(
      setup.service.login(
        { email: user.email, password: "incorrecta" },
        { ipAddress: null, userAgent: null },
      ),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(setup.sessions.create).not.toHaveBeenCalled();
  });

  it("revokes a refresh-token family when an old token is reused", async () => {
    const sessions = createSessionRepository();
    sessions.rotate = vi.fn(
      async (): Promise<RotateRefreshTokenResult> => "reused",
    );
    const { service } = createService(createUserRepository(), sessions);

    await expect(
      service.refresh(`${sessionId}.old-secret`),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    expect(sessions.rotate).toHaveBeenCalled();
  });

  it("verifies an email with the hashed token and rejects a reused token", async () => {
    const setup = createService();

    await expect(
      setup.service.verifyEmail({
        token: "verification-token-value-123456789",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        message: expect.stringContaining("verificado"),
      }),
    );
    expect(setup.actionTokens.hash).toHaveBeenCalled();
    expect(setup.authTokens.verifyEmail).toHaveBeenCalledWith(
      "action-hash",
      now,
    );

    setup.authTokens.verifyEmail = vi.fn(async () => false);
    await expect(
      setup.service.verifyEmail({
        token: "verification-token-value-123456789",
      }),
    ).rejects.toBeInstanceOf(InvalidActionTokenError);
  });

  it("resets the password through a one-use token", async () => {
    const setup = createService();

    const result = await setup.service.resetPassword({
      token: "password-reset-token-value-123456789",
      password: "nueva-clave-segura",
    });

    expect(result.message).toContain("actualizada");
    expect(setup.authTokens.resetPassword).toHaveBeenCalledWith(
      "action-hash",
      "hashed-password",
      now,
    );
  });

  it("requires the local password before linking a matching Google email", async () => {
    const users = createUserRepository();
    users.findByEmail = vi.fn(async () => user);
    const setup = createService(users);

    await expect(
      setup.service.loginWithGoogle(
        { credential: "google-credential" },
        { ipAddress: null, userAgent: null },
      ),
    ).rejects.toBeInstanceOf(GoogleLinkRequiredError);
    expect(users.linkGoogleIdentity).not.toHaveBeenCalled();
  });

  it("links Google after verifying the existing local password", async () => {
    const users = createUserRepository();
    users.findByEmail = vi.fn(async () => user);
    const setup = createService(users);

    await setup.service.linkGoogle(
      { credential: "google-credential", password: "clave-segura" },
      { ipAddress: null, userAgent: null },
    );

    expect(users.linkGoogleIdentity).toHaveBeenCalledWith(
      user.id,
      "google-subject",
      user.email,
    );
    expect(setup.sessions.revokeAll).toHaveBeenCalledWith(user.id, now);
  });
});
