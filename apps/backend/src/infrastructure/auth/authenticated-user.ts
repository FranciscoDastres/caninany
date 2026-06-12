export type AuthenticatedRole = "admin" | "client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: AuthenticatedRole;
}
