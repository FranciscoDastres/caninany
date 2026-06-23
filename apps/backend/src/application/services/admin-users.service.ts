import type { UpdateUserRoleInput, UserSummaryDto } from "@caninany/shared";

import { CannotChangeOwnRoleError } from "../../domain/errors/domain.error";
import type {
  UserRepository,
  UserSummaryRecord,
} from "../../domain/repositories/user.repository";
import type { AuthSessionRepository } from "../../domain/repositories/auth-session.repository";
import type { Clock } from "../ports/clock.port";

export class AdminUsersService {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: AuthSessionRepository,
    private readonly clock: Clock,
  ) {}

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

    const user = await this.users.updateRole(targetUserId, input.role);
    await this.sessions.revokeAll(targetUserId, this.clock.now());
    return this.toDto(user);
  }

  private toDto(user: UserSummaryRecord): UserSummaryDto {
    return {
      avatarUrl: user.avatarUrl,
      id: user.id,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
