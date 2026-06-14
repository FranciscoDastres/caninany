import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { PurchaseDto } from "@caninany/shared";

import { PurchasesService } from "../../../application/services/purchases.service";
import type { AuthenticatedUser } from "../../auth/authenticated-user";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";

@ApiTags("compras")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("cliente")
@Controller("compras")
export class PurchasesController {
  constructor(private readonly purchases: PurchasesService) {}

  @Get("mis-compras")
  @ApiOkResponse({ description: "Compras del cliente autenticado." })
  getMine(@CurrentUser() user: AuthenticatedUser): Promise<PurchaseDto[]> {
    return this.purchases.getForCustomer(user.id);
  }
}
