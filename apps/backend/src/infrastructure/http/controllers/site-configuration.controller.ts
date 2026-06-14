import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { createReadStream } from "fs";
import {
  updateSiteConfigurationSchema,
  type SiteConfigurationDto,
  type UpdateSiteConfigurationInput,
  type UploadedImageDto,
} from "@caninany/shared";

import { SiteConfigurationService } from "../../../application/services/site-configuration.service";
import type { AuthenticatedUser } from "../../auth/authenticated-user";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import {
  LocalImageStorage,
  type ImageUpload,
} from "../../storage/local-image-storage";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";

@ApiTags("configuración del sitio")
@Controller("configuracion-sitio")
export class SiteConfigurationController {
  constructor(
    private readonly configuration: SiteConfigurationService,
    private readonly images: LocalImageStorage,
  ) {}

  @Get()
  @ApiOkResponse({ description: "Contenido público editable del sitio." })
  get(): Promise<SiteConfigurationDto> {
    return this.configuration.get();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  update(
    @Body(new ZodValidationPipe(updateSiteConfigurationSchema))
    input: UpdateSiteConfigurationInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SiteConfigurationDto> {
    return this.configuration.update(input, user.id);
  }

  @Post("imagenes")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @UseInterceptors(
    FileInterceptor("imagen", {
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  async uploadImage(
    @UploadedFile() file: ImageUpload | undefined,
  ): Promise<UploadedImageDto> {
    if (!file) {
      throw new BadRequestException("Selecciona una imagen.");
    }
    return { url: await this.images.save(file) };
  }

  @Get("imagenes/:filename")
  async getImage(
    @Param("filename") filename: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const image = await this.images.resolve(filename);
    response.setHeader("Content-Type", image.contentType);
    response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return new StreamableFile(createReadStream(image.path));
  }
}
