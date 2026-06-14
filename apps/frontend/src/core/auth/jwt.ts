import type { UserRole } from "@caninany/shared";

export interface AccessTokenPayload {
  email: string;
  exp: number;
  name: string;
  role: UserRole;
  userId: string;
}

export function decodeAccessToken(token: string): AccessTokenPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized)) as Partial<AccessTokenPayload>;
    if (
      !decoded.userId ||
      !decoded.email ||
      !decoded.name ||
      !decoded.exp ||
      (decoded.role !== "admin" && decoded.role !== "cliente")
    ) {
      return null;
    }

    return decoded as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function isAccessTokenValid(token: string): boolean {
  const payload = decodeAccessToken(token);
  return Boolean(payload && payload.exp * 1000 > Date.now());
}
