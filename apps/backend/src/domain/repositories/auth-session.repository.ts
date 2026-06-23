export const AUTH_SESSION_REPOSITORY = Symbol("AUTH_SESSION_REPOSITORY");

export interface AuthSessionRecord {
  createdAt: Date;
  expiresAt: Date;
  id: string;
  ipAddress: string | null;
  lastUsedAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
  userId: string;
}

export interface CreateAuthSessionRecord {
  expiresAt: Date;
  id: string;
  ipAddress: string | null;
  refreshTokenHash: string;
  userAgent: string | null;
  userId: string;
}

export type RotateRefreshTokenResult = "rotated" | "invalid" | "reused";

export interface AuthSessionRepository {
  create(input: CreateAuthSessionRecord): Promise<AuthSessionRecord>;
  findActiveById(id: string, now: Date): Promise<AuthSessionRecord | null>;
  isActive(id: string, userId: string, now: Date): Promise<boolean>;
  listActive(userId: string, now: Date): Promise<AuthSessionRecord[]>;
  revokeAll(userId: string, now: Date): Promise<void>;
  revokeById(id: string, userId: string, now: Date): Promise<boolean>;
  revokeWithToken(id: string, tokenHash: string, now: Date): Promise<boolean>;
  rotate(
    id: string,
    currentTokenHash: string,
    nextTokenHash: string,
    now: Date,
  ): Promise<RotateRefreshTokenResult>;
}
