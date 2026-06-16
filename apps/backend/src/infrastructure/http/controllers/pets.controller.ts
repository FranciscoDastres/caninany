import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  createPetSchema,
  updatePetSchema,
  type CreatePetInput,
  type PetDto,
  type UpdatePetInput,
} from "@caninany/shared";

import { PetsService } from "../../../application/services/pets.service";
import type { AuthenticatedUser } from "../../auth/authenticated-user";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";

@ApiTags("mascotas")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("cliente")
@Controller("pets")
export class PetsController {
  constructor(private readonly pets: PetsService) {}

  @Get()
  @ApiOkResponse({ description: "Mascotas activas del cliente autenticado." })
  list(@CurrentUser() user: AuthenticatedUser): Promise<PetDto[]> {
    return this.pets.listForOwner(user.id);
  }

  @Post()
  @ApiCreatedResponse({ description: "Mascota creada." })
  create(
    @Body(new ZodValidationPipe(createPetSchema)) input: CreatePetInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PetDto> {
    return this.pets.create(user.id, input);
  }

  @Put(":id")
  @ApiOkResponse({ description: "Mascota actualizada." })
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(updatePetSchema)) input: UpdatePetInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PetDto> {
    return this.pets.update(user.id, id, input);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: "Mascota archivada." })
  async archive(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.pets.archive(user.id, id);
  }
}
