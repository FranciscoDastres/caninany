export const USER_ROLES = ["cliente", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthUserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
}

export interface UserSummaryDto extends AuthUserDto {
  createdAt: string;
}
