import type { UserRole } from "@caninany/shared";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRecord {
  createdAt: Date;
  email: string;
  id: string;
  name: string;
  passwordHash: string;
  role: UserRole;
}

export interface CreateUserRecord {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
}

export interface UserRepository {
  create(input: CreateUserRecord): Promise<UserRecord>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  list(): Promise<UserRecord[]>;
  updateRole(id: string, role: UserRole): Promise<UserRecord>;
}
