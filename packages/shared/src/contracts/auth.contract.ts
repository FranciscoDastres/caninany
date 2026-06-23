export const USER_ROLES = ["cliente", "admin"] as const;
export const USER_STATUSES = ["active", "suspended"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];

export interface AuthUserDto {
  avatarUrl: string | null;
  id: string;
  email: string;
  emailVerifiedAt: string | null;
  name: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
}

export interface AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
}

export interface MessageResponseDto {
  message: string;
}

export interface UserSummaryDto extends AuthUserDto {
  createdAt: string;
}

export interface AuthSessionDto {
  createdAt: string;
  current: boolean;
  expiresAt: string;
  id: string;
  ipAddress: string | null;
  lastUsedAt: string;
  userAgent: string | null;
}
