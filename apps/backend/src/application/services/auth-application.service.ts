import type {
  AuthResponseDto,
  AuthSessionDto,
  AuthUserDto,
  EmailActionInput,
  GoogleCredentialInput,
  GoogleLinkInput,
  LoginInput,
  MessageResponseDto,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "@caninany/shared";

import type { ActionTokenCodec } from "../ports/action-token.port";
import type { AuthNotification } from "../ports/auth-notification.port";
import type { PasswordHasher } from "../ports/password-hasher.port";
import type { Clock } from "../ports/clock.port";
import type { IdGenerator } from "../ports/id-generator.port";
import type { GoogleIdentityVerifier } from "../ports/google-identity.port";
import type { RefreshTokenCodec } from "../ports/refresh-token.port";
import type { TokenIssuer } from "../ports/token-issuer.port";
import {
  AccountSuspendedError,
  EmailNotVerifiedError,
  EmailAlreadyRegisteredError,
  GoogleLinkRequiredError,
  InvalidCredentialsError,
  InvalidActionTokenError,
  LastLoginMethodError,
  InvalidRefreshTokenError,
  UserNotFoundError,
} from "../../domain/errors/domain.error";
import type { AuthSessionRepository } from "../../domain/repositories/auth-session.repository";
import type { AuthTokenRepository } from "../../domain/repositories/auth-token.repository";
import type { UserRepository } from "../../domain/repositories/user.repository";

const REFRESH_TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
const EMAIL_VERIFICATION_LIFETIME_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_LIFETIME_MS = 30 * 60 * 1000;

export interface SessionContext {
  ipAddress: string | null;
  userAgent: string | null;
}

export interface IssuedAuthSession extends AuthResponseDto {
  refreshToken: string;
}

export class AuthApplicationService {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
    private readonly tokens: TokenIssuer,
    private readonly sessions: AuthSessionRepository,
    private readonly refreshTokens: RefreshTokenCodec,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
    private readonly authTokens: AuthTokenRepository,
    private readonly actionTokens: ActionTokenCodec,
    private readonly notifications: AuthNotification,
    private readonly googleIdentity: GoogleIdentityVerifier,
  ) {}

  async register(input: RegisterInput): Promise<MessageResponseDto> {
    if (await this.users.findByEmail(input.email)) {
      throw new EmailAlreadyRegisteredError(
        "Ya existe una cuenta con este correo.",
      );
    }

    const user = await this.users.create({
      email: input.email,
      emailVerifiedAt: null,
      name: input.name,
      passwordHash: await this.passwords.hash(input.password),
      role: "cliente",
    });

    await this.sendActionToken(
      user.id,
      user.email,
      "email-verification",
      EMAIL_VERIFICATION_LIFETIME_MS,
    );
    return {
      message: "Cuenta creada. Revisa tu correo para verificarla.",
    };
  }

  async login(
    input: LoginInput,
    context: SessionContext,
  ): Promise<IssuedAuthSession> {
    const user = await this.users.findByEmail(input.email);
    if (
      !user ||
      !user.passwordHash ||
      !(await this.passwords.verify(input.password, user.passwordHash))
    ) {
      throw new InvalidCredentialsError("Correo o contraseña incorrectos.");
    }

    if (user.status === "suspended") {
      throw new AccountSuspendedError("La cuenta está suspendida.");
    }
    if (!user.emailVerifiedAt) {
      throw new EmailNotVerifiedError(
        "Debes verificar tu correo antes de iniciar sesión.",
      );
    }

    return this.createSession(user, context);
  }

  async refresh(rawRefreshToken: string): Promise<IssuedAuthSession> {
    const parsed = this.refreshTokens.parse(rawRefreshToken);
    if (!parsed) throw new InvalidRefreshTokenError("La sesión no es válida.");

    const nextToken = this.refreshTokens.create(parsed.sessionId);
    const now = this.clock.now();
    const rotation = await this.sessions.rotate(
      parsed.sessionId,
      parsed.hash,
      nextToken.hash,
      now,
    );
    if (rotation !== "rotated") {
      throw new InvalidRefreshTokenError(
        rotation === "reused"
          ? "La sesión fue revocada por reutilización del token."
          : "La sesión expiró o fue revocada.",
      );
    }

    const session = await this.sessions.findActiveById(parsed.sessionId, now);
    if (!session) throw new InvalidRefreshTokenError("La sesión no es válida.");
    const sessionUser = await this.users.findById(session.userId);
    if (!sessionUser || sessionUser.status === "suspended") {
      await this.sessions.revokeById(parsed.sessionId, session.userId, now);
      throw new InvalidRefreshTokenError("La sesión no es válida.");
    }

    return {
      accessToken: await this.issueAccessToken(sessionUser, parsed.sessionId),
      refreshToken: nextToken.raw,
      user: await this.toDto(sessionUser),
    };
  }

  async verifyEmail(input: VerifyEmailInput): Promise<MessageResponseDto> {
    const verified = await this.authTokens.verifyEmail(
      this.actionTokens.hash(input.token),
      this.clock.now(),
    );
    if (!verified) {
      throw new InvalidActionTokenError(
        "El enlace de verificación expiró o ya fue utilizado.",
      );
    }
    return { message: "Correo verificado. Ya puedes iniciar sesión." };
  }

  async resendVerification(
    input: EmailActionInput,
  ): Promise<MessageResponseDto> {
    const user = await this.users.findByEmail(input.email);
    if (user && !user.emailVerifiedAt && user.status === "active") {
      await this.sendActionToken(
        user.id,
        user.email,
        "email-verification",
        EMAIL_VERIFICATION_LIFETIME_MS,
      );
    }
    return {
      message:
        "Si la cuenta existe y aún no está verificada, enviaremos un nuevo enlace.",
    };
  }

  async forgotPassword(input: EmailActionInput): Promise<MessageResponseDto> {
    const user = await this.users.findByEmail(input.email);
    if (user && user.emailVerifiedAt && user.status === "active") {
      await this.sendActionToken(
        user.id,
        user.email,
        "password-reset",
        PASSWORD_RESET_LIFETIME_MS,
      );
    }
    return {
      message:
        "Si existe una cuenta activa con ese correo, enviaremos instrucciones.",
    };
  }

  async resetPassword(input: ResetPasswordInput): Promise<MessageResponseDto> {
    const reset = await this.authTokens.resetPassword(
      this.actionTokens.hash(input.token),
      await this.passwords.hash(input.password),
      this.clock.now(),
    );
    if (!reset) {
      throw new InvalidActionTokenError(
        "El enlace de recuperación expiró o ya fue utilizado.",
      );
    }
    return {
      message: "Contraseña actualizada. Inicia sesión nuevamente.",
    };
  }

  async loginWithGoogle(
    input: GoogleCredentialInput,
    context: SessionContext,
  ): Promise<IssuedAuthSession> {
    const identity = await this.googleIdentity.verify(input.credential);
    let user = await this.users.findByGoogleSubject(identity.subject);
    if (!user) {
      if (await this.users.findByEmail(identity.email)) {
        throw new GoogleLinkRequiredError(
          "Esta cuenta ya existe. Ingresa su contraseña para vincular Google.",
        );
      }
      user = await this.users.createGoogle({
        avatarUrl: identity.avatarUrl,
        email: identity.email,
        name: identity.name,
        providerSubject: identity.subject,
      });
    }
    if (user.status === "suspended") {
      throw new AccountSuspendedError("La cuenta está suspendida.");
    }
    return this.createSession(user, context);
  }

  async linkGoogle(
    input: GoogleLinkInput,
    context: SessionContext,
  ): Promise<IssuedAuthSession> {
    const identity = await this.googleIdentity.verify(input.credential);
    const linkedUser = await this.users.findByGoogleSubject(identity.subject);
    if (linkedUser) {
      if (linkedUser.email !== identity.email) {
        throw new InvalidCredentialsError(
          "La identidad de Google ya está vinculada.",
        );
      }
      if (linkedUser.status === "suspended") {
        throw new AccountSuspendedError("La cuenta está suspendida.");
      }
      return this.createSession(linkedUser, context);
    }

    const user = await this.users.findByEmail(identity.email);
    if (
      !user ||
      !user.passwordHash ||
      !(await this.passwords.verify(input.password, user.passwordHash))
    ) {
      throw new InvalidCredentialsError("La contraseña no es correcta.");
    }
    if (user.status === "suspended") {
      throw new AccountSuspendedError("La cuenta está suspendida.");
    }

    await this.users.linkGoogleIdentity(
      user.id,
      identity.subject,
      identity.email,
    );
    await this.sessions.revokeAll(user.id, this.clock.now());
    return this.createSession(user, context);
  }

  async unlinkGoogle(userId: string): Promise<MessageResponseDto> {
    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundError("La cuenta ya no existe.");
    if (!user.passwordHash) {
      throw new LastLoginMethodError(
        "Agrega una contraseña antes de desvincular Google.",
      );
    }
    await this.users.unlinkGoogleIdentity(userId);
    return { message: "Google fue desvinculado de la cuenta." };
  }

  async getCurrentUser(userId: string): Promise<AuthUserDto> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UserNotFoundError("La cuenta ya no existe.");
    }

    return this.toDto(user);
  }

  async listSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<AuthSessionDto[]> {
    return (await this.sessions.listActive(userId, this.clock.now())).map(
      (session) => ({
        id: session.id,
        current: session.id === currentSessionId,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        lastUsedAt: session.lastUsedAt.toISOString(),
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      }),
    );
  }

  async logout(rawRefreshToken: string | null): Promise<void> {
    if (!rawRefreshToken) return;
    const parsed = this.refreshTokens.parse(rawRefreshToken);
    if (!parsed) return;
    await this.sessions.revokeWithToken(
      parsed.sessionId,
      parsed.hash,
      this.clock.now(),
    );
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessions.revokeAll(userId, this.clock.now());
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await this.sessions.revokeById(sessionId, userId, this.clock.now());
  }

  private async createSession(
    user: Awaited<ReturnType<UserRepository["create"]>>,
    context: SessionContext,
  ): Promise<IssuedAuthSession> {
    const sessionId = this.ids.generate();
    const refreshToken = this.refreshTokens.create(sessionId);
    const now = this.clock.now();
    await this.sessions.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: refreshToken.hash,
      expiresAt: new Date(now.getTime() + REFRESH_TOKEN_LIFETIME_MS),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      accessToken: await this.issueAccessToken(user, sessionId),
      refreshToken: refreshToken.raw,
      user: await this.toDto(user),
    };
  }

  private async issueAccessToken(
    user: Awaited<ReturnType<UserRepository["create"]>>,
    sessionId: string,
  ): Promise<string> {
    return this.tokens.issue({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sessionId,
    });
  }

  private async sendActionToken(
    userId: string,
    email: string,
    type: "email-verification" | "password-reset",
    lifetimeMs: number,
  ): Promise<void> {
    const token = this.actionTokens.create();
    const now = this.clock.now();
    await this.authTokens.replace(
      userId,
      type,
      token.hash,
      new Date(now.getTime() + lifetimeMs),
      now,
    );
    if (type === "email-verification") {
      await this.notifications.sendVerification(email, token.raw);
    } else {
      await this.notifications.sendPasswordReset(email, token.raw);
    }
  }

  private async toDto(
    user: Awaited<ReturnType<UserRepository["create"]>>,
  ): Promise<AuthUserDto> {
    return {
      avatarUrl: user.avatarUrl,
      id: user.id,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      hasGoogleIdentity: await this.users.hasGoogleIdentity(user.id),
      hasPassword: Boolean(user.passwordHash),
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
    };
  }
}
