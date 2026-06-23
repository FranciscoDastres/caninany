import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  loginSchema,
  registerSchema,
  emailActionSchema,
  googleCredentialSchema,
  googleLinkSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type AuthResponseDto,
  type AuthSessionDto,
  type AuthUserDto,
  type EmailActionInput,
  type GoogleCredentialInput,
  type GoogleLinkInput,
  type LoginInput,
  type MessageResponseDto,
  type RegisterInput,
  type ResetPasswordInput,
  type VerifyEmailInput,
} from "@caninany/shared";
import type { Request, Response } from "express";

import {
  AuthApplicationService,
  type IssuedAuthSession,
  type SessionContext,
} from "../../../application/services/auth-application.service";
import { InvalidRefreshTokenError } from "../../../domain/errors/domain.error";
import type { AuthenticatedUser } from "../../auth/authenticated-user";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { RateLimit } from "../rate-limit.decorator";

@ApiTags("autenticación")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthApplicationService,
    private readonly config: ConfigService,
  ) {}

  @Post("register")
  @RateLimit({ limit: 5, windowMs: 60 * 60 * 1000 })
  @ApiCreatedResponse({ description: "Cuenta cliente creada." })
  register(
    @Body(new ZodValidationPipe(registerSchema)) input: RegisterInput,
  ): Promise<MessageResponseDto> {
    return this.auth.register(input);
  }

  @Post("login")
  @RateLimit({ limit: 10, windowMs: 60 * 1000 })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Sesión iniciada." })
  async login(
    @Body(new ZodValidationPipe(loginSchema)) input: LoginInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return this.persistRefreshToken(
      await this.auth.login(input, this.getSessionContext(request)),
      response,
    );
  }

  @Post("refresh")
  @RateLimit({ limit: 30, windowMs: 60 * 1000 })
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = this.readRefreshToken(request);
    if (!refreshToken) {
      throw new InvalidRefreshTokenError("No existe una sesión renovable.");
    }
    return this.persistRefreshToken(
      await this.auth.refresh(refreshToken),
      response,
    );
  }

  @Post("google")
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 10, windowMs: 60 * 1000 })
  async google(
    @Body(new ZodValidationPipe(googleCredentialSchema))
    input: GoogleCredentialInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return this.persistRefreshToken(
      await this.auth.loginWithGoogle(input, this.getSessionContext(request)),
      response,
    );
  }

  @Post("google/link")
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 5, windowMs: 60 * 1000 })
  async linkGoogle(
    @Body(new ZodValidationPipe(googleLinkSchema)) input: GoogleLinkInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return this.persistRefreshToken(
      await this.auth.linkGoogle(input, this.getSessionContext(request)),
      response,
    );
  }

  @Delete("google")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  unlinkGoogle(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MessageResponseDto> {
    return this.auth.unlinkGoogle(user.id);
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 10, windowMs: 60 * 1000 })
  verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) input: VerifyEmailInput,
  ): Promise<MessageResponseDto> {
    return this.auth.verifyEmail(input);
  }

  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 5, windowMs: 60 * 60 * 1000 })
  resendVerification(
    @Body(new ZodValidationPipe(emailActionSchema)) input: EmailActionInput,
  ): Promise<MessageResponseDto> {
    return this.auth.resendVerification(input);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 5, windowMs: 60 * 60 * 1000 })
  forgotPassword(
    @Body(new ZodValidationPipe(emailActionSchema)) input: EmailActionInput,
  ): Promise<MessageResponseDto> {
    return this.auth.forgotPassword(input);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 10, windowMs: 60 * 1000 })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) input: ResetPasswordInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MessageResponseDto> {
    const result = await this.auth.resetPassword(input);
    this.clearRefreshToken(response);
    return result;
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.auth.logout(this.readRefreshToken(request));
    this.clearRefreshToken(response);
  }

  @Post("logout-all")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.auth.logoutAll(user.id);
    this.clearRefreshToken(response);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getCurrentUser(@CurrentUser() user: AuthenticatedUser): Promise<AuthUserDto> {
    return this.auth.getCurrentUser(user.id);
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getSessions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AuthSessionDto[]> {
    return this.auth.listSessions(user.id, user.sessionId);
  }

  @Delete("sessions/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeSession(
    @Param("id") sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.auth.revokeSession(user.id, sessionId);
  }

  private getSessionContext(request: Request): SessionContext {
    return {
      ipAddress: request.ip || null,
      userAgent: request.get("user-agent") ?? null,
    };
  }

  private persistRefreshToken(
    session: IssuedAuthSession,
    response: Response,
  ): AuthResponseDto {
    response.cookie("caninany_refresh", session.refreshToken, {
      httpOnly: true,
      secure: this.config.getOrThrow<string>("NODE_ENV") === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth",
    });
    return { accessToken: session.accessToken, user: session.user };
  }

  private clearRefreshToken(response: Response): void {
    response.clearCookie("caninany_refresh", {
      httpOnly: true,
      secure: this.config.getOrThrow<string>("NODE_ENV") === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
    });
  }

  private readRefreshToken(request: Request): string | null {
    const cookie = request.headers.cookie
      ?.split(";")
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith("caninany_refresh="));
    if (!cookie) return null;
    return decodeURIComponent(cookie.slice("caninany_refresh=".length));
  }
}
