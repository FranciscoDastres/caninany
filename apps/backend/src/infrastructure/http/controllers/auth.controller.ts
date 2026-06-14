import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  loginSchema,
  registerSchema,
  type AuthResponseDto,
  type AuthUserDto,
  type LoginInput,
  type RegisterInput,
} from "@caninany/shared";

import { AuthApplicationService } from "../../../application/services/auth-application.service";
import type { AuthenticatedUser } from "../../auth/authenticated-user";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";

@ApiTags("autenticación")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthApplicationService) {}

  @Post("register")
  @ApiCreatedResponse({ description: "Cuenta cliente creada." })
  register(
    @Body(new ZodValidationPipe(registerSchema)) input: RegisterInput,
  ): Promise<AuthResponseDto> {
    return this.auth.register(input);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Sesión iniciada." })
  login(
    @Body(new ZodValidationPipe(loginSchema)) input: LoginInput,
  ): Promise<AuthResponseDto> {
    return this.auth.login(input);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getCurrentUser(@CurrentUser() user: AuthenticatedUser): Promise<AuthUserDto> {
    return this.auth.getCurrentUser(user.id);
  }
}
