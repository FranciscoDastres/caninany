import type { UserRole, UserStatus } from "@caninany/shared";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRecord {
  avatarUrl: string | null;
  createdAt: Date;
  email: string;
  emailVerifiedAt: Date | null;
  id: string;
  name: string;
  passwordHash: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
}

export interface CreateUserRecord {
  email: string;
  emailVerifiedAt?: Date | null;
  name: string;
  passwordHash: string | null;
  role: UserRole;
}

export interface CreateGoogleUserRecord {
  avatarUrl: string | null;
  email: string;
  name: string;
  providerSubject: string;
}

export type UserSummaryRecord = Omit<UserRecord, "passwordHash">;

export interface UserRepository {
  create(input: CreateUserRecord): Promise<UserRecord>;
  createGoogle(input: CreateGoogleUserRecord): Promise<UserRecord>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findByGoogleSubject(subject: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  hasGoogleIdentity(userId: string): Promise<boolean>;
  linkGoogleIdentity(
    userId: string,
    subject: string,
    email: string,
  ): Promise<void>;
  list(): Promise<UserSummaryRecord[]>;
  unlinkGoogleIdentity(userId: string): Promise<boolean>;
  updateRole(id: string, role: UserRole): Promise<UserSummaryRecord>;
}
