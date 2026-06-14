import type { UserRole } from "@caninany/shared";

export const TOKEN_ISSUER = Symbol("TOKEN_ISSUER");

export interface AccessTokenPayload {
  email: string;
  name: string;
  role: UserRole;
  userId: string;
}

export interface TokenIssuer {
  issue(payload: AccessTokenPayload): Promise<string>;
}
