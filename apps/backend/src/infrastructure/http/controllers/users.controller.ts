import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import {
  updateUserRoleSchema,
  type UpdateUserRoleInput,
  type UserSummaryDto,
} from "@caninany/shared";

import { AdminUsersService } from "../../../application/services/admin-users.service";
import type { AuthenticatedUser } from "../../auth/authenticated-user";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";

@ApiTags("usuarios")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@Controller("usuarios")
export class UsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  @ApiOkResponse({ description: "Usuarios registrados." })
  list(): Promise<UserSummaryDto[]> {
    return this.users.list();
  }

  @Patch(":id/rol")
  updateRole(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateUserRoleSchema))
    input: UpdateUserRoleInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserSummaryDto> {
    return this.users.updateRole(id, input, currentUser.id);
  }
}
