import type { UpdateUserRoleInput, UserSummaryDto } from "@caninany/shared";

import { CannotChangeOwnRoleError } from "../../domain/errors/domain.error";
import type {
  UserRepository,
  UserSummaryRecord,
} from "../../domain/repositories/user.repository";

export class AdminUsersService {
  constructor(private readonly users: UserRepository) {}

  async list(): Promise<UserSummaryDto[]> {
    return (await this.users.list()).map((user) => this.toDto(user));
  }

  async updateRole(
    targetUserId: string,
    input: UpdateUserRoleInput,
    currentUserId: string,
  ): Promise<UserSummaryDto> {
    if (targetUserId === currentUserId) {
      throw new CannotChangeOwnRoleError(
        "No puedes cambiar tu propio rol administrativo.",
      );
    }

    return this.toDto(await this.users.updateRole(targetUserId, input.role));
  }

  private toDto(user: UserSummaryRecord): UserSummaryDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
