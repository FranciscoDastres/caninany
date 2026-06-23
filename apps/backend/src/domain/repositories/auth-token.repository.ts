export const AUTH_TOKEN_REPOSITORY = Symbol("AUTH_TOKEN_REPOSITORY");

export type AuthTokenKind = "email-verification" | "password-reset";

export interface AuthTokenRepository {
  replace(
    userId: string,
    type: AuthTokenKind,
    tokenHash: string,
    expiresAt: Date,
    now: Date,
  ): Promise<void>;
  resetPassword(
    tokenHash: string,
    passwordHash: string,
    now: Date,
  ): Promise<boolean>;
  verifyEmail(tokenHash: string, now: Date): Promise<boolean>;
}
