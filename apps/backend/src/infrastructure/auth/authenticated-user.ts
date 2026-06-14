export type AuthenticatedRole = "admin" | "cliente";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: AuthenticatedRole;
}
